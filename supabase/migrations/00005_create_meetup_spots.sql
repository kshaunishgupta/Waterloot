CREATE TABLE public.meetup_spots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  latitude        DOUBLE PRECISION NOT NULL,
  longitude       DOUBLE PRECISION NOT NULL,
  building_code   TEXT,
  image_url       TEXT,
  is_indoor       BOOLEAN NOT NULL DEFAULT TRUE,
  hours           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
