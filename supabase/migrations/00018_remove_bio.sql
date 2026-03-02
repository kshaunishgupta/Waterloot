-- Remove bio field from profiles (feature removed from UI)
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS bio;
