-- Criação de géneros apenas via RPC (limite 2/mês/utilizador + filtro básico de conteúdo).
-- Remove INSERT direto na tabela `genres` para o papel `authenticated`.

DROP POLICY IF EXISTS "genres_insert_authenticated" ON public.genres;

CREATE TABLE IF NOT EXISTS public.genre_user_creations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  genre_id uuid NOT NULL REFERENCES public.genres (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_genre_user_creations_user_created
  ON public.genre_user_creations (user_id, created_at DESC);

ALTER TABLE public.genre_user_creations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "genre_user_creations_select_own" ON public.genre_user_creations;

CREATE POLICY "genre_user_creations_select_own"
  ON public.genre_user_creations
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

COMMENT ON TABLE public.genre_user_creations IS
  'Registo de géneros criados por utilizador (para limite mensal). Inserido apenas pela RPC create_genre_with_limits.';

-- Termos a bloquear (substring, case insensitive). Rever periodicamente.
CREATE OR REPLACE FUNCTION public.genre_name_is_blocked(p_name text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  t text := lower(trim(p_name));
  w text;
  blocked text[] := ARRAY[
    'hitler', 'nazismo', 'nazi', 'estupro', 'estuprador',
    'putaria', 'puta ', ' puta', 'puto ', 'fdp', 'filho da puta',
    'caralho', 'buceta', 'pau no ', 'foda', 'foder', 'merda',
    'macaco ', ' macaco', 'babuino', 'viado', 'bicha ',
    'retardado', 'retardada', 'nigga', 'nigger', 'whore', 'faggot',
    'rape ', ' rape', 'https://', 'http://', '<script', '</', '<iframe'
  ];
BEGIN
  IF t IS NULL OR t = '' THEN
    RETURN true;
  END IF;
  IF position('<' IN t) > 0 OR position('>' IN t) > 0
     OR position(E'\n' IN t) > 0 OR position(E'\r' IN t) > 0 THEN
    RETURN true;
  END IF;
  FOREACH w IN ARRAY blocked
  LOOP
    IF position(w IN t) > 0 THEN
      RETURN true;
    END IF;
  END LOOP;
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_genre_with_limits(p_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_trim text;
  v_slug text;
  v_count int;
  v_id uuid;
  v_existing record;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  v_trim := trim(p_name);
  IF length(v_trim) < 2 OR length(v_trim) > 80 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_length');
  END IF;

  IF public.genre_name_is_blocked(v_trim) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'blocked_content');
  END IF;

  v_slug := lower(
    regexp_replace(
      regexp_replace(v_trim, '[^a-zA-Z0-9]+', '-', 'g'),
      '^-+|-+$',
      '',
      'g'
    )
  );
  IF v_slug IS NULL OR v_slug = '' THEN
    v_slug := 'genero';
  END IF;
  IF length(v_slug) > 80 THEN
    v_slug := left(v_slug, 80);
  END IF;

  SELECT id, name, slug INTO v_existing
  FROM public.genres
  WHERE lower(name) = lower(v_trim) OR slug = v_slug
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'ok', true,
      'existing', true,
      'id', v_existing.id,
      'name', v_existing.name
    );
  END IF;

  SELECT COUNT(*)::int INTO v_count
  FROM public.genre_user_creations
  WHERE user_id = v_uid
    AND created_at >= date_trunc('month', now());

  IF v_count >= 2 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'monthly_limit');
  END IF;

  BEGIN
    INSERT INTO public.genres (name, slug, description, color, image)
    VALUES (v_trim, v_slug, NULL, NULL, NULL)
    RETURNING id INTO v_id;
  EXCEPTION
    WHEN unique_violation THEN
      SELECT id, name, slug INTO v_existing
      FROM public.genres
      WHERE slug = v_slug OR lower(name) = lower(v_trim)
      LIMIT 1;
      IF FOUND THEN
        RETURN jsonb_build_object(
          'ok', true,
          'existing', true,
          'id', v_existing.id,
          'name', v_existing.name
        );
      END IF;
      RETURN jsonb_build_object('ok', false, 'error', 'invalid_slug');
  END;

  INSERT INTO public.genre_user_creations (user_id, genre_id)
  VALUES (v_uid, v_id);

  RETURN jsonb_build_object(
    'ok', true,
    'existing', false,
    'id', v_id,
    'name', v_trim
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_genre_with_limits(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_genre_with_limits(text) TO authenticated;

COMMENT ON FUNCTION public.create_genre_with_limits(text) IS
  'Cria género com limite de 2 inserções novas por utilizador por mês civil e filtro básico de conteúdo.';
