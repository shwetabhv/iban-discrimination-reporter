import { getNcaForCountry, countryName } from "./ncaData";
import type { RefusalContext } from "./types";

const CONTEXT_LABELS: Record<RefusalContext, string> = {
  salary: "Salary payment",
  direct_debit: "Direct debit setup",
  one_off_payment: "One-off payment",
  refund: "Refund",
};

export interface LetterInput {
  companyName: string;
  companyCountry: string;
  ibanCountry: string;
  context: RefusalContext;
  incidentDate: string;
  description?: string;
}

const TODAY = () => new Date().toISOString().slice(0, 10);

/** Server-side fallback mirror of app/src/lib/letterTemplates.ts (EN only). */
export function generateNcaLetter(input: LetterInput): { subject: string; body: string; recipient: string } {
  const nca = getNcaForCountry(input.companyCountry);
  const companyCountryName = countryName(input.companyCountry);
  const ibanCountryName = countryName(input.ibanCountry);
  const contextLabel = CONTEXT_LABELS[input.context];
  const recipient = nca ? `${nca.authorityName}\n${nca.address}` : `[National Competent Authority for ${companyCountryName}]`;

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
