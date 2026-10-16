import type { VercelRequest, VercelResponse } from "@vercel/node";
import { admin } from "../server/social/db.js";
import { env } from "../server/social/env.js";
import { loadOpportunity } from "../server/social/opportunity.js";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * HTML mínimo con Open Graph por oportunidad para rastreadores que no ejecutan JavaScript
 * (Facebook, LinkedIn, WhatsApp, Telegram, etc.). vercel.json lo sirve solo a esos user-agents;
 * las personas reciben la SPA normal.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.query.page === "tokenizate") {
    const site = env.siteUrl();
    const t = "Tokenizate | Alba Capital";
    const d = "Conocé cómo funciona la inversión tokenizada o postulá tu activo para que Alba Capital evalúe sus posibilidades de financiación.";
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=3600");
    return res.status(200).send(`<!doctype html><html lang="es-AR"><head><meta charset="utf-8"><title>${esc(t)}</title><meta name="description" content="${esc(d)}"><link rel="canonical" href="${site}/tokenizate"><meta property="og:type" content="website"><meta property="og:site_name" content="Alba Capital"><meta property="og:title" content="${esc(t)}"><meta property="og:description" content="${esc(d)}"><meta property="og:url" content="${site}/tokenizate"><meta property="og:image" content="${site}/og-image.jpg"><meta name="twitter:card" content="summary_large_image"></head><body><h1>${esc(t)}</h1><p>${esc(d)}</p></body></html>`);
  }
  const slug = String(req.query.slug ?? "").toLowerCase();
  const site = env.siteUrl();
  let title = "Alba Capital — Convertimos activos en rendimiento";
  let description = "Alba Capital estructura vehículos de inversión inmobiliaria.";
  let image = `${site}/og-image.jpg`;
  let url = site;
  try {
    if (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && env.serviceRoleKey()) {
      const { data } = await admin().from("opportunities").select("id").eq("slug", slug).eq("status", "published").is("archived_at", null).maybeSingle();
      const opp = data ? await loadOpportunity(data.id) : null;
      if (opp) {
        title = `${opp.title} — Alba Capital`;
        description = opp.description.replace(/\s+/g, " ").slice(0, 200);
        image = opp.photoUrl ?? image;
        url = opp.url;
      }
    }
  } catch {
    /* se usan los valores por defecto */
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
  res.status(200).send(`<!doctype html><html lang="es-AR"><head><meta charset="utf-8"><title>${esc(title)}</title>
<meta name="description" content="${esc(description)}"><link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="article"><meta property="og:site_name" content="Alba Capital">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:image" content="${esc(image)}"></head><body><h1>${esc(title)}</h1><p>${esc(description)}</p><a href="${esc(url)}">Ver oportunidad</a></body></html>`);
}
