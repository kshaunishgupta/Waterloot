-- ============================================
-- Migration 00021: Fix seller_ratings RLS, reports RLS, and search_listings RPC
-- ============================================

-- --------------------------------------------
-- 1. seller_ratings — drop and recreate all RLS policies.
--    Uses (SELECT auth.uid()) wrapper to avoid plan-caching issues
--    that can cause "new row violates row-level security policy" errors.
-- --------------------------------------------
DROP POLICY IF EXISTS "ratings_select" ON public.seller_ratings;
DROP POLICY IF EXISTS "ratings_insert" ON public.seller_ratings;
DROP POLICY IF EXISTS "ratings_update" ON public.seller_ratings;
DROP POLICY IF EXISTS "ratings_delete" ON public.seller_ratings;

ALTER TABLE public.seller_ratings ENABLE ROW LEVEL SECURITY;

-- Public (anon + authenticated) can read ratings for seller-approval display
CREATE POLICY "ratings_select" ON public.seller_ratings
  FOR SELECT TO anon, authenticated
  USING (true);

-- Authenticated buyers can insert a rating; cannot rate yourself
CREATE POLICY "ratings_insert" ON public.seller_ratings
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = buyer_id
    AND (SELECT auth.uid()) <> seller_id
  );

-- Buyers can flip their own vote (like ↔ dislike)
CREATE POLICY "ratings_update" ON public.seller_ratings
  FOR UPDATE TO authenticated
  USING  ((SELECT auth.uid()) = buyer_id)
  WITH CHECK ((SELECT auth.uid()) = buyer_id);

-- Buyers can remove their own rating
CREATE POLICY "ratings_delete" ON public.seller_ratings
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = buyer_id);


-- --------------------------------------------
-- 2. reports — drop and recreate RLS policies.
-- --------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view own reports"             ON public.reports;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can create reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = reporter_id);

CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = reporter_id);


-- --------------------------------------------
-- 3. search_listings — drop and recreate.
--    Must DROP first because CREATE OR REPLACE cannot change the return type.
--    The old function returned location_type / location_detail columns that
--    were dropped in migration 00016, causing "column does not exist" errors.
-- --------------------------------------------
DROP FUNCTION IF EXISTS public.search_listings(TEXT, UUID, TEXT, TEXT, NUMERIC, NUMERIC, TIMESTAMPTZ, TEXT, INT, INT);

CREATE FUNCTION public.search_listings(
  search_query      TEXT         DEFAULT NULL,
  filter_category   UUID         DEFAULT NULL,
  filter_condition  TEXT         DEFAULT NULL,
  filter_location   TEXT         DEFAULT NULL,  -- kept for API compat, ignored
  filter_min_price  NUMERIC      DEFAULT NULL,
  filter_max_price  NUMERIC      DEFAULT NULL,
  filter_date_after TIMESTAMPTZ  DEFAULT NULL,
  sort_by           TEXT         DEFAULT 'newest',
  page_number       INT          DEFAULT 1,
  page_size         INT          DEFAULT 20
)
RETURNS TABLE (
  id            UUID,
  title         TEXT,
  description   TEXT,
  price         NUMERIC,
  condition     TEXT,
  images        TEXT[],
  status        TEXT,
  isbn          TEXT,
  book_title    TEXT,
  book_author   TEXT,
  book_edition  TEXT,
  course_code   TEXT,
  seller_id     UUID,
  seller_name   TEXT,
  seller_avatar TEXT,
  category_id   UUID,
  category_name TEXT,
  category_slug TEXT,
  created_at    TIMESTAMPTZ,
  total_count   BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH filtered AS (
    SELECT
      l.id,
      l.title,
      l.description,
      l.price,
      l.condition,
      l.images,
      l.status,
      l.isbn,
      l.book_title,
      l.book_author,
      l.book_edition,
      l.course_code,
      l.seller_id,
      p.full_name  AS seller_name,
      p.avatar_url AS seller_avatar,
      l.category_id,
      c.name       AS category_name,
      c.slug       AS category_slug,
      l.created_at,
      COUNT(*) OVER() AS total_count
    FROM public.listings l
    JOIN public.profiles p ON p.id = l.seller_id
    JOIN public.categories c ON c.id = l.category_id
    WHERE l.status = 'active'
      AND (search_query    IS NULL OR l.fts @@ plainto_tsquery('english', search_query))
      AND (filter_category IS NULL OR l.category_id = filter_category)
      AND (filter_condition IS NULL OR l.condition   = filter_condition)
      AND (filter_min_price IS NULL OR l.price       >= filter_min_price)
      AND (filter_max_price IS NULL OR l.price       <= filter_max_price)
      AND (filter_date_after IS NULL OR l.created_at >= filter_date_after)
    ORDER BY
      CASE WHEN sort_by = 'newest'                                   THEN l.created_at END DESC,
      CASE WHEN sort_by = 'oldest'                                   THEN l.created_at END ASC,
      CASE WHEN sort_by = 'price_asc'                                THEN l.price END ASC,
      CASE WHEN sort_by = 'price_desc'                               THEN l.price END DESC,
      CASE WHEN sort_by = 'relevance' AND search_query IS NOT NULL
        THEN ts_rank(l.fts, plainto_tsquery('english', search_query)) END DESC,
      l.created_at DESC
    LIMIT  page_size
    OFFSET (page_number - 1) * page_size
  )
  SELECT * FROM filtered;
END;
$$;

-- Ensure both anon and authenticated roles can call the function
GRANT EXECUTE ON FUNCTION public.search_listings TO anon, authenticated;
