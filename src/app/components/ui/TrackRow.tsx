import { useState } from "react";
import { toast } from "sonner";
import { ListMinus, Trash2 } from "lucide-react";
import { Track } from "../../context/MusicContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useLibrary } from "../../context/LibraryContext";
import { FavoriteButton } from "./FavoriteButton";
import { AddToPlaylistMenu } from "./AddToPlaylistMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./tooltip";

// ── Equalizer animation bars ──
function EqualizerBars() {
  return (
    <div className="flex items-end gap-[2px]" style={{ width: "14px", height: "14px" }}>
      <div
        className="bg-[#ff164c]"
        style={{ width: "4px", height: "14px", animation: "barBounce 0.8s ease-in-out infinite alternate" }}
      />
      <div
        className="bg-[#ff164c]"
        style={{ width: "4px", height: "8px", animation: "barBounce 0.6s ease-in-out infinite alternate 0.2s" }}
      />
      <div
        className="bg-[#ff164c]"
        style={{ width: "4px", height: "11px", animation: "barBounce 0.9s ease-in-out infinite alternate 0.1s" }}
      />
    </div>
  );
}

// ── Track Row ──
interface TrackRowProps {
  track: Track;
  index: number;
  isPlaying: boolean;
  onClick: () => void;
  showAlbum?: boolean;
  showDuration?: boolean;
  showFavorites?: boolean;
  showAddToPlaylist?: boolean;
  /** Na página da playlist: mostra remover desta lista em vez de adicionar a outra. */
  playlistContextId?: string;
  /** Perfil próprio: pedido de exclusão (confirmação fica no pai). */
  onRequestDeletePublished?: (track: Track) => void;
}

export function TrackRow({ 
  track, 
  index, 
  isPlaying, 
  onClick,
  showAlbum = true,
  showDuration = true,
  showFavorites = true,
  showAddToPlaylist = true,
  playlistContextId,
  onRequestDeletePublished,
}: TrackRowProps) {
  const { isFavorite: isFav, toggleFavorite } = useFavorites();
  const { removeTrackFromPlaylist } = useLibrary();
  const [isHovered, setIsHovered] = useState(false);
  const [removing, setRemoving] = useState(false);
  const favoriteActive = isFav(track.id);

  const showPlaylistActionsCol = Boolean(playlistContextId) || showAddToPlaylist;
  const showDeleteCol = Boolean(onRequestDeletePublished);

  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer transition-colors duration-150"
      style={{
        backgroundColor: isPlaying ? "rgba(255,22,76,0.08)" : isHovered ? "rgba(255,255,255,0.04)" : "transparent",
        borderBottom: "1px solid #30292b",
        border: isPlaying ? "1px solid #ff164c" : undefined,
      }}
    >
      {/* # / playing indicator */}
      <td className="px-4 py-4" style={{ width: "56px" }} title="Reproduzir">
        <div className="flex items-center justify-center" style={{ width: "24px" }}>
          {isPlaying ? (
            <EqualizerBars />
          ) : isHovered ? (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden>
              <path d="M1 1L11 7L1 13V1Z" fill="#ff164c" />
            </svg>
          ) : (
            <span
              className="font-semibold text-[14px] leading-[1.5]"
              style={{ color: "#a19a9b" }}
            >
              {index + 1}
            </span>
          )}
        </div>
      </td>

      {/* Título */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0" style={{ width: "48px", height: "48px" }}>
            <img
              src={track.image}
              alt={track.title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ border: `1px solid ${isPlaying ? "#ff164c" : "#30292b"}` }}
            />
          </div>
          <div className="min-w-0">
            <p
              className="font-semibold text-[14px] leading-[1.5] truncate"
              style={{ color: isPlaying ? "#ff164c" : "#f8f8f8" }}
            >
              {track.title}
            </p>
            <p className="text-[12px] leading-[1.25] truncate" style={{ color: "#bababa" }}>
              {track.artist}
            </p>
          </div>
        </div>
      </td>

      {/* Álbum */}
      {showAlbum && (
        <td className="px-4 py-4 hidden sm:table-cell">
          <p className="font-semibold text-[14px] leading-[1.5] truncate" style={{ color: "#bababa" }}>
            {track.album || "—"}
          </p>
        </td>
      )}

      {/* Tempo */}
      {showDuration && (
        <td className="px-4 py-4 text-center hidden sm:table-cell">
          <p className="font-semibold text-[14px] leading-[1.5]" style={{ color: "#bababa" }}>
            {track.duration || "—"}
          </p>
        </td>
      )}

      {/* Adicionar a outra playlist ou remover desta */}
      {showPlaylistActionsCol && (
        <td className="px-4 py-4 w-14" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center">
            {playlistContextId ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <button
                      type="button"
                      disabled={removing}
                      className="shrink-0 flex items-center justify-center w-9 h-9 rounded-md text-[#a19a9b] hover:text-[#ff164c] hover:bg-white/5 transition-colors disabled:opacity-40"
                      title="Remover desta playlist"
                      aria-label="Remover desta playlist"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRemoving(true);
                        void removeTrackFromPlaylist(playlistContextId, track.id)
                          .then(() => {
                            toast.success("Faixa removida da playlist.");
                          })
                          .catch(() => {
                            toast.error("Não foi possível remover da playlist.");
                          })
                          .finally(() => setRemoving(false));
                      }}
                    >
                      <ListMinus className="w-4 h-4" />
                    </button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">Remover desta playlist</TooltipContent>
              </Tooltip>
            ) : showAddToPlaylist ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <AddToPlaylistMenu trackId={track.id} variant="inline" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">Adicionar à playlist</TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        </td>
      )}

      {/* Favoritos */}
      {showFavorites && (
        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <FavoriteButton
                    isFavorite={favoriteActive}
                    onToggle={() => toggleFavorite(track.id)}
                    size="sm"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                {favoriteActive ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              </TooltipContent>
            </Tooltip>
          </div>
        </td>
      )}

      {showDeleteCol && onRequestDeletePublished && (
        <td className="px-4 py-4 w-14" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <button
                    type="button"
                    className="shrink-0 flex items-center justify-center w-9 h-9 rounded-md text-[#a19a9b] hover:text-[#ff164c] hover:bg-white/5 transition-colors"
                    title="Excluir publicação"
                    aria-label="Excluir publicação"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestDeletePublished(track);
                    }}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden />
                  </button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">Excluir publicação</TooltipContent>
            </Tooltip>
          </div>
        </td>
      )}
    </tr>
  );
}

// ── Table Header ──
interface TrackTableHeaderProps {
  showAlbum?: boolean;
  showDuration?: boolean;
  showFavorites?: boolean;
  showAddToPlaylist?: boolean;
  playlistContextId?: string;
  showDeletePublished?: boolean;
}

export function TrackTableHeader({
  showAlbum = true,
  showDuration = true,
  showFavorites = true,
  showAddToPlaylist = true,
  playlistContextId,
  showDeletePublished = false,
}: TrackTableHeaderProps) {
  const showPlaylistActionsCol = Boolean(playlistContextId) || showAddToPlaylist;
  return (
    <thead>
      <tr style={{ borderBottom: "1px solid #30292b" }}>
        <th className="px-4 py-3 text-center" style={{ width: "56px" }}>
          <span
            className="font-semibold text-[12px] uppercase tracking-wide"
            style={{ color: "#a19a9b" }}
          >
            #
          </span>
        </th>
        <th className="px-4 py-3 text-left">
          <span
            className="font-semibold text-[12px] uppercase tracking-wide"
            style={{ color: "#a19a9b" }}
          >
            Título
          </span>
        </th>
        {showAlbum && (
          <th className="px-4 py-3 text-left hidden sm:table-cell">
            <span
              className="font-semibold text-[12px] uppercase tracking-wide"
              style={{ color: "#a19a9b" }}
            >
              Álbum
            </span>
          </th>
        )}
        {showDuration && (
          <th className="px-4 py-3 text-center hidden sm:table-cell">
            <span
              className="font-semibold text-[12px] uppercase tracking-wide"
              style={{ color: "#a19a9b" }}
            >
              Tempo
            </span>
          </th>
        )}
        {showPlaylistActionsCol && (
          <th className="px-4 py-3 text-center w-14">
            <span
              className="font-semibold text-[12px] uppercase tracking-wide"
              style={{ color: "#a19a9b" }}
            >
              {playlistContextId ? "Remover" : "+"}
            </span>
          </th>
        )}
        {showFavorites && (
          <th className="px-4 py-3 text-center">
            <span
              className="font-semibold text-[12px] uppercase tracking-wide"
              style={{ color: "#a19a9b" }}
            >
              Salvar
            </span>
          </th>
        )}
        {showDeletePublished && (
          <th className="px-4 py-3 text-center w-14">
            <span
              className="font-semibold text-[12px] uppercase tracking-wide"
              style={{ color: "#a19a9b" }}
            >
              Excluir
            </span>
          </th>
        )}
      </tr>
    </thead>
  );
}