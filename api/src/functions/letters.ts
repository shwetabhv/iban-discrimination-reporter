import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { generateNcaLetter, type LetterInput } from "../lib/letterTemplates";
import { CONTEXTS } from "../lib/types";

const COUNTRY_CODE_RE = /^[A-Z]{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validate(body: unknown): { ok: true; value: LetterInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Invalid request body." };
  const b = body as Record<string, unknown>;
  const companyCountry = String(b.companyCountry || "").toUpperCase();
  const ibanCountry = String(b.ibanCountry || "").toUpperCase();

  if (typeof b.companyName !== "string" || !b.companyName.trim()) return { ok: false, error: "companyName is required." };
  if (!COUNTRY_CODE_RE.test(companyCountry)) return { ok: false, error: "companyCountry must be a 2-letter code." };
  if (!COUNTRY_CODE_RE.test(ibanCountry)) return { ok: false, error: "ibanCountry must be a 2-letter code." };
  if (!CONTEXTS.includes(b.context as any)) return { ok: false, error: `context must be one of: ${CONTEXTS.join(", ")}` };
  if (typeof b.incidentDate !== "string" || !DATE_RE.test(b.incidentDate)) return { ok: false, error: "incidentDate must be yyyy-mm-dd." };

  return {
    ok: true,
    value: {
      companyName: b.companyName.trim(),
      companyCountry,
      ibanCountry,
      context: b.context as LetterInput["context"],
      incidentDate: b.incidentDate,
      description: typeof b.description === "string" ? b.description.slice(0, 500) : undefined,
    },
  };
}

// Fallback letter merge endpoint — Module B is designed to work fully client-side (NFR-6);
// this exists for API completeness / non-browser callers.
async function letters(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { status: 400, jsonBody: { error: "Invalid JSON body." } };
  }

  const result = validate(body);
  if (!result.ok) return { status: 400, jsonBody: { error: result.error } };

  try {
    const letter = generateNcaLetter(result.value);
    return { status: 200, jsonBody: letter };
  } catch (err) {
    context.error("Letter generation failed", err);
    return { status: 500, jsonBody: { error: "Letter generation failed." } };
  }
}

app.http("letters", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "letters",
  handler: letters,
});
