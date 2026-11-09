# Home page: sample analysis card beside the main heading

Keep the current teal + gold style; this is a refinement only.

## What you'll see
- On wide screens the top of the home page becomes two columns: the heading, text and buttons on the left, and a sample **"Rights Analysis" card** on the right that fills the empty space.
- The card shows a realistic example case, for instance "Hotel deposit · Bangkok · ฿5,000", with:
  - a small risk dial (78%, "Strong case", green);
  - a two-line AI verdict that cites the Thai Consumer Protection Act;
  - three short leverage points with check marks;
  - a faded preview of the complaint email, with a "Draft ready" tag.
- A small "Example" label makes it clear this is not the visitor's own case.
- A soft gold glow sits behind the card, and the card is tilted very slightly so it reads as a preview. It straightens gently on hover.
- On phones the card sits below the buttons, smaller and without the tilt. On very small screens it hides the email preview so the page stays short.
- All card text follows the chosen language (EN, 中文, and the other five languages).
- Light and dark modes are both supported.

## Technical details
- New `HeroPreviewCard` component in `src/components/`, built with semantic design tokens only (card, primary, accent, success tones). A success/strong tone is added to `src/styles.css` if one is missing.
- Change the `src/routes/index.tsx` hero container from `max-w-3xl` to a `lg:grid lg:grid-cols-[1.1fr_0.9fr]` two-column layout with vertical centering.
- Add `home.preview.*` translation keys to `i18n.ts` (en/zh) and the five locale JSON files.
- Check the result with screenshots at 1280px and 390px, in light and dark mode.
