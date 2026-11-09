CREATE TABLE public.ota_rules_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ota_name text NOT NULL,
  source_url text NOT NULL,
  raw_content text NOT NULL,
  content_hash text NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ota_rules_cache_ota_url_uniq
  ON public.ota_rules_cache (ota_name, source_url);

CREATE INDEX ota_rules_cache_ota_fetched_idx
  ON public.ota_rules_cache (ota_name, fetched_at DESC);

-- Server-only table: only the edge function (service_role) reads/writes.
-- No grants to anon or authenticated.
GRANT ALL ON public.ota_rules_cache TO service_role;

ALTER TABLE public.ota_rules_cache ENABLE ROW LEVEL SECURITY;

-- No policies: with RLS on and no grants to anon/authenticated,
-- the table is invisible to client roles. service_role bypasses RLS.