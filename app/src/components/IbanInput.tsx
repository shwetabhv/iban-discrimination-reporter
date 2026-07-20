import { useEffect, useMemo, useState } from "react";
import { validateIban, isKnownIbanCountry } from "../lib/iban";
import { countryName } from "../lib/countries";
import { useI18n } from "../lib/i18n";
import "./IbanInput.css";

interface Props {
  onValidCountry: (countryCode: string | null) => void;
  id: string;
}

function flagEmoji(countryCode: string): string {
  if (countryCode.length !== 2) return "";
  const codePoints = [...countryCode.toUpperCase()].map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function IbanInput({ onValidCountry, id }: Props) {
  const { t } = useI18n();
  const [raw, setRaw] = useState("");
  const [touched, setTouched] = useState(false);

  const result = useMemo(() => {
    const value = raw.trim();
    if (!value) return { status: "empty" as const };

    if (/^[A-Za-z]{2}$/.test(value)) {
      const code = value.toUpperCase();
      if (isKnownIbanCountry(code)) return { status: "valid" as const, countryCode: code, mode: "code" as const };
      return { status: "invalid" as const, error: `Unrecognised country code "${code}".` };
    }

    const validation = validateIban(value);
    if (validation.valid && validation.countryCode) {
      return { status: "valid" as const, countryCode: validation.countryCode, mode: "iban" as const };
    }
    return { status: "invalid" as const, error: validation.error || "Invalid IBAN." };
  }, [raw]);

  useEffect(() => {
    onValidCountry(result.status === "valid" ? result.countryCode : null);
  }, [result, onValidCountry]);

  return (
    <div className="iban-input">
      <label htmlFor={id}>{t("form_iban_country")}</label>
      <input
        id={id}
        type="text"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        placeholder="FR or FR7630006000011234567890189"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={() => setTouched(true)}
        aria-invalid={touched && result.status === "invalid"}
        aria-describedby={`${id}-hint ${id}-status`}
        className={
          result.status === "valid" ? "valid" : touched && result.status === "invalid" ? "invalid" : ""
        }
      />
      <p id={`${id}-hint`} className="hint">
        {t("form_iban_hint")}
      </p>
      <div id={`${id}-status`} aria-live="polite" className="status-line">
        {result.status === "valid" && (
          <span className="badge badge-valid">
            {flagEmoji(result.countryCode)} {t("form_iban_valid")} — {countryName(result.countryCode)}
          </span>
        )}
        {touched && result.status === "invalid" && (
          <span className="badge badge-invalid">✕ {t("form_iban_invalid")}: {result.error}</span>
        )}
      </div>
    </div>
  );
}
