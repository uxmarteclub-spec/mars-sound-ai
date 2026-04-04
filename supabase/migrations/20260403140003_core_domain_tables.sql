-- Applied to project ftezgnflagqhokwbkonw via Supabase MCP
CREATE TABLE public.tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  audio_url text NOT NULL,
  image_url text NOT NULL,
  waveform_url text,
  duration integer NOT NULL,
  file_size integer NOT NULL,
  format text NOT NULL DEFAULT 'mp3',
  bitrate integer,
  sample_rate integer,
  artist text NOT NULL,
  album text,
  genre_id uuid NOT NULL REFERENCES public.genres (id),
  moods varchar(50)[] NOT NULL DEFAULT '{}',
  ai_model text,
  ai_prompt text,
  ai_settings jsonb,
  play_count integer NOT NULL DEFAULT 0,
  like_count integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  share_count integer NOT NULL DEFAULT 0,
  status public.track_status NOT NULL DEFAULT 'DRAFT',
  is_explicit boolean NOT NULL DEFAULT false,
  is_downloadable boolean NOT NULL DEFAULT false,
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tracks_user_id ON public.tracks (user_id);
CREATE INDEX idx_tracks_genre_id ON public.tracks (genre_id);
CREATE INDEX idx_tracks_status ON public.tracks (status);
CREATE INDEX idx_tracks_published_at ON public.tracks (published_at);
CREATE INDEX idx_tracks_play_count ON public.tracks (play_count);
CREATE INDEX idx_tracks_created_at ON public.tracks (created_at);

CREATE TABLE public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cover_image text,
  visibility public.playlist_visibility NOT NULL DEFAULT 'PUBLIC',
  is_collaborative boolean NOT NULL DEFAULT false,
  track_count integer NOT NULL DEFAULT 0,
  total_duration integer NOT NULL DEFAULT 0,
  follower_count integer NOT NULL DEFAULT 0,
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_playlists_user_id ON public.playlists (user_id);
CREATE INDEX idx_playlists_visibility ON public.playlists (visibility);
CREATE INDEX idx_playlists_created_at ON public.playlists (created_at);

CREATE TABLE public.playlist_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid NOT NULL REFERENCES public.playlists (id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES public.tracks (id) ON DELETE CASCADE,
  position integer NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  added_by uuid REFERENCES public.users (id),
  CONSTRAINT playlist_tracks_playlist_id_track_id_key UNIQUE (playlist_id, track_id)
);

CREATE INDEX idx_playlist_tracks_playlist_id ON public.playlist_tracks (playlist_id);
CREATE INDEX idx_playlist_tracks_track_id ON public.playlist_tracks (track_id);
CREATE INDEX idx_playlist_tracks_position ON public.playlist_tracks (position);

CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES public.tracks (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT favorites_user_id_track_id_key UNIQUE (user_id, track_id)
);

CREATE INDEX idx_favorites_user_id ON public.favorites (user_id);
CREATE INDEX idx_favorites_track_id ON public.favorites (track_id);
CREATE INDEX idx_favorites_created_at ON public.favorites (created_at);

CREATE TABLE public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES public.tracks (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT likes_user_id_track_id_key UNIQUE (user_id, track_id)
);

CREATE INDEX idx_likes_user_id ON public.likes (user_id);
CREATE INDEX idx_likes_track_id ON public.likes (track_id);
CREATE INDEX idx_likes_created_at ON public.likes (created_at);

CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT follows_follower_id_following_id_key UNIQUE (follower_id, following_id),
  CONSTRAINT follows_no_self CHECK (follower_id <> following_id)
);

CREATE INDEX idx_follows_follower_id ON public.follows (follower_id);
CREATE INDEX idx_follows_following_id ON public.follows (following_id);
CREATE INDEX idx_follows_created_at ON public.follows (created_at);

CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES public.tracks (id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.comments (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_user_id ON public.comments (user_id);
CREATE INDEX idx_comments_track_id ON public.comments (track_id);
CREATE INDEX idx_comments_parent_id ON public.comments (parent_id);
CREATE INDEX idx_comments_created_at ON public.comments (created_at);

CREATE TABLE public.play_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES public.tracks (id) ON DELETE CASCADE,
  played_at timestamptz NOT NULL DEFAULT now(),
  duration integer,
  completed boolean NOT NULL DEFAULT false,
  source text,
  playlist_id uuid REFERENCES public.playlists (id) ON DELETE SET NULL
);

CREATE INDEX idx_play_history_user_id ON public.play_history (user_id);
CREATE INDEX idx_play_history_track_id ON public.play_history (track_id);
CREATE INDEX idx_play_history_played_at ON public.play_history (played_at);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.users (id) ON DELETE SET NULL,
  entity_id text,
  entity_type text,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications (is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications (created_at);

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  entity_id text NOT NULL,
  entity_type text NOT NULL,
  reason text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES public.users (id)
);

CREATE INDEX idx_reports_reporter_id ON public.reports (reporter_id);
CREATE INDEX idx_reports_entity_id ON public.reports (entity_id);
CREATE INDEX idx_reports_status ON public.reports (status);
CREATE INDEX idx_reports_created_at ON public.reports (created_at);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users (id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  metadata jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs (user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs (entity);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at);

CREATE TABLE public.track_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES public.tracks (id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags (id) ON DELETE CASCADE,
  CONSTRAINT track_tags_track_id_tag_id_key UNIQUE (track_id, tag_id)
);

CREATE INDEX idx_track_tags_track_id ON public.track_tags (track_id);
CREATE INDEX idx_track_tags_tag_id ON public.track_tags (tag_id);
