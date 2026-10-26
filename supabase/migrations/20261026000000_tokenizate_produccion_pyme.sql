-- Producción PyME: extiende los expedientes de Tokenizate (cambios aditivos y compatibles).
-- Los expedientes existentes quedan con modality = 'activo' y se comportan igual que antes.

ALTER TABLE public.tk_applications
  ADD COLUMN IF NOT EXISTS modality TEXT NOT NULL DEFAULT 'activo',
  ADD COLUMN IF NOT EXISTS pyme JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS next_action TEXT,
  ADD COLUMN IF NOT EXISTS next_action_at DATE;

ALTER TABLE public.tk_applications
  ADD CONSTRAINT tk_app_modality CHECK (modality IN ('activo', 'produccion_pyme')),
  ADD CONSTRAINT tk_app_next_action_len CHECK (next_action IS NULL OR char_length(next_action) <= 500);

-- Único estado nuevo necesario: "propuesta de estructuración". "No viable" y "Archivada" reutilizan
-- no_elegible y cerrado (se rotulan distinto en la interfaz de Producción PyME).
ALTER TABLE public.tk_applications DROP CONSTRAINT tk_app_status;
ALTER TABLE public.tk_applications ADD CONSTRAINT tk_app_status CHECK (status IN (
  'borrador','recibido','revision_preliminar','documentacion_pendiente','analisis_tecnico_financiero',
  'analisis_juridico','viable_con_condiciones','propuesta_estructuracion','no_elegible','cerrado'));

CREATE INDEX IF NOT EXISTS idx_tk_app_modality ON public.tk_applications(modality, status);
