-- =========================================================================
-- Módulo "Marketing → Redes sociales" (aditivo; se puede desactivar con
-- social_settings.enabled = false sin tocar las oportunidades).
-- Todas las tablas tienen RLS activado SIN políticas para anon/authenticated:
-- solo se accede desde las funciones de servidor (/api/*) con la service role,
-- que verifican la sesión y el rol de superadmin. Los tokens nunca llegan al
-- navegador y se guardan cifrados (AES-256-GCM, clave fuera de la base).
-- =========================================================================

CREATE TABLE public.social_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  enabled BOOLEAN NOT NULL DEFAULT true,
  default_cta TEXT NOT NULL DEFAULT 'Conocé el proyecto y registrá tu interés en Alba Capital',
  design JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  CONSTRAINT social_settings_cta_length CHECK (char_length(default_cta) <= 200)
);
INSERT INTO public.social_settings (id) VALUES (true) ON CONFLICT DO NOTHING;

CREATE TABLE public.social_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  network TEXT NOT NULL,
  external_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  target_kind TEXT NOT NULL,
  parent_external_id TEXT,
  status TEXT NOT NULL DEFAULT 'connected',
  status_detail TEXT,
  selected BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  publish_enabled BOOLEAN NOT NULL DEFAULT false,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  token_enc TEXT,
  token_expires_at TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  connected_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT social_accounts_network_valid CHECK (network IN ('instagram','facebook','linkedin','telegram')),
  CONSTRAINT social_accounts_kind_valid CHECK (target_kind IN ('page','ig_business','member','organization','channel')),
  CONSTRAINT social_accounts_status_valid CHECK (status IN ('connected','needs_reconnect','insufficient_permissions','pending_approval')),
  CONSTRAINT social_accounts_unique UNIQUE (network, external_id)
);

CREATE TABLE public.social_oauth_states (
  state_hash TEXT PRIMARY KEY,
  nonce_hash TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT social_oauth_provider_valid CHECK (provider IN ('meta','linkedin'))
);

CREATE TABLE public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  pieces JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_version INTEGER NOT NULL DEFAULT 1,
  opportunity_hash TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT social_posts_status_valid CHECK (status IN ('draft','generated'))
);
CREATE INDEX idx_social_posts_opp ON public.social_posts(opportunity_id, updated_at DESC);

CREATE TABLE public.social_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  content_version INTEGER NOT NULL,
  account_id UUID NOT NULL REFERENCES public.social_accounts(id) ON DELETE RESTRICT,
  network TEXT NOT NULL,
  format TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key TEXT NOT NULL UNIQUE,
  attempts INTEGER NOT NULL DEFAULT 0,
  external_id TEXT,
  external_url TEXT,
  error TEXT,
  provider_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  confirmed_by UUID REFERENCES auth.users(id),
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_until TIMESTAMPTZ,
  next_attempt_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT social_deliveries_status_valid CHECK (status IN ('queued','processing','published','failed','needs_review')),
  CONSTRAINT social_deliveries_once UNIQUE (post_id, content_version, account_id)
);
CREATE INDEX idx_social_deliveries_opp ON public.social_deliveries(opportunity_id, created_at DESC);
CREATE INDEX idx_social_deliveries_status ON public.social_deliveries(status, locked_until);

CREATE TABLE public.social_rate_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_social_rate_events ON public.social_rate_events(user_id, action, created_at DESC);

CREATE TRIGGER trg_social_posts_updated_at BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_social_deliveries_updated_at BEFORE UPDATE ON public.social_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.social_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_rate_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.social_settings, public.social_accounts, public.social_oauth_states,
  public.social_posts, public.social_deliveries, public.social_rate_events FROM anon, authenticated;

-- Imágenes generadas: lectura pública (los proveedores deben poder descargarlas
-- por URL), escritura solo desde el servidor (sin políticas de INSERT).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('social-pieces', 'social-pieces', true, 4194304, ARRAY['image/jpeg'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read social pieces" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'social-pieces');

-- Atribución de origen en leads (aditivo)
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_utm_source_length CHECK (utm_source IS NULL OR char_length(utm_source) <= 50),
  ADD CONSTRAINT leads_utm_medium_length CHECK (utm_medium IS NULL OR char_length(utm_medium) <= 50),
  ADD CONSTRAINT leads_utm_campaign_length CHECK (utm_campaign IS NULL OR char_length(utm_campaign) <= 120);
