import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarDays, Scale } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ARTICLES, getArticle } from "@/lib/knowledge";
import type { CategoryKey } from "@/lib/categories";
import { CASES, type CaseOutcome } from "@/lib/knowledge-cases";

const OUTCOME_STYLE: Record<CaseOutcome, string> = {
  full: "bg-risk-strong/15 text-risk-strong",
  partial: "bg-risk-moderate/20 text-accent-foreground dark:text-risk-moderate",
  rejected: "bg-risk-weak/15 text-risk-weak",
};
const OUTCOME_LABEL: Record<CaseOutcome, string> = {
  full: "Full refund",
  partial: "Partial refund",
  rejected: "Rejected",
};

export const Route = createFileRoute("/knowledge_/$slug")({
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.article;
    if (!a) return { meta: [{ title: "Article — RefundRights" }] };
    return {
      meta: [
        { title: `${a.title} · RefundRights` },
        { name: "description", content: a.summary },
        { property: "og:title", content: a.title },
        { property: "og:description", content: a.summary },
      ],
    };
  },
  notFoundComponent: NotFoundFallback,
  component: ArticlePage,
});

function NotFoundFallback() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-primary">{t("knowledge.notFound")}</h1>
        <Link
          to="/knowledge"
          className="mt-4 inline-flex items-center gap-1.5 text-accent font-semibold"
        >
          <ArrowLeft className="h-4 w-4" /> {t("knowledge.backToKb")}
        </Link>
      </div>
    </div>
  );
}

const CAT_TO_CLAIM: Record<string, CategoryKey> = {
  hotel: "hotel",
  flight: "flight",
  insurance: "insurance",
  general: "hotel",
  transport: "hotel",
};

function ArticlePage() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams({ from: "/knowledge_/$slug" });
  const article = getArticle(slug)!;
  const claimCategory = CAT_TO_CLAIM[article.category];
  const related = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);
  const cases = CASES[article.slug] ?? [];
  const dateLocale = i18n.language?.startsWith("zh") ? "zh-CN" : undefined;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
          <Link
            to="/knowledge"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> {t("knowledge.allGuides")}
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
              {t(`countries.${article.country}`, { defaultValue: article.country })}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {t("knowledge.updated", {
                date: new Date(article.updated).toLocaleDateString(dateLocale, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }),
              })}
            </span>
          </div>

          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">
            {article.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">{article.summary}</p>

          <Section title={t("knowledge.rights")}>
            <ul className="space-y-2.5">
              {article.rights.map((r, i) => (
                <Bullet key={i}>{r}</Bullet>
              ))}
            </ul>
          </Section>

          <Section title={t("knowledge.stepsTake")}>
            <ol className="space-y-3">
              {article.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-foreground leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </Section>

          {cases.length > 0 && (
            <Section title={t("knowledge.cases", { defaultValue: "Example cases" })}>
              <div className="space-y-4">
                {cases.map((c, i) => (
                  <article key={i} className="rounded-xl border border-border bg-card p-5 shadow-card">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h4 className="min-w-0 text-base font-semibold text-primary leading-snug">{c.title}</h4>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${OUTCOME_STYLE[c.outcome]}`}>
                        {t(`knowledge.outcome_${c.outcome}`, { defaultValue: OUTCOME_LABEL[c.outcome] })}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {c.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                    <dl className="mt-4 space-y-2.5 text-sm">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("knowledge.caseHappened", { defaultValue: "What happened" })}</dt>
                        <dd className="mt-0.5 text-foreground leading-relaxed">{c.situation}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("knowledge.caseAction", { defaultValue: "What they did" })}</dt>
                        <dd className="mt-0.5 text-foreground leading-relaxed">{c.action}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("knowledge.caseOutcome", { defaultValue: "Outcome" })}</dt>
                        <dd className="mt-0.5 text-foreground leading-relaxed">{c.result}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">{t("knowledge.casesDisclaimer", { defaultValue: "Illustrative examples, not legal advice." })}</p>
                <Link to="/claim/$category" params={{ category: claimCategory }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:opacity-90">
                  {t("knowledge.startSimilar", { defaultValue: "Start a similar claim" })} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Section>
          )}


          <Section title={t("knowledge.escalate")}>
            <ul className="space-y-2.5">
              {article.escalation.map((e, i) => (
                <Bullet key={i}>{e}</Bullet>
              ))}
            </ul>
          </Section>

          <Section title={t("knowledge.templates")}>
            <div className="space-y-3">
              {article.templates.map((tmpl, i) => (
                <blockquote
                  key={i}
                  className="rounded-lg border-l-4 border-accent bg-secondary/40 p-4 text-foreground italic"
                >
                  "{tmpl}"
                </blockquote>
              ))}
            </div>
          </Section>

          {/* CTA */}
          <div className="mt-10 rounded-2xl border border-border bg-primary text-primary-foreground p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <Scale className="h-6 w-6 text-accent" />
              <div>
                <h3 className="text-xl font-bold">{t("knowledge.haveCase")}</h3>
                <p className="mt-1 text-primary-foreground/80">{t("knowledge.haveCaseSub")}</p>
              </div>
            </div>
            <Link
              to="/claim/$category"
              params={{ category: claimCategory }}
              className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground hover:opacity-95"
            >
              {t("home.startClaim")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-8 rounded-md border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
            <strong className="text-primary">{t("analysis.disclaimer")}</strong> {t("analysis.disclaimerBody")}
          </p>

          {/* Related */}
          <section className="mt-12">
            <h3 className="text-lg font-bold text-primary">{t("knowledge.moreGuides")}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {related.map((a) => (
                <Link
                  key={a.slug}
                  to="/knowledge/$slug"
                  params={{ slug: a.slug }}
                  className="rounded-xl border border-border bg-card p-4 shadow-card hover:border-accent/40 hover:shadow-elevated transition-all"
                >
                  <span className="text-xs font-semibold text-primary">
                    {t(`countries.${a.country}`, { defaultValue: a.country })}
                  </span>
                  <p className="mt-1 text-sm font-semibold text-primary leading-snug">
                    {a.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-primary">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      <span className="text-foreground leading-relaxed">{children}</span>
    </li>
  );
}
