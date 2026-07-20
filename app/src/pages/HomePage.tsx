import { Link } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import "./HomePage.css";

export default function HomePage() {
  const { t } = useI18n();
  return (
    <div className="page home-page">
      <div className="hero">
        <p className="eyebrow">{t("tagline")}</p>
        <h1>{t("home_title")}</h1>
        <p className="hero-body">{t("home_body")}</p>
        <div className="hero-actions">
          <Link to="/report" className="primary-btn">
            {t("home_cta")}
          </Link>
          <Link to="/map" className="secondary-btn">
            {t("home_secondary")}
          </Link>
        </div>
      </div>
    </div>
  );
}
