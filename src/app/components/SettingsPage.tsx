import { useState, useRef, useEffect, useId } from "react";
import { toast } from "sonner";
import { Switch } from "./ui/switch";
import { CategoryChip } from "./ui/CategoryChip";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
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
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { getSupabase } from "../../lib/supabaseClient";
import {
  fetchUserProfileRow,
  uploadUserAvatar,
} from "../../services/supabase/libraryData";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

// ─── Sub-components ─────────────────────────────────────────────────

// Image upload icon
function PictureIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6Z"
        stroke="#EBE9E9"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 16L10 13L14.5 18"
        stroke="#EBE9E9"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 18L17.5 15L21 18"
        stroke="#EBE9E9"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 9C16.5 9.82843 15.8284 10.5 15 10.5C14.1716 10.5 13.5 9.82843 13.5 9C13.5 8.17157 14.1716 7.5 15 7.5C15.8284 7.5 16.5 8.17157 16.5 9Z"
        fill="#EBE9E9"
      />
    </svg>
  );
}

// Styled input
function SettingsInput({
  id,
  placeholder,
  type = "text",
  value,
  onChange,
  defaultValue,
  ariaLabel,
}: {
  id?: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
  defaultValue?: string;
  /** Acessível quando não há <Label> visível */
  ariaLabel?: string;
}) {
  return (
    <div
      className="relative flex-1 min-w-0"
      style={{ border: "1px solid #30292b" }}
    >
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        aria-label={ariaLabel ?? (id ? undefined : placeholder)}
        {...(value !== undefined
          ? { value, onChange: (e) => onChange?.(e.target.value) }
          : {
              defaultValue,
              onChange: (e) => onChange?.(e.target.value),
            })}
        className="w-full bg-transparent outline-none px-6 py-2 placeholder-white/20"
        style={{
          color: "#f8f8f8",
          fontSize: "14px",
          fontWeight: 600,
          height: "44px",
        }}
      />
    </div>
  );
}

// Panel card wrapper
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative w-full"
      style={{
        background: "#24191b",
        border: "1px solid #30292b",
      }}
    >
      <div className="flex flex-col gap-6 p-6">{children}</div>
    </div>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────────────

const GENRES = [
  "Ambient", "Pop", "Rock", "Gospel", "Samba", "Clássica",
  "Jazz", "Blues", "Country", "Reggae", "Hip-hop", "Electronic",
  "Metal", "Opera",
];

const MOODS = [
  "Calmo", "Concentrado", "Relaxante", "Inspirador", "Divertido",
  "Festivo", "Sofisticado", "Romântico", "Introspectivo", "Cativante",
];

function ProfileTab() {
  const { user, refreshProfile } = useAuth();
  const { refreshLibrary } = useLibrary();
  const nameFieldId = useId();
  const usernameFieldId = useId();
  const bioFieldId = useId();
  const [profileRetryToken, setProfileRetryToken] = useState(0);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [publicProfile, setPublicProfile] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [selectedMoods, setSelectedMoods] = useState<Set<string>>(new Set());
  /** Pré-visualização: URL remota ou blob: após escolher ficheiro. */
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingAvatarFileRef = useRef<File | null>(null);
  const localPreviewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setProfileLoading(false);
      setProfileLoadError(null);
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      setProfileLoading(false);
      setProfileLoadError("Ligação ao servidor indisponível.");
      return;
    }
    let cancelled = false;
    setProfileLoading(true);
    setProfileLoadError(null);
    void fetchUserProfileRow(sb, user.id)
      .then((row) => {
        if (cancelled) return;
        if (!row) {
          setProfileLoadError("Perfil não encontrado na conta.");
          return;
        }
        setDisplayName(row.name ?? "");
        const u = row.username?.trim() ?? "";
        setUsername(u.startsWith("@") ? u : u ? `@${u}` : "");
        setBio(row.bio ?? "");
        setPublicProfile(row.is_public);
        setSelectedGenres(new Set(row.favorite_genres ?? []));
        setSelectedMoods(new Set(row.favorite_moods ?? []));
        const av = row.avatar?.trim();
        if (av) {
          if (localPreviewUrlRef.current) {
            URL.revokeObjectURL(localPreviewUrlRef.current);
            localPreviewUrlRef.current = null;
          }
          pendingAvatarFileRef.current = null;
          setAvatarUrl(av);
        } else if (!pendingAvatarFileRef.current) {
          setAvatarUrl(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProfileLoadError("Não foi possível carregar o perfil da conta.");
        }
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, profileRetryToken]);

  const persistProfile = async () => {
    if (!user?.id) {
      toast.error("Sessão indisponível.");
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      toast.error("Ligação ao servidor indisponível.");
      return;
    }
    const cleanUser = username.replace(/^@/, "").trim();
    if (!displayName.trim() || !cleanUser) {
      toast.error("Nome e nome de utilizador são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      let newAvatarUrl: string | undefined;
      const pending = pendingAvatarFileRef.current;
      if (pending) {
        newAvatarUrl = await uploadUserAvatar(sb, user.id, pending);
      }

      const payload: Record<string, unknown> = {
        name: displayName.trim(),
        username: cleanUser,
        bio: bio.trim() || null,
        is_public: publicProfile,
        favorite_genres: [...selectedGenres],
        favorite_moods: [...selectedMoods],
      };
      if (newAvatarUrl) payload.avatar = newAvatarUrl;

      const { error } = await sb.from("users").update(payload).eq("id", user.id);
      if (error) throw error;

      if (pending) {
        pendingAvatarFileRef.current = null;
        if (localPreviewUrlRef.current) {
          URL.revokeObjectURL(localPreviewUrlRef.current);
          localPreviewUrlRef.current = null;
        }
        if (newAvatarUrl) setAvatarUrl(newAvatarUrl);
      }

      void refreshProfile();
      void refreshLibrary();

      toast.success("Perfil guardado na conta.");
    } catch (e) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Não foi possível guardar o perfil.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  function toggleGenre(g: string) {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  }

  function toggleMood(m: string) {
    setSelectedMoods((prev) => {
      const next = new Set(prev);
      next.has(m) ? next.delete(m) : next.add(m);
      return next;
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Escolhe um ficheiro de imagem (JPEG, PNG, etc.).");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("A imagem deve ter no máximo 5 MB.");
      e.target.value = "";
      return;
    }
    if (localPreviewUrlRef.current) {
      URL.revokeObjectURL(localPreviewUrlRef.current);
      localPreviewUrlRef.current = null;
    }
    pendingAvatarFileRef.current = file;
    const url = URL.createObjectURL(file);
    localPreviewUrlRef.current = url;
    setAvatarUrl(url);
    e.target.value = "";
  }

  if (profileLoading) {
    return (
      <p className="text-sm text-[#a19a9b] py-8 text-center" aria-live="polite">
        A carregar perfil…
      </p>
    );
  }

  if (profileLoadError) {
    return (
      <div
        className="flex flex-col items-center gap-4 py-10 px-4 text-center border border-[#30292b] bg-[#24191b]"
        role="alert"
      >
        <p className="text-sm text-[#ebe9e9] max-w-md">{profileLoadError}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setProfileRetryToken((n) => n + 1)}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Panel 1: Informações do perfil ── */}
      <Panel>
        {/* Title */}
        <div>
          <h2
            className="font-bold leading-[1.5]"
            style={{ fontSize: "24px", color: "#ebe9e9" }}
          >
            Informações do perfil
          </h2>
        </div>

        {/* Foto de perfil + fields */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <button
            type="button"
            aria-label="Carregar ou alterar foto de perfil"
            onClick={() => fileInputRef.current?.click()}
            className="relative flex flex-col items-center justify-center gap-3 cursor-pointer transition-opacity duration-150 hover:opacity-80 shrink-0"
            style={{
              width: "120px",
              height: "120px",
              border: "1px solid #30292b",
              background: avatarUrl ? "none" : "transparent",
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <PictureIcon />
                <span
                  className="font-semibold text-center px-1 leading-tight"
                  style={{ fontSize: "14px", color: "#f8f8f8" }}
                >
                  Foto perfil
                </span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Text fields */}
          <div className="flex flex-col gap-4 flex-1 w-full min-w-0">
            {/* Row: Nome + @username */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <Label
                  htmlFor={nameFieldId}
                  className="text-[12px] font-semibold uppercase tracking-wide text-[#a19a9b]"
                >
                  Nome
                </Label>
                <SettingsInput
                  id={nameFieldId}
                  placeholder="Nome do utilizador"
                  value={displayName}
                  onChange={setDisplayName}
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <Label
                  htmlFor={usernameFieldId}
                  className="text-[12px] font-semibold uppercase tracking-wide text-[#a19a9b]"
                >
                  Nome de utilizador
                </Label>
                <SettingsInput
                  id={usernameFieldId}
                  placeholder="@username"
                  value={username}
                  onChange={setUsername}
                />
              </div>
            </div>
            {/* Bio textarea */}
            <div className="flex flex-col gap-1.5 w-full">
              <Label
                htmlFor={bioFieldId}
                className="text-[12px] font-semibold uppercase tracking-wide text-[#a19a9b]"
              >
                Bio
              </Label>
              <div
                className="relative w-full"
                style={{ border: "1px solid #30292b" }}
              >
                <textarea
                  id={bioFieldId}
                  placeholder="Uma frase para representar o teu perfil."
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-transparent outline-none resize-none px-6 py-2 placeholder-white/20"
                  style={{
                    color: "#f8f8f8",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Public toggle + Save */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span
                className="font-semibold"
                style={{ fontSize: "14px", color: "#f8f8f8" }}
              >
                Perfil público
              </span>
              <Switch
                checked={publicProfile}
                onCheckedChange={setPublicProfile}
              />
            </div>
            <p style={{ fontSize: "12px", color: "#bababa" }}>
              Outros usuários poderão ver seu perfil e encontrar nas buscas
            </p>
          </div>
          <Button
            variant="default"
            type="button"
            onClick={() => void persistProfile()}
            disabled={saving}
          >
            {saving ? "A guardar…" : "Salvar alterações"}
          </Button>
        </div>
      </Panel>

      {/* ── Panel 2: Preferências musicais ── */}
      <Panel>
        {/* Title */}
        <div>
          <h2
            className="font-bold leading-[1.5]"
            style={{ fontSize: "24px", color: "#ebe9e9" }}
          >
            Preferências musicais
          </h2>
        </div>

        {/* Genres */}
        <div className="flex flex-col gap-3">
          <p
            className="font-semibold leading-[1.5]"
            style={{ fontSize: "14px", color: "#bfbbbc" }}
          >
            Gêneros favoritos
          </p>
          <div className="flex flex-wrap gap-3">
            {GENRES.map((g) => (
              <CategoryChip
                key={g}
                label={g}
                active={selectedGenres.has(g)}
                onClick={() => toggleGenre(g)}
              />
            ))}
          </div>
        </div>

        {/* Moods */}
        <div className="flex flex-col gap-3">
          <p
            className="font-semibold leading-[1.5]"
            style={{ fontSize: "14px", color: "#bfbbbc" }}
          >
            Clima
          </p>
          <div className="flex flex-wrap gap-3">
            {MOODS.map((m) => (
              <CategoryChip
                key={m}
                label={m}
                active={selectedMoods.has(m)}
                onClick={() => toggleMood(m)}
              />
            ))}
          </div>
        </div>

        {/* Bottom save */}
        <div
          className="flex justify-end pt-2"
          style={{ borderTop: "1px solid #30292b" }}
        >
          <Button
            type="button"
            onClick={() => void persistProfile()}
            disabled={saving}
            className="flex items-center justify-center px-4 py-2 cursor-pointer transition-opacity duration-150 hover:opacity-90 whitespace-nowrap shrink-0 disabled:opacity-50"
            style={{
              background: "linear-gradient(to right, #ff164c 57%, #ea5858 100%)",
              color: "#f8f8f8",
              fontSize: "14px",
              fontWeight: 600,
              height: "44px",
            }}
          >
            {saving ? "A guardar…" : "Salvar alterações"}
          </Button>
        </div>
      </Panel>
    </div>
  );
}

// ─── Account Tab ─────────────────────────────────────────────────────

function AccountTab({ onLogout }: { onLogout?: () => void }) {
  const { user, signOut } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const accountEmail = user?.email ?? "";

  async function confirmDeleteAccount() {
    if (!user?.id) {
      toast.error("Sessão indisponível.");
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      toast.error("Ligação ao servidor indisponível.");
      return;
    }
    setDeleteBusy(true);
    try {
      const { error } = await sb.rpc("delete_own_account");
      if (error) throw error;
      toast.success("Conta eliminada.");
      setDeleteOpen(false);
      await signOut();
    } catch (e) {
      const raw =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "";
      toast.error(
        raw.includes("not_authenticated")
          ? "Sessão expirada. Inicia sessão novamente."
          : raw.includes("Could not find the function") ||
              raw.includes("delete_own_account") ||
              raw.includes("42883")
            ? "Função indisponível na base de dados. Aplica a migração mais recente (delete_own_account) e tenta de novo."
            : "Não foi possível eliminar a conta. Verifica a ligação ou tenta mais tarde."
      );
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Panel 1: Informações da conta ── */}
      <Panel>
        <div>
          <h2
            className="font-bold leading-[1.5]"
            style={{ fontSize: "24px", color: "#ebe9e9" }}
          >
            Informações da conta
          </h2>
        </div>

        <p className="text-[13px] leading-relaxed" style={{ color: "#bababa" }}>
          O e-mail da sessão vem do Supabase Auth e não pode ser alterado aqui. Para mudar a
          palavra-passe, use &quot;Esqueci-me da palavra-passe&quot; no ecrã de início de sessão ou o
          painel do projeto Supabase.
        </p>

        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: "#a19a9b" }}>
            E-mail
          </span>
          <div
            className="px-6 py-2 flex items-center"
            style={{ border: "1px solid #30292b", color: "#f8f8f8", fontSize: "14px", fontWeight: 600, minHeight: "44px" }}
          >
            {accountEmail || "—"}
          </div>
        </div>
      </Panel>

      {/* ── Panel 2: Sair da conta ou excluir ── */}
      <Panel>
        <div>
          <h2
            className="font-bold leading-[1.5]"
            style={{ fontSize: "24px", color: "#ebe9e9" }}
          >
            Sair da conta ou excluir
          </h2>
        </div>

        {/* Sign out row */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4"
          style={{ borderBottom: "1px solid #30292b" }}
        >
          <div className="flex flex-col gap-1">
            <p
              className="font-semibold leading-[1.5]"
              style={{ fontSize: "16px", color: "#ebe9e9" }}
            >
              Sair da conta
            </p>
            <p style={{ fontSize: "12px", color: "#bababa" }}>
              Encerrar sua sessão neste dispositivo
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center justify-center px-4 py-2 cursor-pointer transition-opacity duration-150 hover:opacity-90 whitespace-nowrap shrink-0"
            style={{
              background: "linear-gradient(to right, #ff164c 57%, #ea5858 100%)",
              color: "#f8f8f8",
              fontSize: "14px",
              fontWeight: 600,
              height: "44px",
            }}
          >
            Sair da conta
          </button>
        </div>

        {/* Delete account row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p
              className="font-semibold leading-[1.5]"
              style={{ fontSize: "16px", color: "#ebe9e9" }}
            >
              Encerrar conta
            </p>
            <p style={{ fontSize: "12px", color: "#bababa" }}>
              Excluir permanentemente sua conta e todos os seus dados
            </p>
          </div>
          <Button variant="outline" onClick={() => setDeleteOpen(true)}>
            Excluir conta
          </Button>
        </div>
      </Panel>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open && deleteBusy) return;
          setDeleteOpen(open);
        }}
      >
        <AlertDialogContent className="border-[#30292b] bg-[#24191b] text-[#f8f8f8]">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#bababa]">
              Esta ação é irreversível. Todos os teus dados, músicas e playlists
              serão eliminados. A sessão de autenticação será encerrada.
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
                void confirmDeleteAccount();
              }}
            >
              {deleteBusy ? "A eliminar…" : "Confirmar exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Main SettingsPage ────────────────────────────────────────────────

type SettingsTab = "perfil" | "conta";

interface SettingsPageProps {
  onLogout?: () => void;
}

export function SettingsPage({ onLogout }: SettingsPageProps = {}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("perfil");
  const tabsPrefix = useId();
  const tabPerfilId = `${tabsPrefix}-tab-perfil`;
  const tabContaId = `${tabsPrefix}-tab-conta`;
  const panelPerfilId = `${tabsPrefix}-panel-perfil`;
  const panelContaId = `${tabsPrefix}-panel-conta`;

  return (
    <div className="w-full min-h-full flex justify-center">
      {/* Centered container - only for settings page */}
      <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6 lg:py-[38px]">
        {/* ── Page header ── */}
        <div className="flex flex-col gap-2 mb-6">
          <h1
            className="font-bold leading-[1.5]"
            style={{ fontSize: "24px", color: "#ebe9e9" }}
          >
            Configurações
          </h1>
          <p
            className="font-semibold leading-[1.5]"
            style={{ fontSize: "14px", color: "#bfbbbc" }}
          >
            Gerencie sua conta e preferências
          </p>
        </div>

        {/* ── Tabs ── */}
        <div
          role="tablist"
          aria-label="Secções das configurações"
          className="flex items-center gap-3 mb-6"
        >
          {(["perfil", "conta"] as SettingsTab[]).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab === "perfil" ? "Perfil" : "Conta";
            const tabId = tab === "perfil" ? tabPerfilId : tabContaId;
            const panelId = tab === "perfil" ? panelPerfilId : panelContaId;
            return (
              <button
                key={tab}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab)}
                className="relative flex items-center justify-center px-4 py-2 cursor-pointer transition-all duration-150 whitespace-nowrap"
                style={{
                  background: isActive
                    ? "linear-gradient(to right, #ff164c 57%, #ea5858 100%)"
                    : "transparent",
                  border: isActive ? "none" : "1px solid #ff164c",
                  color: "#f8f8f8",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ── */}
        <div
          id={panelPerfilId}
          role="tabpanel"
          aria-labelledby={tabPerfilId}
          hidden={activeTab !== "perfil"}
        >
          {activeTab === "perfil" ? <ProfileTab /> : null}
        </div>
        <div
          id={panelContaId}
          role="tabpanel"
          aria-labelledby={tabContaId}
          hidden={activeTab !== "conta"}
        >
          {activeTab === "conta" ? <AccountTab onLogout={onLogout} /> : null}
        </div>
      </div>
    </div>
  );
}