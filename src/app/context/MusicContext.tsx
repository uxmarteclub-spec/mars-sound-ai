import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import type { Track } from "../../types/music";
import { useFavorites } from "./FavoritesContext";
import { notifyTrackPlaybackStarted } from "../../services/supabase/playerAnalytics";

export type { Track } from "../../types/music";

export type RepeatMode = "off" | "one" | "all";

const PLAYER_STORAGE_KEY = "mars-sound-player-state";
const PERSIST_DEBOUNCE_MS = 900;

type PersistedPlayerV1 = {
  v: 1;
  track: Track;
  queue: Track[];
  currentIndex: number;
  positionSeconds: number;
  volume: number;
  updatedAt: number;
};

function writePersistSnapshot(p: PersistedPlayerV1) {
  try {
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* quota / modo privado */
  }
}

function readPersistedPlayer(): PersistedPlayerV1 | null {
  try {
    const raw = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as PersistedPlayerV1;
    if (o.v !== 1 || !o.track?.audioUrl) return null;
    const q = Array.isArray(o.queue)
      ? o.queue.filter((x) => x && typeof x.audioUrl === "string")
      : [];
    if (q.length === 0) return null;
    return { ...o, queue: q };
  } catch {
    return null;
  }
}

function shuffleTracks(tracks: Track[]): Track[] {
  const arr = [...tracks];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface MusicContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  isMuted: boolean;
  isFavorite: boolean;
  isFullscreenOpen: boolean;
  queue: Track[];
  currentIndex: number;
  shuffleOn: boolean;
  repeatMode: RepeatMode;
  audioLoading: boolean;
  audioError: string | null;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFavorite: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  playNext: () => void;
  playPrevious: () => void;
  openFullscreen: () => void;
  closeFullscreen: () => void;
  clearAudioError: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const { isFavorite: isFavId, toggleFavorite: toggleFavId } = useFavorites();

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const queueRef = useRef<Track[]>([]);
  const sourceQueueRef = useRef<Track[]>([]);
  const currentIndexRef = useRef(-1);
  const currentTrackRef = useRef<Track | null>(null);
  const repeatModeRef = useRef<RepeatMode>("off");
  const shuffleOnRef = useRef(false);
  const volumeRef = useRef(70);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Evita persistir com refs antigos durante a hidratação inicial do player. */
  const suppressPersistRef = useRef(false);
  const didRestoreFromStorageRef = useRef(false);

  queueRef.current = queue;
  currentIndexRef.current = currentIndex;
  currentTrackRef.current = currentTrack;
  repeatModeRef.current = repeatMode;
  shuffleOnRef.current = shuffleOn;
  volumeRef.current = volume;

  const isFavorite = currentTrack ? isFavId(currentTrack.id) : false;

  const flushPersist = useCallback(() => {
    if (suppressPersistRef.current) return;
    const t = currentTrackRef.current;
    const audio = audioRef.current;
    if (!t?.audioUrl) return;
    const pos =
      audio && Number.isFinite(audio.currentTime) && audio.currentTime >= 0
        ? audio.currentTime
        : 0;
    writePersistSnapshot({
      v: 1,
      track: t,
      queue: queueRef.current,
      currentIndex: currentIndexRef.current,
      positionSeconds: pos,
      volume: volumeRef.current,
      updatedAt: Date.now(),
    });
  }, []);

  const schedulePersist = useCallback(() => {
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null;
      flushPersist();
    }, PERSIST_DEBOUNCE_MS);
  }, [flushPersist]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || didRestoreFromStorageRef.current) return;
    const saved = readPersistedPlayer();
    if (!saved) return;
    didRestoreFromStorageRef.current = true;
    suppressPersistRef.current = true;
    const idx = Math.min(
      Math.max(0, saved.currentIndex),
      saved.queue.length - 1
    );
    const track = saved.queue[idx];
    if (!track?.audioUrl) {
      suppressPersistRef.current = false;
      return;
    }
    setQueue(saved.queue);
    setCurrentTrack(track);
    setCurrentIndex(idx);
    setIsPlaying(false);
    if (
      typeof saved.volume === "number" &&
      saved.volume >= 0 &&
      saved.volume <= 100
    ) {
      setVolume(saved.volume);
    }
    setProgress(0);
    const pos = saved.positionSeconds ?? 0;
    audio.src = track.audioUrl;
    const onMeta = () => {
      const d = audio.duration;
      if (Number.isFinite(d) && d > 0) {
        const clamped = Math.min(Math.max(0, pos), Math.max(0, d - 0.25));
        audio.currentTime = clamped;
        setProgress((clamped / d) * 100);
      }
      suppressPersistRef.current = false;
      audio.removeEventListener("loadedmetadata", onMeta);
    };
    const onHydrateErr = () => {
      suppressPersistRef.current = false;
    };
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("error", onHydrateErr, { once: true });
  }, []);

  useEffect(() => {
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onUnload = () => flushPersist();
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [flushPersist]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadStart = () => {
      setAudioLoading(true);
      setAudioError(null);
    };
    const onCanPlay = () => setAudioLoading(false);
    const onError = () => {
      setAudioLoading(false);
      setAudioError("Não foi possível carregar o áudio. Verifique a ligação ou o ficheiro.");
      setIsPlaying(false);
    };

    audio.addEventListener("loadstart", onLoadStart);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("loadstart", onLoadStart);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
    };
  }, []);

  const goToTrackAtIndex = useCallback((index: number, q: Track[]) => {
    const t = q[index];
    if (!t || !audioRef.current) return;
    setAudioError(null);
    setCurrentTrack(t);
    setCurrentIndex(index);
    audioRef.current.src = t.audioUrl;
    audioRef.current.play().catch(() => {
      setIsPlaying(false);
      setAudioError("Não foi possível reproduzir esta faixa.");
    });
    setIsPlaying(true);
    setProgress(0);
    writePersistSnapshot({
      v: 1,
      track: t,
      queue: q,
      currentIndex: index,
      positionSeconds: 0,
      volume: volumeRef.current,
      updatedAt: Date.now(),
    });
    void notifyTrackPlaybackStarted(t.id);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(percent) ? 0 : percent);
      schedulePersist();
    };

    const onPausePersist = () => flushPersist();

    const handleEnded = () => {
      const q = queueRef.current;
      const idx = currentIndexRef.current;
      const rep = repeatModeRef.current;

      if (rep === "one" && q[idx]) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        setIsPlaying(true);
        setProgress(0);
        return;
      }

      setIsPlaying(false);
      setProgress(0);

      if (rep === "all" && q.length > 0) {
        const nextIdx = idx < q.length - 1 ? idx + 1 : 0;
        const next = q[nextIdx];
        if (next) {
          setCurrentTrack(next);
          setCurrentIndex(nextIdx);
          audio.src = next.audioUrl;
          audio.play().catch(() => {});
          setIsPlaying(true);
          setProgress(0);
          writePersistSnapshot({
            v: 1,
            track: next,
            queue: q,
            currentIndex: nextIdx,
            positionSeconds: 0,
            volume: volumeRef.current,
            updatedAt: Date.now(),
          });
          void notifyTrackPlaybackStarted(next.id);
        }
        return;
      }

      if (idx < q.length - 1) {
        const next = q[idx + 1];
        if (next) {
          const nextIdx = idx + 1;
          setCurrentTrack(next);
          setCurrentIndex(nextIdx);
          audio.src = next.audioUrl;
          audio.play().catch(() => {});
          setIsPlaying(true);
          setProgress(0);
          writePersistSnapshot({
            v: 1,
            track: next,
            queue: q,
            currentIndex: nextIdx,
            positionSeconds: 0,
            volume: volumeRef.current,
            updatedAt: Date.now(),
          });
          void notifyTrackPlaybackStarted(next.id);
        }
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("pause", onPausePersist);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("pause", onPausePersist);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [flushPersist, schedulePersist]);

  const playTrack = useCallback((track: Track, newQueue?: Track[]) => {
    if (!audioRef.current) return;
    const source = newQueue ?? [track];
    sourceQueueRef.current = source;
    const ordered = shuffleOnRef.current ? shuffleTracks(source) : source;
    const idx = ordered.findIndex((t) => t.id === track.id);
    const startIdx = idx >= 0 ? idx : 0;
    setQueue(ordered);
    setCurrentTrack(ordered[startIdx]);
    setCurrentIndex(startIdx);
    setAudioError(null);
    const el = audioRef.current;
    el.src = ordered[startIdx].audioUrl;
    el.play().catch(() => {
      setIsPlaying(false);
      setAudioError("Não foi possível reproduzir esta faixa.");
    });
    setIsPlaying(true);
    setProgress(0);
    writePersistSnapshot({
      v: 1,
      track: ordered[startIdx],
      queue: ordered,
      currentIndex: startIdx,
      positionSeconds: 0,
      volume: volumeRef.current,
      updatedAt: Date.now(),
    });
    void notifyTrackPlaybackStarted(ordered[startIdx].id);
  }, []);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleSetProgress = useCallback(
    (newProgress: number) => {
      if (audioRef.current && audioRef.current.duration) {
        const newTime = (newProgress / 100) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
        setProgress(newProgress);
        flushPersist();
      }
    },
    [flushPersist]
  );

  const handleSetVolume = useCallback(
    (v: number) => {
      setVolume(v);
      schedulePersist();
    },
    [schedulePersist]
  );

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFavorite = useCallback(() => {
    if (currentTrack) toggleFavId(currentTrack.id);
  }, [currentTrack, toggleFavId]);

  const toggleShuffle = useCallback(() => {
    setShuffleOn((prev) => {
      const src = sourceQueueRef.current;
      if (src.length === 0) return !prev;
      const cur = currentTrackRef.current;
      if (!prev) {
        const shuffled = shuffleTracks(src);
        setQueue(shuffled);
        if (cur) {
          const ni = shuffled.findIndex((t) => t.id === cur.id);
          if (ni >= 0) setCurrentIndex(ni);
        }
        return true;
      }
      setQueue([...src]);
      if (cur) {
        const ni = src.findIndex((t) => t.id === cur.id);
        if (ni >= 0) setCurrentIndex(ni);
      }
      return false;
    });
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  }, []);

  const playNext = useCallback(() => {
    const q = queueRef.current;
    const idx = currentIndexRef.current;
    if (idx < q.length - 1) {
      goToTrackAtIndex(idx + 1, q);
    } else if (repeatModeRef.current === "all" && q.length > 0) {
      goToTrackAtIndex(0, q);
    }
  }, [goToTrackAtIndex]);

  const playPrevious = useCallback(() => {
    const audio = audioRef.current;
    const q = queueRef.current;
    const idx = currentIndexRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setProgress(0);
      return;
    }
    if (idx > 0) {
      goToTrackAtIndex(idx - 1, q);
    }
  }, [goToTrackAtIndex]);

  const openFullscreen = useCallback(() => setIsFullscreenOpen(true), []);
  const closeFullscreen = useCallback(() => setIsFullscreenOpen(false), []);
  const clearAudioError = useCallback(() => setAudioError(null), []);

  const value = useMemo(
    () => ({
      currentTrack,
      isPlaying,
      progress,
      volume,
      isMuted,
      isFavorite,
      isFullscreenOpen,
      queue,
      currentIndex,
      shuffleOn,
      repeatMode,
      audioLoading,
      audioError,
      playTrack,
      togglePlay,
      setProgress: handleSetProgress,
      setVolume: handleSetVolume,
      toggleMute,
      toggleFavorite,
      toggleShuffle,
      cycleRepeat,
      playNext,
      playPrevious,
      openFullscreen,
      closeFullscreen,
      clearAudioError,
      audioRef,
    }),
    [
      currentTrack,
      isPlaying,
      progress,
      volume,
      isMuted,
      isFavorite,
      isFullscreenOpen,
      queue,
      currentIndex,
      shuffleOn,
      repeatMode,
      audioLoading,
      audioError,
      playTrack,
      togglePlay,
      handleSetProgress,
      handleSetVolume,
      toggleMute,
      toggleFavorite,
      toggleShuffle,
      cycleRepeat,
      playNext,
      playPrevious,
      openFullscreen,
      closeFullscreen,
      clearAudioError,
    ]
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio ref={audioRef} crossOrigin="anonymous" />
    </MusicContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusicPlayer must be used within a MusicProvider");
  }
  return context;
}
