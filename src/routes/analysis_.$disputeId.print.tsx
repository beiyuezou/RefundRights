import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Printer, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { getAnalysisReport } from "@/lib/report.functions";
import type { ReportRow } from "@/lib/paywall";

export const Route = createFileRoute("/analysis_/$disputeId/print")({
  head: () => ({
    meta: [
      { title: "Rights analysis report (PDF) · RefundRights" },
      { name: "description", content: "Printable rights analysis report for your travel dispute." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrintPage,
});

type D = { id: string; category: string; country: string; city: string | null; story: string; amount: number | null; currency: string | null; incident_date: string | null };

function PrintPage() {
  const { t, i18n } = useTranslation();
  const { disputeId } = useParams({ from: "/analysis_/$disputeId/print" });
  const { user, loading } = useAuth();
  const fetchReport = useServerFn(getAnalysisReport);
  const [d, setD] = useState<D | null>(null);
  const [row, setRow] = useState<ReportRow | null>(null);
  const [paid, setPaid] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    (async () => {
      const [{ data }, rep] = await Promise.all([
        supabase.from("disputes").select("id, category, country, city, story, amount, currency, incident_date").eq("id", disputeId).maybeSingle(),
        fetchReport({ data: { dispute_id: disputeId } }),
      ]);
      setD(data as D | null);
      setPaid(rep.paid);
      const master = rep.rows.find((r) => !r.parent_analysis_id) ?? rep.rows[0];
      const want = i18n.language?.startsWith("zh") ? "zh" : "en";
      const pick = master && (master.language === want ? master : rep.rows.find((r) => r.parent_analysis_id === master.id && r.language === want) ?? master);
      setRow(pick ?? null);
    })();
  }, [loading, user, disputeId, fetchReport, i18n.language]);

  if (loading || (user && paid === null)) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!user || !paid || !row || !d) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-muted-foreground">{t("report.locked")}</p>
        <Link to="/analysis/$disputeId" params={{ disputeId }} className="mt-4 inline-block text-sm font-semibold text-accent">
          {t("analysis.backToDisputes")}
        </Link>
      </div>
    );
  }
  const points = (row.leverage_points ?? []) as { title: string; detail: string }[];
  const sources = (row.sources ?? []) as { title: string; url: string; domain: string; provider?: string }[];

  return (
    <div className="print-page bg-background text-foreground">
      <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-background/95 px-4 py-3">
        <Link to="/analysis/$disputeId" params={{ disputeId }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> {t("analysis.backToDisputes")}
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-muted-foreground">{t("report.printHint")}</span>
          <button onClick={() => window.print()} className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground">
            <Printer className="h-4 w-4" /> {t("report.print")}
          </button>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-6 py-10">
        <header className="flex items-center justify-between border-b-2 border-primary pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><Shield className="h-4 w-4" /></span>
            <span className="font-display font-bold text-primary">Refund<span className="text-accent">Rights</span></span>
          </div>
          <span className="text-xs text-muted-foreground">{t("report.generated")}: {new Date(row.created_at).toLocaleDateString()}</span>
        </header>
        <h1 className="mt-6 text-2xl font-bold text-primary">{t("report.printTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(`categories.${d.category}.label`)} · {t(`countries.${d.country}`, { defaultValue: d.country })}
          {d.city ? ` · ${d.city}` : ""}{d.incident_date ? ` · ${d.incident_date}` : ""}
          {d.amount ? ` · ${d.amount} ${d.currency ?? ""}` : ""}
        </p>
        <p className="mt-3 text-sm font-semibold">
          {t("analysis.riskLevel")}: {t(`analysis.risk${row.risk_level[0].toUpperCase()}${row.risk_level.slice(1)}`)} · {row.confidence}%
        </p>

        <Block title={t("report.story")}><p className="whitespace-pre-wrap text-sm">{d.story}</p></Block>
        <Block title={t("analysis.recommendation")}><p className="whitespace-pre-wrap text-sm leading-relaxed">{row.recommendation}</p></Block>
        <Block title={t("analysis.leverage")}>
          <ol className="space-y-3">
            {points.map((p, i) => (
              <li key={i} className="avoid-break text-sm"><strong className="text-primary">{i + 1}. {p.title}</strong><p className="mt-0.5">{p.detail}</p></li>
            ))}
          </ol>
        </Block>
        {sources.length > 0 && (
          <Block title={t("analysis.sources")}>
            <ul className="space-y-1 text-xs">{sources.map((s, i) => <li key={i}>[{t(`srcLabel.${s.provider ?? "tavily"}`)}] {s.title || s.domain} — <span className="text-muted-foreground break-all">{s.url}</span></li>)}</ul>
          </Block>
        )}
        <Block title={t("analysis.draftEmail")}><pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{row.draft_email}</pre></Block>
        <p className="mt-10 border-t border-border pt-3 text-[10px] text-muted-foreground">
          {t("analysis.disclaimer")} {t("analysis.disclaimerBody")} · NVIDIA Nemotron · Nebius Token Factory
        </p>
      </article>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="avoid-break mt-6">
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">{title}</h2>
      {children}
    </section>
  );
}
