import { useMusicPlayer, Track } from "../../context/MusicContext";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";
import { FavoriteButton } from "./FavoriteButton";
import { AddToPlaylistMenu } from "./AddToPlaylistMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./tooltip";

type QuickActionsMode = "always" | "othersOnly" | "never";

interface MusicCardProps {
  track: Track;
  variant?: "grid" | "list";
  showFavorite?: boolean;
  showAddToPlaylist?: boolean;
  /** Preferir `quickActionsMode` para alinhar com “só outro criador”. */
  quickActionsMode?: QuickActionsMode;
  className?: string;
  /** Fila para next/previous no player; ex.: lista filtrada da Descobrir */
  playbackQueue?: Track[];
}

export function MusicCard({
  track,
  variant = "grid",
  showFavorite = true,
  showAddToPlaylist = true,
  quickActionsMode = "always",
  className = "",
  playbackQueue,
}: MusicCardProps) {
  const { user } = useAuth();
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();
  const { isFavorite: isFav, toggleFavorite } = useFavorites();
  const isCurrentTrack = currentTrack?.id === track.id;
  const favoriteActive = isFav(track.id);

  const othersOnlyActive =
    Boolean(user?.id && track.ownerUserId && track.ownerUserId !== user.id) ||
    (!track.ownerUserId && Boolean(user?.id));
  const showPlaylistBtn =
    quickActionsMode !== "never" &&
    showAddToPlaylist &&
    (quickActionsMode === "always" ||
      (quickActionsMode === "othersOnly" && othersOnlyActive));
  const showFavBtn =
    quickActionsMode !== "never" &&
    showFavorite &&
    (quickActionsMode === "always" ||
      (quickActionsMode === "othersOnly" && othersOnlyActive));

  const handleClick = () => {
    playTrack(track, playbackQueue);
  };

  const playLabel =
    isCurrentTrack && isPlaying ? "Pausar reprodução" : "Reproduzir";

  const handleFavoriteToggle = () => {
    toggleFavorite(track.id);
  };

  if (variant === "list") {
    return (
      <div
        role="button"
        tabIndex={0}
        title={playLabel}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`group flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-150 hover:bg-white/5 border border-transparent hover:border-[#30292b] ${className}`}
      >
        {/* Thumbnail */}
        <div className="relative w-12 h-12 shrink-0 overflow-hidden rounded-md border border-[#30292b]">
          <img
            src={track.image}
            alt={track.title}
            className="w-full h-full object-cover"
          />
          {isCurrentTrack && isPlaying && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="flex gap-1">
                <div className="w-1 h-4 bg-[#ff164c] animate-pulse" style={{ animationDelay: "0ms" }} />
                <div className="w-1 h-4 bg-[#ff164c] animate-pulse" style={{ animationDelay: "150ms" }} />
                <div className="w-1 h-4 bg-[#ff164c] animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[#f8f8f8] font-semibold text-base truncate">
            {track.title}
          </p>
          <p className="text-[#a19a9b] text-sm truncate">{track.artist}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {showPlaylistBtn && (
            <AddToPlaylistMenu trackId={track.id} variant="inline" />
          )}
          {showFavBtn && (
            <Tooltip>
              <TooltipTrigger asChild>
                <FavoriteButton
                  isFavorite={favoriteActive}
                  onToggle={handleFavoriteToggle}
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                {favoriteActive ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div
      title={playLabel}
      onClick={handleClick}
      className={`group relative flex flex-col gap-3 cursor-pointer transition-all duration-150 ${className}`}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg border border-[#30292b] group-hover:border-[#ff164c]/50 transition-colors duration-150">
        <img
          src={track.image}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Playing indicator overlay */}
        {isCurrentTrack && isPlaying && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="flex gap-1">
              <div className="w-2 h-8 bg-[#ff164c] animate-pulse" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-8 bg-[#ff164c] animate-pulse" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-8 bg-[#ff164c] animate-pulse" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div
          className="absolute top-2 right-2 flex flex-col gap-2 items-end opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {showPlaylistBtn && <AddToPlaylistMenu trackId={track.id} />}
          {showFavBtn && (
            <div className="bg-black/70 rounded-full p-2 backdrop-blur-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <FavoriteButton
                    isFavorite={favoriteActive}
                    onToggle={handleFavoriteToggle}
                    size="sm"
                  />
                </TooltipTrigger>
                <TooltipContent side="left">
                  {favoriteActive ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <p className="text-[#f8f8f8] font-semibold text-sm truncate">
          {track.title}
        </p>
        <p className="text-[#a19a9b] text-xs truncate">{track.artist}</p>
      </div>
    </div>
  );
}
