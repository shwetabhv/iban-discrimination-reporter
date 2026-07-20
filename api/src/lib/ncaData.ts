// Server-side mirror of app/src/lib/ncaData.ts, used only as a fallback for POST /api/letters
// (letter generation is primarily client-side and has zero backend dependency — NFR-6).
export interface NcaRecord {
  countryCode: string;
  countryName: string;
  authorityName: string;
  address: string;
  website: string;
  language: string;
}

export const NCA_TABLE: NcaRecord[] = [
  { countryCode: "AT", countryName: "Austria", authorityName: "Financial Market Authority (FMA)", address: "Otto-Wagner-Platz 5, 1090 Vienna, Austria", website: "https://www.fma.gv.at", language: "de" },
  { countryCode: "BE", countryName: "Belgium", authorityName: "National Bank of Belgium", address: "Boulevard de Berlaimont 14, 1000 Brussels, Belgium", website: "https://www.nbb.be", language: "nl" },
  { countryCode: "BG", countryName: "Bulgaria", authorityName: "Bulgarian National Bank", address: "1 Knyaz Alexander I Sq., 1000 Sofia, Bulgaria", website: "https://www.bnb.bg", language: "bg" },
  { countryCode: "HR", countryName: "Croatia", authorityName: "Croatian National Bank", address: "Trg hrvatskih velikana 3, 10000 Zagreb, Croatia", website: "https://www.hnb.hr", language: "hr" },
  { countryCode: "CY", countryName: "Cyprus", authorityName: "Central Bank of Cyprus", address: "80 Kennedy Avenue, 1076 Nicosia, Cyprus", website: "https://www.centralbank.cy", language: "el" },
  { countryCode: "CZ", countryName: "Czechia", authorityName: "Czech National Bank", address: "Na Příkopě 28, 115 03 Prague 1, Czechia", website: "https://www.cnb.cz", language: "cs" },
  { countryCode: "DK", countryName: "Denmark", authorityName: "Danish Financial Supervisory Authority", address: "Strandgade 29, 1401 Copenhagen K, Denmark", website: "https://www.dfsa.dk", language: "da" },
  { countryCode: "EE", countryName: "Estonia", authorityName: "Estonian Financial Supervisory Authority", address: "Sakala 4, 15030 Tallinn, Estonia", website: "https://www.fi.ee", language: "et" },
  { countryCode: "FI", countryName: "Finland", authorityName: "Financial Supervisory Authority", address: "Snellmaninkatu 6, 00100 Helsinki, Finland", website: "https://www.finanssivalvonta.fi", language: "fi" },
  { countryCode: "FR", countryName: "France", authorityName: "Autorité de contrôle prudentiel et de résolution (ACPR)", address: "4 Place de Budapest, CS 92459, 75436 Paris Cedex 09, France", website: "https://acpr.banque-france.fr", language: "fr" },
  { countryCode: "DE", countryName: "Germany", authorityName: "Federal Financial Supervisory Authority (BaFin)", address: "Graurheindorfer Str. 108, 53117 Bonn, Germany", website: "https://www.bafin.de", language: "de" },
  { countryCode: "GR", countryName: "Greece", authorityName: "Bank of Greece", address: "21 El. Venizelos Ave., 10250 Athens, Greece", website: "https://www.bankofgreece.gr", language: "el" },
  { countryCode: "HU", countryName: "Hungary", authorityName: "Central Bank of Hungary (MNB)", address: "Krisztina krt. 55, 1013 Budapest, Hungary", website: "https://www.mnb.hu", language: "hu" },
  { countryCode: "IE", countryName: "Ireland", authorityName: "Central Bank of Ireland", address: "New Wapping Street, North Wall Quay, Dublin 1, D01 F7X3, Ireland", website: "https://www.centralbank.ie", language: "en" },
  { countryCode: "IT", countryName: "Italy", authorityName: "Bank of Italy", address: "Via Nazionale 91, 00184 Rome, Italy", website: "https://www.bancaditalia.it", language: "it" },
  { countryCode: "LV", countryName: "Latvia", authorityName: "Latvijas Banka", address: "K. Valdemāra iela 2A, 1050 Riga, Latvia", website: "https://www.bank.lv", language: "lv" },
  { countryCode: "LT", countryName: "Lithuania", authorityName: "Bank of Lithuania", address: "Totorių g. 4, 01121 Vilnius, Lithuania", website: "https://www.lb.lt", language: "lt" },
  { countryCode: "LU", countryName: "Luxembourg", authorityName: "Commission de Surveillance du Secteur Financier (CSSF)", address: "283 Route d'Arlon, L-1150 Luxembourg", website: "https://www.cssf.lu", language: "fr" },
  { countryCode: "MT", countryName: "Malta", authorityName: "Malta Financial Services Authority (MFSA)", address: "Triq l-Imdina, Zone 1, Central Business District, Birkirkara CBD 1010, Malta", website: "https://www.mfsa.mt", language: "en" },
  { countryCode: "NL", countryName: "Netherlands", authorityName: "De Nederlandsche Bank (DNB)", address: "Westeinde 1, 1017 ZN Amsterdam, Netherlands", website: "https://www.dnb.nl", language: "nl" },
  { countryCode: "PL", countryName: "Poland", authorityName: "Polish Financial Supervision Authority (KNF)", address: "ul. Piękna 20, 00-549 Warsaw, Poland", website: "https://www.knf.gov.pl", language: "pl" },
  { countryCode: "PT", countryName: "Portugal", authorityName: "Banco de Portugal", address: "Av. Almirante Reis 71, 1150-012 Lisbon, Portugal", website: "https://www.bportugal.pt", language: "pt" },
  { countryCode: "RO", countryName: "Romania", authorityName: "National Bank of Romania (BNR)", address: "Str. Lipscani 25, 030031 Bucharest, Romania", website: "https://www.bnr.ro", language: "ro" },
  { countryCode: "SK", countryName: "Slovakia", authorityName: "National Bank of Slovakia (NBS)", address: "Imricha Karvaša 1, 813 25 Bratislava, Slovakia", website: "https://www.nbs.sk", language: "sk" },
  { countryCode: "SI", countryName: "Slovenia", authorityName: "Bank of Slovenia", address: "Slovenska cesta 35, 1505 Ljubljana, Slovenia", website: "https://www.bsi.si", language: "sl" },
  { countryCode: "ES", countryName: "Spain", authorityName: "Banco de España", address: "Calle de Alcalá 48, 28014 Madrid, Spain", website: "https://www.bde.es", language: "es" },
  { countryCode: "SE", countryName: "Sweden", authorityName: "Financial Supervisory Authority", address: "Box 7821, 103 97 Stockholm, Sweden", website: "https://www.fi.se", language: "sv" },
  { countryCode: "IS", countryName: "Iceland", authorityName: "Central Bank of Iceland", address: "Kalkofnsvegur 1, 150 Reykjavík, Iceland", website: "https://www.sedlabanki.is", language: "is" },
  { countryCode: "LI", countryName: "Liechtenstein", authorityName: "Financial Market Authority Liechtenstein (FMA)", address: "Landstrasse 109, 9490 Vaduz, Liechtenstein", website: "https://www.fma-li.li", language: "de" },
  { countryCode: "NO", countryName: "Norway", authorityName: "Financial Supervisory Authority of Norway", address: "Revierstredet 3, 0151 Oslo, Norway", website: "https://www.finanstilsynet.no", language: "no" },
];

export function getNcaForCountry(countryCode: string): NcaRecord | undefined {
  return NCA_TABLE.find((n) => n.countryCode === countryCode.toUpperCase());
}

export function countryName(code: string): string {
  return getNcaForCountry(code)?.countryName ?? code.toUpperCase();
}
