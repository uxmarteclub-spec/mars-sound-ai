import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { DiscoverTrack, HomeCreator, PlaylistSummary, Track } from "../../types/music";
import type { UploadTrackPayload } from "../../types/upload";
import type { PlaylistData } from "../components/CreatePlaylistModal";
import imgPlaylistDefault from "figma:asset/a5fb4564c109688e9da55ace27c2a57ec585d299.png";
import { getSupabase } from "../../lib/supabaseClient";
import { useAuth } from "./AuthContext";
import {
  addTrackToPlaylistRow,
  removeTrackFromPlaylistRow,
  deletePlaylistRow,
  insertPlaylist,
  fetchRecentlyPlayedTracks,
  loadHomeFeed,
  loadLibraryRest,
  searchTracksRpc,
  updatePlaylistRow,
  uploadPlaylistCoverFile,
  uploadTrackWithStorage,
  deletePublishedTrackForUser,
  updatePublishedTrackRow,
  fetchGenres,
  createGenreViaRpc,
  resolveGenreId,
} from "../../services/supabase/libraryData";
import {
  mapGenreRpcError,
  validateGenreDisplayName,
} from "../../utils/genreContentPolicy";
import { visibilityFromIsPublic } from "../../services/supabase/mappers";

export type { PlaylistSummary as Playlist } from "../../types/music";

interface LibraryContextValue {
  discoverTracks: DiscoverTrack[];
  discoverCategories: readonly string[];
  homeEmAlta: Track[];
  homeRecentes: Track[];
  homeDestaques: Track[];
  homeCreators: HomeCreator[];
  myPublishedTracks: Track[];
  playlists: PlaylistSummary[];
  recentlyPlayed: Track[];
  playlistTracksById: Record<string, Track[]>;
  trackCatalog: Map<string, Track>;
  getTrackById: (id: string) => Track | undefined;
  /** True enquanto o feed da home (criadores + carrosseis) ainda carrega. */
  homeFeedLoading: boolean;
  /** True enquanto descobrir, playlists e histórico ainda carregam. */
  libraryLoading: boolean;
  libraryError: string | null;
  refreshLibrary: () => Promise<void>;
  /** Atualiza só “tocadas recentemente” (ex.: após reproduzir uma faixa). */
  refreshRecentlyPlayed: () => Promise<void>;
  searchPublishedTracks: (query: string) => Promise<DiscoverTrack[]>;
  createPlaylist: (data: PlaylistData) => void;
  updatePlaylist: (id: string, data: PlaylistData) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  appendUploadedTrack: (payload: UploadTrackPayload) => Promise<Track>;
  /** Cria género no Supabase e atualiza opções de categoria na UI. */
  createGenre: (displayName: string) => Promise<string>;
  /** Apaga faixa publicada do utilizador (BD + Storage best-effort) e recarrega a biblioteca. */
  deletePublishedTrack: (track: Track) => Promise<void>;
  /** Atualiza título/álbum da faixa publicada (RLS: dono). */
  updatePublishedTrack: (
    trackId: string,
    patch: { title: string; album: string | null }
  ) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextValue | undefined>(
  undefined
);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [discoverTracks, setDiscoverTracks] = useState<DiscoverTrack[]>([]);
  const [homeEmAlta, setHomeEmAlta] = useState<Track[]>([]);
  const [homeRecentes, setHomeRecentes] = useState<Track[]>([]);
  const [homeDestaques, setHomeDestaques] = useState<Track[]>([]);
  const [homeCreators, setHomeCreators] = useState<HomeCreator[]>([]);
  const [myPublishedTracks, setMyPublishedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [playlistTracksById, setPlaylistTracksById] = useState<
    Record<string, Track[]>
  >({});
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [homeFeedLoading, setHomeFeedLoading] = useState(true);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [genresCache, setGenresCache] = useState<Awaited<
    ReturnType<typeof fetchGenres>
  > | null>(null);
  const [discoverCategoryOptions, setDiscoverCategoryOptions] = useState<
    string[]
  >(["Todos"]);

  const refreshLibrary = useCallback(async () => {
    if (!user?.id) return;
    const sb = getSupabase();
    if (!sb) return;
    setHomeFeedLoading(true);
    setLibraryLoading(true);
    setLibraryError(null);
    try {
      const home = await loadHomeFeed(sb, user.id);
      setHomeEmAlta(home.homeEmAlta);
      setHomeRecentes(home.homeRecentes);
      setHomeDestaques(home.homeDestaques);
      setHomeCreators(home.homeCreators);
      setHomeFeedLoading(false);

      await new Promise<void>((resolve, reject) => {
        const run = () => {
          void loadLibraryRest(sb, user.id)
            .then((rest) => {
              setDiscoverTracks(rest.discoverTracks);
              setMyPublishedTracks(rest.myPublishedTracks);
              setPlaylists(rest.playlists);
              setPlaylistTracksById(rest.playlistTracksById);
              setRecentlyPlayed(rest.recentlyPlayed);
              setDiscoverCategoryOptions(rest.discoverCategories);
              setGenresCache(rest.genres);
              resolve();
            })
            .catch(reject);
        };
        if (typeof requestIdleCallback !== "undefined") {
          requestIdleCallback(() => run(), { timeout: 2000 });
        } else {
          setTimeout(run, 0);
        }
      });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Não foi possível carregar os dados.";
      setLibraryError(msg);
    } finally {
      setHomeFeedLoading(false);
      setLibraryLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setHomeFeedLoading(false);
      setLibraryLoading(false);
      return;
    }
    void refreshLibrary();
  }, [user?.id, refreshLibrary]);

  const refreshRecentlyPlayed = useCallback(async () => {
    if (!user?.id) return;
    const sb = getSupabase();
    if (!sb) return;
    try {
      const list = await fetchRecentlyPlayedTracks(sb, user.id);
      setRecentlyPlayed(list);
    } catch {
      /* não bloquear o player */
    }
  }, [user?.id]);

  const discoverCategories = useMemo(
    () => discoverCategoryOptions as readonly string[],
    [discoverCategoryOptions]
  );

  const searchPublishedTracks = useCallback(async (query: string) => {
    const sb = getSupabase();
    if (!sb) return [];
    try {
      return await searchTracksRpc(sb, query);
    } catch {
      return [];
    }
  }, []);

  const createGenre = useCallback(async (displayName: string) => {
    const validated = validateGenreDisplayName(displayName);
    if (!validated.ok) {
      throw new Error(validated.message);
    }
    const sb = getSupabase();
    if (!sb) throw new Error("Cliente indisponível");
    const result = await createGenreViaRpc(sb, validated.name);
    if (!result.ok) {
      throw new Error(mapGenreRpcError(result.error));
    }
    const g = await fetchGenres(sb);
    setGenresCache(g);
    const names = g
      .map((x) => x.name)
      .sort((a, b) => a.localeCompare(b, "pt"));
    setDiscoverCategoryOptions(["Todos", ...names]);
    return result.name;
  }, []);

  const trackCatalog = useMemo(() => {
    const m = new Map<string, Track>();
    const add = (t: Track) => {
      m.set(t.id, t);
    };
    discoverTracks.forEach((dt) => {
      const { category: _c, ...rest } = dt;
      add(rest as Track);
    });
    homeEmAlta.forEach(add);
    homeRecentes.forEach(add);
    homeDestaques.forEach(add);
    myPublishedTracks.forEach(add);
    recentlyPlayed.forEach(add);
    for (const tracks of Object.values(playlistTracksById)) {
      tracks.forEach(add);
    }
    return m;
  }, [
    discoverTracks,
    playlistTracksById,
    homeEmAlta,
    homeRecentes,
    homeDestaques,
    myPublishedTracks,
    recentlyPlayed,
  ]);

  const getTrackById = useCallback(
    (id: string) => trackCatalog.get(id),
    [trackCatalog]
  );

  const createPlaylist = useCallback(
    (data: PlaylistData) => {
      if (!user?.id) return;
      const sb = getSupabase();
      if (!sb) return;
      void (async () => {
        try {
          const row = await insertPlaylist(
            sb,
            user.id,
            data.name,
            data.description,
            visibilityFromIsPublic(data.isPublic)
          );
          let next = row;
          if (data.coverFile) {
            const url = await uploadPlaylistCoverFile(
              sb,
              user.id,
              row.id,
              data.coverFile
            );
            next = await updatePlaylistRow(sb, row.id, {
              name: data.name,
              description: data.description,
              visibility: visibilityFromIsPublic(data.isPublic),
              cover_image: url,
            });
          }
          setPlaylists((prev) => [next, ...prev]);
          setPlaylistTracksById((prev) => ({ ...prev, [row.id]: [] }));
        } catch {
          setLibraryError("Não foi possível criar a playlist.");
        }
      })();
    },
    [user?.id]
  );

  const updatePlaylist = useCallback(
    (id: string, data: PlaylistData) => {
      const sb = getSupabase();
      if (!sb || !user?.id) return;
      void (async () => {
        try {
          let coverPatch: string | undefined;
          if (data.coverFile) {
            coverPatch = await uploadPlaylistCoverFile(
              sb,
              user.id,
              id,
              data.coverFile
            );
          } else {
            const image = data.coverImage?.trim();
            coverPatch =
              image && image.startsWith("http") ? image : undefined;
          }
          const row = await updatePlaylistRow(sb, id, {
            name: data.name,
            description: data.description,
            visibility: visibilityFromIsPublic(data.isPublic),
            cover_image: coverPatch,
          });
          setPlaylists((prev) => prev.map((p) => (p.id === id ? row : p)));
        } catch {
          setLibraryError("Não foi possível atualizar a playlist.");
        }
      })();
    },
    [user?.id]
  );

  const deletePlaylist = useCallback((id: string) => {
    const sb = getSupabase();
    if (!sb) return;
    void (async () => {
      try {
        await deletePlaylistRow(sb, id);
        setPlaylists((prev) => prev.filter((p) => p.id !== id));
        setPlaylistTracksById((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } catch {
        setLibraryError("Não foi possível eliminar a playlist.");
      }
    })();
  }, []);

  const addTrackToPlaylist = useCallback(
    async (playlistId: string, trackId: string) => {
      const sb = getSupabase();
      if (!sb) throw new Error("Cliente indisponível");
      await addTrackToPlaylistRow(sb, playlistId, trackId);
      await refreshLibrary();
    },
    [refreshLibrary]
  );

  const removeTrackFromPlaylist = useCallback(
    async (playlistId: string, trackId: string) => {
      const sb = getSupabase();
      if (!sb) throw new Error("Cliente indisponível");
      await removeTrackFromPlaylistRow(sb, playlistId, trackId);
      await refreshLibrary();
    },
    [refreshLibrary]
  );

  const deletePublishedTrack = useCallback(
    async (track: Track) => {
      const sb = getSupabase();
      if (!sb) throw new Error("Cliente indisponível");
      await deletePublishedTrackForUser(
        sb,
        track.id,
        track.audioUrl,
        track.image
      );
      await refreshLibrary();
    },
    [refreshLibrary]
  );

  const updatePublishedTrack = useCallback(
    async (trackId: string, patch: { title: string; album: string | null }) => {
      const sb = getSupabase();
      if (!sb) throw new Error("Cliente indisponível");
      await updatePublishedTrackRow(sb, trackId, patch);
      await refreshLibrary();
    },
    [refreshLibrary]
  );

  const appendUploadedTrack = useCallback(
    async (payload: UploadTrackPayload) => {
      if (!user?.id) throw new Error("Sessão inválida");
      if (!payload.audioFile) {
        throw new Error("É necessário um ficheiro de áudio.");
      }
      const sb = getSupabase();
      if (!sb) throw new Error("Cliente Supabase indisponível");
      let g = genresCache;
      if (!g?.length) {
        g = await fetchGenres(sb);
        setGenresCache(g);
      }
      const genreId = await resolveGenreId(sb, payload.category, g);
      if (!genreId) throw new Error("Género inválido");
      const row = await uploadTrackWithStorage({
        sb,
        userId: user.id,
        audioFile: payload.audioFile,
        coverFile: payload.coverFile ?? null,
        title: payload.title,
        genreId,
        moods: payload.tags ?? [],
        aiModel: payload.aiGenerator,
        aiPrompt: payload.prompt,
        publish: true,
        album: payload.album?.trim() ? payload.album.trim() : null,
      });
      await refreshLibrary();
      const { category: _c, ...asTrack } = row;
      return asTrack as Track;
    },
    [user?.id, genresCache, refreshLibrary]
  );

  const value = useMemo<LibraryContextValue>(
    () => ({
      discoverTracks,
      discoverCategories,
      homeEmAlta,
      homeRecentes,
      homeDestaques,
      homeCreators,
      myPublishedTracks,
      playlists,
      recentlyPlayed,
      playlistTracksById,
      trackCatalog,
      getTrackById,
      homeFeedLoading,
      libraryLoading,
      libraryError,
      refreshLibrary,
      refreshRecentlyPlayed,
      searchPublishedTracks,
      createPlaylist,
      updatePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      appendUploadedTrack,
      createGenre,
      deletePublishedTrack,
      updatePublishedTrack,
    }),
    [
      discoverTracks,
      discoverCategories,
      homeEmAlta,
      homeRecentes,
      homeDestaques,
      homeCreators,
      myPublishedTracks,
      playlists,
      recentlyPlayed,
      playlistTracksById,
      trackCatalog,
      getTrackById,
      homeFeedLoading,
      libraryLoading,
      libraryError,
      refreshLibrary,
      refreshRecentlyPlayed,
      searchPublishedTracks,
      createPlaylist,
      updatePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      appendUploadedTrack,
      createGenre,
      deletePublishedTrack,
      updatePublishedTrack,
    ]
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}
