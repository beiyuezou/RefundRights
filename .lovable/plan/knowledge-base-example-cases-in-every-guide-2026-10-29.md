# Knowledge base: example cases in every guide

Add 2–3 short, realistic example cases to each of the 7 guides, in English.

## What you'll see
- A new **"Example cases"** section on each guide page, between "Steps to take" and "Where to escalate".
- Each case is a small card with:
  - a title and tags, e.g. "Bangkok hotel · ฿8,000 deposit";
  - **What happened**: 1–2 sentences;
  - **What they did**: the key action, such as a demand letter, an OCPB complaint or a chargeback;
  - **Outcome**: a coloured badge (Full refund / Partial refund / Rejected) and one line on the result and how long it took.
- One case per guide ends badly ("Rejected") or only partly well, with the lesson learned, so the guides stay credible.
- A short "Illustrative examples, not legal advice" note under the section.
- A "Start a similar claim" link under the cases that opens the matching dispute form.
- Light and dark modes are both supported.

## Example topics, about 18 cases in total
- Thailand hotel deposits: a "damage" charge for a pre-existing stain; a card hold not released after 30 days; cash withheld (rejected because there were no checkout photos).
- Thailand tours: an island tour cancelled for "weather" with no refund; a Phi Phi trip operator that disappeared.
- Singapore hotels: an Agoda/Booking room mismatch; a non-refundable rate after the hotel itself cancelled.
- Singapore Lemon Law: a spa package not as described; a defective rental gear package.
- Malaysia flights: a 6-hour delay compensated; a missed connection; a "weather" excuse that failed.
- Insurance: an "unattended baggage" denial overturned; a pre-existing condition denial upheld.
- Vietnam transport: a rigged taxi meter; motorbike rental "scratch" extortion; a passport held as deposit.

## Note
These cases are written as realistic illustrations, not real verified court records. Tell me if you want real, cited cases instead.

## Technical details
- Add an optional `cases: { title, tags[], situation, action, outcome: "full" | "partial" | "rejected", result }[]` field to `Article` in `src/lib/knowledge.ts`, and fill it for all 7 guides.
- Render the cases in `src/routes/knowledge.$slug.tsx` as a new section using semantic tokens: `risk-strong`, `risk-moderate` and `risk-weak` for the badges.
- Add i18n keys only for the section labels: `knowledge.cases`, `whatHappened`, `whatDone`, `outcome`, `outcomeFull/Partial/Rejected`, `casesDisclaimer`. Case content stays in English.
- Check one guide with screenshots at 1280px and 390px.
