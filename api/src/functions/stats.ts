import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { listReports } from "../lib/storage";
import type { ReportRecord, Sector, StatsResponse } from "../lib/types";

function computeStats(reports: ReportRecord[]): StatsResponse {
  const companies = new Set<string>();
  const countries = new Set<string>();
  const sectorCounts = new Map<Sector, number>();
  const pairCounts = new Map<string, { companyCountry: string; ibanCountry: string; count: number }>();
  const monthCounts = new Map<string, number>();

  for (const r of reports) {
    companies.add(`${r.companyName.toLowerCase()}|${r.companyCountry}`);
    countries.add(r.companyCountry);

    sectorCounts.set(r.sector, (sectorCounts.get(r.sector) || 0) + 1);

    const pairKey = `${r.companyCountry}>${r.ibanCountry}`;
    const pair = pairCounts.get(pairKey);
    if (pair) pair.count += 1;
    else pairCounts.set(pairKey, { companyCountry: r.companyCountry, ibanCountry: r.ibanCountry, count: 1 });

    const month = r.incidentDate.slice(0, 7);
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
  }

  return {
    totalReports: reports.length,
    distinctCompanies: companies.size,
    distinctCountries: countries.size,
    topSectors: Array.from(sectorCounts.entries())
      .map(([sector, count]) => ({ sector, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    topCountryPairs: Array.from(pairCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    reportsOverTime: Array.from(monthCounts.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month)),
  };
}

async function getStats(_request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const reports = await listReports();
    return {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=15" },
      jsonBody: computeStats(reports),
    };
  } catch (err) {
    context.error("Failed to compute stats", err);
    return { status: 500, jsonBody: { error: "Failed to compute stats." } };
  }
}

app.http("stats", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "stats",
  handler: getStats,
});
