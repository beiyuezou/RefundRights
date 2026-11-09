export const CASE_STATUSES = [
  "submitted",
  "email_sent",
  "merchant_replied",
  "escalated",
  "refunded",
  "rejected",
] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export const CLOSED_STATUSES: CaseStatus[] = ["refunded", "rejected"];

/** Days after sending the appeal with no reply before we suggest escalating. */
export const ESCALATE_AFTER_DAYS = 7;

export function isCaseStatus(v: unknown): v is CaseStatus {
  return typeof v === "string" && (CASE_STATUSES as readonly string[]).includes(v);
}

export type NextStep =
  | "send_email"
  | "wait_reply"
  | "escalate_now"
  | "review_reply"
  | "await_regulator"
  | "closed";

export function nextStep(status: CaseStatus, statusAt: Date, now: Date = new Date()): NextStep {
  switch (status) {
    case "submitted":
      return "send_email";
    case "email_sent": {
      const days = (now.getTime() - statusAt.getTime()) / 86_400_000;
      return days >= ESCALATE_AFTER_DAYS ? "escalate_now" : "wait_reply";
    }
    case "merchant_replied":
      return "review_reply";
    case "escalated":
      return "await_regulator";
    default:
      return "closed";
  }
}

export function totalRecovered(rows: { case_status: string; recovered_amount: number | null }[]): number {
  return rows
    .filter((r) => r.case_status === "refunded" && r.recovered_amount && r.recovered_amount > 0)
    .reduce((s, r) => s + Number(r.recovered_amount), 0);
}

/** Opens the user's own mail app with the draft prefilled. */
export function buildMailto(subject: string, body: string, to = ""): string {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Splits a "Subject: ..." first line off an AI draft email. */
export function splitDraft(draft: string, fallbackSubject: string): { subject: string; body: string } {
  const m = draft.match(/^\s*(?:Subject|主题)\s*[:：]\s*(.+)\n+/i);
  if (m) return { subject: m[1].trim(), body: draft.slice(m[0].length) };
  return { subject: fallbackSubject, body: draft };
}
