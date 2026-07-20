import { v4 as uuidv4 } from "uuid";
import type { ReportRecord, Sector, RefusalContext } from "./types";

// Deterministic PRNG (mulberry32) so the seed set is stable across rehearsals (FR-E2).
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COMPANY_COUNTRIES = ["DE", "FR", "NL", "IT", "ES", "PL", "BE", "AT", "IE", "PT", "SE", "DK"];
const IBAN_COUNTRIES = ["DE", "FR", "NL", "IT", "ES", "PL", "BE", "AT", "IE", "PT", "SE", "DK", "RO", "GR", "CZ"];
const SECTORS: Sector[] = ["employer", "utility", "telecom", "insurance", "landlord", "e-commerce", "gym", "government", "other"];
const CONTEXTS: RefusalContext[] = ["salary", "direct_debit", "one_off_payment", "refund"];

const SECTOR_LABELS: Record<Sector, string> = {
  employer: "Employer",
  utility: "Energy provider",
  telecom: "Telecom provider",
  insurance: "Insurance company",
  landlord: "Letting agency",
  "e-commerce": "Online retailer",
  gym: "Fitness club",
  government: "Municipal office",
  other: "Service provider",
};

const NAME_STEMS = [
  "Nordlicht", "Blauwind", "Solvia", "Kronberg", "Rivera", "Alto", "Vertex",
  "Lumino", "Fjordica", "Terrapay", "Blitzstrom", "Meridian", "Silvana",
  "Grancia", "Novara", "Coralto", "Westhaven", "Brixel", "Domora", "Pellara",
];
const NAME_SUFFIXES = ["GmbH", "SA", "SpA", "B.V.", "AB", "Sp. z o.o.", "Lda", "AS", "Ltd", "s.r.o."];

function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

function randomDateWithinLastMonths(months: number, rnd: () => number): string {
  const now = new Date();
  const past = new Date(now);
  past.setMonth(past.getMonth() - months);
  const t = past.getTime() + rnd() * (now.getTime() - past.getTime());
  return new Date(t).toISOString().slice(0, 10);
}

/** Generates ~50 plausible-but-fictional reports across 10+ countries and 6+ sectors (FR-E1). */
export function buildSeedReports(count = 52): ReportRecord[] {
  const rnd = mulberry32(42);
  const reports: ReportRecord[] = [];

  for (let i = 0; i < count; i++) {
    const companyCountry = pick(COMPANY_COUNTRIES, rnd);
    let ibanCountry = pick(IBAN_COUNTRIES, rnd);
    if (ibanCountry === companyCountry) {
      ibanCountry = IBAN_COUNTRIES[(IBAN_COUNTRIES.indexOf(ibanCountry) + 1) % IBAN_COUNTRIES.length];
    }
    const sector = pick(SECTORS, rnd);
    const context = pick(CONTEXTS, rnd);
    const stem = pick(NAME_STEMS, rnd);
    const suffix = pick(NAME_SUFFIXES, rnd);
    const companyName =
      rnd() < 0.25
        ? `${SECTOR_LABELS[sector]} (${companyCountry})`
        : `${stem} ${SECTOR_LABELS[sector]} ${suffix}`;

    reports.push({
      id: uuidv4(),
      companyName,
      companyCountry,
      sector,
      ibanCountry,
      context,
      incidentDate: randomDateWithinLastMonths(10, rnd),
      description: undefined,
      createdAt: new Date().toISOString(),
      source: "seed",
    });
  }

  return reports;
}
