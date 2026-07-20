import { SECTORS, CONTEXTS, type ReportInput } from "./types";

const COUNTRY_CODE_RE = /^[A-Z]{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateReportInput(body: unknown): { ok: true; value: ReportInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Invalid request body." };
  const b = body as Record<string, unknown>;

  if (typeof b.honeypot === "string" && b.honeypot.trim().length > 0) {
    // Silently look like success to the caller (bot), see FR-F3.
    return { ok: false, error: "__honeypot__" };
  }

  if (typeof b.companyName !== "string" || b.companyName.trim().length < 1 || b.companyName.length > 200) {
    return { ok: false, error: "companyName is required (max 200 chars)." };
  }
  const companyCountry = String(b.companyCountry || "").toUpperCase();
  if (!COUNTRY_CODE_RE.test(companyCountry)) {
    return { ok: false, error: "companyCountry must be a 2-letter ISO country code." };
  }
  if (!SECTORS.includes(b.sector as any)) {
    return { ok: false, error: `sector must be one of: ${SECTORS.join(", ")}` };
  }
  const ibanCountry = String(b.ibanCountry || "").toUpperCase();
  if (!COUNTRY_CODE_RE.test(ibanCountry)) {
    return { ok: false, error: "ibanCountry must be a 2-letter ISO country code (full IBANs must never be sent)." };
  }
  if (!CONTEXTS.includes(b.context as any)) {
    return { ok: false, error: `context must be one of: ${CONTEXTS.join(", ")}` };
  }
  if (typeof b.incidentDate !== "string" || !DATE_RE.test(b.incidentDate)) {
    return { ok: false, error: "incidentDate must be an ISO date (yyyy-mm-dd)." };
  }
  const incidentDate = new Date(b.incidentDate);
  if (Number.isNaN(incidentDate.getTime()) || incidentDate > new Date()) {
    return { ok: false, error: "incidentDate must be a valid, non-future date." };
  }
  let description: string | undefined;
  if (b.description !== undefined) {
    if (typeof b.description !== "string" || b.description.length > 500) {
      return { ok: false, error: "description must be a string of at most 500 characters." };
    }
    description = b.description;
  }

  return {
    ok: true,
    value: {
      companyName: b.companyName.trim(),
      companyCountry,
      sector: b.sector as ReportInput["sector"],
      ibanCountry,
      context: b.context as ReportInput["context"],
      incidentDate: b.incidentDate,
      description,
    },
  };
}
