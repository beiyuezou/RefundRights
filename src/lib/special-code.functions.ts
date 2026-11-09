import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { codeMatches, MAX_FAILED_ATTEMPTS_PER_HOUR } from "@/lib/special-code";

type Result =
  | { ok: true }
  | { ok: false; code: "invalid" | "expired" | "exhausted" | "rate_limited" | "forbidden" | "error" };

export const redeemSpecialCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ dispute_id: z.string().uuid(), code: z.string().min(1).max(64) }).parse(data),
  )
  .handler(async ({ data, context }): Promise<Result> => {
    const { supabase, userId } = context;
    const { data: dispute } = await supabase
      .from("disputes")
      .select("id, user_id, paid")
      .eq("id", data.dispute_id)
      .maybeSingle();
    if (!dispute || dispute.user_id !== userId) return { ok: false, code: "forbidden" };
    if (dispute.paid) return { ok: true };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { logEvent } = await import("@/lib/audit.server");

    // Throttle failed attempts.
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await supabaseAdmin
      .from("rate_limit_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("action", "special_code_fail")
      .gte("created_at", since);
    if ((count ?? 0) >= MAX_FAILED_ATTEMPTS_PER_HOUR) return { ok: false, code: "rate_limited" };

    const fail = async (code: "invalid" | "expired" | "exhausted"): Promise<Result> => {
      await supabaseAdmin.from("rate_limit_events").insert({ user_id: userId, action: "special_code_fail" });
      await logEvent({ userId, action: "special_code.failed", resourceType: "dispute", resourceId: dispute.id, metadata: { reason: code } });
      return { ok: false, code };
    };

    if (!codeMatches(data.code, process.env.SPECIAL_UNLOCK_CODE)) return fail("invalid");

    const { data: status, error } = await supabaseAdmin.rpc("redeem_special_code", {
      _user_id: userId,
      _dispute_id: dispute.id,
    });
    if (error) {
      console.error("redeem_special_code failed", error);
      return { ok: false, code: "error" };
    }
    if (status === "inactive") return fail("invalid");
    if (status === "expired") return fail("expired");
    if (status === "exhausted") return fail("exhausted");

    await supabaseAdmin.from("payments").upsert(
      {
        user_id: userId,
        dispute_id: dispute.id,
        provider: "special_code",
        paypal_order_id: `special_code:${dispute.id}`,
        amount_cents: 0,
        currency: "USD",
        status: "completed",
      },
      { onConflict: "paypal_order_id" },
    );
    await supabaseAdmin
      .from("disputes")
      .update({ paid: true, paid_at: new Date().toISOString() })
      .eq("id", dispute.id)
      .eq("paid", false);
    await logEvent({ userId, action: "special_code.redeemed", resourceType: "dispute", resourceId: dispute.id });
    return { ok: true };
  });
