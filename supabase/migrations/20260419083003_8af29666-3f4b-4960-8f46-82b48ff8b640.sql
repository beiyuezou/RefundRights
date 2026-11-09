
-- Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles select own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Disputes
CREATE TABLE public.disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('hotel','flight','insurance')),
  country TEXT NOT NULL,
  city TEXT,
  incident_date DATE,
  story TEXT NOT NULL,
  amount NUMERIC,
  currency TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','analyzing','analyzed','failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Disputes select own" ON public.disputes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Disputes insert own" ON public.disputes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Disputes update own" ON public.disputes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Disputes delete own" ON public.disputes FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_disputes_user ON public.disputes(user_id, created_at DESC);

-- Evidence
CREATE TABLE public.dispute_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dispute_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Evidence select own" ON public.dispute_evidence FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Evidence insert own" ON public.dispute_evidence FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Evidence delete own" ON public.dispute_evidence FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_evidence_dispute ON public.dispute_evidence(dispute_id);

-- Analyses
CREATE TABLE public.dispute_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('strong','moderate','weak')),
  confidence INT NOT NULL CHECK (confidence BETWEEN 0 AND 100),
  recommendation TEXT NOT NULL,
  leverage_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  draft_email TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dispute_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Analyses select own" ON public.dispute_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Analyses insert own" ON public.dispute_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Analyses delete own" ON public.dispute_analyses FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_analyses_dispute ON public.dispute_analyses(dispute_id, created_at DESC);

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage: private evidence bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', false);

CREATE POLICY "Evidence files select own"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Evidence files insert own"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Evidence files delete own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]);
