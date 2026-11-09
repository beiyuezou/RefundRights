// Edge function: analyze-dispute
// Calls Lovable AI Gateway with tool-calling to produce structured legal analysis,
// then stores the result in dispute_analyses (RLS-scoped to the calling user).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import {
  detectOtaFromStory,
  detectLegalSources,
  fetchOtaRules,
} from "../_shared/bright-data-service.ts";
import { searchLegalSources, type TavilySource } from "../_shared/tavily-search.ts";
import { clampConfidence, enforceTranslation, type AnalysisShape } from "../_shared/consistency.ts";
import { glossaryBlock } from "../_shared/statute-glossary.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function buildSystemPrompt(language: "en" | "zh") {
  const langClause =
    language === "zh"
      ? `UX/LOCALIZATION DIRECTIVE (user language = 'zh'):
- Write the recommendation and every leverage_point (title and detail) in professional Simplified Chinese (简体中文).
- The draft_email MUST be BILINGUAL: write the full email in English first (Subject, salutation, body, sign-off), and immediately after each English sentence or short paragraph, place the Chinese translation in square brackets on the next line, e.g.
    Subject: Formal Complaint — Booking Ref [BOOKING REF]
    [主题：正式投诉 — 订单号 [BOOKING REF]]
    Dear [RECIPIENT NAME],
    [尊敬的 [RECIPIENT NAME]：]
- When citing statutes or regulators inside Chinese prose, give the Chinese translation followed by the official English/local name in parentheses, e.g. "泰国《消费者保护法》B.E. 2522 (Consumer Protection Act B.E. 2522)", "新加坡《公平交易法》(Consumer Protection (Fair Trading) Act, CPFTA)".
- Keep brand names (Agoda, Booking.com, Trip.com, Klook, MAVCOM, OCPB, CASE), email addresses, URLs, dates and numbers in ASCII. Use full-width punctuation only inside Chinese sentences.`
      : `UX/LOCALIZATION DIRECTIVE (user language = 'en'):
- Write the recommendation, every leverage_point, and the entire draft_email in full English. No Chinese.
- Cite statutes by their official English/local name (e.g. "Consumer Protection Act B.E. 2522", "Consumer Protection (Fair Trading) Act (CPFTA)").`;

  return `You are an integrated Multi-Agent Orchestrator for Southeast Asian travel-dispute analysis. You operate as a panel of four specialist agents reasoning together inside a single response. Internally simulate each agent's perspective, then synthesise their conclusions into the final tool call. Do NOT expose the agent labels or internal reasoning in the output — only the synthesised result.

THE PANEL:

1. EVIDENCE AGENT
   - Extract every concrete fact from the traveler's account with precision: booking IDs / PNRs, supplier and platform names, full names, dates and times (with timezone if given), flight numbers, hotel names, amounts and currencies, communication channels, and any screenshots or documents the user references.
   - Flag missing-but-critical evidence as a leverage gap rather than inventing facts.
   - Build a clean factual timeline that grounds every later argument.

2. LEGAL AGENT
   - Map the dispute to the consumer-protection framework of the stated jurisdiction. Anchors you may cite (do NOT fabricate section numbers or hotlines):
     • Thailand — Consumer Protection Act B.E. 2522, Office of the Consumer Protection Board (OCPB), Tourist Police 1155.
     • Singapore — Consumer Protection (Fair Trading) Act (CPFTA), Lemon Law (Part 3 CPFTA), CASE, Small Claims Tribunals.
     • Malaysia — Malaysian Aviation Consumer Protection Code 2016 (MACPC) under MAVCOM, Consumer Protection Act 1999, Tribunal for Consumer Claims.
     • Indonesia — UU Perlindungan Konsumen No. 8/1999, BPSK.
     • Vietnam / Philippines / Cambodia / Laos — cite general consumer-protection principles only when confident.
   - Explicitly NAME deceptive platform behaviours when the facts support them, so the user can confront the tactic directly:
     • A booking site (Agoda, Booking.com, Trip.com, Klook, etc.) pressuring the traveler to cancel an active insurance policy as a condition of refund.
     • An airline or OTA refusing a refund for a clearly documented airline-caused delay or cancellation.
     • Pre-authorisation holds or "damage" charges asserted without itemised evidence.
     • Substituted services materially worse than what was paid for.
     • Coercive "non-refundable" framing applied where consumer law overrides it.

3. FINANCE / INSURANCE AGENT
   - Identify likely insurance coverage triggers (trip interruption, supplier default, baggage, medical, travel-delay clauses) and what documentation activates them.
   - Build a concrete escalation ladder, in this order: (i) Platform / supplier formal complaint with deadline → (ii) Card issuer chargeback under the relevant scheme (Visa / Mastercard / Amex dispute reason codes) and/or insurer claim → (iii) Regulator or tribunal in the stated country (e.g. OCPB, CASE, MAVCOM, BPSK).
   - Call out chargeback time limits and evidence the bank will require.

4. UX / LOCALIZATION AGENT
   - Enforces tone, language, and the bilingual email rule defined in the LANGUAGE DIRECTIVE below.
   - Keeps the output sober, formal, lawyer-like — never breezy or salesy.

SYNTHESIS RULES:
- The recommendation field (300–500 words) must read as one coherent professional analysis weaving the Evidence → Legal → Finance reasoning together, ending with the escalation path.
- The leverage_points array must contain 3–7 items. Use them to surface the strongest specific arguments AND to explicitly name any deceptive platform tactics detected.
- The draft_email must be a complete, sendable formal complaint starting with "Subject: ..." on the first line, using placeholders like [RECIPIENT NAME], [BOOKING REF], [DATE] where the user must fill in, citing the applicable statute, and setting a 14-day response deadline.
- Risk levels:
  • "strong" — clear documentary evidence + named statute/regulator likely to side with the consumer.
  • "moderate" — winnable case but with evidence gaps or jurisdictional ambiguity.
  • "weak" — limited evidence, lawful supplier conduct, or hostile jurisdiction.
- Confidence rubric (deterministic — same facts must give the same score): start at the midpoint of the band for the chosen risk level (strong 75–95, moderate 50–74, weak 20–49); +5 each for documentary evidence referenced, a written refusal from the supplier, a statute that directly covers the conduct, an amount within small-claims limits; −5 each for a consumer-caused error, clearly disclosed non-refundable terms, missing booking/receipt details. Stay inside the band.
- Produce exactly 4 leverage_points unless the facts genuinely support fewer (min 3) or more (max 7).
- Cite a section number ONLY if it appears verbatim in the REFERENCE text supplied; otherwise cite the Act by name only.
${glossaryBlock()}
- NEVER invent specific section numbers, hotline numbers, or compensation amounts you are not confident in. If the user's facts are thin, say so inside the recommendation and ask them to add specific details rather than overclaim.

${langClause}

You MUST respond by calling the produce_analysis function. Do not return prose.`;
}

interface AnalyzePayload {
  category: "hotel" | "flight" | "insurance";
  country: string;
  city?: string | null;
  incident_date?: string | null;
  story: string;
  amount?: number | null;
  currency?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Unauthorized" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const NEBIUS_API_KEY = Deno.env.get("NEBIUS_API_KEY");

    if (!NEBIUS_API_KEY) {
      return json({ error: "AI service is not configured." }, 500);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = userData.user.id;

    // Per-user rate limit: 10 / hour
    const sinceIso = new Date(Date.now() - 3600 * 1000).toISOString();
    const { count: recent } = await admin
      .from("rate_limit_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("action", "analyze")
      .gte("created_at", sinceIso);
    if ((recent ?? 0) >= 10) {
      await admin.from("audit_logs").insert({
        user_id: userId,
        action: "rate_limit.exceeded",
        metadata: { kind: "analyze" },
      });
      return new Response(
        JSON.stringify({ error: "Too many requests", code: "rate_limited" }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "3600" },
        },
      );
    }
    await admin.from("rate_limit_events").insert({ user_id: userId, action: "analyze" });

    const body = (await req.json()) as { dispute_id: string; language?: string; mode?: string };
    if (!body?.dispute_id) {
      return json({ error: "dispute_id required" }, 400);
    }
    const language: "en" | "zh" = body.language === "zh" ? "zh" : "en";
    const mode: "analyze" | "translate" = body.mode === "translate" ? "translate" : "analyze";

    // Load dispute (RLS ensures it's owned by caller)
    const { data: dispute, error: dErr } = await supabase
      .from("disputes")
      .select("id, user_id, category, country, city, incident_date, story, amount, currency")
      .eq("id", body.dispute_id)
      .single();

    if (dErr || !dispute) {
      return json({ error: "Dispute not found" }, 404);
    }
    if (dispute.user_id !== userId) {
      return json({ error: "Forbidden" }, 403);
    }

    // Hackathon requirement: NVIDIA open model served on Nebius Token Factory.
    // Tiering: Super for the main legal analysis, Nano for fast translation calls.
    const model = "nvidia/nemotron-3-super-120b-a12b";

    // ---------- Translate mode: reuse the master analysis ----------
    if (mode === "translate") {
      const { data: master } = await admin
        .from("dispute_analyses")
        .select("id, risk_level, confidence, recommendation, leverage_points, draft_email, sources, language")
        .eq("user_id", userId)
        .eq("dispute_id", dispute.id)
        .is("parent_analysis_id", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!master) return json({ error: "No analysis to translate." }, 404);
      if (master.language === language) return json({ analysis_id: master.id });
      const { data: existing } = await supabase
        .from("dispute_analyses")
        .select("id")
        .eq("parent_analysis_id", master.id)
        .eq("language", language)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing) return json({ analysis_id: existing.id });
      const t = await translateAnalysis(master as unknown as MasterRow, language, NEBIUS_API_KEY, model);
      if (!t.ok) return json({ error: t.error }, t.status);
      // Ownership verified above; report columns are not browser-selectable, so write as admin.
      const { data: row, error: insErr } = await admin
        .from("dispute_analyses")
        .insert({
          dispute_id: dispute.id,
          user_id: userId,
          ...t.result,
          sources: master.sources,
          model: t.model,
          language,
          parent_analysis_id: master.id,
        })
        .select("id")
        .single();
      if (insErr || !row) {
        console.error("Insert translation error:", insErr);
        return json({ error: "Failed to save analysis." }, 500);
      }
      await admin.from("audit_logs").insert({
        user_id: userId,
        action: "analysis.translate",
        resource_type: "dispute_analyses",
        resource_id: row.id,
        metadata: { dispute_id: dispute.id, master_id: master.id, language, mismatches: t.mismatches },
      });
      return json({ analysis_id: row.id });
    }

    await supabase.from("disputes").update({ status: "analyzing" }).eq("id", dispute.id);

    const payload: AnalyzePayload = {
      category: dispute.category as AnalyzePayload["category"],
      country: dispute.country,
      city: dispute.city,
      incident_date: dispute.incident_date,
      story: dispute.story,
      amount: dispute.amount,
      currency: dispute.currency,
    };

    // Ground Truth: fetch latest OTA refund policy if we can detect one.
    let groundTruth = "";
    let groundTruthMeta: { ota?: string; source: string } = { source: "none" };
    const detected = detectOtaFromStory(dispute.story);
    if (detected) {
      const res = await fetchOtaRules(detected.ota, detected.url, admin, userId);
      groundTruth = res.content;
      groundTruthMeta = { ota: detected.ota, source: res.source };
    }

    const tavilyPromise: Promise<TavilySource[]> = searchLegalSources(
      { country: dispute.country, category: dispute.category, ota: detected?.ota },
      admin,
      userId,
    );
    const legalDetected = detectLegalSources(dispute.country);
    const legalResults: { slug: string; url: string; source: string; content: string }[] = [];
    if (legalDetected.length > 0) {
      const settled = await Promise.all(
        legalDetected.map((l) =>
          fetchOtaRules(l.slug, l.url, admin, userId).then((r) => ({
            slug: l.slug,
            url: l.url,
            source: r.source,
            content: r.content,
          })),
        ),
      );
      for (const r of settled) {
        if (r.content) legalResults.push(r);
      }
    }

    const tavilySources = await tavilyPromise;
    // The master analysis is always produced in English, deterministically;
    // other languages are translations of it so verdicts never diverge.
    const userPrompt = buildUserPrompt(payload, "en", {
      ota: groundTruthMeta.ota,
      content: groundTruth,
    }, legalResults, tavilySources);
    const systemPrompt = buildSystemPrompt("en");

    const call = await callModel(systemPrompt, userPrompt, NEBIUS_API_KEY, model);
    if (!call.ok) {
      await supabase.from("disputes").update({ status: "failed" }).eq("id", dispute.id);
      return json({ error: call.error, ...(call.code ? { code: call.code } : {}) }, call.status);
    }
    const parsed = call.parsed;
    parsed.confidence = clampConfidence(parsed.risk_level, parsed.confidence);
    const { data: analysis, error: insertErr } = await admin
      .from("dispute_analyses")
      .insert({
        dispute_id: dispute.id,
        user_id: userId,
        risk_level: parsed.risk_level,
        confidence: parsed.confidence,
        recommendation: parsed.recommendation,
        leverage_points: parsed.leverage_points,
        draft_email: parsed.draft_email,
        sources: [
          ...(detected && groundTruth
            ? [{ title: `${detected.ota} refund policy`, url: detected.url, domain: hostOf(detected.url), provider: "tavily_extract" }]
            : []),
          ...legalResults.map((l) => ({ title: l.slug.toUpperCase(), url: l.url, domain: hostOf(l.url), provider: "official" })),
          ...tavilySources.map(({ title, url, domain }) => ({ title, url, domain, provider: "tavily" })),
        ],
        model,
        language: "en",
      })
      .select()
      .single();

    if (insertErr || !analysis) {
      console.error("Insert analysis error:", insertErr);
      await supabase.from("disputes").update({ status: "failed" }).eq("id", dispute.id);
      return json({ error: "Failed to save analysis." }, 500);
    }

    await supabase.from("disputes").update({ status: "analyzed" }).eq("id", dispute.id);

    await admin.from("audit_logs").insert({
      user_id: userId,
      action: "analysis.run",
      resource_type: "dispute_analyses",
      resource_id: analysis.id,
      metadata: {
        dispute_id: dispute.id,
        model,
        risk: parsed.risk_level,
        ground_truth: groundTruthMeta,
        legal_sources: legalResults.map((l) => ({ slug: l.slug, source: l.source, bytes: l.content.length })),
      },
    });

    // Requested language differs from the master: translate it right away.
    let resultId: string = analysis.id;
    if (language !== "en") {
      const t = await translateAnalysis(
        { ...parsed, id: analysis.id, sources: analysis.sources, language: "en" },
        language,
        NEBIUS_API_KEY,
        model,
      );
      if (t.ok) {
        const { data: row } = await admin
          .from("dispute_analyses")
          .insert({
            dispute_id: dispute.id,
            user_id: userId,
            ...t.result,
            sources: analysis.sources,
            model: t.model,
            language,
            parent_analysis_id: analysis.id,
          })
          .select("id")
          .single();
        if (row) resultId = row.id;
      }
    }
    return json({ analysis_id: resultId });
  } catch (e) {
    const id = crypto.randomUUID();
    console.error(`[analyze-dispute ${id}]`, e);
    return json({ error: "Request failed", code: "internal" }, 500);
  }
});

function buildUserPrompt(
  p: AnalyzePayload,
  language: "en" | "zh",
  groundTruth?: { ota?: string; content: string },
  legalSources?: { slug: string; source: string; content: string }[],
  webSources?: TavilySource[],
) {
  const webBlock =
    webSources && webSources.length > 0
      ? "\n### REFERENCE — Web search results from official/platform sites (Tavily):\n" +
        webSources.map((w, i) => `[S${i + 1}] ${w.title} — ${w.url}\n"""\n${w.content}\n"""`).join("\n") +
        "\nWhen relying on these, cite them by title or domain. Do NOT invent provisions absent from this text.\n"
      : "";
  const categoryLabel = {
    hotel: "Hotel issue (deposits, wrong booking, unjustified charges)",
    flight: "Flight disruption (delays, cancellation, missed connection)",
    insurance: "Insurance trap (denial, deceptive cancellation advice)",
  }[p.category];

  const langReminder =
    language === "zh"
      ? `CRITICAL: recommendation and leverage_points MUST be in Simplified Chinese. The draft_email MUST be BILINGUAL — write each line / short paragraph in English first, then place the Chinese translation in square brackets on the very next line (Subject line included). Cite statutes as "中文翻译 (English original name)".`
      : `CRITICAL: All output MUST be in English.`;

  const groundTruthBlock =
    groundTruth && groundTruth.content && groundTruth.ota
      ? `\n### REFERENCE — Latest published refund policy of ${groundTruth.ota} (retrieved ${new Date().toISOString().slice(0, 10)}):\n"""\n${groundTruth.content}\n"""\nUse this as ground truth when discussing this platform's policy. Cite specific clauses where applicable. Do NOT invent clauses not present in this text. If the platform's own policy contradicts consumer-protection statute, call out the override explicitly.\n`
      : "";

  const legalBlock =
    legalSources && legalSources.length > 0
      ? "\n### REFERENCE — Jurisdictional consumer-protection sources (retrieved live):\n" +
        legalSources
          .map(
            (l) =>
              `--- Source: ${l.slug} (${l.source}) ---\n"""\n${l.content}\n"""`,
          )
          .join("\n") +
        "\nCite these sources by name (e.g. CASE, CCCS) when grounding statutory claims. Do NOT invent provisions absent from this text. Prefer quoting short phrases from the source over paraphrasing.\n"
      : "";

  return `Produce a structured analysis for the following traveler dispute.

Category: ${categoryLabel}
Country: ${p.country}${p.city ? ` (${p.city})` : ""}
Incident date: ${p.incident_date ?? "not provided"}
Amount in dispute: ${p.amount != null ? `${p.amount} ${p.currency ?? ""}`.trim() : "not provided"}

Traveler's account:
"""
${p.story}
"""
${groundTruthBlock}
${legalBlock}
${webBlock}
${langReminder}

Remember: explicitly name any deceptive platform tactics in leverage_points, and ground your reasoning in the consumer-protection framework of ${p.country}. Respond by invoking produce_analysis.`;
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type Parsed = AnalysisShape;
interface MasterRow extends Parsed {
  id: string;
  sources: unknown;
  language: string;
}

const PRODUCE_TOOLS = [
  {
    type: "function",
    function: {
      name: "produce_analysis",
      description: "Return a structured rights analysis for the traveler's dispute.",
      parameters: {
        type: "object",
        properties: {
          risk_level: {
            type: "string",
            enum: ["strong", "moderate", "weak"],
            description:
              "Strength of the consumer's case. 'strong' = likely to win, 'moderate' = winnable with effort, 'weak' = uphill.",
          },
          confidence: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            description: "Confidence in this assessment, 0-100, following the rubric.",
          },
          recommendation: {
            type: "string",
            description:
              "300-500 word professional legal-style analysis: applicable consumer rights for this jurisdiction, how the supplier's conduct measures up, and the suggested escalation path (platform → regulator → tribunal).",
          },
          leverage_points: {
            type: "array",
            minItems: 3,
            maxItems: 7,
            description:
              "Strongest arguments and tactics the user can deploy. MUST explicitly name any deceptive platform behavior detected.",
            items: {
              type: "object",
              properties: { title: { type: "string" }, detail: { type: "string" } },
              required: ["title", "detail"],
              additionalProperties: false,
            },
          },
          draft_email: {
            type: "string",
            description:
              "A complete formal complaint email. Begin with 'Subject: ...'. Use placeholders like [RECIPIENT NAME], [BOOKING REF], [DATE]. Reference applicable statutes and set a 14-day deadline.",
          },
        },
        required: ["risk_level", "confidence", "recommendation", "leverage_points", "draft_email"],
        additionalProperties: false,
      },
    },
  },
];

async function callModel(
  system: string,
  user: string,
  apiKey: string,
  model: string,
): Promise<
  | { ok: true; parsed: Parsed }
  | { ok: false; status: number; error: string; code?: string }
> {
  const aiRes = await fetch("https://api.tokenfactory.nebius.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 8000,
      temperature: 0,
      seed: 42,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      tools: PRODUCE_TOOLS,
      tool_choice: { type: "function", function: { name: "produce_analysis" } },
    }),
  });
  if (!aiRes.ok) {
    const errText = await aiRes.text();
    console.error("AI error:", aiRes.status, errText.slice(0, 1000));
    if (aiRes.status === 429) {
      return { ok: false, status: 429, error: "Rate limit exceeded. Please wait a moment and try again." };
    }
    if (aiRes.status === 402) {
      return {
        ok: false,
        status: 503,
        error: "Analysis service is temporarily unavailable. Please try again later.",
        code: "service_unavailable",
      };
    }
    return { ok: false, status: 500, error: "AI analysis failed. Please try again." };
  }
  const aiJson = await aiRes.json();
  const msg = aiJson?.choices?.[0]?.message;
  let rawArgs: string | undefined = msg?.tool_calls?.[0]?.function?.arguments;
  if (!rawArgs && typeof msg?.content === "string") {
    const cleaned = msg.content.replace(/<think>[\s\S]*?<\/think>/g, "");
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) rawArgs = m[0];
  }
  if (!rawArgs) {
    console.error("No tool call in AI response", JSON.stringify(aiJson).slice(0, 2000));
    return { ok: false, status: 500, error: "Invalid AI response." };
  }
  try {
    const parsed = JSON.parse(rawArgs) as Parsed;
    if (
      !["strong", "moderate", "weak"].includes(parsed.risk_level) ||
      typeof parsed.recommendation !== "string" ||
      !Array.isArray(parsed.leverage_points) ||
      typeof parsed.draft_email !== "string"
    ) throw new Error("schema mismatch");
    parsed.confidence = Number(parsed.confidence) || 0;
    return { ok: true, parsed };
  } catch (e) {
    console.error("Failed to parse tool call args", e);
    return { ok: false, status: 500, error: "Invalid AI response format." };
  }
}

async function translateAnalysis(
  master: MasterRow,
  language: "en" | "zh",
  apiKey: string,
  model: string,
): Promise<
  | { ok: true; result: Parsed; mismatches: string[]; model: string }
  | { ok: false; status: number; error: string }
> {
  const target = language === "zh" ? "Simplified Chinese (简体中文)" : "English";
  const system = `You are a professional legal translator. Translate an existing legal analysis into ${target}. You are NOT re-analysing the case.
STRICT RULES:
- Keep risk_level and confidence EXACTLY as given.
- Keep EXACTLY ${master.leverage_points.length} leverage_points, in the same order; translate each title and detail faithfully.
- Do not add, remove or change any statute, section number, amount, date, deadline, regulator or argument.
- ${
    language === "zh"
      ? "The draft_email MUST be BILINGUAL: keep every English line exactly as given and put the Chinese translation in square brackets on the next line (Subject line included)."
      : "Write everything in English only."
  }
- Keep brand names, URLs, emails, dates and numbers in ASCII.
${glossaryBlock()}
Respond by calling produce_analysis.`;
  const user =
    "Analysis to translate (JSON):\n" +
    JSON.stringify({
      risk_level: master.risk_level,
      confidence: master.confidence,
      recommendation: master.recommendation,
      leverage_points: master.leverage_points,
      draft_email: master.draft_email,
    });
  let last: { result: Parsed; mismatches: string[] } | null = null;
  let used = model;
  for (let attempt = 0; attempt < 2; attempt++) {
    const prompt =
      attempt === 0 || !last
        ? user
        : `${user}\n\nYour previous translation changed the structure (${last.mismatches.join(", ")}). Translate again, faithfully, keeping every argument and citation.`;
    // First attempt on fast Nemotron Nano; fall back to Super on error or drift.
    used = attempt === 0 ? FAST_TRANSLATION_MODEL : model;
    let call = await callModel(system, prompt, apiKey, used);
    if (!call.ok && attempt === 0) {
      used = model;
      call = await callModel(system, prompt, apiKey, used);
    }
    if (!call.ok) return call;
    last = enforceTranslation(master, call.parsed);
    // Smaller models sometimes echo English; require real Chinese text.
    if (language === "zh" && (call.parsed.recommendation.match(/[\u4e00-\u9fff]/g)?.length ?? 0) < 10) {
      last.mismatches.push("not_translated");
    }
    if (last.mismatches.length === 0) break;
  }
  if (!last || last.mismatches.includes("leverage_count")) {
    return { ok: false, status: 500, error: "Translation failed. Please try again." };
  }
  return { ok: true, ...last, model: used };
}

const FAST_TRANSLATION_MODEL = "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B";

function hostOf(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
