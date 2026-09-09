CREATE POLICY "admins manage payment assets" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'payment-assets' AND public.is_admin())
  WITH CHECK (bucket_id = 'payment-assets' AND public.is_admin());