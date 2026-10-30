/**
 * Portada de la home: UN solo video continuo en bucle, sin audio.
 *
 * Recorrido por activos productivos reales (campo, ganadería, obra, loteo, energía, puerto), con los títulos entrando palabra por
 * palabra, el logo revelado al final y el cierre sobre la imagen de portada de siempre. Dos recortes del mismo montaje:
 * horizontal 16:9 (escritorio/tablet) y vertical 9:16 (celular). El sitio conserva el titular como texto real y lo muestra en el
 * tramo final del video, cuando el cuadro coincide con la portada original.
 */

export interface HeroVideoSource {
  src: string;
  /** Imagen de portada del recorte (la misma que ve el sitio sin video). */
  poster: string;
}

/** Se cambia al regenerar los archivos para que ningún navegador reutilice una versión vieja. */
export const ASSET_VERSION = "1";

export type HeroLocale = "es-AR" | "en-US" | "pt-BR";

/** Los títulos van dentro del video: hay una versión por idioma (español sin sufijo). */
const SUFFIX: Record<HeroLocale, string> = { "es-AR": "", "en-US": "-en", "pt-BR": "-pt" };

const source = (variant: "desktop" | "mobile", locale: HeroLocale): HeroVideoSource => ({
  src: `/hero/alba-hero-${variant}${SUFFIX[locale] ?? ""}.mp4?v=${ASSET_VERSION}`,
  // La portada (imagen original) es la misma para todos los idiomas.
  poster: `/hero/alba-hero-${variant}.webp?v=${ASSET_VERSION}`,
});

export const heroVideoFor = (locale: string) => {
  const l: HeroLocale = locale === "en-US" || locale === "pt-BR" ? locale : "es-AR";
  return { desktop: source("desktop", l), mobile: source("mobile", l) };
};

export const HERO_VIDEO = heroVideoFor("es-AR");

/** Duración del montaje y tramo (en segundos) en que el cuadro ya es la portada original: ahí aparece el titular del sitio. */
export const HERO_VIDEO_TIMING = { duration: 28, textFrom: 24.3, textUntil: 27.3 };

/** Tope de espera (ms) para pedir el video si la página tarda en terminar de cargar. */
export const VIDEO_MAX_WAIT_MS = 2500;

export interface ConnectionInfo {
  saveData?: boolean;
  effectiveType?: string;
}

/** Con "reducir movimiento", ahorro de datos o conexión 2G/3G no se descarga el video: queda la imagen de portada. */
export function shouldAllowVideo(reducedMotion: boolean, connection?: ConnectionInfo | null): boolean {
  if (reducedMotion) return false;
  if (connection?.saveData === true) return false;
  return !["slow-2g", "2g", "3g"].includes(connection?.effectiveType ?? "");
}

export type PlayOutcome = "ignore" | "blocked" | "failed";

/** AbortError (pausa o recarga en medio) se ignora; NotAllowedError pide un gesto; cualquier otro error deja la imagen. */
export function classifyPlayError(err: unknown): PlayOutcome {
  const name = (err as { name?: string } | null)?.name;
  if (name === "AbortError") return "ignore";
  if (name === "NotAllowedError") return "blocked";
  return "failed";
}

/** ¿Se ve el titular del sitio? Siempre sin video activo; con video, solo en el tramo final (portada original). */
export function isHeadlineVisible(videoActive: boolean, currentTime: number, t = HERO_VIDEO_TIMING): boolean {
  if (!videoActive) return true;
  return currentTime >= t.textFrom && currentTime <= t.textUntil;
}
