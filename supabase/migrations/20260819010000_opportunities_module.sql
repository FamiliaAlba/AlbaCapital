-- =========================================================================
-- Módulo "Oportunidades": tabla principal de activos/proyectos de inversión
-- =========================================================================

CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  location TEXT,
  photo_path TEXT,
  photo_alt TEXT,
  deal_status TEXT NOT NULL DEFAULT 'abierto',
  tir_estimada TEXT,
  plazo TEXT,
  ticket_minimo TEXT,
  capital_objetivo TEXT,
  capital_captado INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  archived_at TIMESTAMPTZ,
  CONSTRAINT opportunities_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT opportunities_slug_length CHECK (char_length(slug) BETWEEN 2 AND 120),
  CONSTRAINT opportunities_location_length CHECK (location IS NULL OR char_length(location) <= 150),
  CONSTRAINT opportunities_status_valid CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT opportunities_deal_status_valid CHECK (deal_status IN ('abierto', 'due-diligence', 'cerrado')),
  CONSTRAINT opportunities_capital_captado_range CHECK (capital_captado BETWEEN 0 AND 100),
  CONSTRAINT opportunities_photo_alt_length CHECK (photo_alt IS NULL OR char_length(photo_alt) <= 250),
  CONSTRAINT opportunities_tir_length CHECK (tir_estimada IS NULL OR char_length(tir_estimada) <= 50),
  CONSTRAINT opportunities_plazo_length CHECK (plazo IS NULL OR char_length(plazo) <= 50),
  CONSTRAINT opportunities_ticket_length CHECK (ticket_minimo IS NULL OR char_length(ticket_minimo) <= 50),
  CONSTRAINT opportunities_objetivo_length CHECK (capital_objetivo IS NULL OR char_length(capital_objetivo) <= 50)
);

CREATE INDEX idx_opportunities_status_order ON public.opportunities(status, display_order);
CREATE INDEX idx_opportunities_slug ON public.opportunities(slug);

-- =========================================================================
-- Traducciones por oportunidad
-- =========================================================================

CREATE TABLE public.opportunity_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  tipo TEXT,
  descripcion TEXT,
  highlights TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT opportunity_translations_locale_valid CHECK (locale IN ('es-AR', 'en-US', 'pt-BR')),
  CONSTRAINT opportunity_translations_unique UNIQUE (opportunity_id, locale),
  CONSTRAINT opportunity_translations_title_length CHECK (char_length(title) <= 150),
  CONSTRAINT opportunity_translations_tipo_length CHECK (tipo IS NULL OR char_length(tipo) <= 150),
  CONSTRAINT opportunity_translations_descripcion_length CHECK (descripcion IS NULL OR char_length(descripcion) <= 2000),
  CONSTRAINT opportunity_translations_highlights_length CHECK (highlights IS NULL OR char_length(highlights) <= 1000)
);

CREATE INDEX idx_opportunity_translations_opp ON public.opportunity_translations(opportunity_id);

-- =========================================================================
-- Triggers: reutilizan las funciones set_updated_at/set_updated_by/set_created_by
-- creadas por la migración del módulo de equipo (20260808220000).
-- =========================================================================

CREATE TRIGGER trg_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_opportunity_translations_updated_at
  BEFORE UPDATE ON public.opportunity_translations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_opportunities_updated_by
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_by();

CREATE TRIGGER trg_opportunities_created_by
  BEFORE INSERT ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.set_created_by();

-- =========================================================================
-- Row Level Security
-- =========================================================================

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_translations ENABLE ROW LEVEL SECURITY;

-- Público: solo lectura de oportunidades publicadas
CREATE POLICY "Public can read published opportunities"
  ON public.opportunities
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published' AND archived_at IS NULL);

-- Público: solo lectura de traducciones de oportunidades publicadas
CREATE POLICY "Public can read translations of published opportunities"
  ON public.opportunity_translations
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_id AND o.status = 'published' AND o.archived_at IS NULL
    )
  );

-- Superadmin: acceso total
CREATE POLICY "Superadmin full access on opportunities"
  ON public.opportunities
  FOR ALL
  TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

CREATE POLICY "Superadmin full access on opportunity translations"
  ON public.opportunity_translations
  FOR ALL
  TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());
