import { useCallback, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { NCA_TABLE } from "../lib/ncaData";
import { SECTORS, SECTOR_LABELS, CONTEXTS, CONTEXT_LABELS, type Sector, type RefusalContext } from "../lib/types";
import { submitReport } from "../lib/api";
import IbanInput from "../components/IbanInput";
import "./ReportFormPage.css";

const today = new Date().toISOString().slice(0, 10);

export default function ReportFormPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [companyCountry, setCompanyCountry] = useState("");
  const [sector, setSector] = useState<Sector>("employer");
  const [ibanCountry, setIbanCountry] = useState<string | null>(null);
  const [context, setContext] = useState<RefusalContext>("salary");
  const [incidentDate, setIncidentDate] = useState(today);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleIbanCountry = useCallback((code: string | null) => setIbanCountry(code), []);

  const canSubmit = companyName.trim().length > 0 && companyCountry && ibanCountry && incidentDate;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || !ibanCountry) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      companyName: companyName.trim(),
      companyCountry,
      sector,
      ibanCountry,
      context,
      incidentDate,
      description: description.trim() || undefined,
      honeypot: honeypot || undefined,
    };

    try {
      // Only companyName..description are ever sent/stored — the optional email (FR-A6) stays
      // client-side and is just carried over to prefill a "send myself a copy" mailto on the letter page.
      await submitReport(payload);
      navigate("/letter", { state: { report: payload, reporterEmail: email.trim() || undefined } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page report-form">
      <h1>{t("form_title")}</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="companyName">{t("form_company_name")}</label>
          <input
            id="companyName"
            type="text"
            required
            maxLength={200}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="companyCountry">{t("form_company_country")}</label>
            <select
              id="companyCountry"
              required
              value={companyCountry}
              onChange={(e) => setCompanyCountry(e.target.value)}
            >
              <option value="" disabled>
                —
              </option>
              {NCA_TABLE.map((n) => (
                <option key={n.countryCode} value={n.countryCode}>
                  {n.countryName}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="sector">{t("form_sector")}</label>
            <select id="sector" required value={sector} onChange={(e) => setSector(e.target.value as Sector)}>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {SECTOR_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <IbanInput id="ibanCountry" onValidCountry={handleIbanCountry} />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="context">{t("form_context")}</label>
            <select id="context" required value={context} onChange={(e) => setContext(e.target.value as RefusalContext)}>
              {CONTEXTS.map((c) => (
                <option key={c} value={c}>
                  {CONTEXT_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="incidentDate">{t("form_date")}</label>
            <input
              id="incidentDate"
              type="date"
              required
              max={today}
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="description">{t("form_description")}</label>
          <textarea
            id="description"
            maxLength={500}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <span className="char-count">{description.length}/500</span>
        </div>

        <div className="field">
          <label htmlFor="email">{t("form_email")}</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        {/* Honeypot — hidden from real users via CSS, bots tend to fill every field (FR-F3). */}
        <div className="hp-field" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button type="submit" disabled={!canSubmit || submitting} className="primary-btn">
          {submitting ? t("form_submitting") : t("form_submit")}
        </button>
      </form>
    </div>
  );
}
