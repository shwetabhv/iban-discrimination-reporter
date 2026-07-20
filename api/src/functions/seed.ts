import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { insertReport, clearSeedReports } from "../lib/storage";
import { buildSeedReports } from "../lib/seedData";

// Hidden reset mechanism so demo data can be respun in seconds between rehearsals (FR-E2).
// Protected by a shared secret query param — not meant to be a real auth boundary.
async function seed(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const secret = request.query.get("secret");
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return { status: 403, jsonBody: { error: "Forbidden." } };
  }

  try {
    await clearSeedReports();
    const reports = buildSeedReports();
    for (const report of reports) {
      await insertReport(report);
    }
    return { status: 200, jsonBody: { seeded: reports.length } };
  } catch (err) {
    context.error("Seed failed", err);
    return { status: 500, jsonBody: { error: "Seed failed." } };
  }
}

app.http("seed", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "seed",
  handler: seed,
});
