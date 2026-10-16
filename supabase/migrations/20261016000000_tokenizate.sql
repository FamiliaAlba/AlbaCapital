-- =========================================================================
-- Sección "Tokenizate": interesados en inversiones y postulaciones de activos.
-- Todas las tablas tienen RLS activado SIN políticas para anon/authenticated:
-- solo accede la Edge Function `tokenizate` (service role), que autoriza cada
-- operación (clave de acceso del expediente o rol superadmin).
-- Los documentos viven en un bucket PRIVADO; se entregan con URL firmada corta.
-- =========================================================================

CREATE SEQUENCE public.tk_expediente_seq START 1001;

CREATE TABLE public.tk_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  max_files INTEGER NOT NULL DEFAULT 25 CHECK (max_files BETWEEN 1 AND 100),
  max_file_mb INTEGER NOT NULL DEFAULT 15 CHECK (max_file_mb BETWEEN 1 AND 50),
  retention_months INTEGER NOT NULL DEFAULT 24 CHECK (retention_months BETWEEN 1 AND 120),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.tk_settings (id) VALUES (true) ON CONFLICT DO NOTHING;

CREATE TABLE public.tk_interested (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  capital_range TEXT,
  privacy_version TEXT NOT NULL,
  privacy_accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'nuevo',
  assigned_to UUID REFERENCES auth.users(id),
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tk_interested_status CHECK (status IN ('nuevo','contactado','cerrado')),
  CONSTRAINT tk_interested_email CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(email) <= 255),
  CONSTRAINT tk_interested_lens CHECK (char_length(name) BETWEEN 2 AND 120 AND char_length(country) <= 80 AND char_length(asset_type) <= 80
    AND (phone IS NULL OR char_length(phone) <= 40) AND (capital_range IS NULL OR char_length(capital_range) <= 60))
);
CREATE INDEX idx_tk_interested_created ON public.tk_interested(created_at DESC);

CREATE TABLE public.tk_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expediente TEXT NOT NULL UNIQUE DEFAULT ('TK-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.tk_expediente_seq')::text, 6, '0')),
  access_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'borrador',
  stage INTEGER NOT NULL DEFAULT 1,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT,
  owner_country TEXT,
  owner_province TEXT,
  owner_relation TEXT,
  owner_tax_id TEXT,
  project_name TEXT,
  category TEXT,
  location TEXT,
  summary TEXT,
  project_state TEXT,
  value_amount NUMERIC,
  value_currency TEXT,
  funding_amount NUMERIC,
  funding_currency TEXT,
  funds_use TEXT,
  generates_income TEXT,
  has_liens TEXT,
  liens_detail TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  declarations JSONB NOT NULL DEFAULT '{}'::jsonb,
  terms_version TEXT,
  privacy_version TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  email_status TEXT NOT NULL DEFAULT 'not_configured',
  submitted_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  retention_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tk_app_status CHECK (status IN ('borrador','recibido','revision_preliminar','documentacion_pendiente','analisis_tecnico_financiero','analisis_juridico','viable_con_condiciones','no_elegible','cerrado')),
  CONSTRAINT tk_app_email_status CHECK (email_status IN ('not_configured','pending','sent','failed')),
  CONSTRAINT tk_app_email CHECK (owner_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(owner_email) <= 255),
  CONSTRAINT tk_app_lens CHECK (char_length(owner_name) BETWEEN 2 AND 160 AND (summary IS NULL OR char_length(summary) <= 3000)
    AND (funds_use IS NULL OR char_length(funds_use) <= 2000) AND (liens_detail IS NULL OR char_length(liens_detail) <= 2000))
);
CREATE INDEX idx_tk_app_status ON public.tk_applications(status, updated_at DESC);
CREATE INDEX idx_tk_app_email ON public.tk_applications(lower(owner_email));

CREATE TABLE public.tk_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.tk_applications(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  original_name TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  mime TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stage TEXT NOT NULL DEFAULT 'inicial',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT tk_doc_status CHECK (status IN ('pending','verified','rejected','deleted')),
  CONSTRAINT tk_doc_mime CHECK (mime IN ('application/pdf','image/jpeg','image/png'))
);
CREATE INDEX idx_tk_documents_app ON public.tk_documents(application_id);

CREATE TABLE public.tk_doc_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.tk_applications(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 3 AND 2000),
  requested_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fulfilled_at TIMESTAMPTZ
);

CREATE TABLE public.tk_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.tk_applications(id) ON DELETE CASCADE,
  interested_id UUID REFERENCES public.tk_interested(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'note',
  channel TEXT,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  author UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tk_notes_kind CHECK (kind IN ('note','communication')),
  CONSTRAINT tk_notes_target CHECK ((application_id IS NOT NULL) <> (interested_id IS NOT NULL))
);

CREATE TABLE public.tk_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  application_id UUID REFERENCES public.tk_applications(id) ON DELETE CASCADE,
  interested_id UUID REFERENCES public.tk_interested(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL,
  actor_id UUID,
  action TEXT NOT NULL,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tk_events_actor CHECK (actor_type IN ('owner','staff','system'))
);
CREATE INDEX idx_tk_events_app ON public.tk_events(application_id, created_at DESC);

CREATE TABLE public.tk_evaluations (
  application_id UUID PRIMARY KEY REFERENCES public.tk_applications(id) ON DELETE CASCADE,
  fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  fees JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.tk_rate_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rate_key TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tk_rate ON public.tk_rate_events(rate_key, action, created_at DESC);

CREATE TRIGGER trg_tk_interested_updated BEFORE UPDATE ON public.tk_interested FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_tk_app_updated BEFORE UPDATE ON public.tk_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tk_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tk_interested ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tk_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tk_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tk_doc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tk_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tk_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tk_rate_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tk_settings, public.tk_interested, public.tk_applications, public.tk_documents,
  public.tk_doc_requests, public.tk_notes, public.tk_events, public.tk_evaluations, public.tk_rate_events FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.tk_expediente_seq FROM anon, authenticated;

-- Bucket PRIVADO: sin políticas de storage para anon/authenticated (solo service role).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('tokenizate-docs', 'tokenizate-docs', false, 15728640, ARRAY['application/pdf','image/jpeg','image/png'])
ON CONFLICT (id) DO NOTHING;
