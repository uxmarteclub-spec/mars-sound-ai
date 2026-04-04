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

  queueRef.current = queue;
  currentIndexRef.current = currentIndex;
  currentTrackRef.current = currentTrack;
  repeatModeRef.current = repeatMode;
  shuffleOnRef.current = shuffleOn;

  const isFavorite = currentTrack ? isFavId(currentTrack.id) : false;

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
    void notifyTrackPlaybackStarted(t.id);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(percent) ? 0 : percent);
    };

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
          void notifyTrackPlaybackStarted(next.id);
        }
        return;
      }

      if (idx < q.length - 1) {
        const next = q[idx + 1];
        if (next) {
          setCurrentTrack(next);
          setCurrentIndex(idx + 1);
          audio.src = next.audioUrl;
          audio.play().catch(() => {});
          setIsPlaying(true);
          setProgress(0);
          void notifyTrackPlaybackStarted(next.id);
        }
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

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

  const handleSetProgress = useCallback((newProgress: number) => {
    if (audioRef.current && audioRef.current.duration) {
      const newTime = (newProgress / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(newProgress);
    }
  }, []);

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
      setVolume,
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
