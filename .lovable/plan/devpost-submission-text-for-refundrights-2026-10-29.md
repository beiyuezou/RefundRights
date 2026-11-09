# Devpost submission text for RefundRights

Copy each section into Devpost. All facts come from what is built in the app. No made-up user numbers or success rates.

## Inspiration
Travelers in Southeast Asia lose money every day to unreturned hotel deposits, flight delays, wrong bookings and misleading "non-refundable" advice. Booking platforms have legal teams; travelers have a screenshot and a language barrier. Most people don't know their country's consumer law covers them, such as Singapore's CPFTA, Thailand's Consumer Protection Act B.E. 2522 or Malaysia's MAVCOM rules. So they give up. We wanted to give every traveler a firm, well-sourced legal argument in minutes, for less than the cost of one taxi ride.

## What it does
RefundRights is an AI legal assistant for travel refund disputes in Thailand, Singapore, Malaysia, Vietnam and Indonesia.
- **Claim Wizard:** pick a category (hotel, flight, insurance, transport), describe what happened by typing or by voice, choose the country, and upload evidence.
- **Multi-agent analysis:** Evidence, Legal, Finance and Localization agents work through the case together. They return a risk gauge (strong / moderate / weak), a confidence score, a firm recommendation, numbered legal arguments, and a ready-to-send complaint email.
- **Live, cited sources:** before reasoning, the app searches official regulators and reads platform refund policies (Agoda, Booking.com, Trip.com and others). Every report shows its sources and labels where each came from.
- **Consistent across languages:** one English master analysis is translated into Chinese with the same verdict, confidence and arguments. The Chinese email stays English with Chinese in brackets.
- **Act on it:** edit the email, send it from your own inbox, export a PDF, have it read aloud, and track the case from "Submitted" to "Refunded", including the amount recovered.
- **Fair pricing:** a free preview, and the full report unlocks for US$9.90 via PayPal or with a promo code.
- **Human help:** if the report isn't enough, users can request expert help through a private form.
- **Interface:** English, 简体中文 and Nederlands, with light and dark mode.

## How we built it
- **AI:** NVIDIA Nemotron open models on **Nebius Token Factory** (OpenAI-compatible API), using model tiering:
  - **Nemotron 3 Super** (`nvidia/nemotron-3-super-120b-a12b`) for the reasoning-heavy multi-agent legal analysis. It uses structured function calling and temperature 0.
  - **Nemotron 3 Nano** (`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`) for fast report translation. If the output is invalid or not translated, it automatically falls back to Super.
- **Grounding:** Tavily Search finds the relevant law and regulator notices. Tavily Extract reads allowlisted platform policy and official law pages. A cache serves as fallback, so an analysis never fails because a source is down.
- **App:** React 19 + TanStack Start, with Tailwind CSS v4 and server functions.
- **Backend:** Postgres with row-level security, private evidence storage, audit logs and rate limiting.
- **Voice:** ElevenLabs for speech-to-text input and bilingual read-aloud.
- **Payments:** PayPal (Sandbox). Orders are created and captured on the server, webhooks are verified by signature, and the paywall is enforced on the server.

```text
Traveler -> RefundRights -> analyze-dispute
   -> Tavily search + extract (live legal / policy sources)
   -> Nebius Token Factory -> Nemotron 3 Super (English master analysis)
   -> Nebius Token Factory -> Nemotron 3 Nano  (translation, same verdict)
```

## Challenges we ran into
- **Different answers in different languages:** running the same case in English and Chinese gave different confidence scores, argument counts and law names. We fixed this with an English master analysis plus translation only, a fixed confidence rubric, a bilingual statute glossary, and a code-level consistency check.
- **Reliable structured output:** we had to strip reasoning text and validate the model's output against a strict schema, with a JSON fallback.
- **Scraping protected sites:** our first scraping vendor was fragile (timeouts, runtime incompatibilities, expired keys). We consolidated on Tavily Extract with a URL allowlist to block SSRF, plus cached fallback.
- **Paywall security:** report content must never reach the browser before payment, so it is served only by a server function after a server-side "paid" check.
- **Privacy for an open-source repo:** we audited the code and its history for keys and personal data. We added data self-deletion, 90-day log expiry, and we no longer store PayPal payloads.

## Accomplishments that we're proud of
- A real consumer product, not a demo chatbot: from intake to analysis, sending the email, tracking the case and recovering money.
- Model tiering on Nemotron (Super for reasoning, Nano for speed) with automatic quality fallback.
- English and Chinese reports that reach the same verdict, confidence and arguments.
- Every claim is grounded in live sources that the user can see and check.
- Security and privacy built in from the start: row-level security, server-enforced paywall, audit trail, and one-click data deletion.

## What we learned
- Grounding matters more than prompt cleverness. Live official sources turned vague advice into specific, defensible arguments.
- Model tiering is a real win. Nano handles the everyday calls fast, and Super is kept for the hard reasoning.
- For legal output, being consistent is as important as being correct. Users lose trust if the answer changes when they switch language.
- Fewer vendors means fewer failure points.

## What's next for RefundRights
- Use Nemotron 3 Ultra for complex multi-party cases, and Nebius Serverless Jobs for background follow-ups (for example, reminders to escalate after 7 days).
- Switch PayPal to Live and add a clear refund policy.
- Add more countries (Philippines, Japan, Korea) and full Thai, Vietnamese and Bahasa reports.
- Add regulator-ready complaint packs (CASE, OCPB, Tribunal) and an admin dashboard for expert-help requests.
- Partner with consumer associations to check our guides and publish real, verified outcomes.

---
If you approve, nothing in the app changes. This text is for you to copy into Devpost.
