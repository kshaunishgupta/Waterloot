-- ============================================
-- Migration 00011: Add contact fields to listings
-- ============================================

ALTER TABLE public.listings
  ADD COLUMN instagram TEXT,
  ADD COLUMN discord TEXT,
  ADD COLUMN contact_phone TEXT;
