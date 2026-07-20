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
  companyCountry: string;
  sector: Sector;
  ibanCountry: string;
  context: RefusalContext;
  incidentDate: string;
  description?: string;
  email?: string;
  honeypot?: string;
}

export interface ReportRecord {
  id: string;
  companyName: string;
  companyCountry: string;
  sector: Sector;
  ibanCountry: string;
  context: RefusalContext;
  incidentDate: string;
  description?: string;
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
}

export interface StatsResponse {
  totalReports: number;
  distinctCompanies: number;
  distinctCountries: number;
  topSectors: { sector: Sector; count: number }[];
  topCountryPairs: { companyCountry: string; ibanCountry: string; count: number }[];
  reportsOverTime: { month: string; count: number }[];
}
