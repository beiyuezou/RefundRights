# Rewrite README (English, judge-friendly)

## Structure
1. **Hero**: name, one-line pitch, badges (Nebius Token Factory, NVIDIA Nemotron, TanStack Start, Tavily, ElevenLabs, PayPal Sandbox), links: Live demo (https://refundrights.lovable.app) and Demo video (placeholder `VIDEO_URL` for you to fill).
2. **Screenshots**: 4 fresh captures (home, claim wizard, analysis report, case dashboard) in desktop + one mobile shot, uploaded as CDN assets and embedded. A demo GIF of the wizard-to-report flow (short, generated from Playwright frames).
3. **The problem / What it does**: short, no invented stats.
4. **Feature highlights**: multi-agent analysis (Evidence/Legal/Finance/Localization), live Tavily grounding with source labels, EN master + translation consistency, voice in/out, editable complaint email, case tracker, PDF export, paywall + special code, human help form, EN/ZH/NL UI, dark mode.
5. **Architecture**: mermaid diagram (browser -> TanStack server fns -> analyze-dispute -> Tavily / Nebius Nemotron Super & Nano -> database), plus model tiering table.
6. **Hackathon compliance**: keep existing section, tightened.
7. **Tech stack** table.
8. **Run locally**: prerequisites, clone, `bun install`, copy `.env.example`, set secrets, `bun dev`, run tests.
9. **Configuration** table (existing, names only).
10. **Security & privacy by design**: server-enforced paywall, verified PayPal webhook, RLS, allowlisted fetches, 90-day log expiry, self-delete, no secrets in repo; link `SECURITY.md`.
11. **Project structure**, **Roadmap**, **License/Disclaimer** (not legal advice).

## Notes
- Screenshots use the fictional demo case only, no real user data.
- Demo video link left as a clearly marked placeholder until you send it.
