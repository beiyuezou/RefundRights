# Remove Bright Data, use Tavily for search + page extraction

## Impact (answer)
Removing Bright Data does not break the app. Today it only does two things inside the AI analysis:
1. Fetch the detected platform's refund policy page (Agoda, Booking.com, Trip.com, etc.).
2. Fetch official law pages (Singapore CASE/CCCS).

Its key is already expired, so analyses currently fall back to old cached text anyway. Tavily already powers the live legal search. Tavily also has an "Extract" feature that reads a full web page and returns clean text, so it can replace both jobs. Benefits: one fewer paid service and key, simpler code, fewer failure points. Trade-off: some heavily protected platform pages may block Tavily Extract; in that case we fall back to cached text or Tavily search snippets, and the analysis still runs.

## What changes for the user
- Reports keep the same sources section; the "Platform policy · Bright Data" label becomes "Platform policy · Tavily".
- Old reports already labelled Bright Data still display correctly.
- No change to price, unlock, languages or results format.

## Steps
1. Add Tavily Extract to the existing Tavily helper: takes a URL from the existing allowlist (same anti-SSRF validation), timeout, returns trimmed text; failures log server-side and return nothing.
2. In the analysis function, replace Bright Data calls with Tavily Extract for the platform policy page and official law pages; keep the existing cache table as fallback (rename source to tavily on new writes), and keep the audit event renamed to `tavily.extract_triggered`.
3. Delete the Bright Data service file and the `/api/public/scrape-browser` route.
4. Update source labels and the loading message text (EN/ZH/NL); keep showing old `bright_data` labels for legacy reports.
5. Update README, SECURITY.md, .env.example, AGENTS.md; remove Bright Data secrets (`BRIGHT_DATA_API_KEY`, zone/browser secrets) after confirming nothing uses them.
6. Redeploy the analysis function, run one demo case end to end and confirm platform policy text is extracted, and run existing tests.

## Technical notes
- Tavily Extract endpoint: `POST https://api.tavily.com/extract` with `urls`, using existing `TAVILY_API_KEY`.
- `ota_rules_cache` table stays (no migration needed); provider value `tavily` for new rows.
