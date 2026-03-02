-- Remove location fields from listings (feature was removed from UI)
ALTER TABLE public.listings
  DROP COLUMN IF EXISTS location_type,
  DROP COLUMN IF EXISTS location_detail;
