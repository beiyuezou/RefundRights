import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequestHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { checkAndRecord } from "@/lib/rate-limit.server";
import { logEvent } from "@/lib/audit.server";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const MAX_BYTES = 10 * 1024 * 1024;

const Input = z.object({
  dispute_id: z.string().uuid(),
  storage_path: z.string().min(1).max(512),
  file_name: z.string().min(1).max(255),
  mime_type: z.string().min(1).max(128),
  size_bytes: z.number().int().positive().max(MAX_BYTES),
});

function detectMime(bytes: Uint8Array): string | null {
  if (bytes.length < 4) return null;
  // %PDF
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return "application/pdf";
  }
  // JPEG FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  // WEBP: RIFF????WEBP
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export const validateAndRegisterEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;

    // Path must be scoped to this user
    if (!data.storage_path.startsWith(`${userId}/`)) {
      await logEvent({ userId, action: "evidence.rejected", metadata: { reason: "path_scope" } });
      return { ok: false as const, code: "path_scope" };
    }

    // Verify dispute_id belongs to the calling user (RLS-scoped read)
    const { data: dispRow } = await supabase
      .from("disputes")
      .select("id")
      .eq("id", data.dispute_id)
      .maybeSingle();
    if (!dispRow) {
      await supabaseAdmin.storage.from("evidence").remove([data.storage_path]);
      await logEvent({ userId, action: "evidence.rejected", metadata: { reason: "dispute_not_owned", dispute_id: data.dispute_id } });
      return { ok: false as const, code: "dispute_not_found" };
    }

    if (!ALLOWED_MIME.has(data.mime_type)) {
      await supabaseAdmin.storage.from("evidence").remove([data.storage_path]);
      await logEvent({ userId, action: "evidence.rejected", metadata: { reason: "mime_disallowed", mime: data.mime_type } });
      return { ok: false as const, code: "mime_disallowed" };
    }

    const rl = await checkAndRecord(userId, "evidence_upload");
    if (!rl.ok) {
      await supabaseAdmin.storage.from("evidence").remove([data.storage_path]);
      await logEvent({ userId, action: "rate_limit.exceeded", metadata: { kind: "evidence_upload" } });
      return { ok: false as const, code: "rate_limited", retryAfter: rl.retryAfter };
    }

    // Magic-byte sniff
    const dl = await supabaseAdmin.storage.from("evidence").download(data.storage_path);
    if (dl.error || !dl.data) {
      await logEvent({ userId, action: "evidence.rejected", metadata: { reason: "download_failed" } });
      return { ok: false as const, code: "download_failed" };
    }
    const buf = new Uint8Array(await dl.data.slice(0, 16).arrayBuffer());
    const sniffed = detectMime(buf);
    if (sniffed !== data.mime_type) {
      await supabaseAdmin.storage.from("evidence").remove([data.storage_path]);
      await logEvent({
        userId,
        action: "evidence.rejected",
        metadata: { reason: "magic_mismatch", declared: data.mime_type, sniffed },
      });
      return { ok: false as const, code: "magic_mismatch" };
    }

    const { data: row, error: insErr } = await supabaseAdmin
      .from("dispute_evidence")
      .insert({
        dispute_id: data.dispute_id,
        user_id: userId,
        storage_path: data.storage_path,
        file_name: data.file_name,
        mime_type: data.mime_type,
        size_bytes: data.size_bytes,
      })
      .select("id")
      .single();

    if (insErr) {
      await supabaseAdmin.storage.from("evidence").remove([data.storage_path]);
      return { ok: false as const, code: "insert_failed" };
    }

    await logEvent({
      userId,
      action: "evidence.upload",
      resourceType: "dispute_evidence",
      resourceId: row.id,
      metadata: { mime: data.mime_type, size: data.size_bytes, dispute_id: data.dispute_id },
    });

    return { ok: true as const, id: row.id };
  });

const StagedInput = z.object({
  storage_path: z.string().min(1).max(512),
  file_name: z.string().min(1).max(255),
  mime_type: z.string().min(1).max(128),
  size_bytes: z.number().int().nonnegative().max(MAX_BYTES),
});

export const logEvidenceStaged = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => StagedInput.parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    if (!data.storage_path.startsWith(`${userId}/`)) {
      return { ok: false as const, code: "path_scope" };
    }
    const ua = getRequestHeader("user-agent") ?? null;
    await logEvent({
      userId,
      action: "evidence.staged",
      resourceType: "storage.evidence",
      userAgent: ua,
      metadata: {
        path: data.storage_path,
        file_name: data.file_name,
        mime: data.mime_type,
        size: data.size_bytes,
      },
    });
    return { ok: true as const };
  });

const RemovedInput = z.object({
  storage_path: z.string().min(1).max(512),
  file_name: z.string().min(1).max(255),
  was_finalized: z.boolean().optional(),
});

export const logEvidenceRemoved = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => RemovedInput.parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    if (!data.storage_path.startsWith(`${userId}/`)) {
      return { ok: false as const, code: "path_scope" };
    }
    const ua = getRequestHeader("user-agent") ?? null;
    await logEvent({
      userId,
      action: "evidence.removed",
      resourceType: "storage.evidence",
      userAgent: ua,
      metadata: {
        path: data.storage_path,
        file_name: data.file_name,
        was_finalized: data.was_finalized ?? false,
      },
    });
    return { ok: true as const };
  });

const DisputeCreatedInput = z.object({
  dispute_id: z.string().uuid(),
  category: z.string().min(1).max(64),
  country: z.string().min(1).max(64),
});

export const logDisputeCreated = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => DisputeCreatedInput.parse(data))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    // Verify the dispute belongs to this user (RLS-scoped read)
    const { data: row } = await supabase
      .from("disputes")
      .select("id")
      .eq("id", data.dispute_id)
      .maybeSingle();
    if (!row) {
      return { ok: false as const, code: "not_found" };
    }
    const ua = getRequestHeader("user-agent") ?? null;
    await logEvent({
      userId,
      action: "dispute.created",
      resourceType: "disputes",
      resourceId: data.dispute_id,
      userAgent: ua,
      metadata: { category: data.category, country: data.country },
    });
    return { ok: true as const };
  });
