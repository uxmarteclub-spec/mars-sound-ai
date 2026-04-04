-- Applied to project ftezgnflagqhokwbkonw via Supabase MCP
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('audio-tracks', 'audio-tracks', true),
  ('track-covers', 'track-covers', true),
  ('user-avatars', 'user-avatars', true),
  ('playlist-covers', 'playlist-covers', true),
  ('waveforms', 'waveforms', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_audio_tracks_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio-tracks');

CREATE POLICY "storage_audio_tracks_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audio-tracks'
    AND (SELECT auth.uid()) IS NOT NULL
    AND split_part(name, '/', 1) = (SELECT auth.uid())::text
  );

CREATE POLICY "storage_audio_tracks_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'audio-tracks'
    AND split_part(name, '/', 1) = (SELECT auth.uid())::text
  );

CREATE POLICY "storage_audio_tracks_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'audio-tracks'
    AND split_part(name, '/', 1) = (SELECT auth.uid())::text
  );

CREATE POLICY "storage_track_covers_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'track-covers');

CREATE POLICY "storage_track_covers_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'track-covers'
    AND (SELECT auth.uid()) IS NOT NULL
    AND split_part(name, '/', 1) = (SELECT auth.uid())::text
  );

CREATE POLICY "storage_track_covers_update_own"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'track-covers' AND split_part(name, '/', 1) = (SELECT auth.uid())::text);

CREATE POLICY "storage_track_covers_delete_own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'track-covers' AND split_part(name, '/', 1) = (SELECT auth.uid())::text);

CREATE POLICY "storage_user_avatars_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-avatars');

CREATE POLICY "storage_user_avatars_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-avatars'
    AND (SELECT auth.uid()) IS NOT NULL
    AND split_part(name, '/', 1) = (SELECT auth.uid())::text
  );

CREATE POLICY "storage_user_avatars_update_own"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'user-avatars' AND split_part(name, '/', 1) = (SELECT auth.uid())::text);

CREATE POLICY "storage_user_avatars_delete_own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'user-avatars' AND split_part(name, '/', 1) = (SELECT auth.uid())::text);

CREATE POLICY "storage_playlist_covers_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'playlist-covers');

CREATE POLICY "storage_playlist_covers_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'playlist-covers'
    AND (SELECT auth.uid()) IS NOT NULL
    AND split_part(name, '/', 1) = (SELECT auth.uid())::text
  );

CREATE POLICY "storage_playlist_covers_update_own"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'playlist-covers' AND split_part(name, '/', 1) = (SELECT auth.uid())::text);

CREATE POLICY "storage_playlist_covers_delete_own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'playlist-covers' AND split_part(name, '/', 1) = (SELECT auth.uid())::text);

CREATE POLICY "storage_waveforms_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'waveforms');

CREATE POLICY "storage_waveforms_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'waveforms'
    AND (SELECT auth.uid()) IS NOT NULL
    AND split_part(name, '/', 1) = (SELECT auth.uid())::text
  );

CREATE POLICY "storage_waveforms_update_own"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'waveforms' AND split_part(name, '/', 1) = (SELECT auth.uid())::text);

CREATE POLICY "storage_waveforms_delete_own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'waveforms' AND split_part(name, '/', 1) = (SELECT auth.uid())::text);
