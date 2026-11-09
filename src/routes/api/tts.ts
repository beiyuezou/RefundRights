import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prepareTtsText } from "@/lib/tts-text";
import { createClient } from "@supabase/supabase-js";
import { checkAndRecord } from "@/lib/rate-limit.server";
import { logEvent } from "@/lib/audit.server";
import { genericError, logServerError } from "@/lib/errors.server";

const Body = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string().min(1).max(64).optional(),
  language: z.enum(["en", "zh"]).optional(),
});

const DEFAULT_VOICE = "EXAVITQu4vr4xnSDxMaL"; // Sarah

export const Route = createFileRoute("/api/tts")({
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

        const rl = await checkAndRecord(userId, "tts");
        if (!rl.ok) {
          await logEvent({ userId, action: "rate_limit.exceeded", userAgent: ua, metadata: { kind: "tts" } });
          return new Response(
            JSON.stringify({ error: "Too many requests", code: "rate_limited" }),
            { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rl.retryAfter) } },
          );
        }

        const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
        if (!ELEVENLABS_API_KEY) {
          return genericError(500, "tts_unavailable");
        }

        let json: unknown;
        try {
          json = await request.json();
        } catch {
          return genericError(400, "invalid_body");
        }
        const parsed = Body.safeParse(json);
        if (!parsed.success) {
          return genericError(400, "invalid_body");
        }

        const { text, voiceId = DEFAULT_VOICE, language = "en" } = parsed.data;
        const cleaned = prepareTtsText(text, language).slice(0, 5000);
        if (!cleaned) {
          return genericError(400, "empty_text");
        }

        const res = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: {
              "xi-api-key": ELEVENLABS_API_KEY,
              "Content-Type": "application/json",
              accept: "audio/mpeg",
            },
            body: JSON.stringify({
              text: cleaned,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.7,
                similarity_boost: 0.8,
                style: 0,
                use_speaker_boost: true,
              },
            }),
          },
        );

        if (!res.ok || !res.body) {
          const errText = await res.text().catch(() => "");
          logServerError("elevenlabs.tts", new Error(errText), { status: res.status });
          return genericError(502, "tts_failed");
        }

        await logEvent({ userId, action: "tts.call", userAgent: ua, metadata: { len: cleaned.length, lang: language } });

        return new Response(res.body, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
