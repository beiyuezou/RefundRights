import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Permanently deletes all of the signed-in user's case data and files. */
export const deleteMyData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ confirm: z.literal("DELETE") }).parse(data))
  .handler(async ({ context }): Promise<{ ok: boolean }> => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { logEvent } = await import("@/lib/audit.server");
    try {
      // 1. Evidence files in storage (everything under the user's folder, incl. staging).
      const paths: string[] = [];
      const walk = async (prefix: string) => {
        const { data } = await supabaseAdmin.storage.from("evidence").list(prefix, { limit: 1000 });
        for (const f of data ?? []) {
          const p = `${prefix}/${f.name}`;
          if (f.id) paths.push(p);
          else await walk(p);
        }
      };
      await walk(userId);
      for (let i = 0; i < paths.length; i += 100) {
        await supabaseAdmin.storage.from("evidence").remove(paths.slice(i, i + 100));
      }

      // 2. Rows, children first.
      const { data: disputes } = await supabaseAdmin.from("disputes").select("id").eq("user_id", userId);
      const ids = (disputes ?? []).map((d) => d.id);
      await supabaseAdmin.from("expert_help_requests").delete().eq("user_id", userId);
      await supabaseAdmin.from("dispute_events").delete().eq("user_id", userId);
      await supabaseAdmin.from("dispute_analyses").delete().eq("user_id", userId).not("parent_analysis_id", "is", null);
      await supabaseAdmin.from("dispute_analyses").delete().eq("user_id", userId);
      await supabaseAdmin.from("dispute_evidence").delete().eq("user_id", userId);
      if (ids.length > 0) {
        await supabaseAdmin.from("special_code_redemptions").delete().in("dispute_id", ids);
        // PayPal keeps its own transaction records for accounting.
        await supabaseAdmin.from("payments").delete().in("dispute_id", ids);
      }
      const { error } = await supabaseAdmin.from("disputes").delete().eq("user_id", userId);
      if (error) throw error;
      await supabaseAdmin.from("profiles").update({ display_name: null, country: null }).eq("id", userId);

      await logEvent({ userId, action: "account.data_deleted", metadata: { cases: ids.length, files: paths.length } });
      return { ok: true };
    } catch (err) {
      console.error("deleteMyData failed", err);
      return { ok: false };
    }
  });
