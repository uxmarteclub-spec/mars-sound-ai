-- Mars Sound AI — seed opcional pós-signup (executar no SQL Editor como usuário já existente em auth.users)
-- 1) Crie uma conta em Authentication (ou Dashboard → Add user).
-- 2) Copie o UUID de auth.users (Authentication → Users → copy id).
-- 3) Substitua :user_id e :genre_id abaixo (genre: SELECT id FROM genres WHERE slug = 'ambient' LIMIT 1).

-- Perfil já é criado pelo trigger handle_new_user; use isto só para ajustar preferências:
-- UPDATE public.users SET favorite_genres = ARRAY['ambient','jazz']::varchar(50)[], favorite_moods = ARRAY['chill']::varchar(50)[] WHERE id = ':user_id'::uuid;

-- Uma faixa publicada de exemplo (URLs devem apontar para ficheiros reais no Storage ou CDN):
/*
INSERT INTO public.tracks (
  title, description, audio_url, image_url, duration, file_size, format,
  artist, album, genre_id, moods, user_id, status, published_at
) VALUES (
  'Cosmic Dreams',
  'Demo track',
  'https://SEU_PROJETO.supabase.co/storage/v1/object/public/audio-tracks/USER_ID/file.mp3',
  'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=400',
  245,
  5242880,
  'mp3',
  'Mars AI',
  'Mars Sound',
  ':genre_id'::uuid,
  ARRAY['chill','meditation']::varchar(50)[],
  ':user_id'::uuid,
  'PUBLISHED',
  now()
);

INSERT INTO public.playlists (name, description, user_id, visibility)
VALUES ('Chill Vibes', 'Playlist demo', ':user_id'::uuid, 'PUBLIC');

INSERT INTO public.playlist_tracks (playlist_id, track_id, position)
SELECT p.id, t.id, 0
FROM public.playlists p
CROSS JOIN public.tracks t
WHERE p.user_id = ':user_id'::uuid AND t.user_id = ':user_id'::uuid
ORDER BY p.created_at DESC, t.created_at DESC
LIMIT 1;
*/
