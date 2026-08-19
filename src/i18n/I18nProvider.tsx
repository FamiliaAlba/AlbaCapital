import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import esAR from "./locales/es-AR";
import enUS from "./locales/en-US";
import ptBR from "./locales/pt-BR";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./types";

const STORAGE_KEY = "alba-locale";

const dictionaries: Record<Locale, unknown> = {
  "es-AR": esAR,
  "en-US": enUS,
  "pt-BR": ptBR,
};

function lookup(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, source);
}

function interpolate(value: string, vars?: Record<string, string | number>): string {
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Traducción de un texto simple, con fallback a es-AR. */
  t: (path: string, vars?: Record<string, string | number>) => string;
  /** Traducción de una lista de textos. */
  tList: (path: string) => string[];
  /** Traducción de objetos arbitrarios (bloques, tabs, etc.). */
  tRaw: <T>(path: string) => T;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatPercent: (value: number, fractionDigits?: number) => string;
  formatDate: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
  return stored && LOCALES.includes(stored) ? stored : DEFAULT_LOCALE;
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* almacenamiento no disponible */
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[locale];

    const resolve = (path: string): unknown => {
      const found = lookup(dict, path);
      if (found !== undefined && found !== null && !(Array.isArray(found) && found.length === 0)) {
        return found;
      }
      return lookup(esAR, path);
    };

    const t = (path: string, vars?: Record<string, string | number>) => {
      const found = resolve(path);
      return typeof found === "string" ? interpolate(found, vars) : path;
    };

    const tList = (path: string) => {
      const found = resolve(path);
      return Array.isArray(found) ? (found as string[]) : [];
    };

    const tRaw = <T,>(path: string) => resolve(path) as T;

    return {
      locale,
      setLocale,
      t,
      tList,
      tRaw,
      formatNumber: (v, options) => new Intl.NumberFormat(locale, options).format(v),
      formatCurrency: (v, currency = "USD") =>
        new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(v),
      formatPercent: (v, fractionDigits = 0) =>
        new Intl.NumberFormat(locale, {
          style: "percent",
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        }).format(v / 100),
      formatDate: (v, options = { day: "2-digit", month: "long", year: "numeric" }) =>
        new Intl.DateTimeFormat(locale, options).format(new Date(v)),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n debe usarse dentro de I18nProvider");
  return ctx;
}
