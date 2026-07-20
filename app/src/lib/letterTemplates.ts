import { CONTEXT_LABELS, type ReportInput } from "./types";
import { countryName } from "./countries";
import { getNcaForCountry } from "./ncaData";

export type LetterLanguage = "en" | "de";

const DE_CONTEXT_LABELS: Record<ReportInput["context"], string> = {
  salary: "Gehaltszahlung",
  direct_debit: "Einrichtung eines Lastschriftmandats",
  one_off_payment: "Einmalzahlung",
  refund: "Rückerstattung",
};

const DE_COUNTRY_NAMES: Record<string, string> = {
  AT: "Österreich", BE: "Belgien", BG: "Bulgarien", HR: "Kroatien", CY: "Zypern",
  CZ: "Tschechien", DK: "Dänemark", EE: "Estland", FI: "Finnland", FR: "Frankreich",
  DE: "Deutschland", GR: "Griechenland", HU: "Ungarn", IE: "Irland", IT: "Italien",
  LV: "Lettland", LT: "Litauen", LU: "Luxemburg", MT: "Malta", NL: "Niederlande",
  PL: "Polen", PT: "Portugal", RO: "Rumänien", SK: "Slowakei", SI: "Slowenien",
  ES: "Spanien", SE: "Schweden", IS: "Island", LI: "Liechtenstein", NO: "Norwegen",
  GB: "Vereinigtes Königreich", CH: "Schweiz", MC: "Monaco", SM: "San Marino",
  AD: "Andorra", VA: "Vatikanstadt",
};

export interface LetterInput extends Pick<
  ReportInput,
  "companyName" | "companyCountry" | "ibanCountry" | "context" | "incidentDate" | "description"
> {}

const TODAY = () => new Date().toISOString().slice(0, 10);

/** Formal complaint letter to the National Competent Authority (FR-B1). Zero backend dependency (NFR-6). */
export function generateNcaLetter(input: LetterInput, lang: LetterLanguage = "en"): { subject: string; body: string; recipient: string } {
  const nca = getNcaForCountry(input.companyCountry);
  const companyCountryName = lang === "de" ? DE_COUNTRY_NAMES[input.companyCountry] ?? countryName(input.companyCountry) : countryName(input.companyCountry);
  const ibanCountryName = lang === "de" ? DE_COUNTRY_NAMES[input.ibanCountry] ?? countryName(input.ibanCountry) : countryName(input.ibanCountry);
  const contextLabel = lang === "de" ? DE_CONTEXT_LABELS[input.context] : CONTEXT_LABELS[input.context];

  const recipient = nca
    ? `${nca.authorityName}\n${nca.address}`
    : `[National Competent Authority for ${companyCountryName}]`;

  if (lang === "de") {
    return {
      subject: `Beschwerde wegen Verstoßes gegen Art. 9 SEPA-Verordnung (EU) 260/2012 — ${input.companyName}`,
      recipient,
      body:
`${recipient}

${TODAY()}

Betreff: Beschwerde wegen Diskriminierung aufgrund der IBAN gemäß Art. 9 Abs. 2 der Verordnung (EU) Nr. 260/2012

Sehr geehrte Damen und Herren,

hiermit reiche ich eine Beschwerde gegen "${input.companyName}" (${companyCountryName}) ein.

Am ${input.incidentDate} weigerte sich das genannte Unternehmen, eine gültige IBAN aus ${ibanCountryName} im Zusammenhang mit folgendem Vorgang zu akzeptieren: ${contextLabel}.

${input.description ? `Weitere Angaben: ${input.description}\n\n` : ""}Gemäß Art. 9 Abs. 2 der Verordnung (EU) Nr. 260/2012 darf ein Zahlungsempfänger, der einen SEPA-Zahlungsauftrag entgegennimmt, dem Zahler nicht vorschreiben, in welchem Mitgliedstaat sich das Zahlungskonto befinden muss, sofern dieses Konto innerhalb der Union erreichbar ist. Die Ablehnung einer gültigen IBAN allein aufgrund ihres Ausstellungslandes stellt einen Verstoß gegen diese Vorschrift dar.

Ich bitte Sie höflich, diesen Fall zu prüfen und die notwendigen aufsichtsrechtlichen Maßnahmen zu ergreifen.

Mit freundlichen Grüßen,
[Ihr Name]

---
Hinweis: Dieses Schreiben wurde automatisch von FairIBAN erstellt und stellt keine Rechtsberatung dar.`,
    };
  }

  return {
    subject: `Complaint — breach of Article 9 SEPA Regulation (EU) 260/2012 by ${input.companyName}`,
    recipient,
    body:
`${recipient}

${TODAY()}

Subject: Complaint regarding IBAN discrimination under Article 9(2) of Regulation (EU) No 260/2012

Dear Sir or Madam,

I am writing to file a complaint against "${input.companyName}" (${companyCountryName}).

On ${input.incidentDate}, the above company refused to accept a valid IBAN issued in ${ibanCountryName} in connection with the following: ${contextLabel}.

${input.description ? `Additional details: ${input.description}\n\n` : ""}Under Article 9(2) of Regulation (EU) No 260/2012, a payee accepting a credit transfer or using a direct debit to collect funds shall not specify the Member State in which a payment account is to be located, provided that the payment account is reachable in accordance with Article 3. Refusing a valid IBAN solely because of its country of issue constitutes a breach of this provision.

I kindly ask you to investigate this matter and take the supervisory action you consider appropriate.

Yours faithfully,
[Your name]

---
Note: This letter was generated automatically by FairIBAN and does not constitute legal advice.`,
  };
}

/** Optional "cease and comply" notice addressed directly to the offending company (FR-B5). */
export function generateCompanyLetter(input: LetterInput, lang: LetterLanguage = "en"): { subject: string; body: string } {
  const ibanCountryName = lang === "de" ? DE_COUNTRY_NAMES[input.ibanCountry] ?? countryName(input.ibanCountry) : countryName(input.ibanCountry);
  const contextLabel = lang === "de" ? DE_CONTEXT_LABELS[input.context] : CONTEXT_LABELS[input.context];

  if (lang === "de") {
    return {
      subject: `Aufforderung zur Einhaltung von Art. 9 SEPA-Verordnung (EU) 260/2012`,
      body:
`An die Geschäftsleitung von ${input.companyName}

${TODAY()}

Sehr geehrte Damen und Herren,

am ${input.incidentDate} haben Sie eine gültige IBAN aus ${ibanCountryName} im Rahmen von "${contextLabel}" abgelehnt.

Dies verstößt gegen Art. 9 Abs. 2 der Verordnung (EU) Nr. 260/2012, die es untersagt, SEPA-Zahlungen aufgrund des Ausstellungslandes der IBAN abzulehnen.

Ich fordere Sie auf, diese Praxis umgehend einzustellen und künftig alle gültigen IBAN aus dem EU/EWR-Raum zu akzeptieren. Andernfalls behalte ich mir vor, eine Beschwerde bei der zuständigen Aufsichtsbehörde einzureichen.

Mit freundlichen Grüßen,
[Ihr Name]

---
Hinweis: Dieses Schreiben stellt keine Rechtsberatung dar.`,
    };
  }

  return {
    subject: `Notice to cease non-compliance with Article 9 of Regulation (EU) 260/2012`,
    body:
`To the management of ${input.companyName}

${TODAY()}

Dear Sir or Madam,

On ${input.incidentDate}, you refused a valid IBAN issued in ${ibanCountryName} in connection with: ${contextLabel}.

This constitutes a breach of Article 9(2) of Regulation (EU) No 260/2012, which prohibits refusing SEPA payments on the basis of the country in which the IBAN was issued.

I ask that you cease this practice immediately and accept any valid IBAN from the EU/EEA going forward. Failing that, I reserve the right to file a complaint with the competent national authority.

Yours faithfully,
[Your name]

---
Note: This letter does not constitute legal advice.`,
  };
}
