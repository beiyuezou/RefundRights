import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AuditAction =
  | "auth.login_success"
  | "auth.login_failure"
  | "analysis.run"
  | "analysis.edit_draft"
  | "dispute.created"
  | "evidence.staged"
  | "evidence.removed"
  | "evidence.upload"
  | "evidence.delete"
  | "evidence.rejected"
  | "tts.call"
  | "stt.call"
  | "rate_limit.exceeded"
  | "bright_data.fetch_triggered"
  | "bright_data.fetch_succeeded"
  | "bright_data.fetch_failed"
  | "bright_data.cache_hit"
  | "tavily.extract_triggered"
  | "tavily.extract_succeeded"
  | "tavily.extract_failed"
  | "tavily.cache_hit"
  | "special_code.redeemed"
  | "special_code.failed"
  | "account.data_deleted";

export type AuditInput = {
  userId?: string | null;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logEvent(input: AuditInput): Promise<void> {
  try {
    await supabaseAdmin.from("audit_logs").insert({
      user_id: input.userId ?? null,
      action: input.action,
      resource_type: input.resourceType ?? null,
      resource_id: input.resourceId ?? null,
      ip: input.ip ?? null,
      user_agent: input.userAgent ?? null,
      metadata: (input.metadata ?? {}) as never,
    });
  } catch (err) {
    console.error("audit log failed", err);
  }
}
