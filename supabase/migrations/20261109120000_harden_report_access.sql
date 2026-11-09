-- Keep report content readable only through getAnalysisReport, which checks payment.
REVOKE SELECT ON TABLE public.dispute_analyses FROM PUBLIC, anon, authenticated;

DO $$
DECLARE
  column_name text;
BEGIN
  FOR column_name IN
    SELECT attname
    FROM pg_attribute
    WHERE attrelid = 'public.dispute_analyses'::regclass
      AND attnum > 0
      AND NOT attisdropped
  LOOP
    EXECUTE format(
      'REVOKE SELECT (%I) ON TABLE public.dispute_analyses FROM PUBLIC, anon, authenticated',
      column_name
    );
  END LOOP;
END;
$$;

-- The dashboard only needs these non-report fields; report data stays server-only.
GRANT SELECT (id, dispute_id, risk_level, confidence, created_at)
  ON TABLE public.dispute_analyses TO authenticated;
GRANT SELECT ON TABLE public.dispute_analyses TO service_role;

-- Payment state can only be changed by trusted server roles (webhook / unlock functions).
CREATE OR REPLACE FUNCTION public.protect_dispute_paid()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('service_role', 'postgres') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.paid := false;
      NEW.paid_at := NULL;
    ELSIF NEW.paid IS DISTINCT FROM OLD.paid
      OR NEW.paid_at IS DISTINCT FROM OLD.paid_at THEN
      RAISE EXCEPTION 'paid status can only be changed by the server'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_dispute_paid_trg ON public.disputes;
CREATE TRIGGER protect_dispute_paid_trg
BEFORE INSERT OR UPDATE ON public.disputes
FOR EACH ROW EXECUTE FUNCTION public.protect_dispute_paid();
