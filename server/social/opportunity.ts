import { opportunityFingerprint } from "../../src/lib/social/hash.js";
import { canonicalProjectUrl } from "../../src/lib/social/utm.js";
import { admin } from "./db.js";
import { env } from "./env.js";

export interface OpportunitySnapshot {
  id: string;
  slug: string;
  title: string;
  tipo: string | null;
  description: string;
  location: string | null;
  photoUrl: string | null;
  photoAlt: string;
  url: string;
  published: boolean;
  hash: string;
}

/** Datos PÚBLICOS de la oportunidad (es-AR). Es la única fuente de contenido de las piezas. */
export async function loadOpportunity(opportunityId: string): Promise<OpportunitySnapshot | null> {
  const { data } = await admin()
    .from("opportunities")
    .select("id, slug, location, photo_path, photo_alt, status, archived_at, opportunity_translations(locale, title, tipo, descripcion)")
    .eq("id", opportunityId)
    .maybeSingle();
  if (!data) return null;
  const tr = (data.opportunity_translations as { locale: string; title: string; tipo: string | null; descripcion: string | null }[]).find((t) => t.locale === "es-AR");
  const base = env.supabaseUrl()?.replace(/\/+$/, "");
  const photoUrl = data.photo_path
    ? data.photo_path.startsWith("/")
      ? `${env.siteUrl()}${data.photo_path}`
      : `${base}/storage/v1/object/public/opportunity-photos/${data.photo_path}`
    : null;
  const snap = {
    id: data.id as string,
    slug: data.slug as string,
    title: tr?.title ?? "",
    tipo: tr?.tipo ?? null,
    description: tr?.descripcion ?? "",
    location: (data.location as string | null) ?? null,
    photoUrl,
    photoAlt: (data.photo_alt as string | null) ?? tr?.title ?? "",
    url: canonicalProjectUrl(env.siteUrl(), data.slug as string),
    published: data.status === "published" && !data.archived_at,
  };
  return { ...snap, hash: opportunityFingerprint([snap.slug, snap.title, snap.tipo, snap.description, snap.location, data.photo_path as string | null]) };
}
