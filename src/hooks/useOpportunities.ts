import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/i18n/types";

export type DealStatus = "abierto" | "due-diligence" | "cerrado";

export interface PublicOpportunity {
  id: string;
  slug: string;
  location: string | null;
  photoUrl: string | null;
  photoAlt: string;
  dealStatus: DealStatus;
  tirEstimada: string | null;
  plazo: string | null;
  ticketMinimo: string | null;
  capitalObjetivo: string | null;
  capitalCaptado: number;
  isFeatured: boolean;
  title: string;
  tipo: string | null;
  descripcion: string | null;
  highlights: string[];
}

const OPPORTUNITY_PHOTOS_BUCKET = "opportunity-photos";

/**
 * Trae las oportunidades publicadas, con la traducción del idioma activo
 * (con fallback a es-AR si falta esa traducción puntual). Solo se piden
 * las columnas públicas: nada de created_by/updated_by/status/archived_at.
 */
export function useOpportunities(locale: Locale) {
  const [opportunities, setOpportunities] = useState<PublicOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
          opportunity_translations ( locale, title, tipo, descripcion, highlights )
        `,
        )
        .eq("status", "published")
        .is("archived_at", null)
        .order("display_order", { ascending: true });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const mapped: PublicOpportunity[] = (data ?? [])
        .map((row) => {
          const translations = row.opportunity_translations ?? [];
          const active = translations.find((t) => t.locale === locale) ?? translations.find((t) => t.locale === "es-AR");

          // Sin título o foto válida, no se publica (regla de negocio reforzada
          // acá por si un registro quedó incompleto).
          if (!active?.title || !row.photo_path) return null;

          const photoUrl = supabase.storage.from(OPPORTUNITY_PHOTOS_BUCKET).getPublicUrl(row.photo_path).data.publicUrl;

          return {
            id: row.id,
            slug: row.slug,
            location: row.location,
            photoUrl,
            photoAlt: row.photo_alt || active.title,
            dealStatus: row.deal_status as DealStatus,
            tirEstimada: row.tir_estimada,
            plazo: row.plazo,
            ticketMinimo: row.ticket_minimo,
            capitalObjetivo: row.capital_objetivo,
            capitalCaptado: row.capital_captado,
            isFeatured: row.is_featured,
            title: active.title,
            tipo: active.tipo,
            descripcion: active.descripcion,
            highlights: (active.highlights ?? "").split("\n").map((h) => h.trim()).filter(Boolean),
          } satisfies PublicOpportunity;
        })
        .filter((o): o is PublicOpportunity => o !== null);

      setOpportunities(mapped);
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return { opportunities, loading, error };
}
