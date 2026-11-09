# Demo case on Nemotron + labelled live sources

## Demo case
- Case: Singapore hotel booked on Trip.com, wrong gender field, SGD 320 (English story, 30 May).
- Re-run the analysis on Nemotron (English master), then make the Chinese report (Nano, with Super fallback).
- Delete only this case's old Gemini reports (by case id and model). Other cases are untouched.
- Check the analysis page in English and Chinese: model badge shows Nemotron, verdict/confidence/argument count match across languages.
- The case is currently not unlocked, so judges will see the free preview. If you want the full report shown, unlock it with the special code during the demo (uses 1 of the 8 uses), or tell me and I'll mark it unlocked.

## Source labels (Tavily / Bright Data)
Today the report lists sources, but only Tavily search results are saved, and nothing says where they came from. Bright Data and official consumer-law pages are used in the analysis but not shown.
- Save each source with where it came from: "Live search · Tavily", "Platform policy · Bright Data", or "Official law source".
- Show a small label on each source in the report and the PDF, plus one line under the Sources heading: "Retrieved live before analysis via Tavily search and Bright Data."
- Older reports without that information show as "Live search · Tavily" (correct, since only Tavily results were saved before).
- Labels in Chinese, English and Dutch.

## Technical details
- `analyze-dispute`: add `provider: "tavily" | "bright_data" | "official"` to each source; append Bright Data OTA cache entries used (ota name + allowlisted URL) and official legal sources (CASE/CCCS etc., URL) to `sources`. Translation rows copy master sources unchanged.
- Front end: `sources` type gains optional `provider`; badge rendering on analysis and print pages; strings in `locales/extra.ts`.
- Re-run triggered via the function with a minted session for the case owner; old rows deleted with a filter on that dispute id and `model like 'google/%'`.
