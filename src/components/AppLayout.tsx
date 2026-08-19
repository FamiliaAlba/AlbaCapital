import { ReactNode, useEffect } from "react";
import BottomNav from "./BottomNav";
import WhatsAppFloat from "./WhatsAppFloat";
import TopBar from "./TopBar";
import { useI18n } from "@/i18n/I18nProvider";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { t, locale } = useI18n();

  // Metadatos SEO dinámicos según el idioma activo
  useEffect(() => {
    document.title = t("seo.title");
    const setMeta = (selector: string, content: string) => {
      const el = document.head.querySelector<HTMLMetaElement>(selector);
      if (el) el.setAttribute("content", content);
    };
    setMeta('meta[name="description"]', t("seo.description"));
    setMeta('meta[property="og:title"]', t("seo.title"));
    setMeta('meta[property="og:description"]', t("seo.description"));
    setMeta('meta[name="twitter:title"]', t("seo.title"));
    setMeta('meta[name="twitter:description"]', t("seo.description"));
  }, [t, locale]);

  return (
    <div className="min-h-screen pb-24">
      <TopBar />
      {children}
      <WhatsAppFloat />
      <BottomNav />
    </div>
  );
};

export default AppLayout;
