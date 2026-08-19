-- Tighten the public insert policy with field validation constraints
ALTER TABLE public.leads
  ADD CONSTRAINT leads_nombre_length CHECK (char_length(nombre) BETWEEN 2 AND 100),
  ADD CONSTRAINT leads_email_length CHECK (char_length(email) BETWEEN 5 AND 255),
  ADD CONSTRAINT leads_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  ADD CONSTRAINT leads_telefono_length CHECK (telefono IS NULL OR char_length(telefono) <= 30),
  ADD CONSTRAINT leads_mensaje_length CHECK (mensaje IS NULL OR char_length(mensaje) <= 2000),
  ADD CONSTRAINT leads_monto_length CHECK (monto_interes IS NULL OR char_length(monto_interes) <= 50),
  ADD CONSTRAINT leads_oportunidad_length CHECK (oportunidad_id IS NULL OR char_length(oportunidad_id) <= 100),
  ADD CONSTRAINT leads_source_length CHECK (source IS NULL OR char_length(source) <= 50);

-- Replace the policy with one that adds a redundant runtime check (defense in depth)
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(nombre) BETWEEN 2 AND 100
    AND char_length(email) BETWEEN 5 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );