-- Drop the old text-review system
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP FUNCTION IF EXISTS public.get_seller_rating(UUID);

-- Create the new simple like/dislike ratings table
CREATE TABLE public.seller_ratings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  is_like    BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One rating per buyer-seller pair
  UNIQUE (buyer_id, seller_id)
);

CREATE INDEX idx_seller_ratings_seller ON public.seller_ratings(seller_id);
CREATE INDEX idx_seller_ratings_buyer  ON public.seller_ratings(buyer_id);
CREATE INDEX idx_seller_ratings_listing ON public.seller_ratings(listing_id);

-- Row-Level Security
ALTER TABLE public.seller_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anon) can read ratings
CREATE POLICY "ratings_select" ON public.seller_ratings
  FOR SELECT USING (true);

-- Authenticated buyers can insert a rating (cannot rate yourself)
CREATE POLICY "ratings_insert" ON public.seller_ratings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id AND auth.uid() != seller_id);

-- Buyers can update their own rating (change like ↔ dislike)
CREATE POLICY "ratings_update" ON public.seller_ratings
  FOR UPDATE TO authenticated
  USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);

-- Buyers can remove their rating
CREATE POLICY "ratings_delete" ON public.seller_ratings
  FOR DELETE TO authenticated
  USING (auth.uid() = buyer_id);

-- Helper RPC: returns approval stats for a seller
CREATE OR REPLACE FUNCTION public.get_seller_approval(p_seller_id UUID)
RETURNS TABLE (
  total_ratings BIGINT,
  like_count    BIGINT,
  approval_pct  INTEGER
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*)::BIGINT                                              AS total_ratings,
    COUNT(*) FILTER (WHERE is_like = true)::BIGINT               AS like_count,
    CASE
      WHEN COUNT(*) = 0 THEN NULL
      ELSE (COUNT(*) FILTER (WHERE is_like = true) * 100 / COUNT(*))::INTEGER
    END                                                           AS approval_pct
  FROM public.seller_ratings
  WHERE seller_id = p_seller_id;
$$;
