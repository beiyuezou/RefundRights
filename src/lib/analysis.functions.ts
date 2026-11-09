import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logEvent } from "@/lib/audit.server";

const Input = z.object({
  analysis_id: z.string().uuid(),
  draft_email: z.string().min(1).max(20000),
});

export const saveDraftEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("dispute_analyses")
      .update({ draft_email: data.draft_email })
      .eq("id", data.analysis_id);
    if (error) {
      return { ok: false as const, code: "save_failed" };
    }
    await logEvent({
      userId,
      action: "analysis.edit_draft",
      resourceType: "dispute_analyses",
      resourceId: data.analysis_id,
      metadata: { len: data.draft_email.length },
    });
    return { ok: true as const };
  });
