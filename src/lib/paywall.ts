import type { Json } from "@/integrations/supabase/types";

/** Per-case price for the full report. */
export const PRICE_CENTS = 990;
export const CURRENCY = "USD";
export const PRICE_VALUE = (PRICE_CENTS / 100).toFixed(2);

type LeveragePoint = { title: string; detail: string };
export type ReportRow = {
  id: string;
  risk_level: string;
  confidence: number;
  recommendation: string;
  leverage_points: Json;
  draft_email: string;
  sources: Json;
  created_at: string;
  language: string;
  parent_analysis_id: string | null;
  model?: string;
};

const LOCKED = "••••••••••••••••••••••••••••••••••••••••";

function teaser(text: string, max: number) {
  const s = (text ?? "").trim();
  const firstSentence = s.split(/(?<=[.!?。！？])\s*/)[0] ?? "";
  const cut = firstSentence.length > max ? firstSentence.slice(0, max) : firstSentence;
  return cut + " …";
}

/** Strip paid content: keep verdict, confidence, a one-line teaser and the number of arguments. */
export function redactReport(row: ReportRow): ReportRow {
  const points = Array.isArray(row.leverage_points)
    ? (row.leverage_points as LeveragePoint[])
    : [];
  return {
    ...row,
    recommendation: teaser(row.recommendation, 160),
    leverage_points: points.map((_, i) => ({
      title: i === 0 ? points[0]?.title ?? LOCKED : LOCKED,
      detail: LOCKED,
    })),
    draft_email: `${LOCKED}\n${LOCKED}\n${LOCKED}`,
    sources: [],
  };
}

/** True only when PayPal captured exactly our price, in our currency, for this case. */
export function isValidCapture(
  payload: unknown,
  disputeId: string,
): boolean {
  const p = payload as {
    status?: string;
    purchase_units?: Array<{
      reference_id?: string;
      payments?: {
        captures?: Array<{
          status?: string;
          custom_id?: string;
          amount?: { value?: string; currency_code?: string };
        }>;
      };
    }>;
  };
  if (p?.status !== "COMPLETED") return false;
  const unit = p.purchase_units?.[0];
  const cap = unit?.payments?.captures?.[0];
  if (!cap || cap.status !== "COMPLETED") return false;
  const linked = cap.custom_id === disputeId || unit?.reference_id === disputeId;
  return (
    linked &&
    cap.amount?.currency_code === CURRENCY &&
    cap.amount?.value === PRICE_VALUE
  );
}

/** Webhook capture resource check (PAYMENT.CAPTURE.COMPLETED). */
export function isValidCaptureResource(resource: unknown): boolean {
  const r = resource as { status?: string; amount?: { value?: string; currency_code?: string } };
  return (
    r?.status === "COMPLETED" &&
    r.amount?.currency_code === CURRENCY &&
    r.amount?.value === PRICE_VALUE
  );
}
