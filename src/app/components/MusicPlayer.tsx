import { useMusicPlayer } from "../context/MusicContext";
import imgPlayerMusic from "figma:asset/a5fb4564c109688e9da55ace27c2a57ec585d299.png";
import svgPaths from "../../imports/svg-1rskmayuh7";
import { FavoriteButton } from "./ui/FavoriteButton";
import { Slider } from "./ui/slider";
import { cn } from "./ui/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

function ShuffleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 33 33" fill="currentColor">
      <path d={svgPaths.p5cd5200} />
    </svg>
  );
}

function PrevIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 33 33" fill="currentColor">
      <path d={svgPaths.p9da1b80} />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="8,5 19,12 8,19" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="3" width="4" height="18" rx="1" />
      <rect x="15" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 33 33" fill="currentColor">
      <path d={svgPaths.p251da300} />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 33 33" fill="currentColor">
      <path d={svgPaths.pf5e8780} />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d={svgPaths.p2abb5600} />
    </svg>
  );
}

function VolumeMutedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

const sliderTrackStyles =
  "[&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:rounded-none [&_[data-slot=slider-track]]:bg-[#5b4f51] [&_[data-slot=slider-range]]:rounded-none [&_[data-slot=slider-range]]:bg-[#ff164c] [&_[data-slot=slider-thumb]]:size-2.5 [&_[data-slot=slider-thumb]]:border-[#ff164c] [&_[data-slot=slider-thumb]]:bg-[#1c1315]";

export function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    isFavorite,
    toggleFavorite,
    progress,
    setProgress,
    volume,
    setVolume,
    isMuted,
    toggleMute,
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

  const audioDuration =
    audioRef.current && Number.isFinite(audioRef.current.duration) && audioRef.current.duration > 0
      ? audioRef.current.duration
      : 0;

  const formatTime = (pct: number, durationSec: number) => {
    if (!durationSec) return "00:00";
    const currentSec = Math.round((pct / 100) * durationSec);
    const m = Math.floor(currentSec / 60);
    const s = currentSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getTotalTime = () => {
    if (audioDuration) {
      const m = Math.floor(audioDuration / 60);
      const s = Math.floor(audioDuration % 60);
      return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return "00:00";
  };

  const displayImage = currentTrack?.image || imgPlayerMusic;
  const displayTitle = currentTrack?.title || "Nada a reproduzir";
  const displayArtist = currentTrack?.artist || "—";
  const displayVolume = isMuted ? 0 : volume;
  const playDisabled = !currentTrack;

  return (
    <footer
      role="region"
      aria-label="Reprodutor de música"
      className="hidden lg:flex fixed bottom-0 left-0 right-0 z-[100] items-center gap-6 px-[37px] py-3 border-t border-[#30292b]"
      style={{
        backgroundColor: "#1c1315",
        width: "100%",
      }}
    >
      <div className="flex items-center gap-0 shrink-0">
        <div className="w-16 h-16 shrink-0 border border-[#30292b]">
          <img src={displayImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col px-[18px] py-3 min-w-[142px]">
          <p className="font-semibold text-[16px] leading-[1.5] truncate text-[#bababa]">
            {displayTitle}
          </p>
          <p className="text-[12px] leading-[1.25] text-[#bababa]">{displayArtist}</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <FavoriteButton isFavorite={isFavorite} onToggle={toggleFavorite} />
          </TooltipTrigger>
          <TooltipContent side="top">
            {isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
        {audioError ? (
          <div className="flex items-center gap-2 text-xs text-[#ff8a9a] max-w-full px-2">
            <span className="truncate">{audioError}</span>
            <button
              type="button"
              onClick={clearAudioError}
              className="shrink-0 underline text-[#f8f8f8] hover:opacity-80"
            >
              Fechar
            </button>
          </div>
        ) : null}
        <div className="flex items-center gap-7">
          <button
            type="button"
            onClick={toggleShuffle}
            aria-pressed={shuffleOn}
            aria-label={shuffleOn ? "Desativar ordem aleatória" : "Ativar ordem aleatória"}
            className="cursor-pointer transition-colors duration-150 w-[34px] h-[34px] flex items-center justify-center"
            style={{ color: shuffleOn ? "#ff164c" : "#a19a9b" }}
          >
            <ShuffleIcon />
          </button>

          <button
            type="button"
            onClick={playPrevious}
            className="cursor-pointer transition-colors duration-150 w-[34px] h-[34px] flex items-center justify-center hover:opacity-80"
            style={{ color: "#a19a9b" }}
            aria-label="Faixa anterior"
          >
            <PrevIcon />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            disabled={playDisabled}
            aria-busy={audioLoading}
            aria-label={
              audioLoading ? "A carregar áudio" : isPlaying ? "Pausar" : "Reproduzir"
            }
            className="w-[43px] h-[43px] flex items-center justify-center cursor-pointer transition-all duration-150 shrink-0 border disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--color-player-play-bg)",
              borderColor: "var(--color-player-play-bg)",
              color: "var(--color-player-play-icon)",
            }}
          >
            {audioLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-t-transparent rounded-full animate-spin border-[var(--color-player-play-icon)]" />
            ) : isPlaying ? (
              <PauseIcon />
            ) : (
              <PlayIcon />
            )}
          </button>

          <button
            type="button"
            onClick={playNext}
            className="cursor-pointer transition-colors duration-150 w-[34px] h-[34px] flex items-center justify-center hover:opacity-80"
            style={{ color: "#a19a9b" }}
            aria-label="Próxima faixa"
          >
            <NextIcon />
          </button>

          <button
            type="button"
            onClick={cycleRepeat}
            aria-label={
              repeatMode === "off"
                ? "Repetir desligado"
                : repeatMode === "all"
                  ? "Repetir fila ativo"
                  : "Repetir faixa atual"
            }
            className="relative cursor-pointer transition-colors duration-150 w-[34px] h-[34px] flex items-center justify-center"
            style={{ color: repeatMode !== "off" ? "#ff164c" : "#a19a9b" }}
          >
            <RepeatIcon />
            {repeatMode === "one" && (
              <span
                className="absolute bottom-1 right-1 text-[8px] font-bold leading-none"
                style={{ color: "#ff164c" }}
              >
                1
              </span>
            )}
          </button>
        </div>

        <div className="flex w-full max-w-[752px] items-center gap-[14px]">
          <span
            className="shrink-0 tabular-nums"
            style={{ color: "#a19a9b", fontSize: "13px", fontFamily: "Raleway, sans-serif", lineHeight: "1.7" }}
          >
            {formatTime(progress, audioDuration)}
          </span>
          <Slider
            value={[Math.min(100, Math.max(0, progress))]}
            max={100}
            step={0.25}
            disabled={playDisabled}
            onValueChange={(v) => setProgress(v[0] ?? 0)}
            aria-label="Posição na faixa"
            className={cn("flex-1 min-w-0 py-2", sliderTrackStyles)}
          />
          <span
            className="shrink-0 tabular-nums"
            style={{ color: "#a19a9b", fontSize: "13px", fontFamily: "Raleway, sans-serif", lineHeight: "1.7" }}
          >
            {getTotalTime()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Ativar som" : "Silenciar"}
          className="w-6 h-6 flex items-center justify-center cursor-pointer transition-colors duration-150 hover:opacity-80"
          style={{ color: isMuted ? "#ff164c" : "#5b4f51" }}
        >
          {displayVolume > 0 ? <VolumeIcon /> : <VolumeMutedIcon />}
        </button>
        <Slider
          value={[Math.min(100, Math.max(0, displayVolume))]}
          max={100}
          step={1}
          onValueChange={(v) => {
            const next = v[0] ?? 0;
            setVolume(next);
            if (isMuted && next > 0) toggleMute();
          }}
          aria-label="Volume"
          className={cn("w-[105px] shrink-0 py-2", sliderTrackStyles)}
        />
      </div>
    </footer>
  );
}
