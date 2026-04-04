-- Applied to project ftezgnflagqhokwbkonw via Supabase MCP
CREATE TABLE public.genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  image text,
  color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT genres_name_key UNIQUE (name),
  CONSTRAINT genres_slug_key UNIQUE (slug)
);

CREATE INDEX idx_genres_slug ON public.genres (slug);

CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tags_name_key UNIQUE (name),
  CONSTRAINT tags_slug_key UNIQUE (slug)
);

CREATE INDEX idx_tags_slug ON public.tags (slug);

INSERT INTO public.genres (name, slug, color, description) VALUES
  ('Ambient', 'ambient', '#4A90E2', 'Atmospheric and relaxing soundscapes'),
  ('Pop', 'pop', '#FF6B9D', 'Catchy and mainstream music'),
  ('Rock', 'rock', '#E74C3C', 'Energetic guitar-driven music'),
  ('Gospel', 'gospel', '#F39C12', 'Spiritual and uplifting music'),
  ('Samba', 'samba', '#1ABC9C', 'Brazilian rhythmic music'),
  ('Clássica', 'classica', '#9B59B6', 'Orchestral and timeless compositions'),
  ('Jazz', 'jazz', '#3498DB', 'Improvisational and sophisticated'),
  ('Blues', 'blues', '#34495E', 'Soulful and emotional'),
  ('Country', 'country', '#E67E22', 'American folk music'),
  ('Reggae', 'reggae', '#27AE60', 'Jamaican rhythm and vibes'),
  ('Hip-hop', 'hip-hop', '#E74C3C', 'Urban beats and rap'),
  ('Electronic', 'electronic', '#8E44AD', 'Synthesized and digital sounds'),
  ('Metal', 'metal', '#2C3E50', 'Heavy and aggressive'),
  ('Opera', 'opera', '#C0392B', 'Classical vocal performance')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.tags (name, slug) VALUES
  ('chill', 'chill'),
  ('energetic', 'energetic'),
  ('romantic', 'romantic'),
  ('sad', 'sad'),
  ('happy', 'happy'),
  ('workout', 'workout'),
  ('focus', 'focus'),
  ('sleep', 'sleep'),
  ('party', 'party'),
  ('meditation', 'meditation')
ON CONFLICT (slug) DO NOTHING;
