import { NavLink } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import "./Header.css";

export default function Header() {
  const { t, lang, setLang } = useI18n();

  return (
    <header className="site-header">
      <NavLink to="/" className="brand">
        {t("appName")}
      </NavLink>
      <nav>
        <NavLink to="/report">{t("nav_report")}</NavLink>
        <NavLink to="/map">{t("nav_map")}</NavLink>
        <NavLink to="/wall">{t("nav_shame")}</NavLink>
        <NavLink to="/stats">{t("nav_stats")}</NavLink>
      </nav>
      <div className="lang-toggle" role="group" aria-label="Language">
        <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>
          EN
        </button>
        <button className={lang === "de" ? "active" : ""} onClick={() => setLang("de")}>
          DE
        </button>
      </div>
    </header>
  );
}
