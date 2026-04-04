import { useMusicPlayer } from "../context/MusicContext";
import { FavoriteButton } from "./ui/FavoriteButton";
import imgPlayerMusic from "figma:asset/a5fb4564c109688e9da55ace27c2a57ec585d299.png";
import svgPaths from "../../imports/svg-1rskmayuh7";

function ChevronDownIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 33 33" fill="currentColor">
      <path d={svgPaths.p5cd5200} />
    </svg>
  );
}

function PrevIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 33 33" fill="currentColor">
      <path d={svgPaths.p9da1b80} />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="8,5 19,12 8,19" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="3" width="4" height="18" rx="1" />
      <rect x="15" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 33 33" fill="currentColor">
      <path d={svgPaths.p251da300} />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 33 33" fill="currentColor">
      <path d={svgPaths.pf5e8780} />
    </svg>
  );
}

export function FullScreenMobilePlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    setProgress,
    isFavorite,
    toggleFavorite,
    isFullscreenOpen,
    closeFullscreen,
    audioRef,
    playNext,
    playPrevious,
    shuffleOn,
    repeatMode,
    toggleShuffle,
    cycleRepeat,
    audioLoading,
    audioError,
    clearAudioError,
  } = useMusicPlayer();

  if (!isFullscreenOpen || !currentTrack) return null;

  const displayImage = currentTrack?.image || imgPlayerMusic;
  const displayTitle = currentTrack?.title || "";
  const displayArtist = currentTrack?.artist || "";

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getCurrentTime = () => {
    if (audioRef.current && audioRef.current.currentTime) {
      return formatTime(audioRef.current.currentTime);
    }
    return "0:00";
  };

  const getTotalTime = () => {
    if (audioRef.current && audioRef.current.duration) {
      return formatTime(audioRef.current.duration);
    }
    return "0:00";
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
  };

  return (
    <div
      className="fixed inset-0 z-[100] lg:hidden flex flex-col"
      style={{
        background: "linear-gradient(to bottom, #2d1f21 0%, #150f10 100%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={closeFullscreen}
          className="w-10 h-10 flex items-center justify-center text-white"
        >
          <ChevronDownIcon />
        </button>
        <div className="flex-1 text-center">
          <p className="text-white text-xs font-medium">A TOCAR DO SEU TELEFONE</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Album Art */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-[340px] aspect-square rounded-lg overflow-hidden shadow-2xl">
          <img src={displayImage} alt={displayTitle} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Track Info */}
      <div className="px-6 pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-white text-2xl font-bold truncate mb-1">
              {displayTitle}
            </h1>
            <p className="text-[#a19a9b] text-base truncate">
              {displayArtist}
            </p>
          </div>
          <div className="shrink-0 pt-1">
            <FavoriteButton
              isFavorite={isFavorite}
              onToggle={toggleFavorite}
              size="lg"
            />
          </div>
        </div>
      </div>

      {audioError ? (
        <div className="px-6 pb-2 flex items-center gap-3 text-sm text-[#ff8a9a]">
          <span className="flex-1 min-w-0">{audioError}</span>
          <button type="button" onClick={clearAudioError} className="shrink-0 underline text-white">
            Fechar
          </button>
        </div>
      ) : null}

      {/* Progress Bar */}
      <div className="px-6 pb-2">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleProgressChange}
          className="w-full h-1 bg-[#5b4f51] rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ff164c 0%, #ff164c ${progress}%, #5b4f51 ${progress}%, #5b4f51 100%)`,
          }}
        />
        <div className="flex justify-between mt-2 text-xs text-[#a19a9b]">
          <span>{getCurrentTime()}</span>
          <span>{getTotalTime()}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 pb-8">
        <div className="flex items-center justify-between mb-8">
          {/* Shuffle */}
          <button
            type="button"
            onClick={toggleShuffle}
            aria-pressed={shuffleOn}
            aria-label={shuffleOn ? "Desativar ordem aleatória" : "Ativar ordem aleatória"}
            className="w-8 h-8 flex items-center justify-center transition-colors"
            style={{ color: shuffleOn ? "#ff164c" : "#a19a9b" }}
          >
            <ShuffleIcon />
          </button>

          {/* Previous */}
          <button
            onClick={playPrevious}
            className="w-12 h-12 flex items-center justify-center text-white"
          >
            <PrevIcon />
          </button>

          {/* Play/Pause */}
          <button
            type="button"
            onClick={togglePlay}
            disabled={audioLoading}
            aria-busy={audioLoading}
            aria-label={
              audioLoading ? "A carregar áudio" : isPlaying ? "Pausar" : "Reproduzir"
            }
            className="w-16 h-16 rounded-full flex items-center justify-center bg-white disabled:opacity-60"
            style={{ color: "#150f10" }}
          >
            {audioLoading ? (
              <span className="inline-block w-7 h-7 border-2 border-[#150f10] border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <PauseIcon />
            ) : (
              <PlayIcon />
            )}
          </button>

          {/* Next */}
          <button
            onClick={playNext}
            className="w-12 h-12 flex items-center justify-center text-white"
          >
            <NextIcon />
          </button>

          {/* Repeat */}
          <button
            type="button"
            onClick={cycleRepeat}
            aria-label={
              repeatMode === "off"
                ? "Repetir desligado"
                : repeatMode === "all"
                  ? "Repetir fila"
                  : "Repetir uma faixa"
            }
            className="relative w-8 h-8 flex items-center justify-center transition-colors"
            style={{ color: repeatMode !== "off" ? "#ff164c" : "#a19a9b" }}
          >
            <RepeatIcon />
            {repeatMode === "one" && (
              <span
                className="absolute bottom-0 right-0 text-[7px] font-bold leading-none"
                style={{ color: "#ff164c" }}
              >
                1
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}