-- =========================================================================
-- Storage: bucket "team-photos"
-- =========================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'team-photos',
  'team-photos',
  true, -- lectura pública de objetos (necesaria para mostrar fotos en el sitio)
  5242880, -- 5 MB, límite duro a nivel bucket (además del control en el cliente)
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública: cualquiera puede ver los objetos del bucket (son fotos
-- de perfil ya optimizadas; el control de "solo integrantes publicados"
-- se hace filtrando photo_path en la consulta a team_members, no en Storage,
-- porque Storage no tiene forma nativa de unir contra esa tabla en la policy
-- de forma performante). Los nombres de archivo no son adivinables
-- (UUID + slug), así que no quedan expuestos por enumeración.
CREATE POLICY "Public can view team photos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'team-photos');

-- Solo superadmin puede subir
CREATE POLICY "Superadmin can upload team photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'team-photos' AND public.is_superadmin());

-- Solo superadmin puede reemplazar
CREATE POLICY "Superadmin can update team photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'team-photos' AND public.is_superadmin())
  WITH CHECK (bucket_id = 'team-photos' AND public.is_superadmin());

-- Solo superadmin puede eliminar
CREATE POLICY "Superadmin can delete team photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'team-photos' AND public.is_superadmin());
