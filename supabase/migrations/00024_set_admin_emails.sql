-- ─────────────────────────────────────────────────────────────────────────────
-- 00024_set_admin_emails.sql
--
-- Promotes specific UWaterloo accounts to the 'admin' role at launch.
-- Safe to re-run (UPDATE is idempotent for rows that are already admin).
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE public.profiles
SET role = 'admin'
WHERE email IN (
  'k83gupta@uwaterloo.ca',
  'a882sing@uwaterloo.ca'
);
