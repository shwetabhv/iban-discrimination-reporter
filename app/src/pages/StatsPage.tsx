import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n";
import { fetchStats } from "../lib/api";
import { countryName } from "../lib/countries";
import { SECTOR_LABELS, type StatsResponse } from "../lib/types";
import "./StatsPage.css";

export default function StatsPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    let active = true;
    fetchStats().then((s) => {
      if (active) setStats(s);
    });
    const interval = setInterval(() => {
      fetchStats().then((s) => active && setStats(s));
    }, 20000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (!stats) return <div className="page">Loading…</div>;

  const maxMonth = Math.max(1, ...stats.reportsOverTime.map((m) => m.count));

  return (
    <div className="page stats-page">
      <h1>{t("stats_title")}</h1>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.totalReports}</div>
          <div className="stat-label">{t("stats_total")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.distinctCompanies}</div>
          <div className="stat-label">{t("stats_companies")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.distinctCountries}</div>
          <div className="stat-label">{t("stats_countries")}</div>
        </div>
      </div>

      <section>
        <h2>{t("stats_top_sectors")}</h2>
        <ul className="bar-list">
          {stats.topSectors.map((s) => (
            <li key={s.sector}>
              <span className="bar-label">{SECTOR_LABELS[s.sector]}</span>
              <span className="bar-track">
                <span
                  className="bar-fill"
                  style={{ width: `${(s.count / (stats.topSectors[0]?.count || 1)) * 100}%` }}
                />
              </span>
              <span className="bar-value">{s.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{t("stats_top_pairs")}</h2>
        <ul className="pair-list">
          {stats.topCountryPairs.map((p) => (
            <li key={`${p.companyCountry}-${p.ibanCountry}`}>
              <strong>{countryName(p.companyCountry)}</strong> companies refusing{" "}
              <strong>{countryName(p.ibanCountry)}</strong> IBANs — {p.count}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{t("stats_over_time")}</h2>
        <div className="timeline">
          {stats.reportsOverTime.map((m) => (
            <div className="timeline-col" key={m.month} title={`${m.month}: ${m.count}`}>
              <div className="timeline-bar" style={{ height: `${(m.count / maxMonth) * 100}%` }} />
              <span className="timeline-label">{m.month.slice(5)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
