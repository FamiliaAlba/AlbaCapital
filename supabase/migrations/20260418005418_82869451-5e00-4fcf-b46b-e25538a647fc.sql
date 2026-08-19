-- Create leads table for investor inquiries
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  oportunidad_id TEXT,
  monto_interes TEXT,
  mensaje TEXT,
  source TEXT DEFAULT 'web',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone (anon) can submit a lead
CREATE POLICY "Anyone can submit a lead"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No public read; only service role (admin) can read leads
-- (no SELECT policy = nobody can read via anon/authenticated)

CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);