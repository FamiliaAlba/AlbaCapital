import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/i18n/types";
import { isSitePhoto } from "@/lib/imageUpload";
import type { DealStatus, PublicOpportunity } from "@/hooks/useOpportunities";

export interface DetailSection {
  title: string;
  text?: string;
  rows?: [string, string][];
  table?: { headers: string[]; rows: string[][] };
  items?: string[];
  note?: string;
}

export interface OpportunityDetail {
  sections: DetailSection[];
  source?: string;
}

export type OpportunityWithDetail = PublicOpportunity & { detail: OpportunityDetail | null };

const OPPORTUNITY_PHOTOS_BUCKET = "opportunity-photos";

const asDetail = (value: unknown): OpportunityDetail | null =>
  value && typeof value === "object" && Array.isArray((value as OpportunityDetail).sections)
    ? (value as OpportunityDetail)
    : null;

/** Trae una oportunidad publicada por slug, con su detalle completo. Si el idioma activo no tiene detalle, usa el de es-AR. */
export function useOpportunityDetail(slug: string | undefined, locale: Locale) {
  const [opportunity, setOpportunity] = useState<OpportunityWithDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("opportunities")
        .select(
          `
          id, slug, location, photo_path, photo_alt, deal_status, tir_estimada, plazo,
          ticket_minimo, capital_objetivo, capital_captado, is_featured,
          opportunity_translations ( locale, title, tipo, descripcion, highlights, detail )
        `,
        )
        .eq("slug", slug)
        .eq("status", "published")
        .is("archived_at", null)
        .maybeSingle();

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const translations = data?.opportunity_translations ?? [];
      const es = translations.find((t) => t.locale === "es-AR");
      const active = translations.find((t) => t.locale === locale) ?? es;

      if (!data || !active?.title || !data.photo_path) {
        setOpportunity(null);
        setLoading(false);
        return;
      }

      const photoUrl = isSitePhoto(data.photo_path)
        ? data.photo_path
        : supabase.storage.from(OPPORTUNITY_PHOTOS_BUCKET).getPublicUrl(data.photo_path).data.publicUrl;

      setOpportunity({
        id: data.id,
        slug: data.slug,
        location: data.location,
        photoUrl,
        photoAlt: data.photo_alt || active.title,
        dealStatus: data.deal_status as DealStatus,
        tirEstimada: data.tir_estimada,
        plazo: data.plazo,
        ticketMinimo: data.ticket_minimo,
        capitalObjetivo: data.capital_objetivo,
        capitalCaptado: data.capital_captado,
        isFeatured: data.is_featured,
        title: active.title,
        tipo: active.tipo,
        descripcion: active.descripcion,
        highlights: (active.highlights ?? "").split("\n").map((h) => h.trim()).filter(Boolean),
        detail: asDetail(active.detail) ?? asDetail(es?.detail),
      });
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, locale]);

  return { opportunity, loading, error };
}
