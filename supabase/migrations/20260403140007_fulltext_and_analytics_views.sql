-- Applied to project ftezgnflagqhokwbkonw via Supabase MCP (final: security_invoker views)
CREATE INDEX IF NOT EXISTS idx_tracks_fts ON public.tracks USING gin (
  to_tsvector('english', title || ' ' || artist || ' ' || COALESCE(album, ''))
);

CREATE OR REPLACE VIEW public.top_tracks_this_month WITH (security_invoker = true) AS
SELECT
  t.id,
  t.title,
  t.artist,
  COUNT(ph.id) AS play_count
FROM public.tracks t
LEFT JOIN public.play_history ph
  ON ph.track_id = t.id AND ph.played_at >= date_trunc('month', (SELECT now()))
WHERE t.status = 'PUBLISHED'
GROUP BY t.id, t.title, t.artist
ORDER BY play_count DESC
LIMIT 100;

CREATE OR REPLACE VIEW public.top_users_this_week WITH (security_invoker = true) AS
SELECT
  u.id,
  u.username,
  u.name,
  COUNT(ph.id) AS total_plays
FROM public.users u
LEFT JOIN public.play_history ph
  ON ph.user_id = u.id AND ph.played_at >= (SELECT now()) - interval '7 days'
GROUP BY u.id, u.username, u.name
ORDER BY total_plays DESC
LIMIT 50;

CREATE OR REPLACE VIEW public.genre_stats WITH (security_invoker = true) AS
SELECT
  g.name,
  COUNT(DISTINCT t.id) AS track_count,
  COALESCE(SUM(t.play_count), 0)::bigint AS total_plays
FROM public.genres g
LEFT JOIN public.tracks t ON t.genre_id = g.id AND t.status = 'PUBLISHED'
GROUP BY g.id, g.name
ORDER BY total_plays DESC;

GRANT SELECT ON public.top_tracks_this_month TO anon, authenticated;
GRANT SELECT ON public.top_users_this_week TO anon, authenticated;
GRANT SELECT ON public.genre_stats TO anon, authenticated;
