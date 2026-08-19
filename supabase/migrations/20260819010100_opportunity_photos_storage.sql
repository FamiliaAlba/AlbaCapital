-- =========================================================================
-- Storage: bucket "opportunity-photos"
-- =========================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'opportunity-photos',
  'opportunity-photos',
  true, -- lectura pública (necesaria para mostrar las fotos en el sitio)
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view opportunity photos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'opportunity-photos');

CREATE POLICY "Superadmin can upload opportunity photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'opportunity-photos' AND public.is_superadmin());

CREATE POLICY "Superadmin can update opportunity photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'opportunity-photos' AND public.is_superadmin())
  WITH CHECK (bucket_id = 'opportunity-photos' AND public.is_superadmin());

CREATE POLICY "Superadmin can delete opportunity photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'opportunity-photos' AND public.is_superadmin());
