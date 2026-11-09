// Tavily search helper: finds jurisdiction-specific legal/policy sources.
// Key read from env only. Failures/timeouts return [] so analysis never breaks.
// deno-lint-ignore-file no-explicit-any

export interface TavilySource {
  title: string;
  url: string;
  domain: string;
  content: string;
}

const OFFICIAL_DOMAINS: Record<string, string[]> = {
  Singapore: ["case.org.sg", "cccs.gov.sg", "sso.agc.gov.sg", "judiciary.gov.sg", "mti.gov.sg"],
  Thailand: ["ocpb.go.th", "krisdika.go.th", "tourismthailand.org", "caat.or.th"],
  Malaysia: ["mavcom.my", "kpdn.gov.my", "ttpm.kpdn.gov.my", "agc.gov.my"],
  Vietnam: ["vcca.gov.vn", "moit.gov.vn", "vietnamtourism.gov.vn"],
  Indonesia: ["bpkn.go.id", "kemendag.go.id", "peraturan.go.id"],
};
const PLATFORM_DOMAINS = ["trip.com", "agoda.com", "booking.com", "klook.com", "airasia.com"];

const CATEGORY_TERMS: Record<string, string> = {
  hotel: "hotel booking refund denied check-in consumer protection",
  flight: "flight delay cancellation refund compensation passenger rights",
  insurance: "travel insurance claim denial cancellation consumer protection",
};

async function sha(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function searchLegalSources(
  args: { country: string; category: string; ota?: string },
  admin: any,
  userId: string,
): Promise<TavilySource[]> {
  const key = Deno.env.get("TAVILY_API_KEY");
  if (!key) return [];

  const query = `${args.country} ${CATEGORY_TERMS[args.category] ?? "travel refund consumer law"}${args.ota ? ` ${args.ota} refund policy` : ""}`;
  const domains = [...(OFFICIAL_DOMAINS[args.country] ?? []), ...PLATFORM_DOMAINS];
  const hash = await sha(query + "|" + domains.join(","));
  const cacheName = `tavily:${hash.slice(0, 32)}`;

  // 7-day cache
  try {
    const { data: cached } = await admin
      .from("ota_rules_cache")
      .select("raw_content, fetched_at")
      .eq("ota_name", cacheName)
      .maybeSingle();
    if (cached && Date.now() - new Date(cached.fetched_at).getTime() < 7 * 86400_000) {
      return JSON.parse(cached.raw_content) as TavilySource[];
    }
  } catch { /* ignore */ }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    await admin.from("audit_logs").insert({
      user_id: userId,
      action: "tavily.search_triggered",
      metadata: { country: args.country, category: args.category, ota: args.ota ?? null },
    });
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        query,
        search_depth: "advanced",
        max_results: 6,
        include_domains: domains,
      }),
    });
    if (!res.ok) {
      console.error("[tavily] upstream", res.status, (await res.text()).slice(0, 300));
      return [];
    }
    const json = await res.json();
    const sources: TavilySource[] = (json?.results ?? [])
      .filter((r: any) => typeof r?.url === "string" && r.url.startsWith("https://"))
      .slice(0, 6)
      .map((r: any) => ({
        title: String(r.title ?? "").slice(0, 200),
        url: r.url,
        domain: new URL(r.url).hostname.replace(/^www\./, ""),
        content: String(r.content ?? "").slice(0, 1200),
      }));
    if (sources.length) {
      await admin.from("ota_rules_cache").upsert(
        {
          ota_name: cacheName,
          raw_content: JSON.stringify(sources),
          source_url: "https://api.tavily.com/search",
          content_hash: hash,
          fetched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "ota_name,source_url" },
      );
    }
    return sources;
  } catch (e) {
    console.error("[tavily] failed", (e as Error)?.name);
    return [];
  } finally {
    clearTimeout(timer);
  }
}
