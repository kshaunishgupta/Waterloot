-- Add parent_id to categories to support housing subcategories
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE;

-- Insert top-level housing category
INSERT INTO public.categories (name, slug, display_order)
VALUES ('Housing', 'housing', 50)
ON CONFLICT (slug) DO NOTHING;

-- Insert housing subcategories
DO $$
DECLARE
  housing_id UUID;
BEGIN
  SELECT id INTO housing_id FROM public.categories WHERE slug = 'housing';

  INSERT INTO public.categories (name, slug, display_order, parent_id)
  VALUES
    ('Sublet / Temporary', 'sublet-temporary', 51, housing_id),
    ('Apartments',         'apartments',        52, housing_id),
    ('Wanted Housing',     'wanted-housing',    53, housing_id)
  ON CONFLICT (slug) DO NOTHING;
END;
$$;
