CREATE TABLE public.listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id     UUID NOT NULL REFERENCES public.categories(id),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  price           NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  condition       TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  location_type   TEXT NOT NULL CHECK (location_type IN ('on_campus', 'off_campus')),
  location_detail TEXT,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed', 'draft')),
  images          TEXT[] NOT NULL DEFAULT '{}',

  -- Textbook-specific fields (nullable for non-textbook listings)
  isbn            TEXT,
  book_title      TEXT,
  book_author     TEXT,
  book_edition    TEXT,
  course_code     TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for filtering and sorting
CREATE INDEX idx_listings_seller ON public.listings(seller_id);
CREATE INDEX idx_listings_category ON public.listings(category_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX idx_listings_price ON public.listings(price);
CREATE INDEX idx_listings_condition ON public.listings(condition);
CREATE INDEX idx_listings_location_type ON public.listings(location_type);
CREATE INDEX idx_listings_isbn ON public.listings(isbn) WHERE isbn IS NOT NULL;

-- Full-text search column (weighted: title > course_code > description > author)
ALTER TABLE public.listings ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(course_code, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(book_author, '')), 'C')
  ) STORED;

CREATE INDEX idx_listings_fts ON public.listings USING GIN(fts);

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
