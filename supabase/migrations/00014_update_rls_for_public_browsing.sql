-- ============================================
-- Migration 00014: Update RLS for public browsing
-- Allow anon (unauthenticated) users to read listings, categories, profiles, meetup spots
-- ============================================

-- LISTINGS: Allow anon to view active listings
DROP POLICY IF EXISTS "Active listings are viewable by authenticated users" ON public.listings;
CREATE POLICY "Active listings are publicly viewable"
ON public.listings FOR SELECT
TO anon, authenticated
USING (status = 'active' OR seller_id = (SELECT auth.uid()));

-- CATEGORIES: Allow anon to view categories
DROP POLICY IF EXISTS "Categories are viewable by authenticated users" ON public.categories;
CREATE POLICY "Categories are publicly viewable"
ON public.categories FOR SELECT
TO anon, authenticated
USING (true);

-- PROFILES: Allow anon to view profiles (needed for seller info on listings)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are publicly viewable"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (true);

-- MEETUP SPOTS: Allow anon to view meetup spots
DROP POLICY IF EXISTS "Meetup spots are viewable by authenticated users" ON public.meetup_spots;
CREATE POLICY "Meetup spots are publicly viewable"
ON public.meetup_spots FOR SELECT
TO anon, authenticated
USING (true);

-- STORAGE: Allow anon to view listing images
DROP POLICY IF EXISTS "Anyone can view listing images" ON storage.objects;
CREATE POLICY "Anyone can view listing images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'listing-images');

-- STORAGE: Allow anon to view avatars
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars');

-- Update search_listings to SECURITY DEFINER so anon can call it
CREATE OR REPLACE FUNCTION public.search_listings(
  search_query TEXT DEFAULT NULL,
  filter_category UUID DEFAULT NULL,
  filter_condition TEXT DEFAULT NULL,
  filter_location TEXT DEFAULT NULL,
  filter_min_price NUMERIC DEFAULT NULL,
  filter_max_price NUMERIC DEFAULT NULL,
  filter_date_after TIMESTAMPTZ DEFAULT NULL,
  sort_by TEXT DEFAULT 'newest',
  page_number INT DEFAULT 1,
  page_size INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  condition TEXT,
  location_type TEXT,
  location_detail TEXT,
  images TEXT[],
  status TEXT,
  isbn TEXT,
  book_title TEXT,
  book_author TEXT,
  book_edition TEXT,
  course_code TEXT,
  seller_id UUID,
  seller_name TEXT,
  seller_avatar TEXT,
  category_id UUID,
  category_name TEXT,
  category_slug TEXT,
  created_at TIMESTAMPTZ,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
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
      l.location_type,
      l.location_detail,
      l.images,
      l.status,
      l.isbn,
      l.book_title,
      l.book_author,
      l.book_edition,
      l.course_code,
      l.seller_id,
      p.full_name AS seller_name,
      p.avatar_url AS seller_avatar,
      l.category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      l.created_at,
      COUNT(*) OVER() AS total_count
    FROM public.listings l
    JOIN public.profiles p ON p.id = l.seller_id
    JOIN public.categories c ON c.id = l.category_id
    WHERE l.status = 'active'
      AND (search_query IS NULL OR l.fts @@ plainto_tsquery('english', search_query))
      AND (filter_category IS NULL OR l.category_id = filter_category)
      AND (filter_condition IS NULL OR l.condition = filter_condition)
      AND (filter_location IS NULL OR l.location_type = filter_location)
      AND (filter_min_price IS NULL OR l.price >= filter_min_price)
      AND (filter_max_price IS NULL OR l.price <= filter_max_price)
      AND (filter_date_after IS NULL OR l.created_at >= filter_date_after)
    ORDER BY
      CASE WHEN sort_by = 'newest' THEN l.created_at END DESC,
      CASE WHEN sort_by = 'oldest' THEN l.created_at END ASC,
      CASE WHEN sort_by = 'price_asc' THEN l.price END ASC,
      CASE WHEN sort_by = 'price_desc' THEN l.price END DESC,
      CASE WHEN sort_by = 'relevance' AND search_query IS NOT NULL
        THEN ts_rank(l.fts, plainto_tsquery('english', search_query)) END DESC,
      l.created_at DESC
    LIMIT page_size
    OFFSET (page_number - 1) * page_size
  )
  SELECT * FROM filtered;
END;
$$;
