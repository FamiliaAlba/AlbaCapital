-- Desarrollos fraccionados: cuarta modalidad de postulación (desarrollos inmobiliarios y hoteleros). Aditivo.
ALTER TABLE public.tk_applications ADD COLUMN IF NOT EXISTS desarrollo JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.tk_applications DROP CONSTRAINT tk_app_modality;
ALTER TABLE public.tk_applications ADD CONSTRAINT tk_app_modality CHECK (modality IN ('activo', 'produccion_pyme', 'campos_industrias', 'desarrollos_fraccionados'));
