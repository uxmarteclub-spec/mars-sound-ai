import { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useMusicPlayer, Track } from "../context/MusicContext";
import { useAuth } from "../context/AuthContext";
import { TrackRow, TrackTableHeader } from "./ui/TrackRow";
import { Button } from "./ui/button";
import { EditPublishedTrackModal } from "./EditPublishedTrackModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Upload, Move, Share2 } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { useFavorites } from "../context/FavoritesContext";
import { getSupabase } from "../../lib/supabaseClient";
import {
  fetchUserProfileRow,
  fetchPublishedTracksForUser,
  uploadUserBanner,
  type PublicUserProfileRow,
} from "../../services/supabase/libraryData";
import { formatPlaylistDuration } from "../../services/supabase/mappers";
import {
  parseCoverObjectPosition,
  formatCoverObjectPosition,
} from "../../utils/coverPosition";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ShareChannelsMenu } from "./ui/ShareChannelsMenu";
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

import imgBanner from "figma:asset/1ff0fd371e6317f8995f6626691775855756bce5.png";
import imgProfilePhoto from "figma:asset/2b9669d4caae7e0131df172e452df996b054e84b.png";

/** Máscara na imagem do banner: opacidade 100% → 0% (base), sem camada de cor por cima. */
const PROFILE_BANNER_MASK_IMAGE =
  "linear-gradient(to bottom, #fff 0%, #fff 38%, rgba(255,255,255,0.55) 62%, rgba(255,255,255,0.12) 88%, rgba(255,255,255,0) 100%)";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-base)]";

function BannerRepositionPreview({
  imageSrc,
  positionStr,
  saving,
  onSave,
  onCancel,
}: {
  imageSrc: string;
  positionStr: string;
  saving?: boolean;
  onSave: (x: number, y: number) => void;
  onCancel: () => void;
}) {
  const initial = parseCoverObjectPosition(positionStr);
  const [x, setX] = useState(initial.x);
  const [y, setY] = useState(initial.y);
  const dragRef = useRef({
    active: false,
    sx: 0,
    sy: 0,
    ix: 0,
    iy: 0,
  });

  useEffect(() => {
    const p = parseCoverObjectPosition(positionStr);
    setX(p.x);
    setY(p.y);
  }, [positionStr]);

  return (
    <>
      <div
        className="relative h-52 w-full overflow-hidden rounded-md border border-[#30292b] touch-none select-none cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          dragRef.current = {
            active: true,
            sx: e.clientX,
            sy: e.clientY,
            ix: x,
            iy: y,
          };
        }}
        onPointerMove={(e) => {
          if (!dragRef.current.active) return;
          const dx = e.clientX - dragRef.current.sx;
          const dy = e.clientY - dragRef.current.sy;
          const k = 0.14;
          setX(
            Math.min(100, Math.max(0, dragRef.current.ix - dx * k))
          );
          setY(
            Math.min(100, Math.max(0, dragRef.current.iy - dy * k))
          );
        }}
        onPointerUp={(e) => {
          dragRef.current.active = false;
          try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        }}
        onPointerCancel={() => {
          dragRef.current.active = false;
        }}
      >
        <img
          src={imageSrc}
          alt=""
          className="pointer-events-none h-full w-full object-cover"
          style={{ objectPosition: `${x}% ${y}%` }}
          draggable={false}
        />
      </div>
      <div className="flex flex-col gap-3 py-3 border-t border-[#30292b] mt-2">
        <p className="text-xs text-[#bababa]">
          Sem rato: use os controlos para afinar a posição (0% = início, 100% = fim).
        </p>
        <label className="flex items-center gap-3 text-sm text-[#f8f8f8]">
          <span className="w-24 shrink-0 text-[#bababa]">Horizontal</span>
          <input
            type="range"
            min={0}
            max={100}
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
            className="min-h-9 flex-1 accent-[#ff164c]"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={x}
            aria-label="Posição horizontal do banner"
          />
          <span className="w-10 shrink-0 text-right tabular-nums text-[#bababa]">{x}%</span>
        </label>
        <label className="flex items-center gap-3 text-sm text-[#f8f8f8]">
          <span className="w-24 shrink-0 text-[#bababa]">Vertical</span>
          <input
            type="range"
            min={0}
            max={100}
            value={y}
            onChange={(e) => setY(Number(e.target.value))}
            className="min-h-9 flex-1 accent-[#ff164c]"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={y}
            aria-label="Posição vertical do banner"
          />
          <span className="w-10 shrink-0 text-right tabular-nums text-[#bababa]">{y}%</span>
        </label>
      </div>
      <DialogFooter className="gap-2 sm:justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          className="border-[#30292b] bg-transparent text-[#f8f8f8]"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={saving}
          className="bg-[#ff164c] hover:bg-[#d4103e] text-white disabled:opacity-50"
          onClick={() => onSave(x, y)}
        >
          {saving ? "A guardar…" : "Guardar posição"}
        </Button>
      </DialogFooter>
    </>
  );
}

function DotsVerticalIcon() {
  return (
    <svg width="4" height="16" viewBox="0 0 4 16" fill="none" aria-hidden="true">
      <circle cx="2" cy="2" r="2" fill="#766C6E" />
      <circle cx="2" cy="8" r="2" fill="#766C6E" />
      <circle cx="2" cy="14" r="2" fill="#766C6E" />
    </svg>
  );
}

interface ProfilePageProps {
  isPublic?: boolean;
  /** Quando definido e diferente do utilizador autenticado, mostra “Seguir” e grava em `follows`. */
  profileUserId?: string;
  onEditProfile?: () => void;
  onViewPublicProfile?: () => void;
  /** Ex.: voltar da navegação “Top criadores” na home. */
  onBack?: () => void;
}

export function ProfilePage({
  isPublic = false,
  profileUserId,
  onEditProfile,
  onViewPublicProfile,
  onBack,
}: ProfilePageProps) {
  const { user: authUser } = useAuth();
  const { myPublishedTracks, deletePublishedTrack } = useLibrary();
  const { removeFavoriteLocal } = useFavorites();
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

  const targetId = profileUserId ?? authUser?.id ?? null;
  const isOtherUser =
    Boolean(
      isPublic &&
        profileUserId &&
        authUser?.id &&
        profileUserId !== authUser.id
    );

  const [profile, setProfile] = useState<PublicUserProfileRow | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [otherTracks, setOtherTracks] = useState<Track[]>([]);
  const [otherTracksLoading, setOtherTracksLoading] = useState(false);
  const [otherTracksError, setOtherTracksError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [bannerImage, setBannerImage] = useState(imgBanner);
  const [avatarImage, setAvatarImage] = useState(imgProfilePhoto);
  const [coverObjectPosition, setCoverObjectPosition] = useState("50% 50%");
  const [repositionOpen, setRepositionOpen] = useState(false);
  const [savingBannerPosition, setSavingBannerPosition] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [trackPendingDelete, setTrackPendingDelete] = useState<Track | null>(
    null
  );
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [trackEditing, setTrackEditing] = useState<Track | null>(null);
  const [profileRetryToken, setProfileRetryToken] = useState(0);

  const publishedTracks = useMemo(() => {
    if (!targetId || !authUser?.id) return [];
    if (isOtherUser) return otherTracks;
    return myPublishedTracks;
  }, [targetId, authUser?.id, isOtherUser, otherTracks, myPublishedTracks]);

  const profileShareUrl = useMemo(() => {
    if (typeof window === "undefined" || !targetId) return "";
    return `${window.location.origin}/u/${encodeURIComponent(targetId)}`;
  }, [targetId]);

  const totalDurationLabel = useMemo(() => {
    let sec = 0;
    for (const t of publishedTracks) {
      if (typeof t.duration === "number") sec += t.duration;
      else if (typeof t.duration === "string" && t.duration.includes(":")) {
        const [m, s] = t.duration.split(":").map(Number);
        if (!Number.isNaN(m)) sec += m * 60 + (s || 0);
      }
    }
    return formatPlaylistDuration(sec);
  }, [publishedTracks]);

  useEffect(() => {
    if (!targetId) {
      setProfileLoading(false);
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      setProfileLoading(false);
      return;
    }
    let cancelled = false;
    setProfileLoading(true);
    setProfileError(null);
    void fetchUserProfileRow(sb, targetId)
      .then((row) => {
        if (cancelled) return;
        if (!row) {
          setProfile(null);
          setProfileError("Perfil não encontrado.");
          return;
        }
        setProfile(row);
        if (row.cover_image) setBannerImage(row.cover_image);
        else setBannerImage(imgBanner);
        if (row.avatar) setAvatarImage(row.avatar);
        else setAvatarImage(imgProfilePhoto);
        const pos = row.cover_object_position?.trim();
        setCoverObjectPosition(pos || "50% 50%");
      })
      .catch(() => {
        if (!cancelled) setProfileError("Não foi possível carregar o perfil.");
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    if (isOtherUser && profileUserId) {
      setOtherTracksLoading(true);
      setOtherTracksError(null);
      void fetchPublishedTracksForUser(sb, profileUserId)
        .then((tracks) => {
          if (!cancelled) setOtherTracks(tracks);
        })
        .catch(() => {
          if (!cancelled) {
            const msg = "Não foi possível carregar as músicas deste perfil.";
            setOtherTracksError(msg);
            setOtherTracks([]);
            toast.error(msg);
          }
        })
        .finally(() => {
          if (!cancelled) setOtherTracksLoading(false);
        });
    } else {
      setOtherTracks([]);
      setOtherTracksLoading(false);
      setOtherTracksError(null);
    }

    return () => {
      cancelled = true;
    };
  }, [targetId, isOtherUser, profileUserId, profileRetryToken]);

  useEffect(() => {
    if (!isOtherUser || !authUser?.id || !profileUserId) return;
    const sb = getSupabase();
    if (!sb) return;
    let cancelled = false;
    void sb
      .from("follows")
      .select("id")
      .eq("follower_id", authUser.id)
      .eq("following_id", profileUserId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsFollowing(Boolean(data));
      });
    return () => {
      cancelled = true;
    };
  }, [isOtherUser, authUser?.id, profileUserId]);

  const handleFollowToggle = () => {
    if (!isOtherUser || !authUser?.id || !profileUserId) return;
    const sb = getSupabase();
    if (!sb) return;
    setFollowLoading(true);
    const next = !isFollowing;
    setIsFollowing(next);
    void (async () => {
      try {
        if (next) {
          const { error } = await sb.from("follows").insert({
            follower_id: authUser.id,
            following_id: profileUserId,
          });
          if (error) throw error;
          toast.success("A seguir este perfil.");
        } else {
          const { error } = await sb
            .from("follows")
            .delete()
            .eq("follower_id", authUser.id)
            .eq("following_id", profileUserId);
          if (error) throw error;
          toast.success("Deixou de seguir.");
        }
      } catch {
        setIsFollowing(!next);
        toast.error("Não foi possível atualizar o seguimento.");
      } finally {
        setFollowLoading(false);
      }
    })();
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || bannerUploading) return;
    if (!authUser?.id) {
      toast.error("Inicie sessão para alterar o banner.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Escolha um ficheiro de imagem (JPG, PNG, WebP ou GIF).");
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      toast.error("Ligação ao servidor indisponível.");
      return;
    }
    setBannerUploading(true);
    void (async () => {
      try {
        const publicUrl = await uploadUserBanner(sb, authUser.id, file);
        const { error } = await sb
          .from("users")
          .update({
            cover_image: publicUrl,
            cover_object_position: "50% 50%",
          })
          .eq("id", authUser.id);
        if (error) throw error;
        setBannerImage(publicUrl);
        setCoverObjectPosition("50% 50%");
        const refreshed = await fetchUserProfileRow(sb, authUser.id);
        if (refreshed) setProfile(refreshed);
        toast.success("Banner guardado no perfil.");
      } catch (err) {
        const msg =
          err instanceof Error && err.message
            ? err.message
            : "Não foi possível enviar o banner.";
        toast.error(msg);
      } finally {
        setBannerUploading(false);
      }
    })();
  };

  const handleSaveBannerPosition = (x: number, y: number) => {
    if (!authUser?.id) {
      toast.error("Inicie sessão para guardar.");
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      toast.error("Ligação indisponível.");
      return;
    }
    const formatted = formatCoverObjectPosition(x, y);
    setSavingBannerPosition(true);
    void sb
      .from("users")
      .update({ cover_object_position: formatted })
      .eq("id", authUser.id)
      .then(({ error }) => {
        if (error) {
          toast.error(
            error.message?.trim() ||
              "Não foi possível guardar a posição do banner. Tente de novo."
          );
          return;
        }
        setCoverObjectPosition(formatted);
        setRepositionOpen(false);
        toast.success("Posição do banner guardada.");
      })
      .finally(() => setSavingBannerPosition(false));
  };

  const displayName = profile?.name ?? "—";
  const handle = profile ? `@${profile.username}` : "—";
  const bio = profile?.bio?.trim() || "";

  if (profileLoading && !profile) {
    return (
      <div className="w-full px-4 py-12 text-center text-[#a19a9b] text-sm">
        A carregar perfil…
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="w-full px-4 py-12 flex flex-col items-center gap-4 text-center">
        <p className="text-[#ff164c] text-sm max-w-md">{profileError}</p>
        <button
          type="button"
          onClick={() => {
            setProfileError(null);
            setProfileLoading(true);
            setProfileRetryToken((n) => n + 1);
          }}
          className={`px-4 py-2 rounded-md bg-[#ff164c] text-white text-sm font-semibold hover:opacity-90 ${focusRing}`}
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full">
      {onBack ? (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <button
            type="button"
            onClick={onBack}
            className={`flex items-center gap-2 rounded-sm transition-opacity duration-150 hover:opacity-70 text-[#a19a9b] ${focusRing}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M10 4L6 8L10 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-semibold text-[14px]">Voltar</span>
          </button>
        </div>
      ) : null}
      <div className="relative w-full">
        <div className="relative w-full overflow-hidden" style={{ height: "245px" }}>
          <img
            src={bannerImage}
            alt=""
            className="w-full h-full object-cover pointer-events-none"
            style={{
              objectPosition: coverObjectPosition,
              opacity: bannerUploading ? 0.55 : 1,
              WebkitMaskImage: PROFILE_BANNER_MASK_IMAGE,
              maskImage: PROFILE_BANNER_MASK_IMAGE,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "top center",
              maskPosition: "top center",
            }}
          />
          {bannerUploading ? (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-[2]"
              aria-live="polite"
            >
              <p className="text-sm font-semibold text-[#f8f8f8]">A enviar banner…</p>
            </div>
          ) : null}
          {!isPublic && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`absolute top-6 right-6 flex items-center justify-center w-8 h-8 rounded-md hover:bg-white/10 transition-colors duration-150 z-10 ${focusRing}`}
                  aria-label="Opções do banner"
                >
                  <DotsVerticalIcon />
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
                <DropdownMenuItem
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: "pointer" }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Upload nova imagem</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setRepositionOpen(true);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <Move className="mr-2 h-4 w-4" />
                  <span>Reposicionar banner</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerUpload}
          />
        </div>

        <div
          className="relative w-full px-4 sm:px-6 lg:px-8"
          style={{ marginTop: "-80px" }}
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div
                className="relative shrink-0"
                style={{ width: "140px", height: "140px" }}
              >
                <img
                  src={avatarImage}
                  alt=""
                  className="w-full h-full object-cover border-4 border-[#ff164c]"
                />
              </div>

              <div className="flex flex-col gap-2 pb-1">
                <div>
                  <h1
                    className="font-bold leading-[1.5]"
                    style={{ fontSize: "clamp(20px, 4vw, 40px)", color: "#ebe9e9" }}
                  >
                    {displayName}
                  </h1>
                  <p
                    className="font-semibold leading-[1.5]"
                    style={{ fontSize: "16px", color: "#bababa" }}
                  >
                    {handle}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold"
                      style={{ fontSize: "16px", color: "#f8f8f8" }}
                    >
                      {profile?.total_followers ?? 0}
                    </span>
                    <span style={{ fontSize: "14px", color: "#a19a9b" }}>
                      seguidores
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold"
                      style={{ fontSize: "16px", color: "#f8f8f8" }}
                    >
                      {profile?.total_following ?? 0}
                    </span>
                    <span style={{ fontSize: "14px", color: "#a19a9b" }}>
                      seguindo
                    </span>
                  </div>
                </div>

                {bio ? (
                  <p className="text-[12px] leading-[1.25] max-w-md" style={{ color: "#bababa" }}>
                    {bio}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isPublic && isOtherUser ? (
                <button
                  type="button"
                  disabled={followLoading}
                  aria-pressed={isFollowing}
                  aria-busy={followLoading}
                  aria-label={isFollowing ? "Deixar de seguir este perfil" : "Seguir este perfil"}
                  onClick={handleFollowToggle}
                  className={`flex items-center justify-center px-4 py-2 rounded-sm cursor-pointer transition-opacity duration-150 hover:opacity-90 whitespace-nowrap disabled:opacity-50 ${focusRing}`}
                  style={{
                    background: isFollowing
                      ? "transparent"
                      : "linear-gradient(to right, #ff164c 57%, #ea5858 100%)",
                    border: isFollowing ? "1px solid #ff164c" : "none",
                    color: "#f8f8f8",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {isFollowing ? "Seguindo" : "Seguir perfil"}
                </button>
              ) : null}
              {isPublic && !isOtherUser ? (
                <p className="text-sm text-[#a19a9b]">Pré-visualização do seu perfil público</p>
              ) : null}
              {!isPublic ? (
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" onClick={onEditProfile}>
                    Editar perfil
                  </Button>
                  {onViewPublicProfile && (
                    <Button variant="outline" onClick={onViewPublicProfile}>
                      Ver como público
                    </Button>
                  )}
                </div>
              ) : null}

              <ShareChannelsMenu
                shareTitle={`${displayName} — perfil no AI Music`}
                shareUrl={profileShareUrl}
                align="end"
              >
                <button
                  type="button"
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#ff164c] text-[#f8f8f8] hover:bg-[#ff164c]/10 transition-opacity duration-150 hover:opacity-90 ${focusRing}`}
                  aria-label="Partilhar perfil"
                  title="Partilhar perfil"
                >
                  <Share2 className="h-5 w-5" strokeWidth={2} aria-hidden />
                </button>
              </ShareChannelsMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="flex flex-col gap-1 mb-4">
          <h2
            className="font-bold leading-[1.5]"
            style={{ fontSize: "24px", color: "#ebe9e9" }}
          >
            Músicas publicadas
          </h2>
          <p style={{ fontSize: "12px", color: "#bababa" }}>
            {publishedTracks.length} músicas · {totalDurationLabel}
          </p>
        </div>

        <div className="overflow-x-auto">
          {isOtherUser && otherTracksLoading ? (
            <p className="text-sm text-[#a19a9b] py-8" aria-live="polite">
              A carregar músicas publicadas…
            </p>
          ) : isOtherUser && otherTracksError ? (
            <p className="text-sm text-[#ff164c] py-8" role="alert">
              {otherTracksError}
            </p>
          ) : publishedTracks.length === 0 ? (
            <p className="text-sm text-[#a19a9b] py-8">
              Nenhuma música publicada neste perfil.
            </p>
          ) : (
            <table className="w-full">
              <TrackTableHeader
                showFavorites={false}
                showAddToPlaylist={isOtherUser}
                showOwnerTrackMenu={!isOtherUser}
              />
              <tbody>
                {publishedTracks.map((track, index) => {
                  const isCurrentTrack = currentTrack?.id === track.id;
                  const isTrackPlaying = isCurrentTrack && isPlaying;
                  return (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={index}
                      isPlaying={isTrackPlaying}
                      onClick={() => playTrack(track, publishedTracks)}
                      showFavorites={false}
                      showAddToPlaylist={isOtherUser}
                      ownerTrackMenu={
                        isOtherUser
                          ? undefined
                          : {
                              onEdit: (t) => setTrackEditing(t),
                              onRequestDelete: (t) =>
                                setTrackPendingDelete(t),
                            }
                      }
                    />
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={repositionOpen} onOpenChange={setRepositionOpen}>
        <DialogContent className="border-[#30292b] bg-[#24191b] text-[#f8f8f8] sm:max-w-lg [&_[data-slot=dialog-close]]:text-[#f8f8f8]">
          <DialogHeader>
            <DialogTitle className="text-[#ebe9e9]">Reposicionar banner</DialogTitle>
            <DialogDescription className="text-[#bababa] text-sm">
              Arraste na pré-visualização ou use os controlos abaixo para ajustar a posição do
              banner.
            </DialogDescription>
          </DialogHeader>
          <BannerRepositionPreview
            imageSrc={bannerImage}
            positionStr={coverObjectPosition}
            saving={savingBannerPosition}
            onCancel={() => setRepositionOpen(false)}
            onSave={handleSaveBannerPosition}
          />
        </DialogContent>
      </Dialog>

      <EditPublishedTrackModal
        open={Boolean(trackEditing)}
        onOpenChange={(next) => {
          if (!next) setTrackEditing(null);
        }}
        track={trackEditing}
      />

      <AlertDialog
        open={Boolean(trackPendingDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteBusy) setTrackPendingDelete(null);
        }}
      >
        <AlertDialogContent className="border-[#30292b] bg-[#24191b] text-[#f8f8f8]">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir publicação?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#bababa]">
              A faixa &quot;{trackPendingDelete?.title ?? ""}&quot; será removida do catálogo,
              playlists e favoritos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteBusy}
              className="border-[#30292b] bg-transparent text-[#f8f8f8]"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteBusy}
              className="bg-[#ff164c] text-white hover:bg-[#d4103e]"
              onClick={(e) => {
                e.preventDefault();
                const t = trackPendingDelete;
                if (!t) return;
                setDeleteBusy(true);
                void deletePublishedTrack(t)
                  .then(() => {
                    removeFavoriteLocal(t.id);
                    toast.success("Faixa eliminada.");
                    setTrackPendingDelete(null);
                  })
                  .catch(() => {
                    toast.error("Não foi possível eliminar a faixa.");
                  })
                  .finally(() => setDeleteBusy(false));
              }}
            >
              {deleteBusy ? "A eliminar…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
