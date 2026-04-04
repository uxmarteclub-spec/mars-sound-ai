import { useState } from "react";
import { useMusicPlayer, Track } from "../context/MusicContext";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { FavoriteButton } from "./ui/FavoriteButton";
import { AddToPlaylistMenu } from "./ui/AddToPlaylistMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import type { HomeCreator } from "../../types/music";

function showTrackQuickActionsForOthers(
  track: Track,
  myUserId: string | undefined
): boolean {
  if (!myUserId) return false;
  if (!track.ownerUserId) return true;
  return track.ownerUserId !== myUserId;
}

// ── Sub-components ────────────────────────────────────────

function PlayingBars() {
  return (
    <div className="flex items-end gap-px h-[13px]">
      <span
        className="w-[3px] rounded-sm"
        style={{ height: "13px", backgroundColor: "rgba(21,15,16,0.85)", animation: "barBounce 0.8s ease-in-out infinite alternate" }}
      />
      <span
        className="w-[3px] rounded-sm"
        style={{ height: "7px", backgroundColor: "rgba(21,15,16,0.85)", animation: "barBounce 0.6s ease-in-out infinite alternate 0.2s" }}
      />
      <span
        className="w-[3px] rounded-sm"
        style={{ height: "10px", backgroundColor: "rgba(21,15,16,0.85)", animation: "barBounce 0.9s ease-in-out infinite alternate 0.1s" }}
      />
    </div>
  );
}

function CreatorCard({
  creator,
  onOpen,
}: {
  creator: HomeCreator;
  onOpen?: (userId: string) => void;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(creator.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen?.(creator.id);
        }
      }}
      className="relative flex-none snap-start w-[140px] sm:w-[160px] lg:w-[175px] h-[220px] sm:h-[250px] lg:h-[279px] overflow-hidden cursor-pointer group"
      style={{ border: "1px solid var(--color-border-subtle)" }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={creator.bgImage}
          alt={creator.name}
          className="absolute w-[130%] h-[130%] object-cover -left-[10%] -top-[20%]"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        {creator.overlayImage && (
          <img
            src={creator.overlayImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[38%] to-black" />
      </div>

      {/* Hover overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ backgroundColor: "rgba(255,22,76,0.08)" }}
      />

      {/* Text */}
      <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4">
        <p
          className="font-semibold truncate"
          style={{ color: "var(--color-text-primary)", fontSize: "14px", lineHeight: 1.5 }}
        >
          {creator.name}
        </p>
        <p
          className="truncate"
          style={{ color: "var(--color-text-secondary)", fontSize: "12px", lineHeight: 1.25 }}
        >
          {creator.handle}
        </p>
      </div>
    </article>
  );
}

function MusicCard({
  track,
  size = "normal",
  playQueue,
}: {
  track: Track;
  size?: "normal" | "large";
  playQueue: Track[];
}) {
  const [hovered, setHovered] = useState(false);
  const { user } = useAuth();
  const { isFavorite: isFav, toggleFavorite } = useFavorites();
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();
  const showOthersActions = showTrackQuickActionsForOthers(track, user?.id);
  const favoriteActive = isFav(track.id);

  const isCurrentTrack = currentTrack?.id === track.id;
  const isActive = isCurrentTrack && isPlaying;

  const handleClick = () => {
    if (track.audioUrl) {
      playTrack(
        {
          id: track.id,
          title: track.title,
          artist: track.artist,
          image: track.image,
          audioUrl: track.audioUrl,
        },
        playQueue
      );
    }
  };

  const cardWidth =
    size === "large"
      ? "flex-none min-w-[260px] sm:min-w-[300px] lg:min-w-[340px]"
      : "w-[140px] sm:w-[160px] lg:w-[175px] flex-none";

  const imgHeight = size === "large"
    ? "h-[150px] sm:h-[160px] lg:h-[175px]"
    : "h-[140px] sm:h-[155px] lg:h-[175px]";

  return (
    <article
      className={`relative flex flex-col snap-start cursor-pointer group ${cardWidth}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Image area */}
      <div
        className={`relative shrink-0 w-full ${imgHeight} overflow-hidden`}
        style={{
          border: isActive
            ? "2px solid var(--color-brand)"
            : "1px solid var(--color-border-subtle)",
        }}
      >
        <img
          src={track.image}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.objectFit = 'contain';
            target.style.backgroundColor = 'rgba(255,22,76,0.1)';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[38%] to-black/80" />

        {/* Active indicator / hover play */}
        <div className="absolute bottom-3 left-3">
          {isActive && !hovered ? (
            <div
              className="flex items-end gap-px p-1"
              style={{ backgroundColor: "var(--color-brand)", padding: "4px" }}
            >
              <PlayingBars />
            </div>
          ) : hovered ? (
            <div
              className="w-8 h-8 rounded flex items-center justify-center transition-all duration-150"
              style={{ backgroundColor: "var(--color-brand)" }}
            >
              <svg width="10" height="12" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          ) : null}
        </div>

        {showOthersActions && hovered ? (
          <div
            className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <AddToPlaylistMenu trackId={track.id} />
            <Tooltip>
              <TooltipTrigger asChild>
                <FavoriteButton
                  variant="overlay"
                  isFavorite={favoriteActive}
                  onToggle={() => toggleFavorite(track.id)}
                />
              </TooltipTrigger>
              <TooltipContent side="left">
                {favoriteActive ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              </TooltipContent>
            </Tooltip>
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div
        className="px-3 py-2.5"
        style={{
          color: isActive ? "var(--color-text-active)" : "var(--color-text-secondary)",
        }}
      >
        <p
          className="font-semibold truncate"
          style={{ fontSize: "14px", lineHeight: 1.5 }}
        >
          {track.title}
        </p>
        <p style={{ fontSize: "12px", lineHeight: 1.25 }}>{track.artist}</p>
      </div>
    </article>
  );
}

function CarouselSkeleton({ tallImage }: { tallImage?: boolean }) {
  const h = tallImage
    ? "h-[150px] sm:h-[160px] lg:h-[175px]"
    : "h-[140px] sm:h-[155px] lg:h-[175px]";
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex-none snap-start w-[140px] sm:w-[160px] lg:w-[175px] flex flex-col gap-2 animate-pulse"
        >
          <div className={`${h} w-full rounded-md bg-white/10`} />
          <div className="h-3.5 w-3/4 rounded bg-white/10" />
          <div className="h-3 w-1/2 rounded bg-white/5" />
        </div>
      ))}
    </>
  );
}

function CreatorRowSkeleton() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex-none snap-start w-[140px] sm:w-[160px] lg:w-[175px] h-[220px] sm:h-[250px] lg:h-[279px] rounded-md bg-white/10 animate-pulse"
        />
      ))}
    </>
  );
}

function SectionHeader({
  title,
  onVerTudo,
}: {
  title: string;
  onVerTudo?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4 lg:mb-5">
      <h2
        className="font-bold"
        style={{ color: "var(--color-text-primary)", fontSize: "20px", lineHeight: 1.5 }}
      >
        {title}
      </h2>
      {onVerTudo ? (
        <button
          type="button"
          onClick={onVerTudo}
          className="text-sm transition-colors duration-150 cursor-pointer"
          style={{ color: "var(--color-text-muted)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-brand)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)")}
        >
          Ver tudo
        </button>
      ) : null}
    </div>
  );
}

// ── Main HomePage ─────────────────────────────────────────

interface HomePageProps {
  onNavigateToDiscover?: () => void;
  onOpenCreatorProfile?: (userId: string) => void;
}

export function HomePage({
  onNavigateToDiscover,
  onOpenCreatorProfile,
}: HomePageProps) {
  const {
    homeEmAlta,
    homeRecentes,
    homeDestaques,
    homeCreators,
    homeFeedLoading,
    libraryError,
    refreshLibrary,
  } = useLibrary();

  return (
    <div className="flex-1 w-full overflow-y-auto scrollbar-hide">
      <div className="w-full px-4 sm:px-6 lg:px-[37px] py-6 lg:py-[38px] space-y-8 lg:space-y-[38px]">
        {libraryError ? (
          <div
            className="rounded-lg border border-[#ff164c]/40 bg-[#ff164c]/10 px-4 py-3 text-sm text-[#f8f8f8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            role="alert"
          >
            <span>Não foi possível carregar os dados: {libraryError}</span>
            <button
              type="button"
              onClick={() => void refreshLibrary()}
              className="shrink-0 px-3 py-1.5 rounded-md bg-[#ff164c] text-white font-semibold text-xs hover:opacity-90"
            >
              Tentar de novo
            </button>
          </div>
        ) : null}
        <section>
          <h2 className="text-lg sm:text-xl lg:text-[24px] font-semibold text-white mb-4 lg:mb-[16px]">
            Top criadores
          </h2>
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 sm:-mx-6 lg:mx-0">
            <div className="flex gap-4 lg:gap-[16px] px-4 sm:px-6 lg:px-0">
              {homeFeedLoading ? (
                <CreatorRowSkeleton />
              ) : homeCreators.length === 0 ? (
                <p className="text-sm text-[#a19a9b] py-4">
                  Ainda não há criadores públicos na plataforma.
                </p>
              ) : (
                homeCreators.map((c) => (
                  <CreatorCard key={c.id} creator={c} onOpen={onOpenCreatorProfile} />
                ))
              )}
            </div>
          </div>
        </section>

        <section>
          <SectionHeader title="Em alta agora" onVerTudo={onNavigateToDiscover} />
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 sm:-mx-6 lg:mx-0">
            <div className="flex gap-4 lg:gap-[16px] px-4 sm:px-6 lg:px-0">
              {homeFeedLoading ? (
                <CarouselSkeleton />
              ) : homeEmAlta.length === 0 ? (
                <p className="text-sm text-[#a19a9b] py-4">
                  Ainda não há faixas em destaque. Explore Descobrir ou publique uma música.
                </p>
              ) : (
                homeEmAlta.map((t) => (
                  <MusicCard key={t.id} track={t} playQueue={homeEmAlta} />
                ))
              )}
            </div>
          </div>
        </section>

        <section>
          <SectionHeader title="Lançamentos recentes" onVerTudo={onNavigateToDiscover} />
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 sm:-mx-6 lg:mx-0">
            <div className="flex gap-4 lg:gap-[16px] px-4 sm:px-6 lg:px-0">
              {homeFeedLoading ? (
                <CarouselSkeleton />
              ) : homeRecentes.length === 0 ? (
                <p className="text-sm text-[#a19a9b] py-4">Sem lançamentos recentes.</p>
              ) : (
                homeRecentes.map((t) => (
                  <MusicCard key={t.id} track={t} playQueue={homeRecentes} />
                ))
              )}
            </div>
          </div>
        </section>

        <section>
          <SectionHeader title="Destaques da semana" onVerTudo={onNavigateToDiscover} />
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 sm:-mx-6 lg:mx-0">
            <div className="flex gap-4 lg:gap-[16px] px-4 sm:px-6 lg:px-0">
              {homeFeedLoading ? (
                <CarouselSkeleton tallImage />
              ) : homeDestaques.length === 0 ? (
                <p className="text-sm text-[#a19a9b] py-4">Sem dados de reprodução esta semana.</p>
              ) : (
                homeDestaques.map((t) => (
                  <MusicCard key={t.id} track={t} size="large" playQueue={homeDestaques} />
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}