import { useState } from "react";
import { useMusicPlayer, Track } from "../context/MusicContext";
import { useLibrary } from "../context/LibraryContext";
import { TrackRow, TrackTableHeader } from "./ui/TrackRow";
import { CreatePlaylistModal } from "./CreatePlaylistModal";
import type { Playlist } from "../context/LibraryContext";

export type { Playlist };

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-base)]";

function PlaylistGridSkeleton() {
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-3 gap-4"
      aria-hidden="true"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex flex-col animate-pulse" style={{ border: "1px solid #30292b" }}>
          <div className="w-full aspect-square bg-white/10" />
          <div className="px-[18px] py-[12px] space-y-2">
            <div className="h-4 w-3/4 rounded bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
}

function PlaylistCard({ playlist, onClick }: PlaylistCardProps) {
  const [hovered, setHovered] = useState(false);
  const label = `Abrir playlist ${playlist.title}`;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex flex-col cursor-pointer transition-all duration-200 rounded-sm ${focusRing}`}
      style={{
        border: `1px solid ${hovered ? "#ff164c" : "#30292b"}`,
        boxShadow: hovered ? "0 0 16px rgba(255,22,76,0.25)" : "none",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      <div className="relative w-full aspect-square overflow-hidden">
        <img
          src={playlist.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[38%] to-black" />
      </div>

      <div className="px-[18px] py-[12px]">
        <p
          className="font-semibold text-[16px] leading-[1.5] truncate"
          style={{ color: "#bababa" }}
        >
          {playlist.title}
        </p>
        <p className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
          {playlist.trackCount} músicas · {playlist.duration}
        </p>
      </div>
    </article>
  );
}

interface PlaylistsPageProps {
  onPlaylistClick: (playlist: Playlist) => void;
}

export function PlaylistsPage({ onPlaylistClick }: PlaylistsPageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();
  const {
    playlists,
    recentlyPlayed,
    createPlaylist,
    libraryLoading,
    libraryError,
    refreshLibrary,
  } = useLibrary();

  return (
    <div className="w-full">
      <div className="w-full px-4 sm:px-6 lg:px-[37px] py-6 lg:py-[38px] space-y-8">
        {libraryError ? (
          <div className="rounded-lg border border-[#ff164c]/40 bg-[#ff164c]/10 px-4 py-3 text-sm text-[#f8f8f8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>Não foi possível carregar as playlists.</span>
            <button
              type="button"
              onClick={() => void refreshLibrary()}
              className="shrink-0 px-3 py-1.5 rounded-md bg-[#ff164c] text-white font-semibold text-xs hover:opacity-90"
            >
              Tentar de novo
            </button>
          </div>
        ) : null}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1
              className="font-bold text-[24px] leading-[1.5] mb-2"
              style={{ color: "#ebe9e9" }}
            >
              Playlists
            </h1>
            <p className="font-semibold text-[16px] leading-[1.5]" style={{ color: "#bfbbbc" }}>
              Sua coleção pessoal de músicas criadas com AI
            </p>
            {libraryLoading && playlists.length === 0 ? (
              <p className="text-sm text-[#a19a9b] mt-2" aria-live="polite">
                A carregar playlists…
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className={`flex items-center gap-[12px] px-[16px] py-[8px] shrink-0 transition-colors duration-150 hover:bg-[#ff164c]/10 rounded-sm ${focusRing}`}
            style={{ border: "1px solid #ff164c" }}
          >
            <svg width="16" height="16" viewBox="0 0 8 8" fill="none" aria-hidden>
              <path
                d="M7.33333 3.33333H4.66667V0.666667C4.66667 0.489856 4.59643 0.320287 4.4714 0.195262C4.34638 0.070238 4.17681 0 4 0C3.82319 0 3.65362 0.070238 3.5286 0.195262C3.40357 0.320287 3.33333 0.489856 3.33333 0.666667V3.33333H0.666667C0.489856 3.33333 0.320287 3.40357 0.195262 3.5286C0.070238 3.65362 0 3.82319 0 4C0 4.17681 0.070238 4.34638 0.195262 4.4714C0.320287 4.59643 0.489856 4.66667 0.666667 4.66667H3.33333V7.33333C3.33333 7.51014 3.40357 7.67971 3.5286 7.80474C3.65362 7.92976 3.82319 8 4 8C4.17681 8 4.34638 7.92976 4.4714 7.80474C4.59643 7.67971 4.66667 7.51014 4.66667 7.33333V4.66667H7.33333C7.51014 4.66667 7.67971 4.59643 7.80474 4.4714C7.92976 4.34638 8 4.17681 8 4C8 3.82319 7.92976 3.65362 7.80474 3.5286C7.67971 3.40357 7.51014 3.33333 7.33333 3.33333Z"
                fill="#f8f8f8"
              />
            </svg>
            <span
              className="font-semibold text-[16px] leading-[1.5] whitespace-nowrap"
              style={{ color: "#f8f8f8" }}
            >
              Nova playlist
            </span>
          </button>
        </div>

        <section>
          {libraryLoading && playlists.length === 0 ? (
            <>
              <div className="hidden sm:block">
                <PlaylistGridSkeleton />
              </div>
              <div className="sm:hidden overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4">
                <div className="flex gap-4 px-4">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div
                      key={i}
                      className="flex-none w-[160px] snap-start animate-pulse"
                      style={{ border: "1px solid #30292b" }}
                    >
                      <div className="w-full aspect-square bg-white/10" />
                      <div className="px-3 py-2 space-y-2">
                        <div className="h-3.5 w-4/5 rounded bg-white/10" />
                        <div className="h-3 w-1/2 rounded bg-white/5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : !libraryLoading && playlists.length === 0 ? (
            <p className="text-sm text-[#a19a9b] py-6 border border-[#30292b] rounded-lg px-4 text-center">
              Ainda não tem playlists. Crie uma com o botão &quot;Nova playlist&quot;.
            </p>
          ) : (
            <>
              <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onClick={() => onPlaylistClick(playlist)}
                  />
                ))}
              </div>

              <div className="sm:hidden overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4">
                <div className="flex gap-4 px-4">
                  {playlists.map((playlist) => (
                    <div key={playlist.id} className="flex-none w-[160px] snap-start">
                      <PlaylistCard
                        playlist={playlist}
                        onClick={() => onPlaylistClick(playlist)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        <section>
          <h2
            className="font-semibold text-[24px] leading-[1.5] mb-4"
            style={{ color: "#ebe9e9" }}
          >
            Tocadas recentemente
          </h2>

          <div className="overflow-x-auto">
            {recentlyPlayed.length === 0 ? (
              <p className="text-sm text-[#a19a9b] py-6">Nada foi reproduzido recentemente.</p>
            ) : (
              <table className="w-full">
                <TrackTableHeader showAlbum={false} showDuration={false} />
                <tbody>
                  {recentlyPlayed.map((track, index) => {
                    const isCurrentTrack = currentTrack?.id === track.id;
                    const isTrackPlaying = isCurrentTrack && isPlaying;

                    return (
                      <TrackRow
                        key={`${track.id}-${index}`}
                        track={track}
                        index={index}
                        isPlaying={isTrackPlaying}
                        onClick={() => playTrack(track, recentlyPlayed)}
                        showAlbum={false}
                        showDuration={false}
                      />
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <CreatePlaylistModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={(data) => {
          createPlaylist(data);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
