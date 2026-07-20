export const SECTORS = [
  "employer",
  "utility",
  "telecom",
  "insurance",
  "landlord",
  "e-commerce",
  "gym",
  "government",
  "other",
] as const;
export type Sector = (typeof SECTORS)[number];

export const CONTEXTS = ["salary", "direct_debit", "one_off_payment", "refund"] as const;
export type RefusalContext = (typeof CONTEXTS)[number];

export interface ReportInput {
  companyName: string;
  companyCountry: string; // ISO 3166-1 alpha-2
  sector: Sector;
  ibanCountry: string; // ISO 3166-1 alpha-2 — derived client-side, full IBAN never sent
  context: RefusalContext;
  incidentDate: string; // ISO date (yyyy-mm-dd)
  description?: string; // max 500 chars
  email?: string; // optional, FR-A6
  honeypot?: string; // must stay empty — bot trap, FR-F3
}

export interface ReportRecord extends Omit<ReportInput, "email" | "honeypot"> {
  id: string;
  createdAt: string;
  source: "live" | "seed";
}

export interface MapEntry {
  companyName: string;
  companyCountry: string;
  sector: Sector;
  reportCount: number;
  ibanCountries: string[];
  lastReportDate: string;
  lat: number;
  lng: number;
}

export interface StatsResponse {
  totalReports: number;
  distinctCompanies: number;
  distinctCountries: number;
  topSectors: { sector: Sector; count: number }[];
  topCountryPairs: { companyCountry: string; ibanCountry: string; count: number }[];
  reportsOverTime: { month: string; count: number }[];
}

export const SECTOR_LABELS: Record<Sector, string> = {
  employer: "Employer (salary payment)",
  utility: "Utility provider",
  telecom: "Telecom provider",
  insurance: "Insurance company",
  landlord: "Landlord / property manager",
  "e-commerce": "E-commerce merchant",
  gym: "Gym / fitness club",
  government: "Government / public body",
  other: "Other",
};

export const CONTEXT_LABELS: Record<RefusalContext, string> = {
  salary: "Salary payment",
  direct_debit: "Direct debit setup",
  one_off_payment: "One-off payment",
  refund: "Refund",
};
