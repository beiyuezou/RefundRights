CREATE TABLE public.expert_help_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  dispute_id uuid REFERENCES public.disputes(id) ON DELETE SET NULL,
  contact_email text NOT NULL,
  preferred_date date,
  preferred_slot text,
  timezone text,
  case_summary text,
  notes text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX expert_help_requests_created_idx ON public.expert_help_requests (created_at DESC);
CREATE INDEX expert_help_requests_email_idx ON public.expert_help_requests (contact_email, created_at);
GRANT SELECT ON public.expert_help_requests TO authenticated;
GRANT ALL ON public.expert_help_requests TO service_role;
ALTER TABLE public.expert_help_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Help requests select own" ON public.expert_help_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);