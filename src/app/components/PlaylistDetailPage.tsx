import { useState, useMemo } from "react";
import { useMusicPlayer, Track } from "../context/MusicContext";
import { useLibrary } from "../context/LibraryContext";
import { TrackRow, TrackTableHeader } from "./ui/TrackRow";
import { ShareChannelsMenu } from "./ui/ShareChannelsMenu";
import type { Playlist } from "../context/LibraryContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Edit, Share2, Trash2 } from "lucide-react";
import { CreatePlaylistModal } from "./CreatePlaylistModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import imgFallback from "figma:asset/48a6e9ae994c060da347e19294ad8e9f9fa5358c.png";

interface PlaylistDetailPageProps {
  playlist?: Playlist | null;
  onBack?: () => void;
  onPlaylistDeleted?: () => void;
}

export function PlaylistDetailPage({
  playlist,
  onBack,
  onPlaylistDeleted,
}: PlaylistDetailPageProps) {
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();
  const { playlistTracksById, updatePlaylist, deletePlaylist } = useLibrary();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const playlistTracks: Track[] = playlist
    ? playlistTracksById[playlist.id] ?? []
    : [];

  const coverImage = playlist?.image ?? imgFallback;
  const title = playlist?.title ?? "Playlist";
  const trackCount = playlist?.trackCount ?? playlistTracks.length;
  const duration = playlist?.duration ?? "—";

  const playlistShareUrl = useMemo(() => {
    if (typeof window === "undefined" || !playlist) return "";
    const base = `${window.location.origin}${window.location.pathname}`.replace(/\/$/, "") || window.location.origin;
    return `${base}/?playlist=${encodeURIComponent(playlist.id)}`;
  }, [playlist]);

  const playlistShareTitle = useMemo(() => {
    if (!playlist) return "";
    return `Playlist «${title}» no AI Music`;
  }, [playlist, title]);

  const confirmDelete = () => {
    if (playlist) {
      deletePlaylist(playlist.id);
      setDeleteOpen(false);
      onPlaylistDeleted?.();
    }
  };

  if (!playlist) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-[37px] py-6 lg:py-[38px]">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 transition-colors duration-150 hover:opacity-70 mb-6"
            style={{ color: "#a19a9b" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-semibold text-[14px]">Voltar</span>
          </button>
        )}
        <p style={{ color: "#a19a9b" }}>Nenhuma playlist selecionada.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full px-4 sm:px-6 lg:px-[37px] py-6 lg:py-[38px] space-y-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 transition-colors duration-150 hover:opacity-70"
            style={{ color: "#a19a9b" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-semibold text-[14px]">Voltar</span>
          </button>
        )}

        <div className="relative overflow-hidden" style={{ border: "1px solid #30292b" }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 transition-colors duration-150 hover:bg-white/10 rounded"
              >
                <svg width="4" height="16" viewBox="0 0 4 16" fill="none">
                  <circle cx="2" cy="2" r="2" fill="#a19a9b" />
                  <circle cx="2" cy="8" r="2" fill="#a19a9b" />
                  <circle cx="2" cy="14" r="2" fill="#a19a9b" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              style={{
                background: "#24191b",
                border: "1px solid #30292b",
                color: "#f8f8f8",
              }}
            >
              <DropdownMenuItem style={{ cursor: "pointer" }} onSelect={() => setEditModalOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar playlist</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator style={{ background: "#30292b" }} />
              <DropdownMenuItem
                variant="destructive"
                style={{ cursor: "pointer" }}
                onSelect={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Excluir playlist</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex flex-col sm:flex-row gap-6 p-6 lg:p-8 sm:items-end">
            <div className="relative shrink-0 mx-auto sm:mx-0" style={{ width: "160px", height: "160px" }}>
              <img src={coverImage} alt={title} className="w-full h-full object-cover" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ border: "1px solid #30292b" }}
              />
            </div>

            <div className="flex flex-col justify-end gap-2 min-w-0 flex-1 text-center sm:text-left">
              <p
                className="font-semibold text-[12px] leading-[1.5] uppercase tracking-wide"
                style={{ color: "#bababa" }}
              >
                {playlist.isPublic !== false ? "Playlist pública" : "Playlist privada"}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                <h1
                  className="font-bold leading-[1.2]"
                  style={{ color: "#ebe9e9", fontSize: "clamp(24px, 4vw, 40px)" }}
                >
                  {title}
                </h1>
                <ShareChannelsMenu
                  shareTitle={playlistShareTitle}
                  shareUrl={playlistShareUrl}
                  align="start"
                >
                  <button
                    type="button"
                    className="shrink-0 flex items-center justify-center w-10 h-10 rounded-md border border-[#ff164c]/80 text-[#ff164c] transition-opacity duration-150 hover:opacity-80 hover:bg-[#ff164c]/10"
                    aria-label="Partilhar playlist"
                    title="Partilhar playlist"
                  >
                    <Share2 className="w-5 h-5" strokeWidth={2} />
                  </button>
                </ShareChannelsMenu>
              </div>

              <p className="text-[14px] leading-[1.5]" style={{ color: "#bababa" }}>
                {trackCount} músicas · {duration}
              </p>
            </div>
          </div>
        </div>

        <section>
          {playlistTracks.length === 0 ? (
            <p className="text-[#a19a9b] text-sm py-8 text-center">
              Essa playlist está vazia. Adicione faixas a partir de Descobrir ou da biblioteca.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <TrackTableHeader playlistContextId={playlist.id} />
                <tbody>
                  {playlistTracks.map((track, index) => {
                    const isCurrentTrack = currentTrack?.id === track.id;
                    const isTrackPlaying = isCurrentTrack && isPlaying;

                    return (
                      <TrackRow
                        key={track.id}
                        track={track}
                        index={index}
                        isPlaying={isTrackPlaying}
                        onClick={() => playTrack(track, playlistTracks)}
                        playlistContextId={playlist.id}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <CreatePlaylistModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        mode="edit"
        initialData={{
          name: title,
          description: playlist.description ?? "",
          isPublic: playlist.isPublic !== false,
          coverImage: typeof coverImage === "string" ? coverImage : undefined,
        }}
        onCreate={(data) => {
          updatePlaylist(playlist.id, data);
          setEditModalOpen(false);
        }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="border-[#30292b] bg-[#24191b] text-[#f8f8f8]">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir playlist?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#bababa]">
              Esta ação não pode ser desfeita. A playlist &quot;{title}&quot; será removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#30292b] bg-transparent text-[#f8f8f8]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#ff164c] text-white hover:bg-[#d4103e]"
              onClick={confirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
