-- ota_rules_cache is only accessed via service_role (edge functions); RLS denies all by default.
-- Add explicit no-access policies for anon/authenticated to satisfy linter and document intent.
CREATE POLICY "ota_rules_cache no public access"
ON public.ota_rules_cache
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);