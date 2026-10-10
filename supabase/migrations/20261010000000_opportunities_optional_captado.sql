-- El % de capital captado solo aplica a rondas de inversión abiertas.
-- Para ventas de campos o activos puede quedar vacío (NULL) y no se muestra la barra.
ALTER TABLE public.opportunities ALTER COLUMN capital_captado DROP NOT NULL;
ALTER TABLE public.opportunities ALTER COLUMN capital_captado DROP DEFAULT;
