# IBAN Discrimination Reporter — Functional Requirements Document (Hackathon Edition)

**Product:** IBAN Discrimination Reporter ("FairIBAN" — working title)
**Version:** 0.1 (Hackathon MVP)
**Target:** Weekend hackathon build, live public demo, deployed on Azure free tier
**Regulatory hook:** Article 9 of the SEPA Regulation (EU 260/2012) — refusing a valid EU/EEA IBAN for euro payments or direct debits is **illegal**, yet enforcement is weak and consumer reporting is fragmented.

---

## 1. Product Overview

A public web app where any EU consumer can report a company that refused their foreign IBAN, instantly generate a legally grounded complaint letter to the correct national regulator, and see all reports on a public map — turning an invisible, widespread violation into visible, actionable data.

**One-line pitch for judges:** "IBAN discrimination is illegal in all 27 EU countries. We built the enforcement layer the EU forgot."

**Demo storyline (3 minutes):**
1. Show a real-world scenario: a German employer refuses a French IBAN for salary.
2. File a report in under 60 seconds → live IBAN validation → complaint letter generated instantly.
3. Flip to the public map/wall-of-shame showing aggregated reports across Europe.
4. Close on the stats dashboard: "X reports, Y companies, Z countries."

---

## 2. Actors

| Actor | Description |
|---|---|
| Reporter | Consumer who experienced IBAN discrimination (no account required) |
| Visitor | Anyone browsing the public map/statistics |
| Regulator (passive) | National Competent Authority receiving the generated complaint (via the user, not via the app) |
| Admin (post-hackathon) | Moderates reports — out of scope for demo, mention in roadmap slide |

---

## 3. Functional Requirements

Priorities: **P0 = must work in the demo** · **P1 = build if time allows** · **P2 = roadmap slide only**

### Module A — Report Submission (P0, the core flow)

- **FR-A1 (P0).** A reporter shall be able to file a report without registration or login (zero-friction is the demo's selling point).
- **FR-A2 (P0).** The report form shall capture: company name, company country, company sector (dropdown: employer / utility / telecom / insurance / landlord / e-commerce / gym / government / other), the country of the refused IBAN, the refusal context (salary / direct debit / one-off payment / refund), date of incident, and an optional free-text description (max 500 chars).
- **FR-A3 (P0).** The reporter shall enter the refused IBAN's **country code only or full IBAN** — if a full IBAN is entered, the app shall validate it client-side using the MOD-97 checksum (ISO 13616) and **immediately discard/anonymise it, storing only the country code**. A visible note shall state: "We never store your IBAN."
- **FR-A4 (P0).** The form shall reject invalid IBANs with a clear inline error, and confirm valid ones with a green check + detected country flag (great demo moment).
- **FR-A5 (P0).** On submit, the report shall be stored and the reporter immediately taken to the complaint-letter screen (Module B).
- **FR-A6 (P1).** The reporter may optionally provide an email to receive a copy of their complaint letter (no verification needed for MVP).
- **FR-A7 (P1).** The form shall support at minimum EN + one more language (pick the demo country's language, e.g., DE or FR) via a simple locale toggle.

### Module B — Complaint Letter Generator (P0, the "wow")

- **FR-B1 (P0).** The app shall auto-generate a formal complaint letter citing **Article 9(2) of Regulation (EU) 260/2012**, populated with the report details, addressed to the correct National Competent Authority for the **company's** country.
- **FR-B2 (P0).** The app shall maintain a static lookup table of all 27 EU (+EEA) NCAs responsible for SEPA Regulation enforcement, with name, postal address, and complaint email/URL where available.
- **FR-B3 (P0).** The letter shall be available as: on-screen text with a copy button, and downloadable PDF. A `mailto:` link pre-filled with the NCA address, subject, and body shall be provided where the NCA accepts email.
- **FR-B4 (P1).** The letter shall be generated in the official language of the target NCA's country **and** English (side-by-side or toggle).
- **FR-B5 (P1).** A second letter template addressed to the **offending company** itself ("cease and comply" notice) shall be offered as an optional extra.
- **FR-B6 (P2).** Track whether the user marked the complaint as "sent" for funnel statistics.

### Module C — Public Map & Wall of Shame (P0, the visual)

- **FR-C1 (P0).** A public page shall display all reports aggregated on an interactive map of Europe (marker/heat by company country), with no personal data shown.
- **FR-C2 (P0).** Each map entry shall show: company name, sector, number of reports, refused-IBAN countries, and most recent report date.
- **FR-C3 (P0).** A ranked "wall of shame" list shall show companies by report count, filterable by country and sector.
- **FR-C4 (P1).** Visitors shall be able to click "This happened to me too" on an existing company entry (+1 counter, creates a lightweight linked report).
- **FR-C5 (P2).** Company response/right-of-reply mechanism (roadmap — mention for balance/defamation caution in Q&A).

### Module D — Statistics Dashboard (P1, the closer)

- **FR-D1 (P1).** A stats page shall show: total reports, distinct companies, top offending sectors, top company-country vs IBAN-country pairs (e.g., "DE companies refusing FR IBANs"), and reports over time.
- **FR-D2 (P1).** Stats shall update without page reload (poll or on-load fetch is fine for demo).
- **FR-D3 (P2).** Public JSON API + CSV export of anonymised aggregate data ("open data for journalists and regulators" — strong roadmap line).

### Module E — Seed & Demo Support (P0, hackathon-specific)

- **FR-E1 (P0).** The database shall be seedable with ~50 realistic sample reports across 10+ countries and 6+ sectors so the map and wall of shame look alive during the demo. Seeded entries shall use plausible but clearly fictional company names, or anonymised labels like "Telecom provider (DE)".
- **FR-E2 (P0).** A hidden `/seed` mechanism or seed script shall exist to reset demo data in seconds between rehearsals.
- **FR-E3 (P0).** The full report→letter→map loop shall be demonstrable in under 90 seconds on a phone and a laptop (responsive design is P0, not polish).

### Module F — Trust, Privacy & Abuse Basics

- **FR-F1 (P0).** No account system, no cookies requiring a consent banner (use no tracking at all — also a nice talking point).
- **FR-F2 (P0).** Full IBANs are never persisted (see FR-A3); reports store only IBAN country code. No reporter name is collected.
- **FR-F3 (P1).** Simple abuse friction: rate-limit submissions per IP (e.g., 5/hour) and a honeypot field against bots.
- **FR-F4 (P2).** Moderation queue before publication (post-hackathon; for the demo, submissions publish instantly because that demos better — say so transparently if asked).

---

## 4. Non-Functional Requirements (hackathon-calibrated)

- **NFR-1 (Cost):** €0 infrastructure. Azure Static Web Apps Free tier (frontend + managed Functions API) + Cosmos DB free tier (or Azure Table Storage). No paid services, no card-required resources.
- **NFR-2 (Public access):** Deployed to a public HTTPS URL (the `*.azurestaticapps.net` domain is fine); works on judge's phone via QR code on the final slide.
- **NFR-3 (Deploy):** `git push` → GitHub Actions → live, in under 5 minutes. No manual deploy steps on demo day.
- **NFR-4 (Performance):** Map page interactive in < 3 s on conference Wi-Fi (pre-aggregate stats server-side; keep map data payload < 200 KB).
- **NFR-5 (Accessibility):** Keyboard-navigable form, labelled inputs, sufficient contrast (WCAG 2.1 AA basics) — cheap to do, and worth one slide bullet.
- **NFR-6 (Resilience for demo):** App must work if the database is empty AND if seeding fails — the letter generator (Module B) has zero DB dependency by design, so half the demo survives any outage.

---

## 5. Recommended Azure Architecture (free tier)

```
Browser (React/Vite SPA)
   │
Azure Static Web Apps ── Free tier
   ├── Static frontend (global CDN, free SSL, public URL)
   └── /api → Managed Azure Functions (Node/TypeScript)
              ├── POST /api/reports        (validate + store)
              ├── GET  /api/reports/map    (aggregated, anonymised)
              ├── GET  /api/stats
              ├── POST /api/letters        (template merge; also runs client-side as fallback)
              └── POST /api/seed           (protected by secret query param)
   │
Azure Cosmos DB (Free tier: 1000 RU/s, 25 GB)  – reports container
   └── alternative: Azure Table Storage (effectively free at this scale)

Static data shipped with the frontend (no DB needed):
   • NCA lookup table (27+ regulators: name, address, email, language)
   • IBAN country/length/format table for MOD-97 validation
   • Letter templates (EN + local languages)
```

**Deliberate design choice:** IBAN validation and letter generation run **client-side** — they work even with zero backend, cost nothing, and make the demo bulletproof.

---

## 6. Out of Scope (say it on the roadmap slide)

- Automatic submission of complaints to regulators (legal review needed)
- Identity verification of reporters / evidence upload
- Company accounts and right of reply
- Legal advice of any kind (letters are templates; include a "not legal advice" footer)

---

## 7. Demo-Day Checklist

1. Seed data loaded; map shows 10+ countries.
2. One rehearsed live report: pick a memorable fictional company ("Musterfirma GmbH"), a French IBAN refused for German salary — validate, submit, letter appears, download PDF.
3. QR code slide → judges open the live map on their phones.
4. Backup: screen recording of the full flow on your phone, in case the venue Wi-Fi dies.
5. Anticipated Q&A: defamation risk (→ FR-F4 moderation on roadmap), fake reports (→ FR-F3 + roadmap verification), "why hasn't the EU built this?" (→ that's the point).
