# FairIBAN — IBAN Discrimination Reporter

> "IBAN discrimination is illegal in all 27 EU countries. We built the enforcement layer the EU forgot."

Report a company that refused your foreign EU/EEA IBAN, get a formal complaint letter citing **Article 9(2) of Regulation (EU) 260/2012** addressed to the right national regulator, and see aggregated reports on a public map — no account, no cookies, no tracking. Implements the [functional requirements document](./iban-discrimination-reporter-frd-hackathon.md).

## Project layout

```
app/     React + Vite + TypeScript SPA (the whole UI, deployed as an Azure Static Web App)
api/     Azure Functions (Node/TypeScript) — /api/reports, /api/reports/map, /api/stats, /api/letters, /api/seed
scripts/ Convenience CLI (seed.mjs — reset demo data)
```

**Design choice (NFR-6):** IBAN validation (MOD-97 / ISO 13616) and complaint-letter generation run **entirely client-side** (`app/src/lib/iban.ts`, `ncaData.ts`, `letterTemplates.ts`). Module B works even if the database and API are both down — half the demo survives any outage.

## Running locally

Requires Node 18+.

```bash
npm run install:all   # installs app/ and api/ dependencies
npm install            # root dev deps: azurite + concurrently
npm run dev             # starts Azurite (local storage emulator), the Functions API, and the Vite dev server together
```

Then open http://localhost:5173. The frontend proxies `/api/*` to the local Functions host on port 7071 (see `app/vite.config.ts`).

Load demo data at any time:

```bash
npm run seed
```

This resets and reloads ~50 fictional reports across 12+ countries and all sectors (FR-E1/FR-E2) — safe to re-run between rehearsals.

## Deploying to Azure (free tier)

1. Push this repo to GitHub.
2. Create an **Azure Static Web App** (Free plan), pointing at the repo with:
   - App location: `app`
   - Api location: `api`
   - Output location: `dist`
3. Azure creates `.github/workflows/azure-static-web-apps.yml` automatically (a matching one is already included here) and adds the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret — push to `main` and it deploys.
4. The Functions API uses the Static Web App's linked storage account (`AzureWebJobsStorage`) for its `Reports` table — no Cosmos DB needed, so there's nothing else to provision. Set `SEED_SECRET` in the Function App's configuration to something private before your talk.

Full architecture is documented in the [FRD](./iban-discrimination-reporter-frd-hackathon.md#5-recommended-azure-architecture-free-tier).

## What's implemented vs. roadmap

All **P0** requirements from the FRD are implemented: zero-friction reporting, client-side IBAN validation with immediate discard of the full IBAN, the NCA letter generator (PDF/copy/mailto), the public map + wall of shame, seed data, and the privacy/abuse basics (no accounts/cookies, rate limiting, honeypot).

Most **P1**s are also in: optional reporter email capture, EN+DE locale toggle, the "cease and comply" letter to the company itself, "this happened to me too" (+1), and the live-updating stats dashboard.

**P2** items are intentionally out of scope for the hackathon build (see FRD §6): automatic submission to regulators, identity verification/evidence upload, company accounts & right of reply, and a moderation queue — reports publish instantly, which is disclosed in the UI copy and is the honest answer if a judge asks.
