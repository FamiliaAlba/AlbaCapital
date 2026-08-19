import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/i18n/I18nProvider";
import { LOCALES, LOCALE_NAME, LOCALE_SHORT } from "@/i18n/types";

const LanguageSelector = ({ className = "" }: { className?: string }) => {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${t("lang.label")} — ${LOCALE_NAME[locale]}`}
        className={`inline-flex min-h-9 items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${className}`}
      >
        <Globe className="h-4 w-4" strokeWidth={1.6} />
        <span>{LOCALE_SHORT[locale]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[13rem]">
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l}
            onSelect={() => setLocale(l)}
            aria-current={l === locale ? "true" : undefined}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className={l === locale ? "font-medium text-foreground" : "text-muted-foreground"}>
              {LOCALE_NAME[l]}
            </span>
            {l === locale && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
