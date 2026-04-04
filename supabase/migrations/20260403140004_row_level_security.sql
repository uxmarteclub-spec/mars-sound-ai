-- Applied to project ftezgnflagqhokwbkonw via Supabase MCP
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.play_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "genres_select_all" ON public.genres FOR SELECT USING (true);
CREATE POLICY "tags_select_all" ON public.tags FOR SELECT USING (true);

CREATE POLICY "users_select_public_or_self_or_follow" ON public.users FOR SELECT USING (
  is_public = true
  OR id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.follows f
    WHERE f.follower_id = (SELECT auth.uid()) AND f.following_id = users.id
  )
);

CREATE POLICY "users_update_self" ON public.users FOR UPDATE
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "users_delete_self" ON public.users FOR DELETE
  USING (id = (SELECT auth.uid()));

CREATE POLICY "tracks_select_published_or_owner" ON public.tracks FOR SELECT USING (
  status = 'PUBLISHED'
  OR user_id = (SELECT auth.uid())
);

CREATE POLICY "tracks_insert_owner" ON public.tracks FOR INSERT
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()));

CREATE POLICY "tracks_update_owner" ON public.tracks FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "tracks_delete_owner" ON public.tracks FOR DELETE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "tracks_admin_all" ON public.tracks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = (SELECT auth.uid()) AND u.role IN ('ADMIN', 'MODERATOR')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = (SELECT auth.uid()) AND u.role IN ('ADMIN', 'MODERATOR')
    )
  );

CREATE POLICY "playlists_select_public_private_owner" ON public.playlists FOR SELECT USING (
  visibility = 'PUBLIC'
  OR user_id = (SELECT auth.uid())
  OR (visibility = 'UNLISTED' AND user_id = (SELECT auth.uid()))
);

CREATE POLICY "playlists_insert_owner" ON public.playlists FOR INSERT
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()));

CREATE POLICY "playlists_update_owner" ON public.playlists FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "playlists_delete_owner" ON public.playlists FOR DELETE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "playlist_tracks_select_with_playlist" ON public.playlist_tracks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.playlists p
    WHERE p.id = playlist_tracks.playlist_id
    AND (
      p.visibility = 'PUBLIC'
      OR p.user_id = (SELECT auth.uid())
      OR (p.visibility = 'UNLISTED' AND p.user_id = (SELECT auth.uid()))
    )
  )
);

CREATE POLICY "playlist_tracks_insert_playlist_owner" ON public.playlist_tracks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists p
      WHERE p.id = playlist_id AND p.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "playlist_tracks_update_playlist_owner" ON public.playlist_tracks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists p
      WHERE p.id = playlist_id AND p.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists p
      WHERE p.id = playlist_id AND p.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "playlist_tracks_delete_playlist_owner" ON public.playlist_tracks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists p
      WHERE p.id = playlist_id AND p.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "favorites_insert_own" ON public.favorites FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "favorites_delete_own" ON public.favorites FOR DELETE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "likes_select_own" ON public.likes FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "likes_insert_own" ON public.likes FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "likes_delete_own" ON public.likes FOR DELETE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "follows_select_involved" ON public.follows FOR SELECT USING (
  follower_id = (SELECT auth.uid()) OR following_id = (SELECT auth.uid())
);
CREATE POLICY "follows_insert_self_as_follower" ON public.follows FOR INSERT
  WITH CHECK (follower_id = (SELECT auth.uid()));
CREATE POLICY "follows_delete_self_as_follower" ON public.follows FOR DELETE
  USING (follower_id = (SELECT auth.uid()));

CREATE POLICY "comments_select_published_or_author" ON public.comments FOR SELECT USING (
  user_id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.tracks t
    WHERE t.id = comments.track_id
    AND (t.status = 'PUBLISHED' OR t.user_id = (SELECT auth.uid()))
  )
);

CREATE POLICY "comments_insert_authenticated_author" ON public.comments FOR INSERT
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()));

CREATE POLICY "comments_update_own" ON public.comments FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "comments_delete_own" ON public.comments FOR DELETE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "play_history_select_own" ON public.play_history FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "play_history_insert_own" ON public.play_history FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "reports_insert_as_reporter" ON public.reports FOR INSERT
  WITH CHECK (reporter_id = (SELECT auth.uid()));
CREATE POLICY "reports_select_own" ON public.reports FOR SELECT USING (reporter_id = (SELECT auth.uid()));

CREATE POLICY "track_tags_select_visible_track" ON public.track_tags FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tracks t
    WHERE t.id = track_tags.track_id
    AND (t.status = 'PUBLISHED' OR t.user_id = (SELECT auth.uid()))
  )
);

CREATE POLICY "track_tags_write_track_owner" ON public.track_tags FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.tracks t WHERE t.id = track_id AND t.user_id = (SELECT auth.uid()))
  );

CREATE POLICY "track_tags_update_track_owner" ON public.track_tags FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.tracks t WHERE t.id = track_id AND t.user_id = (SELECT auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.tracks t WHERE t.id = track_id AND t.user_id = (SELECT auth.uid()))
  );

CREATE POLICY "track_tags_delete_track_owner" ON public.track_tags FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.tracks t WHERE t.id = track_id AND t.user_id = (SELECT auth.uid()))
  );
