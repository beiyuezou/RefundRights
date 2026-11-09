# Hackathon compliance check and optional upgrades

## Findings (checked today)
- Requirement met: all AI analysis and report translation call Nebius Token Factory (`api.tokenfactory.nebius.com`) with the NVIDIA open model `nvidia/nemotron-3-super-120b-a12b`. No other AI model is called anywhere in the app.
- The analysis page and PDF show "Powered by NVIDIA Nemotron · Nebius Token Factory".
- Track fit: "Best Apps and Agents" — a real consumer tool with a multi-expert agent workflow (evidence, legal, finance) plus live policy search.
- Other services (Tavily, Bright Data, ElevenLabs voice, PayPal) are allowed ("everything else is up to you").
- Risk for judges: 34 older reports in the database were made by the previous Gemini model (latest 2026-10-28 22:30). Only 7 are Nemotron. Demo cases should be Nemotron ones.

## Optional upgrades (pick any)
1. Model tiering, as the track suggests: keep Super for the main analysis; use Nemotron Nano for fast calls (report translation). Faster and cheaper. Optionally try Nemotron 3 Ultra for the main analysis if it is available on your Token Factory account.
2. Show the model name on each report (taken from the saved record), and mark older Gemini reports as "legacy" so judges never see a non-Nemotron result as current.
3. Re-run analysis on your demo cases so they all come from Nemotron.
4. Add a short "How it works on Nebius" section to the README (architecture: app → Token Factory → Nemotron Super/Nano), for the submission page.

## Not required
- Nebius Serverless Endpoints / Jobs are encouraged but optional; the app stays hosted as it is.

## Technical details
- Translation model becomes a constant (e.g. Nemotron Nano id confirmed against the Token Factory model list before switching); fallback to Super if the call fails, keeping the consistency rules (same verdict, confidence, argument count).
- Edge function `analyze-dispute` redeployed and tested with one EN + ZH run.
