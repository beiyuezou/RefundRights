-- Only the server (service_role) may change payment status on a dispute.
CREATE OR REPLACE FUNCTION public.protect_dispute_paid()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user <> 'service_role' AND current_user <> 'postgres' THEN
    IF TG_OP = 'INSERT' THEN
      NEW.paid := false;
      NEW.paid_at := NULL;
    ELSIF NEW.paid IS DISTINCT FROM OLD.paid OR NEW.paid_at IS DISTINCT FROM OLD.paid_at THEN
      RAISE EXCEPTION 'paid status can only be changed by the server';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS protect_dispute_paid_trg ON public.disputes;
CREATE TRIGGER protect_dispute_paid_trg
BEFORE INSERT OR UPDATE ON public.disputes
FOR EACH ROW EXECUTE FUNCTION public.protect_dispute_paid();

-- Paid report content is no longer readable directly from the browser;
-- it is served by a server function that checks payment first.
REVOKE SELECT ON public.dispute_analyses FROM anon, authenticated;
GRANT SELECT (id, dispute_id, user_id, risk_level, confidence, created_at, language, parent_analysis_id, model)
  ON public.dispute_analyses TO authenticated;

-- One completed payment per dispute.
CREATE UNIQUE INDEX IF NOT EXISTS payments_one_completed_per_dispute
  ON public.payments(dispute_id) WHERE status = 'completed';