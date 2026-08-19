-- =========================================================================
-- Módulo "Nuestro equipo": tabla principal de integrantes
-- =========================================================================

CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  photo_path TEXT,
  photo_alt TEXT,
  country TEXT,
  city TEXT,
  public_email TEXT,
  public_phone TEXT,
  linkedin_url TEXT,
  professional_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  archived_at TIMESTAMPTZ,
  CONSTRAINT team_members_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT team_members_slug_length CHECK (char_length(slug) BETWEEN 2 AND 120),
  CONSTRAINT team_members_full_name_length CHECK (char_length(full_name) BETWEEN 2 AND 150),
  CONSTRAINT team_members_status_valid CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT team_members_email_format CHECK (
    public_email IS NULL OR public_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  CONSTRAINT team_members_linkedin_format CHECK (
    linkedin_url IS NULL OR linkedin_url ~* '^https://([a-z]{2,3}\.)?linkedin\.com/.+'
  ),
  CONSTRAINT team_members_professional_url_format CHECK (
    professional_url IS NULL OR professional_url ~* '^https://.+'
  ),
  CONSTRAINT team_members_photo_alt_length CHECK (photo_alt IS NULL OR char_length(photo_alt) <= 250)
);

CREATE INDEX idx_team_members_status_order ON public.team_members(status, display_order);
CREATE INDEX idx_team_members_slug ON public.team_members(slug);

-- =========================================================================
-- Traducciones por integrante
-- =========================================================================

CREATE TABLE public.team_member_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  role_title TEXT NOT NULL DEFAULT '',
  specialty TEXT,
  department TEXT,
  short_bio TEXT,
  full_bio TEXT,
  location_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT team_member_translations_locale_valid CHECK (locale IN ('es-AR', 'en-US', 'pt-BR')),
  CONSTRAINT team_member_translations_unique UNIQUE (team_member_id, locale),
  CONSTRAINT team_member_translations_role_length CHECK (char_length(role_title) <= 150),
  CONSTRAINT team_member_translations_short_bio_length CHECK (short_bio IS NULL OR char_length(short_bio) <= 300),
  CONSTRAINT team_member_translations_full_bio_length CHECK (full_bio IS NULL OR char_length(full_bio) <= 4000)
);

CREATE INDEX idx_team_member_translations_member ON public.team_member_translations(team_member_id);

-- =========================================================================
-- Roles administrativos: tabla separada de auth.users, nunca en localStorage
-- =========================================================================

CREATE TABLE public.admin_users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'superadmin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT admin_users_role_valid CHECK (role IN ('superadmin'))
);

-- Función de seguridad: evalúa si el usuario autenticado actual es superadmin.
-- SECURITY DEFINER + search_path fijo para evitar hijacking de la función.
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND role = 'superadmin'
  );
$$;

-- =========================================================================
-- Triggers: updated_at y updated_by automáticos
-- =========================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_team_member_translations_updated_at
  BEFORE UPDATE ON public.team_member_translations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.set_updated_by()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_team_members_updated_by
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_by();

CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.created_by = auth.uid();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_team_members_created_by
  BEFORE INSERT ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.set_created_by();

-- =========================================================================
-- Row Level Security
-- =========================================================================

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_member_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Público: solo lectura de integrantes publicados
CREATE POLICY "Public can read published team members"
  ON public.team_members
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published' AND archived_at IS NULL);

-- Público: solo lectura de traducciones de integrantes publicados
CREATE POLICY "Public can read translations of published members"
  ON public.team_member_translations
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members m
      WHERE m.id = team_member_id AND m.status = 'published' AND m.archived_at IS NULL
    )
  );

-- Superadmin: acceso total sobre team_members
CREATE POLICY "Superadmin full access on team_members"
  ON public.team_members
  FOR ALL
  TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

-- Superadmin: acceso total sobre traducciones
CREATE POLICY "Superadmin full access on translations"
  ON public.team_member_translations
  FOR ALL
  TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

-- admin_users: nadie puede leer/escribir directamente vía API pública,
-- ni siquiera el propio superadmin (se gestiona por migración/backoffice).
-- No se crean policies de INSERT/UPDATE/DELETE a propósito: sin policy,
-- con RLS habilitada, el acceso queda denegado por defecto para anon/authenticated.
CREATE POLICY "Superadmin can read own admin record"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());
