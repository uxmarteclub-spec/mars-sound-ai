-- Applied to project ftezgnflagqhokwbkonw via Supabase MCP
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  username text NOT NULL,
  name text NOT NULL,
  bio text,
  avatar text,
  cover_image text,
  role public.user_role NOT NULL DEFAULT 'USER',
  is_public boolean NOT NULL DEFAULT true,
  is_verified boolean NOT NULL DEFAULT false,
  favorite_genres varchar(50)[] NOT NULL DEFAULT '{}',
  favorite_moods varchar(50)[] NOT NULL DEFAULT '{}',
  total_tracks int NOT NULL DEFAULT 0,
  total_plays int NOT NULL DEFAULT 0,
  total_followers int NOT NULL DEFAULT 0,
  total_following int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz,
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_username_key UNIQUE (username)
);

CREATE INDEX idx_users_username ON public.users (username);
CREATE INDEX idx_users_email ON public.users (email);
CREATE INDEX idx_users_created_at ON public.users (created_at);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username text;
  final_username text;
  suffix int := 0;
BEGIN
  base_username := lower(regexp_replace(
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(COALESCE(NEW.email, 'user'), '@', 1)),
    '[^a-z0-9_]', '_', 'g'
  ));
  IF base_username IS NULL OR base_username = '' THEN
    base_username := 'user';
  END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := base_username || '_' || suffix::text;
  END LOOP;

  INSERT INTO public.users (id, email, username, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    final_username,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''), initcap(replace(final_username, '_', ' ')))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
