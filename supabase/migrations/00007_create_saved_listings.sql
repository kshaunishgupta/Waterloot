CREATE TABLE public.saved_listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id      UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_saved_user ON public.saved_listings(user_id);
