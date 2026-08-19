import { MessageCircle } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { buildWhatsAppUrl } from "@/config/site";

const WhatsAppFloat = () => {
  const { t } = useI18n();
  const href = buildWhatsAppUrl(t("whatsapp.message"));

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsapp.aria")}
      className="fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-elegant transition-transform hover:scale-105 active:scale-95"
      style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
    >
      <MessageCircle className="h-7 w-7" strokeWidth={2} />
    </a>
  );
};

export default WhatsAppFloat;
