import type { Network } from "./types";

/** URL canónica de la oportunidad: sin parámetros. */
export function canonicalProjectUrl(siteUrl: string, slug: string): string {
  return `${siteUrl.replace(/\/+$/, "")}/oportunidades/${encodeURIComponent(slug)}`;
}

/** Agrega UTMs por red. Solo identifica origen y campaña: nunca datos personales. */
export function withUtm(url: string, network: Network, slug: string): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", network);
  u.searchParams.set("utm_medium", "social");
  u.searchParams.set("utm_campaign", `oportunidad-${slug}`.slice(0, 100));
  return u.toString();
}

/** Texto legible sin protocolo, para redes donde el enlace no es clickeable. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}
