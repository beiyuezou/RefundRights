# Keys and privacy before open-sourcing

## What I checked
- **Keys:** all 15 keys (Nebius, Tavily, Bright Data, PayPal, ElevenLabs, special code, etc.) are stored only in the encrypted secret store. None are in the code or its earlier saved versions. The browser only receives the public login key, which is meant to be public.
- **Earlier saved versions:** no key values found. One old planning note contains the Bright Data customer ID. That is an account name, not a password, but it will be visible once the code is public.
- **Personal data in the code:** one old database change contains your account ID; one file has the preview web address hard-coded. No emails, stories or evidence are in the code.

## Step 1 — Make the code safe to publish
1. Create a clean public copy of the code (a ZIP in Files) for the competition repo. Left out:
   - internal planning notes (they contain case IDs, test details and the Bright Data customer ID)
   - the local settings file — replaced with a `.env.example` that has blank values
   - build and cache folders
2. Move the hard-coded preview address into a setting.
3. Add `SECURITY.md` and a "Configuration" section to the README listing every key by name only, and where to get each one.
4. Keep the special code's value and limits out of all docs. Only the name `SPECIAL_UNLOCK_CODE` appears.
5. Re-scan the clean copy for key patterns, emails and account IDs before handing it over.

## Step 2 — Privacy for user data
1. **Privacy page** (CN/EN/NL): what we collect (account email, case stories, evidence files, help requests, payments) and why; that AI providers (Nebius, Tavily, ElevenLabs) process case text; no selling of data. A link in the footer.
2. **Delete my data:** a button in the account menu that permanently deletes the user's cases, reports, evidence files, help requests and voice data. Payment records are kept for accounting, with personal fields removed.
3. **Keep less:**
   - Store only order ID, status, amount and time from PayPal, not the full PayPal reply (which includes the buyer's name and email).
   - Delete audit logs and rate-limit records after 90 days; store only part of the visitor's IP address.
4. **Less in AI requests:** before case text is sent to search (Tavily), remove emails, phone numbers and booking numbers. Nemotron still sees the full story, since it needs it for the analysis.
5. **Demo for judges:** use a test account with made-up cases only. Never use real customers' data in the demo.

## You should also do
- After the competition, or if any key is ever pasted in chat or a screenshot, create a new key with that provider and I'll update it through the secure form.
- PayPal stays in Sandbox for the competition.
- Bright Data's key has expired. Renewing it is a separate step.

## Technical details
- Clean copy built in /tmp, excluding `.lovable/`, `.env`, `.git`, `node_modules`, `.tanstack`, `dist`, `tsconfig.tsbuildinfo`; entries listed and scanned before zipping to /mnt/documents.
- Scrape proxy URL → secret `SCRAPE_PROXY_URL`, with the published URL as the fallback.
- Deletion: authenticated server fn; checks ownership, removes storage objects, then deletes rows with the admin client; logs `account.data_deleted`.
- Payments: stop writing `raw_payload` (mark it deprecated) and blank out existing values.
- Retention: a daily cleanup job for old `audit_logs` and `rate_limit_events`; the IP address is cut short when it is logged.
