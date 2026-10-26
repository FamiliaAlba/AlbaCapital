/**
 * Qué servidor de Tokenizate usa esta compilación.
 * - En los dominios de producción se mantiene la función `tokenizate` y la versión de textos legales vigente,
 *   y el módulo Producción PyME permanece oculto.
 * - En vistas previas (ramas) y en local se usa `tokenizate-preview`, que incluye Producción PyME.
 * Al autorizar el pase a producción: desplegar la misma fuente como `tokenizate` y dejar PYME_ENABLED = true.
 */
const PRODUCTION_HOSTS = ["alba-capital.vercel.app", "albacapital.com", "www.albacapital.com"];

const host = typeof window !== "undefined" ? window.location.hostname : "";
export const IS_PRODUCTION_HOST = PRODUCTION_HOSTS.includes(host);

export const PYME_ENABLED = !IS_PRODUCTION_HOST;
export const TK_FUNCTION = PYME_ENABLED ? "tokenizate-preview" : "tokenizate";
export const TK_LEGAL_VERSION_CURRENT = PYME_ENABLED ? "2026-10-26" : "2026-10-16.2";
