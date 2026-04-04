import { useState } from "react";
import { useMusicPlayer, Track } from "../context/MusicContext";
import { useLibrary } from "../context/LibraryContext";
import { TrackRow, TrackTableHeader } from "./ui/TrackRow";
import type { Playlist } from "../context/LibraryContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Edit, Trash2 } from "lucide-react";
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
                <button type="button" className="shrink-0 transition-opacity duration-150 hover:opacity-70">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M19.3595 14.6672C18.6035 14.6679 17.8589 14.8524 17.19 15.2051C16.5212 15.5577 15.9482 16.0678 15.5205 16.6912L9.01154 13.7522C9.47385 12.6359 9.47565 11.3819 9.01654 10.2642L15.5165 7.31025C16.1504 8.227 17.0919 8.88621 18.1701 9.16829C19.2484 9.45038 20.3921 9.33665 21.3937 8.84775C22.3953 8.35885 23.1885 7.52715 23.6294 6.50351C24.0703 5.47988 24.1297 4.33212 23.7969 3.26842C23.4641 2.20472 22.761 1.29554 21.8153 0.705803C20.8695 0.116061 19.7437 -0.11518 18.6421 0.0540236C17.5405 0.223227 16.5359 0.781668 15.8108 1.62805C15.0856 2.47443 14.6878 3.55269 14.6895 4.66725C14.6938 4.93105 14.7205 5.194 14.7695 5.45325L7.85954 8.59325C7.19588 7.97147 6.36505 7.55709 5.46912 7.40101C4.57318 7.24494 3.65117 7.35396 2.81635 7.71471C1.98153 8.07545 1.27027 8.67218 0.76994 9.43161C0.269611 10.191 0.00200942 11.0801 1.12722e-05 11.9895C-0.00198688 12.8989 0.261705 13.7891 0.758692 14.5507C1.25568 15.3124 1.96432 15.9122 2.79754 16.2766C3.63077 16.641 4.55229 16.7541 5.4489 16.602C6.34551 16.4498 7.17816 16.0391 7.84454 15.4202L14.7725 18.5483C14.7244 18.8073 14.698 19.0698 14.6935 19.3333C14.6933 20.2564 14.9669 21.1588 15.4797 21.9265C15.9924 22.6941 16.7213 23.2924 17.5741 23.6458C18.4269 23.9992 19.3654 24.0917 20.2708 23.9116C21.1762 23.7316 22.0079 23.2871 22.6606 22.6343C23.3134 21.9816 23.7579 21.1499 23.9379 20.2445C24.118 19.3391 24.0255 18.4006 23.6721 17.5478C23.3187 16.695 22.7204 15.9661 21.9528 15.4534C21.1851 14.9406 20.2827 14.6671 19.3595 14.6672Z"
                      fill="#ff164c"
                    />
                  </svg>
                </button>
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
                <TrackTableHeader />
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
