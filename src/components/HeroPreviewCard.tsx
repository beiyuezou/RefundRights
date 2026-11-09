import { Building2, CheckCircle2, Mail, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const PCT = 78;

export function HeroPreviewCard() {
  const { t } = useTranslation();
  const r = 36;
  const c = Math.PI * r; // half circle
  const points = [t("home.preview.p1"), t("home.preview.p2"), t("home.preview.p3")];

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div aria-hidden className="absolute -inset-6 -z-10 rounded-[2rem] bg-accent/20 blur-3xl" />
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-elevated transition-transform duration-500 lg:rotate-[1.5deg] lg:hover:rotate-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary truncate">{t("home.preview.title")}</p>
              <p className="text-xs text-muted-foreground truncate">{t("home.preview.meta")}</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("home.preview.example")}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-4 rounded-xl bg-secondary/60 p-4">
          <svg viewBox="0 0 88 50" className="h-14 w-24 shrink-0" aria-hidden>
            <path d="M8 46 A36 36 0 0 1 80 46" fill="none" className="stroke-border" strokeWidth="8" strokeLinecap="round" />
            <path
              d="M8 46 A36 36 0 0 1 80 46"
              fill="none"
              className="stroke-risk-strong"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(c * PCT) / 100} ${c}`}
            />
            <text x="44" y="44" textAnchor="middle" className="fill-primary text-[15px] font-bold">{PCT}%</text>
          </svg>
          <div className="min-w-0">
            <span className="inline-block rounded-full bg-risk-strong/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-risk-strong">
              {t("home.preview.strong")}
            </span>
            <p className="mt-1.5 text-sm text-foreground leading-snug">{t("home.preview.verdict")}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> {t("home.preview.leverage")}
          </p>
          <ul className="mt-2 space-y-2">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-risk-strong" />
                <span className="leading-snug">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-4 hidden overflow-hidden rounded-xl border border-border p-4 min-[400px]:block">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Mail className="h-3.5 w-3.5" /> {t("home.preview.email")}
            </p>
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
              {t("home.preview.draftReady")}
            </span>
          </div>
          <div className="mt-3 space-y-1.5" aria-hidden>
            <div className="h-2 w-11/12 rounded bg-muted" />
            <div className="h-2 w-full rounded bg-muted" />
            <div className="h-2 w-4/5 rounded bg-muted" />
            <div className="h-2 w-2/3 rounded bg-muted" />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card to-transparent" />
        </div>
      </div>
    </div>
  );
}
