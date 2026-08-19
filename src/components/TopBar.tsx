import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18n } from "@/i18n/I18nProvider";
import albaLogo from "@/assets/alba-logo-white.webp";

const TopBar = () => {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const goToTeam = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/#equipo");
      return;
    }
    document.getElementById("equipo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", "/#equipo");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/60">
      <div className="container mx-auto px-6 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center" aria-label={t("nav.homeAria")}>
          <img src={albaLogo} alt="Alba Capital" className="h-10 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <a
            href="/#equipo"
            onClick={goToTeam}
            className="hidden sm:inline text-minimal text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            {t("nav.team")}
          </a>
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
