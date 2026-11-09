import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/SiteChrome";
import { Shield } from "lucide-react";

const searchSchema = z.object({
  redirect: z
    .string()
    .optional()
    .refine((v) => !v || (v.startsWith("/") && !v.startsWith("//")), {
      message: "Invalid redirect",
    }),
  draft: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — RefundRights" },
      { name: "description", content: "Sign in or create an account to save your disputes." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!z.string().email().safeParse(cleanEmail).success) {
        toast.error(t("auth.errEmail"));
        return;
      }
      if (password.length < 8) {
        toast.error(t("auth.errPw"));
        return;
      }
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) {
          if (error.message.toLowerCase().includes("already")) {
            toast.error(t("auth.errExists"));
          } else {
            if (import.meta.env.DEV) console.warn("signup error", error);
            toast.error(t("auth.errGeneric"));
          }
          return;
        }
        toast.success(t("auth.created"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) {
          toast.error(t("auth.errInvalid"));
          return;
        }
        toast.success(t("auth.welcome"));
      }
      const candidate = search.redirect;
      const safe =
        candidate && candidate.startsWith("/") && !candidate.startsWith("//")
          ? candidate
          : "/dashboard";
      navigate({ to: safe });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Shield className="h-6 w-6" strokeWidth={2.4} />
            </span>
            <h1 className="mt-4 text-2xl font-bold text-primary">
              {mode === "signup" ? t("auth.signupTitle") : t("auth.signinTitle")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signup" ? t("auth.signupSub") : t("auth.signinSub")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.pwPh")}
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-accent text-accent-foreground hover:opacity-95 h-11 font-semibold"
            >
              {busy ? t("auth.pleaseWait") : mode === "signup" ? t("auth.create") : t("auth.signin")}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {mode === "signup" ? t("auth.haveAccount") : t("auth.newHere")}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="font-semibold text-accent hover:underline"
              >
                {mode === "signup" ? t("auth.signin") : t("auth.create")}
              </button>
            </p>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">{t("auth.disclaimer")}</p>
        </div>
      </main>
    </div>
  );
}
