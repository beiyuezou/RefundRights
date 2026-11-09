import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CheckCircle2, Circle, Loader2, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CASE_STATUSES, type CaseStatus, isCaseStatus, nextStep } from "@/lib/case-status";

type Event = { id: string; status: string; note: string | null; created_at: string };

export type TrackedDispute = {
  id: string;
  user_id?: string;
  case_status: string;
  case_status_at: string;
  recovered_amount: number | null;
  currency: string | null;
};

/** Records a status change: updates the case and appends a timeline event. */
export async function recordCaseStatus(
  disputeId: string,
  status: CaseStatus,
  note?: string,
  recovered?: number | null,
) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("auth");
  const patch: { case_status: CaseStatus; recovered_amount?: number | null } = { case_status: status };
  if (recovered !== undefined) patch.recovered_amount = recovered;
  const { error } = await supabase.from("disputes").update(patch).eq("id", disputeId);
  if (error) throw error;
  await supabase
    .from("dispute_events")
    .insert({ dispute_id: disputeId, user_id: u.user.id, status, note: note?.trim() || null });
}

export function CaseTracker({
  dispute,
  onChange,
  refreshKey = 0,
}: {
  dispute: TrackedDispute;
  onChange: (d: Partial<TrackedDispute>) => void;
  refreshKey?: number;
}) {
  const { t } = useTranslation();
  const current: CaseStatus = isCaseStatus(dispute.case_status) ? dispute.case_status : "submitted";
  const [choice, setChoice] = useState<CaseStatus>(current);
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState(dispute.recovered_amount?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  const loadEvents = useCallback(async () => {
    const { data } = await supabase
      .from("dispute_events")
      .select("id, status, note, created_at")
      .eq("dispute_id", dispute.id)
      .order("created_at", { ascending: false })
      .limit(30);
    setEvents((data ?? []) as Event[]);
  }, [dispute.id]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents, refreshKey]);
  useEffect(() => setChoice(current), [current]);

  const step = nextStep(current, new Date(dispute.case_status_at));
  const currentIdx = CASE_STATUSES.indexOf(current);

  async function save() {
    setSaving(true);
    try {
      const n = amount.trim() === "" ? null : Number(amount);
      const recovered = choice === "refunded" && n !== null && !Number.isNaN(n) && n >= 0 ? n : undefined;
      await recordCaseStatus(dispute.id, choice, note, recovered);
      onChange({
        case_status: choice,
        case_status_at: new Date().toISOString(),
        ...(recovered !== undefined ? { recovered_amount: recovered } : {}),
      });
      setNote("");
      toast.success(t("tracker.updated"));
      await loadEvents();
    } catch {
      toast.error(t("tracker.failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h2 className="flex items-center gap-2 text-base font-semibold text-primary">
        <Flag className="h-4 w-4 text-accent" /> {t("tracker.title")}
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">{t("tracker.sub")}</p>

      <ol className="mt-4 space-y-2">
        {CASE_STATUSES.slice(0, 4).map((s, i) => {
          const done = currentIdx >= i && currentIdx < 4 ? true : currentIdx >= 4;
          return (
            <li key={s} className="flex items-center gap-2 text-sm">
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-accent" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/50" />
              )}
              <span className={s === current ? "font-semibold text-primary" : done ? "text-foreground" : "text-muted-foreground"}>
                {t(`tracker.status_${s}`)}
              </span>
            </li>
          );
        })}
        {currentIdx >= 4 && (
          <li className="flex items-center gap-2 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4" style={{ color: current === "refunded" ? "var(--risk-strong)" : "var(--risk-weak)" }} />
            {t(`tracker.status_${current}`)}
            {current === "refunded" && dispute.recovered_amount ? ` · ${dispute.recovered_amount} ${dispute.currency ?? ""}` : ""}
          </li>
        )}
      </ol>

      <p className="mt-4 rounded-lg bg-accent-soft p-3 text-xs font-medium text-accent-foreground">
        {t(`tracker.next_${step}`)}
      </p>

      <div className="mt-4 space-y-2">
        <select
          aria-label={t("tracker.update")}
          value={choice}
          onChange={(e) => setChoice(e.target.value as CaseStatus)}
          className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"
        >
          {CASE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`tracker.status_${s}`)}
            </option>
          ))}
        </select>
        {choice === "refunded" && (
          <Input
            type="number"
            min={0}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`${t("tracker.recovered")}${dispute.currency ? ` (${dispute.currency})` : ""}`}
            className="h-9"
          />
        )}
        <Input
          value={note}
          maxLength={300}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("tracker.notePlaceholder")}
          className="h-9"
        />
        <Button onClick={save} disabled={saving} size="sm" className="w-full">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {t("tracker.update")}
        </Button>
      </div>

      <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("tracker.history")}
      </h3>
      {events.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">{t("tracker.empty")}</p>
      ) : (
        <ul className="mt-2 space-y-2 border-l border-border pl-3">
          {events.map((e) => (
            <li key={e.id} className="text-xs">
              <span className="font-semibold text-primary">
                {t(`tracker.status_${e.status}`, { defaultValue: e.status })}
              </span>
              <span className="text-muted-foreground"> · {new Date(e.created_at).toLocaleDateString()}</span>
              {e.note && <p className="text-muted-foreground mt-0.5">{e.note}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
