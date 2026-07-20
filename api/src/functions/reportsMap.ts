import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { listReports } from "../lib/storage";
import type { MapEntry, ReportRecord } from "../lib/types";

function aggregate(reports: ReportRecord[]): MapEntry[] {
  const byCompany = new Map<string, MapEntry>();
  for (const r of reports) {
    const key = `${r.companyName.toLowerCase()}|${r.companyCountry}`;
    const existing = byCompany.get(key);
    if (existing) {
      existing.reportCount += 1;
      if (!existing.ibanCountries.includes(r.ibanCountry)) existing.ibanCountries.push(r.ibanCountry);
      if (r.incidentDate > existing.lastReportDate) existing.lastReportDate = r.incidentDate;
    } else {
      byCompany.set(key, {
        companyName: r.companyName,
        companyCountry: r.companyCountry,
        sector: r.sector,
        reportCount: 1,
        ibanCountries: [r.ibanCountry],
        lastReportDate: r.incidentDate,
      });
    }
  }
  return Array.from(byCompany.values()).sort((a, b) => b.reportCount - a.reportCount);
}

async function getMap(_request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const reports = await listReports();
    return {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=15" },
      jsonBody: aggregate(reports),
    };
  } catch (err) {
    context.error("Failed to load map data", err);
    return { status: 500, jsonBody: { error: "Failed to load map data." } };
  }
}

app.http("reportsMap", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "reports/map",
  handler: getMap,
});
