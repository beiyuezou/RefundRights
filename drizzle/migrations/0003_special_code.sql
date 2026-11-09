CREATE TABLE public.special_code_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  active boolean NOT NULL DEFAULT false,
  max_uses integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.special_code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dispute_id uuid NOT NULL UNIQUE REFERENCES public.disputes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.special_code_settings TO service_role;
GRANT ALL ON public.special_code_redemptions TO service_role;
ALTER TABLE public.special_code_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_code_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no public access" ON public.special_code_settings FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "no public access" ON public.special_code_redemptions FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
INSERT INTO public.special_code_settings (id) VALUES (1);

-- Atomic redeem: returns 'ok' | 'already' | 'inactive' | 'expired' | 'exhausted'
CREATE OR REPLACE FUNCTION public.redeem_special_code(_user_id uuid, _dispute_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.special_code_settings; used integer;
BEGIN
  IF EXISTS (SELECT 1 FROM special_code_redemptions WHERE dispute_id = _dispute_id) THEN
    RETURN 'already';
  END IF;
  SELECT * INTO s FROM special_code_settings WHERE id = 1 FOR UPDATE;
  IF s IS NULL OR NOT s.active THEN RETURN 'inactive'; END IF;
  IF s.expires_at IS NOT NULL AND s.expires_at < now() THEN RETURN 'expired'; END IF;
  SELECT count(*) INTO used FROM special_code_redemptions;
  IF used >= s.max_uses THEN RETURN 'exhausted'; END IF;
  INSERT INTO special_code_redemptions (user_id, dispute_id) VALUES (_user_id, _dispute_id);
  RETURN 'ok';
END $$;
REVOKE ALL ON FUNCTION public.redeem_special_code(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_special_code(uuid, uuid) TO service_role;