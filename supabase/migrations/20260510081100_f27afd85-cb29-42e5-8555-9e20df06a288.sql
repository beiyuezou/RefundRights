CREATE POLICY "Analyses update own"
ON public.dispute_analyses
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);