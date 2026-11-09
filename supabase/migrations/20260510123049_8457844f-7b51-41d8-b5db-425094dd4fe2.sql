-- Rate limit events (server-only inserts via service role)
CREATE TABLE public.rate_limit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_rate_limit_user_action_time ON public.rate_limit_events (user_id, action, created_at DESC);
ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rl select own" ON public.rate_limit_events FOR SELECT USING (auth.uid() = user_id);
-- No insert/update/delete policies → only service role can write.

-- Audit logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  ip text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_user_time ON public.audit_logs (user_id, created_at DESC);
CREATE INDEX idx_audit_action_time ON public.audit_logs (action, created_at DESC);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit select own" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);
-- No write policies → only service role can write.