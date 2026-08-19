import type { Dictionary } from "./locales/es-AR";

export type Locale = "es-AR" | "en-US" | "pt-BR";

export const LOCALES: Locale[] = ["es-AR", "en-US", "pt-BR"];
export const DEFAULT_LOCALE: Locale = "es-AR";

export const LOCALE_SHORT: Record<Locale, string> = {
  "es-AR": "ES-AR",
  "en-US": "EN-US",
  "pt-BR": "PT-BR",
};

export const LOCALE_NAME: Record<Locale, string> = {
  "es-AR": "Español (Argentina)",
  "en-US": "English (United States)",
  "pt-BR": "Português (Brasil)",
};

type Primitive = string | number | boolean | null | undefined;

export type DeepPartial<T> = T extends Primitive
  ? T
  : T extends readonly (infer U)[]
    ? DeepPartial<U>[]
    : { [K in keyof T]?: DeepPartial<T[K]> };

export type DeepPartialDictionary = DeepPartial<Dictionary>;
export type { Dictionary };
