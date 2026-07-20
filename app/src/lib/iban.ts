// ISO 13616 IBAN structure: known length per country (SEPA + wider IBAN registry).
// Used for client-side validation only — full IBANs are never sent to the server or persisted (FR-A3, FR-F2).
export const IBAN_COUNTRY_LENGTHS: Record<string, number> = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22,
  BR: 29, BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28,
  EE: 20, EG: 29, ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23,
  GL: 18, GR: 27, GT: 28, HR: 21, HU: 28, IE: 22, IL: 23, IQ: 23, IS: 26,
  IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28, LC: 32, LI: 21, LT: 20, LU: 20,
  LV: 21, LY: 25, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27, MT: 31, MU: 30,
  NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29, RO: 24, RS: 22,
  SA: 24, SC: 31, SE: 24, SI: 19, SK: 24, SM: 27, ST: 25, SV: 28, TL: 23,
  TN: 24, TR: 26, UA: 29, VA: 22, VG: 24, XK: 20,
};

// EU + EEA / SEPA-participating countries relevant to Article 9 enforcement.
export const SEPA_EEA_COUNTRIES: { code: string; name: string }[] = [
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "NL", name: "Netherlands" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "IS", name: "Iceland" },
  { code: "LI", name: "Liechtenstein" },
  { code: "NO", name: "Norway" },
  { code: "GB", name: "United Kingdom (non-EU, IBAN still SEPA-scheme)" },
  { code: "CH", name: "Switzerland (non-EU, IBAN still SEPA-scheme)" },
  { code: "MC", name: "Monaco" },
  { code: "SM", name: "San Marino" },
  { code: "AD", name: "Andorra" },
  { code: "VA", name: "Vatican City" },
];

export interface IbanValidationResult {
  valid: boolean;
  countryCode: string | null;
  error?: string;
}

function mod97(digits: string): number {
  let remainder = digits;
  while (remainder.length > 2) {
    const block = remainder.slice(0, 9);
    remainder =
      (parseInt(block, 10) % 97).toString() + remainder.slice(block.length);
  }
  return parseInt(remainder, 10) % 97;
}

/** Validates a full IBAN using the MOD-97 checksum (ISO 13616). Never persist the input. */
export function validateIban(rawIban: string): IbanValidationResult {
  const iban = rawIban.replace(/\s+/g, "").toUpperCase();

  if (iban.length < 4) {
    return { valid: false, countryCode: null, error: "IBAN is too short." };
  }

  const countryCode = iban.slice(0, 2);
  if (!/^[A-Z]{2}$/.test(countryCode)) {
    return { valid: false, countryCode: null, error: "Missing or invalid country code." };
  }

  const expectedLength = IBAN_COUNTRY_LENGTHS[countryCode];
  if (!expectedLength) {
    return {
      valid: false,
      countryCode,
      error: `Unrecognised IBAN country code "${countryCode}".`,
    };
  }

  if (iban.length !== expectedLength) {
    return {
      valid: false,
      countryCode,
      error: `${countryCode} IBANs must be ${expectedLength} characters (got ${iban.length}).`,
    };
  }

  if (!/^[A-Z0-9]+$/.test(iban)) {
    return { valid: false, countryCode, error: "IBAN contains invalid characters." };
  }

  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => (ch.charCodeAt(0) - 55).toString());

  const checksum = mod97(numeric);
  if (checksum !== 1) {
    return { valid: false, countryCode, error: "IBAN checksum is invalid (failed MOD-97 check)." };
  }

  return { valid: true, countryCode };
}

export function isKnownIbanCountry(code: string): boolean {
  return Object.prototype.hasOwnProperty.call(IBAN_COUNTRY_LENGTHS, code.toUpperCase());
}
