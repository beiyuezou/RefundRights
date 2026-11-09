import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { checkAndRecord } from "@/lib/rate-limit.server";
import { logEvent } from "@/lib/audit.server";
import { genericError, logServerError } from "@/lib/errors.server";

const ALLOWED_LANGS = new Set(["eng", "zho", "cmn", "tha", "msa", "vie"]);

export const Route = createFileRoute("/api/transcribe-audio")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Require authenticated Supabase session
        const authHeader = request.headers.get("authorization") || "";
        const token = authHeader.startsWith("Bearer ")
          ? authHeader.slice(7).trim()
          : "";
        if (!token) {
          return genericError(401, "unauthorized");
        }
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
          return genericError(500, "server_misconfigured");
        }
        const sb = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: claims, error: authErr } = await sb.auth.getClaims(token);
        if (authErr || !claims?.claims?.sub) {
          return genericError(401, "unauthorized");
        }
        const userId = claims.claims.sub as string;
        const ua = request.headers.get("user-agent");

        const rl = await checkAndRecord(userId, "stt");
        if (!rl.ok) {
          await logEvent({ userId, action: "rate_limit.exceeded", userAgent: ua, metadata: { kind: "stt" } });
          return new Response(
            JSON.stringify({ error: "Too many requests", code: "rate_limited" }),
            { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rl.retryAfter) } },
          );
        }

        const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
        if (!ELEVENLABS_API_KEY) {
          return genericError(500, "stt_unavailable");
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return genericError(400, "invalid_body");
        }

        const audio = form.get("audio") as unknown;
        if (!(audio instanceof Blob)) {
          return genericError(400, "missing_audio");
        }
        if (audio.size > 25 * 1024 * 1024) {
          return genericError(413, "audio_too_large");
        }

        const rawLang = (form.get("language") || "").toString().toLowerCase();
        const language = ALLOWED_LANGS.has(rawLang) ? rawLang : "";

        const upstream = new FormData();
        upstream.append("file", audio, (audio as File).name || "audio.webm");
        upstream.append("model_id", "scribe_v2");
        upstream.append("tag_audio_events", "false");
        upstream.append("diarize", "false");
        if (language) upstream.append("language_code", language);

        const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
          method: "POST",
          headers: { "xi-api-key": ELEVENLABS_API_KEY },
          body: upstream,
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          logServerError("elevenlabs.stt", new Error(errText), { status: res.status });
          return genericError(502, "stt_failed");
        }

        const data = (await res.json()) as { text?: string };
        await logEvent({ userId, action: "stt.call", userAgent: ua, metadata: { bytes: audio.size, lang: language || "auto" } });
        return Response.json({ text: data.text ?? "" });
      },
    },
  },
});
