import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { v4 as uuidv4 } from "uuid";
import { validateReportInput } from "../lib/validate";
import { insertReport } from "../lib/storage";
import { isRateLimited } from "../lib/rateLimit";
import type { ReportRecord } from "../lib/types";

const JSON_HEADERS = { "Content-Type": "application/json" };

async function createReport(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(ip)) {
    return { status: 429, headers: JSON_HEADERS, jsonBody: { error: "Too many reports from this IP. Try again later." } };
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { status: 400, headers: JSON_HEADERS, jsonBody: { error: "Invalid JSON body." } };
  }

  const result = validateReportInput(body);
  if (!result.ok) {
    if (result.error === "__honeypot__") {
      // Pretend success so simple bots don't learn to skip the field.
      return { status: 201, headers: JSON_HEADERS, jsonBody: { id: uuidv4() } };
    }
    return { status: 400, headers: JSON_HEADERS, jsonBody: { error: result.error } };
  }

  const record: ReportRecord = {
    id: uuidv4(),
    ...result.value,
    createdAt: new Date().toISOString(),
    source: "live",
  };

  try {
    await insertReport(record);
  } catch (err) {
    context.error("Failed to store report", err);
    return { status: 500, headers: JSON_HEADERS, jsonBody: { error: "Failed to store report." } };
  }

  return { status: 201, headers: JSON_HEADERS, jsonBody: { id: record.id } };
}

app.http("reports", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "reports",
  handler: createReport,
});
