import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Plane,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  ScrollText,
  FileText,
  Check,
  Lock,
  Cpu,
  Search,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { type CategoryKey } from "@/lib/categories";
import { ARTICLES } from "@/lib/knowledge";
import { HeroPreviewCard } from "@/components/HeroPreviewCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RefundRights — Don't let them keep your money" },
      {
        name: "description",
        content:
          "AI-powered legal assistant for travel disputes in Southeast Asia. Hotel deposits, flight delays, insurance denials — get a rights analysis and a draft complaint in minutes.",
      },
      { property: "og:title", content: "RefundRights — Don't let them keep your money" },
      {
        property: "og:description",
        content:
          "Free, AI-powered rights analysis for travelers fighting hotels, airlines, and booking platforms across Southeast Asia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const CATEGORY_ICONS: Record<CategoryKey, typeof Building2> = {
  hotel: Building2,
  flight: Plane,
  insurance: ShieldAlert,
};

function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background"
        />
        <div
          aria-hidden
          className="absolute -top-24 -right-24 -z-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-20 pb-12 sm:pb-20">
          <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-xs font-semibold text-accent uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> {t("home.badge")}
            </span>
            <h1 className="mt-4 sm:mt-5 text-[2.1rem] sm:text-6xl font-extrabold tracking-tight text-primary leading-[1.08] sm:leading-[1.05]">
              {t("home.headline1")} <br className="hidden sm:block" />
              {t("home.headline2")} <span className="text-accent">{t("home.headlineMoney")}</span>.
            </h1>
            <p className="mt-4 sm:mt-5 text-base sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              {t("home.subtext")}
            </p>
            <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
              <Link
                to="/claim/$category"
                params={{ category: "hotel" }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-4 sm:px-6 text-base font-semibold text-accent-foreground shadow-elevated transition-all hover:opacity-95"
              >
                {t("home.startDispute")} <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-input bg-background px-4 sm:px-5 text-base font-medium text-primary transition-colors hover:bg-secondary"
              >
                {t("home.howItWorks")}
              </a>
            </div>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" /> {t("home.aiPowered")}
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" /> {t("home.seFocused")}
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" /> {t("home.freeStart")}
              </span>
            </div>
          </div>
          <HeroPreviewCard />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              {t("home.whatHappened")}
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl">{t("home.pickCategory")}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {(["hotel", "flight", "insurance"] as CategoryKey[]).map((key) => {
            const Icon = CATEGORY_ICONS[key];
            return (
              <Link
                key={key}
                to="/claim/$category"
                params={{ category: key }}
                className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated hover:border-accent/40"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors group-hover:bg-accent">
                  <Icon className="h-6 w-6" strokeWidth={2.2} />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-primary">{t(`categories.${key}.label`)}</h3>
                <p className="text-sm font-medium text-accent mt-0.5">{t(`categories.${key}.tagline`)}</p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {t(`categories.${key}.description`)}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:text-accent transition-colors">
                  {t("home.startClaim")} <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-secondary/40 border-y border-border/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            {t("home.threeSteps")}
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", title: t("home.step1Title"), body: t("home.step1Body"), Icon: ScrollText },
              { n: "02", title: t("home.step2Title"), body: t("home.step2Body"), Icon: Sparkles },
              { n: "03", title: t("home.step3Title"), body: t("home.step3Body"), Icon: FileText },
            ].map((s) => (
              <div key={s.n} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                    {s.n}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-primary">
                    <s.Icon className="h-5 w-5 text-accent" />
                    <h3 className="font-semibold text-lg">{s.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge teaser */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              {t("home.knowYourRights")}
            </h2>
            <p className="mt-2 text-muted-foreground">{t("home.countryGuides")}</p>
          </div>
          <Link
            to="/knowledge"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
          >
            {t("home.allArticles")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {ARTICLES.slice(0, 3).map((a) => (
            <Link
              key={a.slug}
              to="/knowledge/$slug"
              params={{ slug: a.slug }}
              className="group rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated hover:border-accent/40"
            >
              <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
                {t(`countries.${a.country}`, { defaultValue: a.country })}
              </span>
              <h3 className="mt-3 font-semibold text-primary leading-snug group-hover:text-accent transition-colors">
                {a.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{a.summary}</p>
            </Link>
          ))}
        </div>
        <div className="mt-6 sm:hidden">
          <Link
            to="/knowledge"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
          >
            {t("home.allArticles")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Value comparison */}
      <section className="bg-secondary/40 border-y border-border/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">{t("value.title")}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-primary">{t("value.free")}</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {(["f1", "f2"] as const).map((k) => (
                  <li key={k} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-accent" />{t(`value.${k}`)}</li>
                ))}
                {(["f3", "f4", "f5", "f6"] as const).map((k) => (
                  <li key={k} className="flex gap-2 text-muted-foreground"><Lock className="h-4 w-4 shrink-0" />{t(`value.${k}`)}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-accent bg-card p-6 shadow-elevated">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-primary">{t("value.full")}</h3>
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">{t("value.price")}</span>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm">
                {(["f1", "f2", "f3", "f4", "f5", "f6"] as const).map((k) => (
                  <li key={k} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-accent" />{t(`value.${k}`)}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5"><Cpu className="h-4 w-4 text-accent" />{t("faq.poweredBy")}</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5"><Search className="h-4 w-4 text-accent" />{t("faq.grounded")}</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">{t("faq.title")}</h2>
        <Accordion type="single" collapsible className="mt-6">
          {[1, 2, 3, 4, 5].map((n) => (
            <AccordionItem key={n} value={`q${n}`}>
              <AccordionTrigger className="text-left font-semibold text-primary">{t(`faq.q${n}`)}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {t(`faq.a${n}`)}
                {n === 4 && (
                  <Link to="/help" className="mt-3 inline-flex items-center gap-1.5 font-semibold text-accent hover:underline">
                    {t("help.cta")} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <SiteFooter />
    </div>
  );
}
