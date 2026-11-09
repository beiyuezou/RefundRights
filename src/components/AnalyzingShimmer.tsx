import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

/**
 * Full-card shimmer shown while analyze-dispute is running.
 * Rotates 3 status lines so the user understands what is happening
 * behind the scenes (saving → live OTA policy fetch → multi-agent synthesis).
 */
export function AnalyzingShimmer() {
  const { t } = useTranslation();
  const [stepIdx, setStepIdx] = useState(0);

  const steps = [
    t("wizard.analyzeStep1"),
    t("wizard.analyzeStep2"),
    t("wizard.analyzeStep3"),
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setStepIdx((i) => (i + 1) % 3);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card"
    >
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
        <h3 className="text-base font-semibold text-primary">
          {t("wizard.analyzeTitle")}
        </h3>
      </div>

      <p
        key={stepIdx}
        className="mt-3 text-sm text-muted-foreground animate-in fade-in duration-500"
      >
        {steps[stepIdx]}
      </p>

      <div className="mt-5 space-y-2.5" aria-hidden="true">
        <div className="h-3 w-11/12 rounded bg-gradient-to-r from-secondary via-secondary/40 to-secondary animate-pulse" />
        <div className="h-3 w-9/12 rounded bg-gradient-to-r from-secondary via-secondary/40 to-secondary animate-pulse [animation-delay:120ms]" />
        <div className="h-3 w-10/12 rounded bg-gradient-to-r from-secondary via-secondary/40 to-secondary animate-pulse [animation-delay:240ms]" />
        <div className="h-3 w-7/12 rounded bg-gradient-to-r from-secondary via-secondary/40 to-secondary animate-pulse [animation-delay:360ms]" />
      </div>

      <div className="mt-5 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === stepIdx
                ? "w-8 bg-accent"
                : "w-4 bg-secondary"
            }`}
          />
        ))}
      </div>
    </div>
  );
}