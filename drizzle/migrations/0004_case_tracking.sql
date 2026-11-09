ALTER TABLE public.disputes
  ADD COLUMN case_status text NOT NULL DEFAULT 'submitted',
  ADD COLUMN case_status_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN recovered_amount numeric;

CREATE OR REPLACE FUNCTION public.validate_case_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.case_status NOT IN ('submitted','email_sent','merchant_replied','escalated','refunded','rejected') THEN
    RAISE EXCEPTION 'invalid case_status';
  END IF;
  IF NEW.recovered_amount IS NOT NULL AND NEW.recovered_amount < 0 THEN
    RAISE EXCEPTION 'invalid recovered_amount';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.case_status IS DISTINCT FROM OLD.case_status THEN
    NEW.case_status_at := now();
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER disputes_validate_case_status
BEFORE INSERT OR UPDATE ON public.disputes
FOR EACH ROW EXECUTE FUNCTION public.validate_case_status();

CREATE TABLE public.dispute_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id uuid NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.dispute_events TO authenticated;
GRANT ALL ON public.dispute_events TO service_role;
ALTER TABLE public.dispute_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events select own" ON public.dispute_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Events insert own" ON public.dispute_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.disputes d WHERE d.id = dispute_id AND d.user_id = auth.uid()));
CREATE POLICY "Events delete own" ON public.dispute_events FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX dispute_events_dispute_idx ON public.dispute_events(dispute_id, created_at);