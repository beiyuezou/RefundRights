import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/lib/theme";
import "@/lib/i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "RefundRights — Fight back against unfair travel charges" },
      {
        name: "description",
        content:
          "AI-powered legal assistant for travel disputes in Southeast Asia: hotel deposits, flight delays, insurance traps. Free to start.",
      },
      { name: "author", content: "RefundRights" },
      { property: "og:title", content: "RefundRights — Fight back against unfair travel charges" },
      {
        property: "og:description",
        content:
          "AI-powered legal assistant for travel disputes, flight delays, and hotel deposit issues across Southeast Asia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "RefundRights — Fight back against unfair travel charges" },
      { name: "description", content: "Your AI-powered legal assistant for SE Asia travel disputes. We help you recover hotel deposits and flight refunds using localized legal expertise." },
      { property: "og:description", content: "Your AI-powered legal assistant for SE Asia travel disputes. We help you recover hotel deposits and flight refunds using localized legal expertise." },
      { name: "twitter:description", content: "Your AI-powered legal assistant for SE Asia travel disputes. We help you recover hotel deposits and flight refunds using localized legal expertise." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/eaSDXDiJpmbp0VxrETpMoHmeeB73/social-images/social-1776653325687-截屏2026-04-20_上午10.48.34.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/eaSDXDiJpmbp0VxrETpMoHmeeB73/social-images/social-1776653325687-截屏2026-04-20_上午10.48.34.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <Outlet />
      <Toaster />
    </ThemeProvider>
  );
}
