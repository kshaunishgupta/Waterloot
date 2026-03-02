-- ============================================
-- Row Level Security Policies
-- ============================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- CATEGORIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by authenticated users"
ON public.categories FOR SELECT
TO authenticated
USING (true);

-- LISTINGS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active listings are viewable by authenticated users"
ON public.listings FOR SELECT
TO authenticated
USING (status = 'active' OR seller_id = (SELECT auth.uid()));

CREATE POLICY "Authenticated users can create listings"
ON public.listings FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = seller_id);

CREATE POLICY "Users can update own listings"
ON public.listings FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = seller_id)
WITH CHECK ((SELECT auth.uid()) = seller_id);

CREATE POLICY "Users can delete own listings"
ON public.listings FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = seller_id);

-- CONVERSATIONS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (buyer_id = (SELECT auth.uid()) OR seller_id = (SELECT auth.uid()));

CREATE POLICY "Buyers can create conversations"
ON public.conversations FOR INSERT
TO authenticated
WITH CHECK (buyer_id = (SELECT auth.uid()));

-- MESSAGES
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own conversations"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.buyer_id = (SELECT auth.uid()) OR c.seller_id = (SELECT auth.uid()))
  )
);

CREATE POLICY "Users can send messages in own conversations"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.buyer_id = (SELECT auth.uid()) OR c.seller_id = (SELECT auth.uid()))
  )
);

CREATE POLICY "Users can mark messages as read"
ON public.messages FOR UPDATE
TO authenticated
USING (
  sender_id != (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.buyer_id = (SELECT auth.uid()) OR c.seller_id = (SELECT auth.uid()))
  )
);

-- MEETUP SPOTS
ALTER TABLE public.meetup_spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Meetup spots are viewable by authenticated users"
ON public.meetup_spots FOR SELECT
TO authenticated
USING (true);

-- REPORTS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can create reports"
ON public.reports FOR INSERT
TO authenticated
WITH CHECK (reporter_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own reports"
ON public.reports FOR SELECT
TO authenticated
USING (reporter_id = (SELECT auth.uid()));

-- SAVED LISTINGS
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved listings"
ON public.saved_listings FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can save listings"
ON public.saved_listings FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can unsave listings"
ON public.saved_listings FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- ============================================
-- Storage Buckets
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage RLS: listing-images
CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listing-images'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

CREATE POLICY "Anyone can view listing images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'listing-images');

CREATE POLICY "Users can delete own listing images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'listing-images'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- Storage RLS: avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);
