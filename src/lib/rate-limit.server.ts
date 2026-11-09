import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type RateAction = "tts" | "stt" | "analyze" | "evidence_upload";

const LIMITS: Record<RateAction, { max: number; windowSec: number }> = {
  tts: { max: 30, windowSec: 300 },
  stt: { max: 20, windowSec: 300 },
  analyze: { max: 10, windowSec: 3600 },
  evidence_upload: { max: 50, windowSec: 3600 },
};

export async function checkAndRecord(
  userId: string,
  action: RateAction,
): Promise<{ ok: true } | { ok: false; retryAfter: number }> {
  const cfg = LIMITS[action];
  const since = new Date(Date.now() - cfg.windowSec * 1000).toISOString();

  const { count, error } = await supabaseAdmin
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", action)
    .gte("created_at", since);

  if (error) {
    // Fail open on infra error, but log.
    console.error("rate_limit query failed", error);
    return { ok: true };
  }

  if ((count ?? 0) >= cfg.max) {
    return { ok: false, retryAfter: cfg.windowSec };
  }

  await supabaseAdmin
    .from("rate_limit_events")
    .insert({ user_id: userId, action });

  return { ok: true };
}
