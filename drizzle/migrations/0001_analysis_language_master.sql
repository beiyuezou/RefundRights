ALTER TABLE public.dispute_analyses ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en';
ALTER TABLE public.dispute_analyses ADD COLUMN IF NOT EXISTS parent_analysis_id uuid REFERENCES public.dispute_analyses(id) ON DELETE CASCADE;
UPDATE public.dispute_analyses SET language = 'zh' WHERE recommendation ~ '[一-龥]';
ALTER TABLE public.dispute_analyses ADD CONSTRAINT dispute_analyses_language_check CHECK (language IN ('en','zh'));
CREATE INDEX IF NOT EXISTS dispute_analyses_parent_idx ON public.dispute_analyses(parent_analysis_id);