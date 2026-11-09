# Make Chinese and English analyses of the same case consistent

## What the data shows (your Trip.com Singapore case, last 6 runs)
- Case strength is mostly the same ("moderate"). One early Chinese run said "strong".
- Confidence moves around a lot: 60, 70, 75, 75, 78, 90.
- The number of key arguments changes (3 or 4), and so do their titles.
- The same law gets a different Chinese name each run (《消费者保障法》 / 《消费者保障（公平交易）法》 / 《公平交易法》). Section numbers also appear and disappear (for example "Section 4(1)").

## Why it happens
1. **Every language switch is a brand-new analysis.** The AI reasons from scratch each time instead of translating one result. The two versions are separate opinions, not one opinion in two languages.
2. **Randomness is switched on.** The AI is set to vary its wording (temperature 0.4), so even two runs in the same language differ.
3. **There's no scoring rule.** The AI picks the confidence number and the number of arguments freely.
4. **There's no fixed list of law names.** The AI translates statute names on its own each time.
5. **The research results can change.** Each run pulls the law and policy pages again, so the material behind the answer can shift.

## The fix
1. **Analyze once, then translate.** Each case gets one English "master" analysis. Switching to Chinese only translates that analysis. It keeps the same strength rating, confidence, arguments (same count and order), sources and law citations. Only a real "Re-analyze" builds a new master.
2. **Turn randomness off** for the analysis step, and use a fixed seed where the AI service allows it.
3. **Fixed scoring guide for confidence.** Points come from clear facts, such as whether there's evidence, written refusal from the platform, a clear legal rule, and the amount involved. Same facts give the same score.
4. **Fixed bilingual list of law names** for Singapore, Thailand, Malaysia, Vietnam and Indonesia, e.g. CPFTA = 《消费者保护（公平交易）法》. Section numbers only appear if the source pages actually contain them.
5. **Reuse the same research** for the translation, so both languages cite the same sources.
6. **Consistency check:** after translating, the app compares strength, confidence, argument count and citations. If anything differs, it retries the translation once.

## What you'll notice
- Switching EN/中文 is faster and gives the same conclusion, score and arguments in both languages.
- The Chinese email stays English with Chinese in brackets, like today.
- Existing analyses aren't changed. The new behavior starts with the next analysis.

## Technical details
- `dispute_analyses`: add `language` (`en`/`zh`) and `parent_analysis_id` columns, so a translation points to its master. The page picks the row matching the selected language and falls back to translating the master.
- `analyze-dispute`: add a `mode` field (`analyze` or `translate`). `translate` loads the master row, which the user must own (RLS), and sends a translation-only prompt to the same Nebius Nemotron model with temperature 0. It must return the same tool schema, with risk_level, confidence and leverage_points length forced equal to the master (enforced in code after parsing).
- Analyze mode: temperature 0, `seed` if Nebius accepts it, a rubric added to the system prompt, and confidence computed or clamped in code from the rubric signals the model returns.
- Shared `statute-glossary.ts` with EN to ZH names, injected into both prompts.
- Analysis page: the EN/中文 buttons call translate mode when a master exists. "Re-analyze" keeps the overwrite warning.
- A small test for the consistency enforcement (same risk, confidence and argument count after translation).
