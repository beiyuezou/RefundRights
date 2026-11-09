import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useAuth } from "@/lib/auth";
import { deleteMyData } from "@/lib/privacy.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy · RefundRights" },
      { name: "description", content: "What RefundRights collects, why, who processes it, and how to delete your data." },
      { property: "og:title", content: "Privacy · RefundRights" },
      { property: "og:description", content: "How RefundRights protects your case data and evidence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

const SECTIONS = ["collect", "why", "processors", "storage", "retention", "rights"] as const;

function PrivacyPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const del = useServerFn(deleteMyData);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    setBusy(true);
    try {
      const r = await del({ data: { confirm: "DELETE" } });
      if (r.ok) {
        toast.success(t("privacy.deleted"));
        setConfirm("");
      } else toast.error(t("privacy.deleteFailed"));
    } catch {
      toast.error(t("privacy.deleteFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-12">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-accent" />
          <h1 className="text-3xl font-bold text-primary tracking-tight">{t("privacy.title")}</h1>
        </div>
        <p className="mt-3 text-muted-foreground">{t("privacy.intro")}</p>
        <div className="mt-8 space-y-6">
          {SECTIONS.map((s) => (
            <section key={s} className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold text-primary">{t(`privacy.${s}T`)}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t(`privacy.${s}`)}</p>
            </section>
          ))}
          {user && (
            <section className="rounded-2xl border border-destructive/40 bg-card p-6">
              <h2 className="font-semibold text-destructive flex items-center gap-2">
                <Trash2 className="h-4 w-4" />{t("privacy.deleteT")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("privacy.deleteBody")}</p>
              <label className="mt-4 block text-sm text-foreground">
                {t("privacy.deleteConfirm")}
                <input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="DELETE"
                  aria-label={t("privacy.deleteConfirm")}
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <Button variant="destructive" className="mt-4" disabled={confirm !== "DELETE" || busy} onClick={onDelete}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("privacy.deleteBtn")}
              </Button>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
