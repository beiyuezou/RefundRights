-- Fix disputes UPDATE policy: add WITH CHECK to prevent ownership transfer
DROP POLICY IF EXISTS "Disputes update own" ON public.disputes;
CREATE POLICY "Disputes update own"
ON public.disputes
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add UPDATE policy on storage.objects for the 'evidence' bucket scoped to owning user
CREATE POLICY "Evidence update own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'evidence'
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'evidence'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);