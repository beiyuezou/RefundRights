import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Hotel, PlaneTakeoff, ShieldAlert, Bus, BookText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ARTICLES, type Article } from "@/lib/knowledge";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "SE Asia traveler rights — Knowledge base · RefundRights" },
      {
        name: "description",
        content:
          "Country-by-country playbooks on consumer protection for travelers: Thailand, Singapore, Malaysia, Vietnam and more.",
      },
      {
        property: "og:title",
        content: "SE Asia traveler rights — Knowledge base · RefundRights",
      },
      {
        property: "og:description",
        content:
          "Practical, jurisdiction-specific guides on hotel deposits, flight delays, transport scams, and insurance traps across Southeast Asia.",
      },
    ],
  }),
  component: KnowledgeIndex,
});

function CategoryIcon({ category }: { category: Article["category"] }) {
  const cls = "h-5 w-5";
  switch (category) {
    case "hotel":
      return <Hotel className={cls} strokeWidth={1.6} />;
    case "flight":
      return <PlaneTakeoff className={cls} strokeWidth={1.6} />;
    case "insurance":
      return <ShieldAlert className={cls} strokeWidth={1.6} />;
    case "transport":
      return <Bus className={cls} strokeWidth={1.6} />;
    default:
      return <BookText className={cls} strokeWidth={1.6} />;
  }
}

function KnowledgeIndex() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-10">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            {t("knowledge.badge")}
          </span>
          <h1 className="mt-5 font-display text-5xl sm:text-6xl font-bold tracking-tight text-primary">
            {t("knowledge.title")}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl leading-relaxed">
            {t("knowledge.subShort")}
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20">
          <div className="grid gap-6 md:gap-8 md:grid-cols-2">
            {ARTICLES.map((a) => (
              <Link
                key={a.slug}
                to="/knowledge/$slug"
                params={{ slug: a.slug }}
                className="group relative rounded-3xl border border-border/70 bg-card p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated hover:border-accent/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary transition-colors group-hover:bg-accent-soft group-hover:text-accent">
                    <CategoryIcon category={a.category} />
                  </span>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                      {t(`countries.${a.country}`, { defaultValue: a.country })}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {t(`knowledge.cat${a.category.charAt(0).toUpperCase() + a.category.slice(1)}`, {
                        defaultValue: a.category,
                      })}
                    </span>
                  </div>
                </div>
                <h2 className="mt-6 font-display text-xl font-semibold text-primary leading-snug group-hover:text-accent transition-colors">
                  {a.title}
                </h2>
                <p className="mt-3 text-[15px] text-muted-foreground line-clamp-3 leading-relaxed font-normal">
                  {a.summary}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                  {t("knowledge.readGuide")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
