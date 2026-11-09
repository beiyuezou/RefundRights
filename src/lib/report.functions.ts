import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { redactReport, type ReportRow } from "@/lib/paywall";

/** Returns the owner's analyses; full content only when the case is paid. */
export const getAnalysisReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ dispute_id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Ownership + payment status via RLS as the user.
    const { data: dispute } = await supabase
      .from("disputes")
      .select("id, user_id, paid")
      .eq("id", data.dispute_id)
      .maybeSingle();
    if (!dispute || dispute.user_id !== userId) {
      return { rows: [] as ReportRow[], paid: false };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("dispute_analyses")
      .select(
        "id, risk_level, confidence, recommendation, leverage_points, draft_email, sources, created_at, language, parent_analysis_id, model",
      )
      .eq("dispute_id", dispute.id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    const list = (rows ?? []) as ReportRow[];
    return {
      paid: dispute.paid,
      rows: dispute.paid ? list : list.map(redactReport),
    };
  });
