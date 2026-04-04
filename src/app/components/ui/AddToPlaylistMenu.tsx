import { useState } from "react";
import { toast } from "sonner";
import { ListPlus } from "lucide-react";
import { useLibrary } from "../../context/LibraryContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface AddToPlaylistMenuProps {
  trackId: string;
  className?: string;
  iconClassName?: string;
  variant?: "overlay" | "inline";
}

export function AddToPlaylistMenu({
  trackId,
  className = "",
  iconClassName = "",
  variant = "overlay",
}: AddToPlaylistMenuProps) {
  const { playlists, addTrackToPlaylist } = useLibrary();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  const handleAdd = (playlistId: string) => {
    setAdding(playlistId);
    void addTrackToPlaylist(playlistId, trackId)
      .then(() => {
        toast.success("Faixa adicionada à playlist.");
        setOpen(false);
      })
      .catch(() => {
        toast.error("Não foi possível adicionar à playlist.");
      })
      .finally(() => setAdding(null));
  };

  const btnBase =
    variant === "overlay"
      ? "shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-black/70 text-[#f8f8f8] hover:bg-black/90 transition-colors"
      : "shrink-0 flex items-center justify-center w-9 h-9 rounded-md text-[#a19a9b] hover:text-[#ff164c] hover:bg-white/5 transition-colors";

  if (playlists.length === 0) {
    return (
      <span
        className={`inline-flex opacity-40 cursor-not-allowed ${className}`}
        title="Crie uma playlist na secção Playlists"
        aria-label="Crie uma playlist primeiro"
      >
        <ListPlus className={`w-5 h-5 ${iconClassName}`} />
      </span>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`${btnBase} ${className}`}
          title="Adicionar à playlist"
          aria-label="Adicionar à playlist"
          onClick={(e) => e.stopPropagation()}
        >
          <ListPlus className={`w-4 h-4 ${iconClassName}`} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-64 overflow-y-auto bg-[#24191b] border-[#30292b] text-[#f8f8f8]"
        onClick={(e) => e.stopPropagation()}
      >
        {playlists.map((p) => (
          <DropdownMenuItem
            key={p.id}
            className="cursor-pointer focus:bg-white/10"
            disabled={adding === p.id}
            onSelect={(e) => {
              e.preventDefault();
              handleAdd(p.id);
            }}
          >
            {p.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
