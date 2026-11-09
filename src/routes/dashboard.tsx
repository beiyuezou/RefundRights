import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2,
  FileText,
  Loader2,
  Plane,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { type CategoryKey } from "@/lib/categories";
import { CLOSED_STATUSES, isCaseStatus, nextStep, totalRecovered } from "@/lib/case-status";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My disputes · RefundRights" },
      { name: "description", content: "Your saved travel disputes and AI rights analyses." },
    ],
  }),
  component: DashboardPage,
});

type DisputeRow = {
  id: string;
  category: CategoryKey;
  country: string;
  city: string | null;
  status: string;
  created_at: string;
  case_status: string;
  case_status_at: string;
  recovered_amount: number | null;
  currency: string | null;
  dispute_analyses: { risk_level: string; confidence: number }[] | null;
};

const ICONS: Record<CategoryKey, typeof Building2> = {
  hotel: Building2,
  flight: Plane,
  insurance: ShieldAlert,
};

const RISK_COLOR: Record<string, string> = {
  strong: "bg-[var(--risk-strong)] text-white",
  moderate: "bg-[var(--risk-moderate)] text-white",
  weak: "bg-[var(--risk-weak)] text-white",
};

function DashboardPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<DisputeRow[] | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/dashboard" } });
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("disputes")
        .select(
          "id, category, country, city, status, created_at, case_status, case_status_at, recovered_amount, currency, dispute_analyses(risk_level, confidence)",
        )
        .order("created_at", { ascending: false });
      if (error) {
        if (import.meta.env.DEV) console.error(error);
        setRows([]);
        return;
      }
      setRows(data as unknown as DisputeRow[]);
    })();
  }, [authLoading, user, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">{t("dashboard.title")}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("dashboard.sub")}</p>
            </div>
            <Link
              to="/claim/$category"
              params={{ category: "hotel" }}
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground hover:opacity-95"
            >
              <Plus className="h-4 w-4" /> {t("dashboard.newDispute")}
            </Link>
          </div>

          {rows && rows.length > 0 && (
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-xs text-muted-foreground">{t("tracker.openCases")}</p>
                <p className="mt-1 text-2xl font-bold text-primary">
                  {rows.filter((r) => !CLOSED_STATUSES.includes(r.case_status as never)).length}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-xs text-muted-foreground">{t("tracker.totalRecovered")}</p>
                <p className="mt-1 text-2xl font-bold text-accent">
                  {totalRecovered(rows).toLocaleString()}
                  {(() => { const c = [...new Set(rows.filter((r) => r.case_status === "refunded" && r.currency).map((r) => r.currency))]; return c.length === 1 ? ` ${c[0]}` : ""; })()}
                </p>
              </div>
            </div>
          )}

          {rows === null ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <FileText className="h-6 w-6" />
              </span>
              <h2 className="mt-3 text-lg font-semibold text-primary">{t("dashboard.empty")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.emptySub")}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {(["hotel", "flight", "insurance"] as CategoryKey[]).map((k) => (
                  <Link
                    key={k}
                    to="/claim/$category"
                    params={{ category: k }}
                    className="inline-flex h-10 items-center rounded-md border border-input bg-background px-4 text-sm font-medium text-primary hover:bg-secondary"
                  >
                    {t(`categories.${k}.label`)}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {rows.map((r) => {
                const Icon = ICONS[r.category];
                const a = r.dispute_analyses?.[0];
                return (
                  <li key={r.id}>
                    <Link
                      to="/analysis/$disputeId"
                      params={{ disputeId: r.id }}
                      className="block rounded-xl border border-border bg-card p-4 sm:p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated hover:border-accent/40"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                          <Icon className="h-5 w-5" strokeWidth={2.4} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-primary truncate">
                              {t(`categories.${r.category}.label`)}
                            </h3>
                            {a ? (
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${RISK_COLOR[a.risk_level] ?? "bg-muted text-foreground"}`}
                              >
                                {a.risk_level} · {a.confidence}%
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {r.status}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {t(`countries.${r.country}`, { defaultValue: r.country })}
                            {r.city ? ` · ${r.city}` : ""} ·{" "}
                            {new Date(r.created_at).toLocaleDateString()}
                          </p>
                          {isCaseStatus(r.case_status) && (
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              <span className="inline-flex items-center rounded-full bg-primary-soft px-2 py-0.5 font-semibold text-primary">
                                {t(`tracker.status_${r.case_status}`)}
                              </span>
                              <span className="text-muted-foreground">
                                {t(`tracker.next_${nextStep(r.case_status, new Date(r.case_status_at))}`)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
