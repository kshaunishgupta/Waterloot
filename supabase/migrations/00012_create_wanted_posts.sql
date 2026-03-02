-- ============================================
-- Migration 00012: Create wanted_posts table
-- ============================================

CREATE TABLE public.wanted_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  budget_min  NUMERIC(10,2),
  budget_max  NUMERIC(10,2),
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wanted_posts_user ON public.wanted_posts(user_id);
CREATE INDEX idx_wanted_posts_status ON public.wanted_posts(status);
CREATE INDEX idx_wanted_posts_created_at ON public.wanted_posts(created_at DESC);
CREATE INDEX idx_wanted_posts_category ON public.wanted_posts(category_id);

CREATE TRIGGER wanted_posts_updated_at
  BEFORE UPDATE ON public.wanted_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.wanted_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active wanted posts are publicly viewable"
ON public.wanted_posts FOR SELECT
TO anon, authenticated
USING (status = 'active' OR user_id = (SELECT auth.uid()));

CREATE POLICY "Authenticated users can create wanted posts"
ON public.wanted_posts FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own wanted posts"
ON public.wanted_posts FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own wanted posts"
ON public.wanted_posts FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);
