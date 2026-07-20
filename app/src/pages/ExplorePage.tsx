import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useI18n } from "../lib/i18n";
import { fetchMap, submitReport } from "../lib/api";
import { COUNTRY_COORDS, countryName, jitterCoords } from "../lib/countries";
import { NCA_TABLE } from "../lib/ncaData";
import { SEPA_EEA_COUNTRIES } from "../lib/iban";
import { SECTORS, SECTOR_LABELS, type MapEntry, type Sector } from "../lib/types";
import "./ExplorePage.css";

interface Props {
  defaultView: "map" | "list";
}

function MetooForm({ entry, onDone }: { entry: MapEntry; onDone: () => void }) {
  const [ibanCountry, setIbanCountry] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="metoo-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!ibanCountry) return;
        setBusy(true);
        try {
          await submitReport({
            companyName: entry.companyName,
            companyCountry: entry.companyCountry,
            sector: entry.sector,
            ibanCountry,
            context: "one_off_payment",
            incidentDate: new Date().toISOString().slice(0, 10),
          });
          onDone();
        } finally {
          setBusy(false);
        }
      }}
    >
      <select value={ibanCountry} onChange={(e) => setIbanCountry(e.target.value)} required>
        <option value="" disabled>
          Your IBAN's country…
        </option>
        {SEPA_EEA_COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
      <button type="submit" disabled={busy || !ibanCountry} className="secondary-btn small">
        {busy ? "…" : "+1 Confirm"}
      </button>
    </form>
  );
}

export default function ExplorePage({ defaultView }: Props) {
  const { t } = useI18n();
  const [entries, setEntries] = useState<MapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"map" | "list">(defaultView);
  const [countryFilter, setCountryFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState<Sector | "">("");
  const [openMetoo, setOpenMetoo] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setEntries(await fetchMap());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      entries.filter(
        (e) => (!countryFilter || e.companyCountry === countryFilter) && (!sectorFilter || e.sector === sectorFilter)
      ),
    [entries, countryFilter, sectorFilter]
  );

  return (
    <div className="page explore-page">
      <div className="explore-header">
        <div>
          <h1>{view === "map" ? t("map_title") : t("shame_title")}</h1>
          <p className="muted">{t("map_body")}</p>
        </div>
        <div className="view-toggle" role="tablist">
          <button className={view === "map" ? "active" : ""} onClick={() => setView("map")} role="tab" aria-selected={view === "map"}>
            {t("nav_map")}
          </button>
          <button className={view === "list" ? "active" : ""} onClick={() => setView("list")} role="tab" aria-selected={view === "list"}>
            {t("nav_shame")}
          </button>
        </div>
      </div>

      <div className="filters">
        <label>
          {t("shame_filter_country")}:{" "}
          <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
            <option value="">{t("shame_all")}</option>
            {NCA_TABLE.map((c) => (
              <option key={c.countryCode} value={c.countryCode}>
                {c.countryName}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("shame_filter_sector")}:{" "}
          <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value as Sector | "")}>
            <option value="">{t("shame_all")}</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {SECTOR_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p>Loading…</p>}

      {!loading && view === "map" && (
        <div className="map-wrap">
          <MapContainer center={[50, 12]} zoom={4} style={{ height: "60vh", width: "100%", borderRadius: 12 }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map((e) => {
              const base = COUNTRY_COORDS[e.companyCountry];
              if (!base) return null;
              const [lat, lng] = jitterCoords(base, `${e.companyName}|${e.companyCountry}`);
              return (
                <CircleMarker
                  key={`${e.companyName}|${e.companyCountry}`}
                  center={[lat, lng]}
                  radius={Math.min(6 + e.reportCount * 1.5, 22)}
                  pathOptions={{ color: "#c62828", fillColor: "#e57373", fillOpacity: 0.65 }}
                >
                  <Popup>
                    <strong>{e.companyName}</strong>
                    <br />
                    {countryName(e.companyCountry)} · {SECTOR_LABELS[e.sector]}
                    <br />
                    {e.reportCount} {t("shame_reports")}
                    <br />
                    {t("shame_iban_countries")}: {e.ibanCountries.map(countryName).join(", ")}
                    <br />
                    {t("shame_last")}: {e.lastReportDate}
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      )}

      {!loading && view === "list" && (
        <table className="shame-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Company</th>
              <th>Country</th>
              <th>Sector</th>
              <th>{t("shame_reports")}</th>
              <th>{t("shame_iban_countries")}</th>
              <th>{t("shame_last")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => {
              const key = `${e.companyName}|${e.companyCountry}`;
              return (
                <tr key={key}>
                  <td>{i + 1}</td>
                  <td>{e.companyName}</td>
                  <td>{countryName(e.companyCountry)}</td>
                  <td>{SECTOR_LABELS[e.sector]}</td>
                  <td>{e.reportCount}</td>
                  <td>{e.ibanCountries.map(countryName).join(", ")}</td>
                  <td>{e.lastReportDate}</td>
                  <td>
                    {openMetoo === key ? (
                      <MetooForm
                        entry={e}
                        onDone={() => {
                          setOpenMetoo(null);
                          load();
                        }}
                      />
                    ) : (
                      <button className="secondary-btn small" onClick={() => setOpenMetoo(key)}>
                        +1 This happened to me
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {!loading && filtered.length === 0 && <p className="muted">No reports match these filters yet.</p>}
    </div>
  );
}
