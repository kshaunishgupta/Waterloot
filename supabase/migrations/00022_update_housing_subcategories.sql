-- ============================================
-- Migration 00022: Housing subcategories (idempotent)
-- Includes the parent_id column from 00020 (which was marked applied but
-- never executed), then upserts all housing categories with correct names.
-- ============================================

-- Add parent_id if it doesn't exist yet (from 00020)
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE;

-- Upsert housing parent
INSERT INTO public.categories (name, slug, display_order)
VALUES ('Housing', 'housing', 50)
ON CONFLICT (slug) DO NOTHING;

-- Upsert all four housing subcategories with correct display names
DO $$
DECLARE
  housing_id UUID;
BEGIN
  SELECT id INTO housing_id FROM public.categories WHERE slug = 'housing';

  INSERT INTO public.categories (name, slug, display_order, parent_id)
  VALUES
    ('Apts / Housing',      'apartments',      51, housing_id),
    ('Housing Wanted',      'wanted-housing',  52, housing_id),
    ('Rooms / Shared',      'rooms-shared',    53, housing_id),
    ('Sublets / Temporary', 'sublet-temporary',54, housing_id)
  ON CONFLICT (slug) DO UPDATE
    SET name      = EXCLUDED.name,
        parent_id = EXCLUDED.parent_id;
END;
$$;
