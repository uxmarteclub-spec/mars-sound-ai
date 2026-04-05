import { useMusicPlayer } from "../context/MusicContext";
import imgPlayerMusic from "figma:asset/a5fb4564c109688e9da55ace27c2a57ec585d299.png";
import { FavoriteButton } from "./ui/FavoriteButton";

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="8,4 20,12 8,20" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="3" width="4" height="18" rx="1.5" />
      <rect x="15" y="3" width="4" height="18" rx="1.5" />
    </svg>
  );
}

export function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    isFavorite,
    toggleFavorite,
    openFullscreen,
    audioLoading,
    audioError,
    clearAudioError,
  } = useMusicPlayer();

  if (!currentTrack) return null;

  const displayImage = currentTrack?.image || imgPlayerMusic;
  const displayTitle = currentTrack?.title || "";
  const displayArtist = currentTrack?.artist || "";

  return (
    /* Sits right above the 60px BottomNav */
    <div
      className="fixed bottom-[60px] left-0 right-0 z-[90] lg:hidden border-t border-[#30292b]"
      style={{
        backgroundColor: "#1c1315",
      }}
    >
      {/* Progress bar — very top edge of the player */}
      <div className="w-full h-[2px]" style={{ backgroundColor: "#3a3550" }}>
        <div
          className="h-full transition-all duration-300 ease-linear"
          style={{
            backgroundColor: "#ff164c",
            width: `${progress}%`,
          }}
        />
      </div>

      {audioError ? (
        <div className="px-3 py-1 flex items-center justify-between gap-2 text-[11px] text-[#ff8a9a] border-t border-white/10">
          <span className="truncate">{audioError}</span>
          <button type="button" onClick={clearAudioError} className="shrink-0 underline text-white/90">
            OK
          </button>
        </div>
      ) : null}

      {/* Main row */}
      <div className="flex items-center gap-3 px-3 py-2">
        {/* Album art — clicking opens fullscreen */}
        <button
          className="w-11 h-11 shrink-0 rounded overflow-hidden focus:outline-none active:scale-95 transition-transform"
          onClick={openFullscreen}
          aria-label="Abrir player"
        >
          <img
            src={displayImage}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
        </button>

        {/* Track info — clicking also opens fullscreen */}
        <button
          className="flex-1 min-w-0 text-left focus:outline-none active:opacity-70 transition-opacity"
          onClick={openFullscreen}
          aria-label="Abrir player"
        >
          <p
            className="truncate"
            style={{
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            {displayTitle}
          </p>
          <p
            className="truncate"
            style={{
              color: "#b3afc0",
              fontSize: "11px",
              lineHeight: 1.3,
            }}
          >
            {displayArtist}
          </p>
        </button>

        {/* Favorite button */}
        <div className="shrink-0">
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={toggleFavorite}
            size="sm"
          />
        </div>

        {/* Play / Pause — just toggles, never opens fullscreen */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="w-9 h-9 flex items-center justify-center shrink-0 focus:outline-none active:scale-90 transition-transform disabled:opacity-40"
          style={{ color: "#ffffff" }}
          disabled={audioLoading}
          aria-busy={audioLoading}
          aria-label={
            audioLoading ? "A carregar áudio" : isPlaying ? "Pausar" : "Reproduzir"
          }
        >
          {audioLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <PauseIcon />
          ) : (
            <PlayIcon />
          )}
        </button>
      </div>
    </div>
  );
}