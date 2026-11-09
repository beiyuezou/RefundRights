import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { submitHelpRequest } from "@/lib/help-request.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Request human help · RefundRights" },
      { name: "description", content: "Ask the RefundRights team to manually review your travel refund case and build a strategy." },
      { property: "og:title", content: "Request human help · RefundRights" },
      { property: "og:description", content: "Get a manual review of your travel refund dispute." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HelpPage,
});

type Slot = "morning" | "afternoon" | "evening" | "any";
const field = "mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

function HelpPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const submit = useServerFn(submitHelpRequest);
  const [cases, setCases] = useState<{ id: string; label: string }[]>([]);
  const [email, setEmail] = useState("");
  const [disputeId, setDisputeId] = useState("");
  const [summary, setSummary] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<Slot>("any");
  const [tz, setTz] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try { setTz(Intl.DateTimeFormat().resolvedOptions().timeZone); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.email) setEmail((e) => e || user.email!);
    supabase.from("disputes").select("id, category, country, created_at").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setCases((data ?? []).map((d) => ({
        id: d.id,
        label: `${d.category} · ${d.country} · ${new Date(d.created_at).toLocaleDateString()}`,
      }))));
  }, [user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErr(t("help.errEmail"));
    if (!disputeId && summary.trim().length < 10) return setErr(t("help.errSummary"));
    setBusy(true);
    try {
      const res = await submit({ data: {
        contact_email: email.trim(),
        dispute_id: disputeId || null,
        case_summary: summary.trim() || null,
        preferred_date: date || null,
        preferred_slot: slot,
        timezone: tz.trim() || null,
        notes: notes.trim() || null,
      } });
      if (res.ok) setDone(true);
      else setErr(res.code === "rate_limited" ? t("help.errRate") : t("help.errGeneric"));
    } catch {
      setErr(t("help.errGeneric"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-xl px-4 sm:px-6 py-12">
        {done ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-accent" />
            <h1 className="mt-4 text-2xl font-bold text-primary">{t("help.done")}</h1>
            <p className="mt-2 text-muted-foreground">{t("help.doneSub")}</p>
            <Button asChild className="mt-6"><Link to="/">{t("help.back")}</Link></Button>
          </div>
        ) : !user ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <h1 className="text-2xl font-bold text-primary">{t("help.title")}</h1>
            <p className="mt-2 text-muted-foreground">{t("help.signInRequired", { defaultValue: "Please sign in to request expert help." })}</p>
            <Button asChild className="mt-6"><Link to="/auth" search={{ redirect: "/help" }}>{t("help.signIn", { defaultValue: "Sign in" })}</Link></Button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-primary tracking-tight">{t("help.title")}</h1>
            <p className="mt-2 text-muted-foreground">{t("help.sub")}</p>
            <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-3xl border border-border bg-card p-6 sm:p-8">
              <label className="block text-sm font-medium text-foreground">{t("help.email")}
                <input type="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
              </label>
              {cases.length > 0 && (
                <label className="block text-sm font-medium text-foreground">{t("help.case")}
                  <select value={disputeId} onChange={(e) => setDisputeId(e.target.value)} className={field}>
                    <option value="">{t("help.noCase")}</option>
                    {cases.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </label>
              )}
              <label className="block text-sm font-medium text-foreground">{t("help.summary")}
                <textarea rows={4} maxLength={2000} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder={t("help.summaryPh")} className={field} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">{t("help.date")}
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
                </label>
                <label className="block text-sm font-medium text-foreground">{t("help.slot")}
                  <select value={slot} onChange={(e) => setSlot(e.target.value as Slot)} className={field}>
                    {(["any", "morning", "afternoon", "evening"] as const).map((s) => <option key={s} value={s}>{t(`help.${s}`)}</option>)}
                  </select>
                </label>
              </div>
              <label className="block text-sm font-medium text-foreground">{t("help.tz")}
                <input maxLength={64} value={tz} onChange={(e) => setTz(e.target.value)} className={field} />
              </label>
              <label className="block text-sm font-medium text-foreground">{t("help.notes")}
                <textarea rows={2} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} className={field} />
              </label>
              {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
              <Button type="submit" disabled={busy} className="w-full">
                {busy ? <><Loader2 className="h-4 w-4 animate-spin" />{t("help.sending")}</> : t("help.submit")}
              </Button>
            </form>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
