import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "en" | "de";

const dict = {
  en: {
    appName: "FairIBAN",
    tagline: "IBAN discrimination is illegal in all 27 EU countries.",
    nav_report: "Report",
    nav_map: "Map",
    nav_shame: "Wall of Shame",
    nav_stats: "Stats",
    home_title: "Refused for having a “foreign” IBAN?",
    home_body:
      "Under Article 9 of the SEPA Regulation, EU companies cannot refuse a valid EU/EEA IBAN for euro payments. It happens anyway — every day, across every country. Report it in under 60 seconds and get a ready-to-send complaint letter.",
    home_cta: "Report discrimination",
    home_secondary: "See the public map",
    footer_note: "No accounts. No cookies. No tracking. Full IBANs are never stored — only the country code.",
    footer_legal: "FairIBAN is not a law firm; letters are templates and do not constitute legal advice.",
    form_title: "Report IBAN discrimination",
    form_company_name: "Company name",
    form_company_country: "Company's country",
    form_sector: "Sector",
    form_iban_country: "Refused IBAN — country code or full IBAN",
    form_iban_hint: "We never store your IBAN. Enter a 2-letter country code (e.g. FR) or the full IBAN — if you enter the full IBAN, we validate it in your browser and immediately discard it.",
    form_context: "What was refused?",
    form_date: "Date of incident",
    form_description: "Description (optional, max 500 characters)",
    form_email: "Email (optional — get a copy of your letter)",
    form_submit: "Submit report",
    form_submitting: "Submitting…",
    form_iban_valid: "Valid IBAN",
    form_iban_invalid: "Invalid IBAN",
    letter_title: "Your complaint letter is ready",
    letter_subtitle: "Addressed to the National Competent Authority for",
    letter_copy: "Copy text",
    letter_copied: "Copied!",
    letter_download: "Download PDF",
    letter_email: "Send by email",
    letter_email_self: "Email me a copy",
    letter_lang_toggle: "Letter language",
    letter_company_letter: "Also generate a notice to the company",
    letter_back: "File another report",
    letter_view_map: "View the public map",
    map_title: "Public map of reports",
    map_body: "Aggregated, anonymised reports — no personal data shown.",
    shame_title: "Wall of Shame",
    shame_filter_country: "Filter by country",
    shame_filter_sector: "Filter by sector",
    shame_all: "All",
    shame_reports: "reports",
    shame_iban_countries: "Refused IBAN countries",
    shame_last: "Most recent",
    stats_title: "Statistics",
    stats_total: "Total reports",
    stats_companies: "Companies named",
    stats_countries: "Countries involved",
    stats_top_sectors: "Top offending sectors",
    stats_top_pairs: "Top company country → refused IBAN country",
    stats_over_time: "Reports over time",
  },
  de: {
    appName: "FairIBAN",
    tagline: "IBAN-Diskriminierung ist in allen 27 EU-Ländern illegal.",
    nav_report: "Melden",
    nav_map: "Karte",
    nav_shame: "Pranger",
    nav_stats: "Statistik",
    home_title: "Wegen einer „ausländischen“ IBAN abgelehnt?",
    home_body:
      "Gemäß Art. 9 der SEPA-Verordnung dürfen EU-Unternehmen eine gültige EU/EWR-IBAN für Euro-Zahlungen nicht ablehnen. Trotzdem passiert es täglich, in jedem Land. Melden Sie es in unter 60 Sekunden und erhalten Sie sofort ein fertiges Beschwerdeschreiben.",
    home_cta: "Diskriminierung melden",
    home_secondary: "Öffentliche Karte ansehen",
    footer_note: "Keine Konten. Keine Cookies. Kein Tracking. Vollständige IBANs werden nie gespeichert — nur der Ländercode.",
    footer_legal: "FairIBAN ist keine Anwaltskanzlei; die Schreiben sind Vorlagen und stellen keine Rechtsberatung dar.",
    form_title: "IBAN-Diskriminierung melden",
    form_company_name: "Firmenname",
    form_company_country: "Land des Unternehmens",
    form_sector: "Branche",
    form_iban_country: "Abgelehnte IBAN — Ländercode oder vollständige IBAN",
    form_iban_hint: "Wir speichern Ihre IBAN niemals. Geben Sie einen 2-stelligen Ländercode (z. B. FR) oder die vollständige IBAN ein — bei vollständiger Eingabe wird sie im Browser geprüft und sofort verworfen.",
    form_context: "Was wurde abgelehnt?",
    form_date: "Datum des Vorfalls",
    form_description: "Beschreibung (optional, max. 500 Zeichen)",
    form_email: "E-Mail (optional — Kopie des Schreibens erhalten)",
    form_submit: "Meldung absenden",
    form_submitting: "Wird gesendet…",
    form_iban_valid: "Gültige IBAN",
    form_iban_invalid: "Ungültige IBAN",
    letter_title: "Ihr Beschwerdeschreiben ist fertig",
    letter_subtitle: "Adressiert an die zuständige Aufsichtsbehörde für",
    letter_copy: "Text kopieren",
    letter_copied: "Kopiert!",
    letter_download: "Als PDF herunterladen",
    letter_email: "Per E-Mail senden",
    letter_email_self: "Kopie an mich senden",
    letter_lang_toggle: "Sprache des Schreibens",
    letter_company_letter: "Zusätzlich ein Schreiben an das Unternehmen erstellen",
    letter_back: "Weitere Meldung abgeben",
    letter_view_map: "Öffentliche Karte ansehen",
    map_title: "Öffentliche Karte der Meldungen",
    map_body: "Aggregierte, anonymisierte Meldungen — keine personenbezogenen Daten.",
    shame_title: "Pranger",
    shame_filter_country: "Nach Land filtern",
    shame_filter_sector: "Nach Branche filtern",
    shame_all: "Alle",
    shame_reports: "Meldungen",
    shame_iban_countries: "Abgelehnte IBAN-Länder",
    shame_last: "Zuletzt",
    stats_title: "Statistik",
    stats_total: "Meldungen gesamt",
    stats_companies: "Genannte Unternehmen",
    stats_countries: "Beteiligte Länder",
    stats_top_sectors: "Häufigste Branchen",
    stats_top_pairs: "Firmenland → abgelehntes IBAN-Land",
    stats_over_time: "Meldungen im Zeitverlauf",
  },
} as const;

export type TranslationKey = keyof (typeof dict)["en"];

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("fairiban_lang") : null;
    return stored === "de" ? "de" : "en";
  });

  const setLangPersist = (l: Lang) => {
    setLang(l);
    if (typeof window !== "undefined") window.localStorage.setItem("fairiban_lang", l);
  };

  const t = (key: TranslationKey) => dict[lang][key] ?? dict.en[key];

  return <I18nContext.Provider value={{ lang, setLang: setLangPersist, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
