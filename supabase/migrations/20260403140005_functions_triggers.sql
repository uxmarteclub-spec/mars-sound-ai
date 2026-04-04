-- Applied to project ftezgnflagqhokwbkonw via Supabase MCP
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at
  BEFORE UPDATE ON public.tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tracks SET like_count = like_count + 1 WHERE id = NEW.track_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tracks SET like_count = like_count - 1 WHERE id = OLD.track_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER track_like_count_trigger
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_like_count();

CREATE OR REPLACE FUNCTION public.update_follower_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users SET total_followers = total_followers + 1 WHERE id = NEW.following_id;
    UPDATE public.users SET total_following = total_following + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users SET total_followers = GREATEST(0, total_followers - 1) WHERE id = OLD.following_id;
    UPDATE public.users SET total_following = GREATEST(0, total_following - 1) WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER user_follow_count_trigger
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_follower_count();

CREATE OR REPLACE FUNCTION public.update_user_track_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users SET total_tracks = total_tracks + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users SET total_tracks = GREATEST(0, total_tracks - 1) WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER user_track_count_trigger
  AFTER INSERT OR DELETE ON public.tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_track_count();

CREATE OR REPLACE FUNCTION public.update_playlist_track_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.playlists SET track_count = track_count + 1 WHERE id = NEW.playlist_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.playlists SET track_count = GREATEST(0, track_count - 1) WHERE id = OLD.playlist_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER playlist_track_count_trigger
  AFTER INSERT OR DELETE ON public.playlist_tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_playlist_track_count();

CREATE OR REPLACE FUNCTION public.create_follow_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, actor_id, entity_id, entity_type)
  SELECT
    NEW.following_id,
    'FOLLOW'::public.notification_type,
    'Novo seguidor',
    (SELECT u.name FROM public.users u WHERE u.id = NEW.follower_id) || ' começou a seguir você',
    NEW.follower_id,
    NEW.follower_id::text,
    'user';
  RETURN NEW;
END;
$$;

CREATE TRIGGER follow_notification_trigger
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.create_follow_notification();

CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, actor_id, entity_id, entity_type)
  SELECT
    t.user_id,
    'LIKE'::public.notification_type,
    'Nova curtida',
    (SELECT u.name FROM public.users u WHERE u.id = NEW.user_id) || ' curtiu sua música ' || t.title,
    NEW.user_id,
    NEW.track_id::text,
    'track'
  FROM public.tracks t
  WHERE t.id = NEW.track_id AND t.user_id <> NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER like_notification_trigger
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_like_notification();

CREATE OR REPLACE FUNCTION public.increment_play_count(track_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.tracks SET play_count = play_count + 1 WHERE id = track_id_param;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_play_count(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.search_tracks(search_query text)
RETURNS TABLE (id uuid, title text, artist text, relevance real)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.artist,
    ts_rank(
      to_tsvector('english', t.title || ' ' || t.artist || ' ' || COALESCE(t.album, '')),
      plainto_tsquery('english', search_query)
    ) AS relevance
  FROM public.tracks t
  WHERE t.status = 'PUBLISHED'
    AND to_tsvector('english', t.title || ' ' || t.artist || ' ' || COALESCE(t.album, ''))
      @@ plainto_tsquery('english', search_query)
  ORDER BY relevance DESC
  LIMIT 50;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_tracks(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_recommendations(user_id_param uuid, limit_param integer DEFAULT 20)
RETURNS TABLE (id uuid, title text, artist text, image_url text, play_count integer)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.artist,
    t.image_url,
    t.play_count
  FROM public.tracks t
  WHERE t.status = 'PUBLISHED'
    AND t.user_id <> user_id_param
    AND t.genre_id IN (
      SELECT g.id FROM public.genres g
      INNER JOIN public.users u ON u.id = user_id_param
      WHERE g.slug = ANY (u.favorite_genres)
    )
  ORDER BY t.play_count DESC, t.created_at DESC
  LIMIT limit_param;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_recommendations(uuid, integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_top_tracks_this_week(limit_param integer DEFAULT 20)
RETURNS TABLE (id uuid, title text, artist text, image_url text, play_count bigint)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.artist,
    t.image_url,
    COUNT(ph.id)::bigint AS play_count
  FROM public.tracks t
  INNER JOIN public.play_history ph ON ph.track_id = t.id AND ph.played_at >= (now() - interval '7 days')
  WHERE t.status = 'PUBLISHED'
  GROUP BY t.id, t.title, t.artist, t.image_url
  ORDER BY play_count DESC
  LIMIT limit_param;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_top_tracks_this_week(integer) TO anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_tracks_user_status ON public.tracks (user_id, status);
CREATE INDEX IF NOT EXISTS idx_tracks_genre_status ON public.tracks (genre_id, status);
