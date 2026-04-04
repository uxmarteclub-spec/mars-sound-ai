import type { DiscoverTrack, PlaylistSummary, Track } from "../../types/music";

type GenreRow = { name: string } | { name: string }[] | null;

export type TrackRow = {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  image_url: string;
  duration: number;
  album: string | null;
  play_count?: number;
  status?: string;
  user_id?: string;
  published_at?: string | null;
  created_at?: string | null;
  genre?: GenreRow;
};

function genreName(g: GenreRow): string {
  if (!g) return "Outros";
  const row = Array.isArray(g) ? g[0] : g;
  return row?.name?.trim() || "Outros";
}

export function formatDurationSeconds(total: number): string {
  if (!Number.isFinite(total) || total < 0) return "0:00";
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatPlaylistDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "0 min";
  const m = Math.round(totalSeconds / 60);
  return `${m} min`;
}

export function rowToDiscoverTrack(row: TrackRow): DiscoverTrack {
  const category = genreName(row.genre);
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    image: row.image_url,
    audioUrl: row.audio_url,
    duration: formatDurationSeconds(row.duration),
    album: row.album ?? undefined,
    category,
  };
}

export function rowToTrack(row: TrackRow): Track {
  const { category: _, ...dt } = rowToDiscoverTrack(row);
  return dt;
}

export function playlistRowToSummary(row: {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  visibility: string;
  track_count: number;
  total_duration: number;
}): PlaylistSummary {
  const defaultImg =
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400";
  return {
    id: row.id,
    title: row.name,
    description: row.description ?? "",
    image: row.cover_image?.trim() || defaultImg,
    trackCount: row.track_count,
    duration: formatPlaylistDuration(row.total_duration),
    isPublic: row.visibility === "PUBLIC",
  };
}

export function visibilityFromIsPublic(isPublic: boolean): "PUBLIC" | "PRIVATE" {
  return isPublic ? "PUBLIC" : "PRIVATE";
}
