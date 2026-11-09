# Home page on phones: tighter, calmer top section

Keep the current teal + gold style; layout and spacing only.

## What you'll see (phones)
- Less empty space above the badge; the heading starts sooner.
- Heading slightly smaller on phones so it fits in 3 lines instead of 4–5.
- Description text a little smaller and easier to read.
- The two buttons sit side by side at full width ("Start dispute" larger, gold; "How it works" outlined), so they are easy to tap.
- The three check-mark points become one compact row of small chips.
- Less gap between the buttons and the sample analysis card, so the card shows sooner when scrolling.
- Desktop stays exactly as it is now.

## Technical details
- `src/routes/index.tsx` hero only: `pt-14` → `pt-8`, grid `gap-12` → `gap-8 lg:gap-12`, h1 `text-4xl` → `text-[2.1rem]`, subtext `text-lg` → `text-base`, buttons in `grid grid-cols-2 sm:flex`, trust points `text-xs` with tighter gap on mobile; all `sm:`/`lg:` values unchanged.
- Verify with screenshots at 390px (EN + 中文) and 1280px.
