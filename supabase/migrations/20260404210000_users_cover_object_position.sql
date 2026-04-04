-- Focal point do banner (object-position CSS), ex.: "50% 35%"
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS cover_object_position text NOT NULL DEFAULT '50% 50%';

COMMENT ON COLUMN public.users.cover_object_position IS 'CSS object-position for profile cover (e.g. 50% 50%).';
