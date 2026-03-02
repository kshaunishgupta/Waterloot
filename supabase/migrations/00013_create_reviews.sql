-- ============================================
-- Migration 00013: Create reviews table
-- ============================================

CREATE TABLE public.reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id  UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, listing_id)
);

CREATE INDEX idx_reviews_seller ON public.reviews(seller_id);
CREATE INDEX idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_listing ON public.reviews(listing_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

-- RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly viewable"
ON public.reviews FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = reviewer_id
  AND (SELECT auth.uid()) != seller_id
);

CREATE POLICY "Users can update own reviews"
ON public.reviews FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = reviewer_id)
WITH CHECK ((SELECT auth.uid()) = reviewer_id);

CREATE POLICY "Users can delete own reviews"
ON public.reviews FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = reviewer_id);

-- Helper function: get average rating for a seller
CREATE OR REPLACE FUNCTION public.get_seller_rating(p_seller_id UUID)
RETURNS TABLE(average_rating NUMERIC, review_count BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average_rating,
    COUNT(*) AS review_count
  FROM public.reviews
  WHERE seller_id = p_seller_id;
$$;
