-- Fix search_listings: remove dropped location_type / location_detail columns
CREATE OR REPLACE FUNCTION public.search_listings(
  search_query TEXT DEFAULT NULL,
  filter_category UUID DEFAULT NULL,
  filter_condition TEXT DEFAULT NULL,
  filter_location TEXT DEFAULT NULL,   -- kept for API compat, no longer used
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
