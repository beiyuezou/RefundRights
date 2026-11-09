import { Link } from "@tanstack/react-router";
import { Shield, Moon, Sun, Languages, User, LogOut, FileWarning } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth, signOut } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { LANGUAGES } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.split("-")[0] ?? "en";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-primary"
          aria-label={t("nav.language")}
        >
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => i18n.changeLanguage(l.code)}
            className={current === l.code ? "font-semibold text-accent" : ""}
          >
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useTranslation();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="h-9 w-9 text-muted-foreground hover:text-primary"
      aria-label={theme === "dark" ? t("nav.light") : t("nav.dark")}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function AccountMenu({ email }: { email: string | undefined }) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("nav.account")}
          className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary ring-1 ring-border transition-all hover:ring-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <User className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground truncate">
          {email ?? t("nav.account")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="cursor-pointer">
            {t("nav.myDisputes")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/privacy" className="cursor-pointer">
            {t("privacy.menu")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-muted-foreground">
          <LogOut className="mr-2 h-4 w-4" />
          {t("nav.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <Shield className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <span className="font-display font-bold text-lg tracking-tight text-primary">
            Refund<span className="text-accent">Rights</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-1.5">
          <Link
            to="/knowledge"
            className="hidden sm:inline-flex h-9 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {t("nav.knowledge")}
          </Link>
          {user ? (
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex h-9 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {t("nav.myDisputes")}
            </Link>
          ) : (
            <Link
              to="/auth"
              className="hidden sm:inline-flex h-9 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {t("nav.signIn")}
            </Link>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            to="/claim/$category"
            params={{ category: "hotel" }}
            aria-label={t("nav.reportDispute")}
            className="ml-1 inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-accent px-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-all hover:opacity-95 hover:shadow sm:px-4"
          >
            <FileWarning className="h-4 w-4 shrink-0 sm:hidden" strokeWidth={2.2} />
            <span className="hidden sm:inline">{t("nav.reportDispute")}</span>
          </Link>
          {user ? <AccountMenu email={user.email ?? undefined} /> : null}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border/60 bg-background mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Shield className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <span className="font-display font-bold text-primary">
              Refund<span className="text-accent">Rights</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">{t("footer.tagline")}</p>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold text-primary mb-3">{t("footer.tools")}</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/claim/$category" params={{ category: "hotel" }} className="hover:text-primary">{t("footer.hotel")}</Link></li>
            <li><Link to="/claim/$category" params={{ category: "flight" }} className="hover:text-primary">{t("footer.flight")}</Link></li>
            <li><Link to="/claim/$category" params={{ category: "insurance" }} className="hover:text-primary">{t("footer.insurance")}</Link></li>
            <li><Link to="/knowledge" className="hover:text-primary">{t("footer.knowledgeBase")}</Link></li>
            <li><Link to="/privacy" className="hover:text-primary">{t("privacy.title")}</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold text-primary mb-3">{t("footer.important")}</h4>
          <p className="text-muted-foreground leading-relaxed">{t("footer.disclaimer")}</p>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
          <span>{t("footer.notLegal")}</span>
        </div>
      </div>
    </footer>
  );
}
