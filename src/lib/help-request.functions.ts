import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const MAX_HELP_REQUESTS_PER_DAY = 3;

const schema = z
  .object({
    contact_email: z.string().trim().email().max(255),
    dispute_id: z.string().uuid().nullable(),
    case_summary: z.string().trim().max(2000).nullable(),
    preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    preferred_slot: z.enum(["morning", "afternoon", "evening", "any"]),
    timezone: z.string().trim().max(64).nullable(),
    notes: z.string().trim().max(1000).nullable(),
  })
  .refine((d) => d.dispute_id || (d.case_summary && d.case_summary.length >= 10), {
    message: "summary_required",
  });

type Result = { ok: true } | { ok: false; code: "rate_limited" | "forbidden" | "error" };

export const submitHelpRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }): Promise<Result> => {
    // Sign-in required: the caller is verified by the auth middleware.
    const { userId, supabase } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.dispute_id) {
      const { data: d } = await supabase
        .from("disputes").select("user_id").eq("id", data.dispute_id).maybeSingle();
      if (!d || d.user_id !== userId) return { ok: false, code: "forbidden" };
    }

    const since = new Date(Date.now() - 86400_000).toISOString();
    const email = data.contact_email.toLowerCase();
    const q = supabaseAdmin
      .from("expert_help_requests")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since);
    const { count } = await q.eq("user_id", userId);
    if ((count ?? 0) >= MAX_HELP_REQUESTS_PER_DAY) return { ok: false, code: "rate_limited" };

    const { error } = await supabaseAdmin.from("expert_help_requests").insert({
      user_id: userId,
      dispute_id: data.dispute_id,
      contact_email: email,
      case_summary: data.case_summary,
      preferred_date: data.preferred_date,
      preferred_slot: data.preferred_slot,
      timezone: data.timezone,
      notes: data.notes,
    });
    if (error) {
      console.error("help request insert failed", error);
      return { ok: false, code: "error" };
    }
    return { ok: true };
  });
