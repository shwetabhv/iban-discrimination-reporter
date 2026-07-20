import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { useI18n, type Lang } from "../lib/i18n";
import { generateNcaLetter, generateCompanyLetter } from "../lib/letterTemplates";
import { getNcaForCountry } from "../lib/ncaData";
import { countryName } from "../lib/countries";
import { CONTEXT_LABELS, type RefusalContext } from "../lib/types";
import "./LetterPage.css";

interface ReportState {
  companyName: string;
  companyCountry: string;
  ibanCountry: string;
  context: RefusalContext;
  incidentDate: string;
  description?: string;
}

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPdf(filename: string, subject: string, body: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const maxWidth = 595 - margin * 2;
  doc.setFontSize(14);
  doc.text(subject, margin, margin, { maxWidth });
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(body, maxWidth);
  doc.text(lines, margin, margin + 30);
  doc.save(filename);
}

export default function LetterPage() {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state as { report?: ReportState; reporterEmail?: string } | null;
  const report = navState?.report;
  const reporterEmail = navState?.reporterEmail;

  const [letterLang, setLetterLang] = useState<Lang>("en");
  const [copied, setCopied] = useState(false);
  const [includeCompanyLetter, setIncludeCompanyLetter] = useState(false);

  useEffect(() => {
    if (!report) navigate("/report", { replace: true });
  }, [report, navigate]);

  const ncaLetter = useMemo(
    () => (report ? generateNcaLetter(report, letterLang) : null),
    [report, letterLang]
  );
  const companyLetter = useMemo(
    () => (report ? generateCompanyLetter(report, letterLang) : null),
    [report, letterLang]
  );

  if (!report || !ncaLetter) return null;

  const nca = getNcaForCountry(report.companyCountry);
  const fullText = includeCompanyLetter && companyLetter
    ? `${ncaLetter.body}\n\n\n===== ${companyLetter.subject} =====\n\n${companyLetter.body}`
    : ncaLetter.body;

  const mailtoHref = nca
    ? `mailto:?subject=${encodeURIComponent(ncaLetter.subject)}&body=${encodeURIComponent(ncaLetter.body)}`
    : undefined;

  return (
    <div className="page letter-page">
      <h1>{t("letter_title")}</h1>
      <p className="letter-subtitle">
        {t("letter_subtitle")} <strong>{countryName(report.companyCountry)}</strong>
        {nca ? ` — ${nca.authorityName}` : ""}
      </p>

      <div className="letter-toolbar">
        <label>
          {t("letter_lang_toggle")}:{" "}
          <select value={letterLang} onChange={(e) => setLetterLang(e.target.value as Lang)}>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
          </select>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={includeCompanyLetter}
            onChange={(e) => setIncludeCompanyLetter(e.target.checked)}
          />
          {t("letter_company_letter")}
        </label>
      </div>

      <pre className="letter-body">{fullText}</pre>

      <div className="letter-actions">
        <button
          className="primary-btn"
          onClick={async () => {
            await navigator.clipboard.writeText(fullText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? t("letter_copied") : t("letter_copy")}
        </button>
        <button
          className="secondary-btn"
          onClick={() => downloadPdf(`complaint-${report.companyName.replace(/\s+/g, "_")}.pdf`, ncaLetter.subject, fullText)}
        >
          {t("letter_download")}
        </button>
        <button
          className="secondary-btn"
          onClick={() => download(`complaint-${report.companyName.replace(/\s+/g, "_")}.txt`, fullText)}
        >
          .txt
        </button>
        {mailtoHref && (
          <a className="secondary-btn" href={mailtoHref}>
            {t("letter_email")}
          </a>
        )}
        {reporterEmail && (
          <a
            className="secondary-btn"
            href={`mailto:${encodeURIComponent(reporterEmail)}?subject=${encodeURIComponent(ncaLetter.subject)}&body=${encodeURIComponent(fullText)}`}
          >
            {t("letter_email_self")}
          </a>
        )}
      </div>

      <p className="context-recap">
        {countryName(report.ibanCountry)} IBAN refused for {CONTEXT_LABELS[report.context]} on {report.incidentDate}.
      </p>

      <div className="letter-footer-nav">
        <Link to="/report">{t("letter_back")}</Link>
        <Link to="/map">{t("letter_view_map")}</Link>
      </div>
    </div>
  );
}
