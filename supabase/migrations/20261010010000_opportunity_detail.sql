-- Contenido de la página de detalle de cada oportunidad (secciones con datos,
-- tablas, listas y notas). Por idioma; si falta, el sitio usa el de es-AR.
-- Forma: { "sections": [ { "title", "text?", "rows?": [[etiqueta, valor]], "table?": {"headers", "rows"}, "items?": [], "note?" } ], "source?": "" }
ALTER TABLE public.opportunity_translations ADD COLUMN IF NOT EXISTS detail jsonb;
ALTER TABLE public.opportunity_translations ADD CONSTRAINT opportunity_translations_detail_shape
  CHECK (detail IS NULL OR (jsonb_typeof(detail) = 'object' AND jsonb_typeof(detail->'sections') = 'array'));
