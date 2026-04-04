import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DiscoverTrack,
  HomeCreator,
  PlaylistSummary,
  Track,
} from "../../types/music";
import {
  playlistRowToSummary,
  rowToDiscoverTrack,
  rowToTrack,
  type TrackRow,
} from "./mappers";

/** Colunas de faixa para PostgREST (uma linha para reutilizar em selects aninhados). */
export const TRACK_SELECT =
  "id, title, artist, audio_url, image_url, duration, album, play_count, status, user_id, published_at, created_at, genre:genres(name)";

export type GenreOption = { id: string; name: string; slug: string };

const CATEGORY_ALIASES: Record<string, string> = {
  eletrônica: "Electronic",
  eletronica: "Electronic",
  "hip-hop": "Hip-hop",
  hiphop: "Hip-hop",
  "r&b": "Pop",
  classica: "Clássica",
  classical: "Clássica",
};

export async function fetchGenres(sb: SupabaseClient): Promise<GenreOption[]> {
  const { data, error } = await sb
    .from("genres")
    .select("id, name, slug")
    .order("name");
  if (error) throw error;
  return (data ?? []) as GenreOption[];
}

export async function resolveGenreId(
  sb: SupabaseClient,
  categoryLabel: string | undefined,
  genres: GenreOption[]
): Promise<string> {
  const raw = categoryLabel?.trim();
  if (raw) {
    const mapped = CATEGORY_ALIASES[raw.toLowerCase()] ?? raw;
    const exact = genres.find(
      (g) => g.name.toLowerCase() === mapped.toLowerCase()
    );
    if (exact) return exact.id;
    const { data } = await sb
      .from("genres")
      .select("id")
      .ilike("name", `%${mapped}%`)
      .limit(1)
      .maybeSingle();
    if (data?.id) return data.id as string;
  }
  const pop = genres.find((g) => g.slug === "pop");
  return pop?.id ?? genres[0]?.id ?? "";
}

function mapTrackRows(rows: unknown): TrackRow[] {
  if (!Array.isArray(rows)) return [];
  return rows as TrackRow[];
}

export type LoadedLibrary = {
  discoverTracks: DiscoverTrack[];
  homeEmAlta: Track[];
  homeRecentes: Track[];
  homeDestaques: Track[];
  homeCreators: HomeCreator[];
  myPublishedTracks: Track[];
  playlists: PlaylistSummary[];
  playlistTracksById: Record<string, Track[]>;
  recentlyPlayed: Track[];
  discoverCategories: string[];
};

const CREATOR_FALLBACK =
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600";

export async function fetchTopCreators(
  sb: SupabaseClient,
  limit = 12
): Promise<HomeCreator[]> {
  const { data, error } = await sb
    .from("users")
    .select("id, name, username, avatar, cover_image")
    .eq("is_public", true)
    .order("total_followers", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: Record<string, string | null>) => ({
    id: row.id as string,
    name: (row.name as string) || "Criador",
    handle: `@${(row.username as string) || "user"}`,
    bgImage:
      (row.cover_image as string)?.trim() ||
      (row.avatar as string)?.trim() ||
      CREATOR_FALLBACK,
    overlayImage: (row.cover_image as string)?.trim()
      ? ((row.avatar as string)?.trim() ?? undefined)
      : undefined,
  }));
}

export type PublicUserProfileRow = {
  name: string;
  username: string;
  bio: string | null;
  avatar: string | null;
  cover_image: string | null;
  total_followers: number;
  total_following: number;
  is_public: boolean;
  favorite_genres: string[];
  favorite_moods: string[];
};

/** Perfil público para ecrã de utilizador. */
export async function fetchUserProfileRow(
  sb: SupabaseClient,
  userId: string
): Promise<PublicUserProfileRow | null> {
  const { data, error } = await sb
    .from("users")
    .select(
      "name, username, bio, avatar, cover_image, total_followers, total_following, is_public, favorite_genres, favorite_moods"
    )
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as PublicUserProfileRow | null) ?? null;
}

export async function fetchPublishedTracksForUser(
  sb: SupabaseClient,
  userId: string
): Promise<Track[]> {
  const { data, error } = await sb
    .from("tracks")
    .select(TRACK_SELECT)
    .eq("user_id", userId)
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(80);
  if (error) throw error;
  return mapTrackRows(data).map(rowToTrack);
}

export async function addTrackToPlaylistRow(
  sb: SupabaseClient,
  playlistId: string,
  trackId: string
): Promise<void> {
  const { data: maxRows, error: maxErr } = await sb
    .from("playlist_tracks")
    .select("position")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: false })
    .limit(1);
  if (maxErr) throw maxErr;
  const nextPos =
    maxRows && maxRows.length > 0 && typeof maxRows[0].position === "number"
      ? (maxRows[0].position as number) + 1
      : 0;
  const { error } = await sb.from("playlist_tracks").insert({
    playlist_id: playlistId,
    track_id: trackId,
    position: nextPos,
  });
  if (error) throw error;
}

export type HomeFeedSnapshot = Pick<
  LoadedLibrary,
  "homeEmAlta" | "homeRecentes" | "homeDestaques" | "homeCreators"
>;

/** Dados só para a home: pedidos em paralelo e limites baixos. */
export async function loadHomeFeed(
  sb: SupabaseClient,
  _userId: string
): Promise<HomeFeedSnapshot> {
  const creatorsPromise = fetchTopCreators(sb, 12).catch(
    () => [] as HomeCreator[]
  );
  const pubRecentPromise = sb
    .from("tracks")
    .select(TRACK_SELECT)
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(72);
  const pubTrendingPromise = sb
    .from("tracks")
    .select(TRACK_SELECT)
    .eq("status", "PUBLISHED")
    .order("play_count", { ascending: false })
    .limit(72);
  const weekRpcPromise = sb.rpc("get_top_tracks_this_week", {
    limit_param: 12,
  });

  const [homeCreators, pubRecentRes, pubTrendingRes, weekRpcRes] =
    await Promise.all([
      creatorsPromise,
      pubRecentPromise,
      pubTrendingPromise,
      weekRpcPromise,
    ]);

  if (pubRecentRes.error) throw pubRecentRes.error;
  if (pubTrendingRes.error) throw pubTrendingRes.error;
  if (weekRpcRes.error) throw weekRpcRes.error;

  const pubRecentRows = mapTrackRows(pubRecentRes.data);
  const pubTrendingRows = mapTrackRows(pubTrendingRes.data);

  const byRecent = [...pubRecentRows].sort((a, b) => {
    const ta = new Date(a.published_at ?? a.created_at ?? 0).getTime();
    const tb = new Date(b.published_at ?? b.created_at ?? 0).getTime();
    return tb - ta;
  });
  const homeRecentes = byRecent.slice(0, 12).map(rowToTrack);

  const byPlay = [...pubTrendingRows].sort(
    (a, b) => (b.play_count ?? 0) - (a.play_count ?? 0)
  );
  const homeEmAlta = byPlay.slice(0, 12).map(rowToTrack);

  const weekIds = (weekRpcRes.data ?? []).map(
    (r: { id: string }) => r.id
  ) as string[];
  let homeDestaques: Track[] = [];
  if (weekIds.length > 0) {
    const { data: weekTracks, error: wtErr } = await sb
      .from("tracks")
      .select(TRACK_SELECT)
      .in("id", weekIds);
    if (wtErr) throw wtErr;
    const rowById = new Map(
      mapTrackRows(weekTracks).map((r) => [r.id, r] as const)
    );
    homeDestaques = weekIds
      .map((id) => rowById.get(id))
      .filter(Boolean)
      .map((r) => rowToTrack(r!));
  }
  if (homeDestaques.length === 0) {
    homeDestaques = byPlay.slice(0, 8).map(rowToTrack);
  }

  return {
    homeEmAlta,
    homeRecentes,
    homeDestaques,
    homeCreators,
  };
}

export type LibraryRestSnapshot = Omit<LoadedLibrary, keyof HomeFeedSnapshot> & {
  genres: GenreOption[];
};

/** Descobrir, playlists, histórico e géneros — em paralelo após o feed da home. */
export async function loadLibraryRest(
  sb: SupabaseClient,
  userId: string
): Promise<LibraryRestSnapshot> {
  const genresPromise = fetchGenres(sb);
  const publishedPromise = sb
    .from("tracks")
    .select(TRACK_SELECT)
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false })
    .limit(120);
  const draftsPromise = sb
    .from("tracks")
    .select(TRACK_SELECT)
    .eq("user_id", userId)
    .eq("status", "DRAFT")
    .order("updated_at", { ascending: false })
    .limit(50);
  const minePromise = sb
    .from("tracks")
    .select(TRACK_SELECT)
    .eq("user_id", userId)
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(40);
  const playlistsPromise = sb
    .from("playlists")
    .select(
      "id, name, description, cover_image, visibility, track_count, total_duration"
    )
    .order("updated_at", { ascending: false });
  const ptPromise = sb
    .from("playlist_tracks")
    .select(`playlist_id, position, track:tracks(${TRACK_SELECT})`)
    .order("position");
  const histPromise = sb
    .from("play_history")
    .select(`played_at, track:tracks(${TRACK_SELECT})`)
    .eq("user_id", userId)
    .order("played_at", { ascending: false })
    .limit(24);

  const [
    genres,
    pubRes,
    draftsRes,
    mineRes,
    plRes,
    ptRes,
    histRes,
  ] = await Promise.all([
    genresPromise,
    publishedPromise,
    draftsPromise,
    minePromise,
    playlistsPromise,
    ptPromise,
    histPromise,
  ]);

  if (pubRes.error) throw pubRes.error;
  if (draftsRes.error) throw draftsRes.error;
  if (mineRes.error) throw mineRes.error;
  if (plRes.error) throw plRes.error;
  if (ptRes.error) throw ptRes.error;
  if (histRes.error) throw histRes.error;

  const categoryNames = ["Todos", ...genres.map((g) => g.name)];

  const pubRows = mapTrackRows(pubRes.data);
  const draftRows = mapTrackRows(draftsRes.data);
  const seen = new Set<string>();
  const mergedRows: TrackRow[] = [];
  for (const r of [...draftRows, ...pubRows]) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    mergedRows.push(r);
  }
  const discoverTracks = mergedRows.map(rowToDiscoverTrack);

  const myPublishedTracks = mapTrackRows(mineRes.data).map(rowToTrack);
  const playlists = (plRes.data ?? []).map(playlistRowToSummary);

  const playlistTracksById: Record<string, Track[]> = {};
  for (const p of playlists) {
    playlistTracksById[p.id] = [];
  }
  type PtRow = {
    playlist_id: string;
    position: number;
    track: TrackRow | TrackRow[] | null;
  };
  const sortedPt = [...(ptRes.data ?? [])] as PtRow[];
  sortedPt.sort((a, b) => a.position - b.position);
  for (const row of sortedPt) {
    const tr = row.track;
    const single = Array.isArray(tr) ? tr[0] : tr;
    if (!single?.id) continue;
    const list = playlistTracksById[row.playlist_id];
    if (!list) continue;
    if (single.status === "PUBLISHED" || single.user_id === userId) {
      list.push(rowToTrack(single as TrackRow & { user_id?: string }));
    }
  }

  const recentlyPlayed: Track[] = [];
  const histList = (histRes.data ?? []) as {
    track: TrackRow | TrackRow[] | null;
  }[];
  for (const h of histList) {
    const tr = h.track;
    const single = Array.isArray(tr) ? tr[0] : tr;
    if (single?.audio_url) {
      recentlyPlayed.push(rowToTrack(single));
    }
  }

  return {
    discoverTracks,
    myPublishedTracks,
    playlists,
    playlistTracksById,
    recentlyPlayed,
    discoverCategories: categoryNames,
    genres,
  };
}

/** Carga completa numa só chamada (ex.: testes ou refresh total). */
export async function loadLibraryForUser(
  sb: SupabaseClient,
  userId: string
): Promise<LoadedLibrary> {
  const [home, rest] = await Promise.all([
    loadHomeFeed(sb, userId),
    loadLibraryRest(sb, userId),
  ]);
  const { genres: _g, ...restLib } = rest;
  return { ...home, ...restLib };
}

export async function searchTracksRpc(
  sb: SupabaseClient,
  query: string
): Promise<DiscoverTrack[]> {
  const q = query.trim();
  if (!q) return [];
  const { data: found, error } = await sb.rpc("search_tracks", {
    search_query: q,
  });
  if (error) throw error;
  const ids = (found ?? []).map((r: { id: string }) => r.id) as string[];
  if (ids.length === 0) return [];
  const { data: rows, error: fe } = await sb
    .from("tracks")
    .select(TRACK_SELECT)
    .in("id", ids);
  if (fe) throw fe;
  const byId = new Map(mapTrackRows(rows).map((r) => [r.id, r] as const));
  return ids
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((r) => rowToDiscoverTrack(r!));
}

async function getAudioDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";
    const done = (n: number) => {
      URL.revokeObjectURL(url);
      resolve(n);
    };
    audio.onloadedmetadata = () => {
      const d = audio.duration;
      done(Number.isFinite(d) && d > 0 ? Math.round(d) : 0);
    };
    audio.onerror = () => done(0);
    audio.src = url;
  });
}

function extOf(file: File): string {
  const n = file.name.toLowerCase();
  if (n.endsWith(".wav")) return "wav";
  return "mp3";
}

const AVATAR_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

/** Upload para bucket `user-avatars` (path `userId/timestamp.ext`). */
export async function uploadUserAvatar(
  sb: SupabaseClient,
  userId: string,
  file: File
): Promise<string> {
  const raw = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const ext = AVATAR_EXT.has(raw) ? raw : "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await sb.storage.from("user-avatars").upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) throw error;
  const {
    data: { publicUrl },
  } = sb.storage.from("user-avatars").getPublicUrl(path);
  return publicUrl;
}

export async function uploadTrackWithStorage(params: {
  sb: SupabaseClient;
  userId: string;
  audioFile: File;
  coverFile: File | null;
  title: string;
  genreId: string;
  moods: string[];
  aiModel?: string;
  aiPrompt?: string;
  publish: boolean;
}): Promise<DiscoverTrack> {
  const {
    sb,
    userId,
    audioFile,
    coverFile,
    title,
    genreId,
    moods,
    aiModel,
    aiPrompt,
    publish,
  } = params;

  const ts = Date.now();
  const audioPath = `${userId}/${ts}-${audioFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error: aErr } = await sb.storage
    .from("audio-tracks")
    .upload(audioPath, audioFile, {
      cacheControl: "3600",
      upsert: false,
    });
  if (aErr) throw aErr;

  const {
    data: { publicUrl: audioUrl },
  } = sb.storage.from("audio-tracks").getPublicUrl(audioPath);

  let imageUrl =
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400";
  if (coverFile) {
    const coverPath = `${userId}/${ts}-cover-${coverFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: cErr } = await sb.storage
      .from("track-covers")
      .upload(coverPath, coverFile, {
        cacheControl: "3600",
        upsert: false,
      });
    if (cErr) throw cErr;
    const {
      data: { publicUrl },
    } = sb.storage.from("track-covers").getPublicUrl(coverPath);
    imageUrl = publicUrl;
  }

  const duration = await getAudioDurationSeconds(audioFile);
  const format = extOf(audioFile);

  const { data: row, error: iErr } = await sb
    .from("tracks")
    .insert({
      title: title.trim(),
      description: null,
      audio_url: audioUrl,
      image_url: imageUrl,
      duration: duration || 1,
      file_size: audioFile.size,
      format,
      artist: "Você",
      album: null,
      genre_id: genreId,
      moods: moods.length ? moods.map((m) => m.slice(0, 50)) : [],
      ai_model: aiModel?.trim() || null,
      ai_prompt: aiPrompt?.trim() || null,
      status: publish ? "PUBLISHED" : "DRAFT",
      user_id: userId,
      published_at: publish ? new Date().toISOString() : null,
    })
    .select(TRACK_SELECT)
    .single();
  if (iErr) throw iErr;
  return rowToDiscoverTrack(row as TrackRow);
}

export async function insertPlaylist(
  sb: SupabaseClient,
  userId: string,
  name: string,
  description: string,
  visibility: "PUBLIC" | "PRIVATE"
) {
  const { data, error } = await sb
    .from("playlists")
    .insert({
      name: name.trim(),
      description: description.trim() || null,
      visibility,
      user_id: userId,
    })
    .select(
      "id, name, description, cover_image, visibility, track_count, total_duration"
    )
    .single();
  if (error) throw error;
  return playlistRowToSummary(data as Parameters<typeof playlistRowToSummary>[0]);
}

export async function updatePlaylistRow(
  sb: SupabaseClient,
  playlistId: string,
  patch: {
    name: string;
    description: string;
    visibility: "PUBLIC" | "PRIVATE";
    cover_image?: string | null;
  }
) {
  const updatePayload: {
    name: string;
    description: string | null;
    visibility: "PUBLIC" | "PRIVATE";
    cover_image?: string | null;
  } = {
    name: patch.name.trim(),
    description: patch.description.trim() || null,
    visibility: patch.visibility,
  };
  if (patch.cover_image !== undefined) {
    updatePayload.cover_image = patch.cover_image;
  }
  const { data, error } = await sb
    .from("playlists")
    .update(updatePayload)
    .eq("id", playlistId)
    .select(
      "id, name, description, cover_image, visibility, track_count, total_duration"
    )
    .single();
  if (error) throw error;
  return playlistRowToSummary(data as Parameters<typeof playlistRowToSummary>[0]);
}

export async function deletePlaylistRow(sb: SupabaseClient, playlistId: string) {
  const { error } = await sb.from("playlists").delete().eq("id", playlistId);
  if (error) throw error;
}
