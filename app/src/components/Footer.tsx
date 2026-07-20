import { useI18n } from "../lib/i18n";
import "./Footer.css";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <p>{t("footer_note")}</p>
      <p className="legal">{t("footer_legal")}</p>
    </footer>
  );
}
