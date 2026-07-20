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

The repo is already on GitHub. What's left is creating the Azure Static Web App resource and linking it to that repo — done once, in the Azure Portal.

### 1. Create the resource

1. Go to [portal.azure.com](https://portal.azure.com) → **Create a resource** → search **"Static Web App"** → **Create**.
2. **Basics**:
   - Subscription / resource group: pick or create one
   - Name: e.g. `fairiban`
   - Plan type: **Free**
   - Region for Functions API: any region close to you
3. **Deployment details** → source: **GitHub** → sign in → pick:
   - Organization: `shwetabhv`
   - Repository: `iban-discrimination-reporter`
   - Branch: `main`
4. **Build details**:
   - Build presets: React (or Custom)
   - App location: `app`
   - Api location: `api`
   - Output location: `dist`
5. **Review + create** → **Create**.

Azure commits a new GitHub Actions workflow file into the repo and adds a secret (`AZURE_STATIC_WEB_APPS_API_TOKEN_<random>`) automatically as part of this step.

### 2. Reconcile the workflow file

This repo already ships with `.github/workflows/azure-static-web-apps.yml`, written ahead of time to match the same app/api/output locations. Azure's wizard doesn't know that and will add its **own** new workflow file (a different filename, referencing its own secret name) — so after the resource finishes creating, pull the repo and:

- **Delete** the pre-written `.github/workflows/azure-static-web-apps.yml`, and keep Azure's auto-generated one (already wired to the correct secret), **or**
- **Delete** Azure's auto-generated workflow file, and edit the pre-written one so `azure_static_web_apps_api_token` points at whatever secret name Azure created.

Either way, end state should be exactly **one** Static Web Apps workflow file in `.github/workflows/` — two active workflows on the same branch/paths will both try to deploy on every push.

### 3. Post-deploy config

The Functions API uses the Static Web App's linked storage account (`AzureWebJobsStorage`) for its `Reports` table — no Cosmos DB needed, so there's nothing else to provision. In the Static Web App resource's **Configuration** blade, set `SEED_SECRET` to something private (not the `letmeseed-dev` local default) before sharing the live URL.

Full architecture is documented in the [FRD](./iban-discrimination-reporter-frd-hackathon.md#5-recommended-azure-architecture-free-tier).

## What's implemented vs. roadmap

All **P0** requirements from the FRD are implemented: zero-friction reporting, client-side IBAN validation with immediate discard of the full IBAN, the NCA letter generator (PDF/copy/mailto), the public map + wall of shame, seed data, and the privacy/abuse basics (no accounts/cookies, rate limiting, honeypot).

Most **P1**s are also in: optional reporter email capture, EN+DE locale toggle, the "cease and comply" letter to the company itself, "this happened to me too" (+1), and the live-updating stats dashboard.

**P2** items are intentionally out of scope for the hackathon build (see FRD §6): automatic submission to regulators, identity verification/evidence upload, company accounts & right of reply, and a moderation queue — reports publish instantly, which is disclosed in the UI copy and is the honest answer if a judge asks.
