import { NCA_TABLE } from "./ncaData";
import { SEPA_EEA_COUNTRIES } from "./iban";

// Approximate country centroids (capital city) — good enough for map marker placement at demo scale.
export const COUNTRY_COORDS: Record<string, [number, number]> = {
  AT: [48.2082, 16.3738],
  BE: [50.8503, 4.3517],
  BG: [42.6977, 23.3219],
  HR: [45.815, 15.9819],
  CY: [35.1856, 33.3823],
  CZ: [50.0755, 14.4378],
  DK: [55.6761, 12.5683],
  EE: [59.437, 24.7536],
  FI: [60.1699, 24.9384],
  FR: [48.8566, 2.3522],
  DE: [52.52, 13.405],
  GR: [37.9838, 23.7275],
  HU: [47.4979, 19.0402],
  IE: [53.3498, -6.2603],
  IT: [41.9028, 12.4964],
  LV: [56.9496, 24.1052],
  LT: [54.6872, 25.2797],
  LU: [49.6116, 6.1319],
  MT: [35.8989, 14.5146],
  NL: [52.3676, 4.9041],
  PL: [52.2297, 21.0122],
  PT: [38.7223, -9.1393],
  RO: [44.4268, 26.1025],
  SK: [48.1486, 17.1077],
  SI: [46.0569, 14.5058],
  ES: [40.4168, -3.7038],
  SE: [59.3293, 18.0686],
  IS: [64.1466, -21.9426],
  LI: [47.166, 9.5554],
  NO: [59.9139, 10.7522],
  GB: [51.5074, -0.1278],
  CH: [46.948, 7.4474],
  MC: [43.7384, 7.4246],
  SM: [43.9424, 12.4578],
  AD: [42.5063, 1.5218],
  VA: [41.9029, 12.4534],
};

const NAME_LOOKUP: Record<string, string> = {};
for (const c of NCA_TABLE) NAME_LOOKUP[c.countryCode] = c.countryName;
for (const c of SEPA_EEA_COUNTRIES) if (!NAME_LOOKUP[c.code]) NAME_LOOKUP[c.code] = c.name;

export function countryName(code: string): string {
  return NAME_LOOKUP[code.toUpperCase()] ?? code.toUpperCase();
}

/** Deterministic small offset so multiple companies in the same country don't stack exactly. */
export function jitterCoords([lat, lng]: [number, number], seed: string): [number, number] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const dLat = ((hash % 1000) / 1000 - 0.5) * 1.4;
  const dLng = (((hash >> 10) % 1000) / 1000 - 0.5) * 1.4;
  return [lat + dLat, lng + dLng];
}
