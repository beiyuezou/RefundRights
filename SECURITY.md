# Security & privacy

## Secrets
No API key, password or token is stored in this repository. All credentials live in the hosting platform's encrypted secret store and are read server-side only (`process.env` / `Deno.env`). The browser only receives the public (publishable) backend key, which is safe to expose; data access is enforced by row-level security.

If you fork this project, provide your own values for the secrets listed in the README "Configuration" section. Never commit them.

## User data
- Every user table has row-level security: users can only read their own cases, reports, evidence and timelines.
- Full report content is served only through a server function after the paywall check.
- Evidence files are stored in a private bucket under the owner's folder; uploads are type- and size-checked.
- Outbound searches (Tavily search and extract) contain only country, category and platform name — never the user's story.
- Full PayPal payloads (which contain payer PII) are not stored.
- Audit and rate-limit logs are deleted after 90 days.
- Users can delete all of their data from the Privacy page.

## Reporting a vulnerability
Please open a private security advisory on the repository instead of a public issue.
