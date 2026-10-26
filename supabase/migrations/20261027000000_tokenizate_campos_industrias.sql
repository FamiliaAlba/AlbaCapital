-- Campos e industrias: tercera modalidad de postulación (grandes activos de renta). Cambios aditivos.
ALTER TABLE public.tk_applications ADD COLUMN IF NOT EXISTS grande JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.tk_applications DROP CONSTRAINT tk_app_modality;
ALTER TABLE public.tk_applications ADD CONSTRAINT tk_app_modality CHECK (modality IN ('activo', 'produccion_pyme', 'campos_industrias'));
