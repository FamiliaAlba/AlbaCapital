import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/i18n/types";

export interface PublicTeamMember {
  id: string;
  slug: string;
  fullName: string;
  photoUrl: string | null;
  photoAlt: string;
  country: string | null;
  city: string | null;
  publicEmail: string | null;
  publicPhone: string | null;
  linkedinUrl: string | null;
  professionalUrl: string | null;
  isFeatured: boolean;
  roleTitle: string;
  specialty: string | null;
  department: string | null;
  shortBio: string | null;
  fullBio: string | null;
  locationLabel: string | null;
}

const TEAM_PHOTOS_BUCKET = "team-photos";

/**
 * Trae los integrantes publicados, con la traducción del idioma activo
 * (con fallback a es-AR si falta esa traducción puntual). Solo se piden
 * las columnas públicas: nada de created_by/updated_by/status/archived_at.
 */
export function useTeamMembers(locale: Locale) {
  const [members, setMembers] = useState<PublicTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("team_members")
        .select(
          `
          id, slug, full_name, photo_path, photo_alt, country, city,
          public_email, public_phone, linkedin_url, professional_url, is_featured,
          team_member_translations ( locale, role_title, specialty, department, short_bio, full_bio, location_label )
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

      const mapped: PublicTeamMember[] = (data ?? [])
        .map((row) => {
          const translations = row.team_member_translations ?? [];
          const active = translations.find((t) => t.locale === locale) ?? translations.find((t) => t.locale === "es-AR");

          // Sin nombre, cargo o foto válida, no se publica (regla de negocio
          // reforzada también acá por si un registro quedó incompleto).
          if (!row.full_name || !active?.role_title || !row.photo_path) return null;

          const photoUrl = supabase.storage.from(TEAM_PHOTOS_BUCKET).getPublicUrl(row.photo_path).data.publicUrl;

          return {
            id: row.id,
            slug: row.slug,
            fullName: row.full_name,
            photoUrl,
            photoAlt: row.photo_alt || row.full_name,
            country: row.country,
            city: row.city,
            publicEmail: row.public_email,
            publicPhone: row.public_phone,
            linkedinUrl: row.linkedin_url,
            professionalUrl: row.professional_url,
            isFeatured: row.is_featured,
            roleTitle: active.role_title,
            specialty: active.specialty,
            department: active.department,
            shortBio: active.short_bio,
            fullBio: active.full_bio,
            locationLabel: active.location_label,
          } satisfies PublicTeamMember;
        })
        .filter((m): m is PublicTeamMember => m !== null);

      setMembers(mapped);
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return { members, loading, error };
}
