-- ─────────────────────────────────────────────────────────────────────────────
-- 00023_admin_rls_policies.sql
--
-- Give admin-role users full (SELECT / INSERT / UPDATE / DELETE) access on
-- every moderation-relevant table, regardless of who owns the row.
-- Uses a sub-select wrapper to avoid plan-caching issues (same pattern as
-- migration 00021).
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper: a stable function that returns the calling user's role.
-- Using SECURITY DEFINER + search_path prevents privilege escalation.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;

-- ── listings ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins have full access to listings" ON public.listings;
CREATE POLICY "admins have full access to listings"
  ON public.listings
  FOR ALL
  USING  (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- ── wanted_posts ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins have full access to wanted_posts" ON public.wanted_posts;
CREATE POLICY "admins have full access to wanted_posts"
  ON public.wanted_posts
  FOR ALL
  USING  (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- ── seller_ratings ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins have full access to seller_ratings" ON public.seller_ratings;
CREATE POLICY "admins have full access to seller_ratings"
  ON public.seller_ratings
  FOR ALL
  USING  (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- ── reports ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins have full access to reports" ON public.reports;
CREATE POLICY "admins have full access to reports"
  ON public.reports
  FOR ALL
  USING  (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- ── profiles ─────────────────────────────────────────────────────────────────
-- Admins need to read/update all profiles (ban, promote, etc.)
DROP POLICY IF EXISTS "admins have full access to profiles" ON public.profiles;
CREATE POLICY "admins have full access to profiles"
  ON public.profiles
  FOR ALL
  USING  (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');
