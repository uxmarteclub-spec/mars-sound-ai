import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LibraryProvider } from "./context/LibraryContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { MusicProvider } from "./context/MusicContext";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { MusicPlayer } from "./components/MusicPlayer";
import { MiniPlayer } from "./components/MiniPlayer";
import { FullScreenMobilePlayer } from "./components/FullScreenMobilePlayer";
import { HomePage } from "./components/HomePage";
import { DiscoverPage } from "./components/DiscoverPage";
import { PlaylistsPage } from "./components/PlaylistsPage";
import { PlaylistDetailPage } from "./components/PlaylistDetailPage";
import { FavoritesPage } from "./components/FavoritesPage";
import { ProfilePage } from "./components/ProfilePage";
import { SettingsPage } from "./components/SettingsPage";
import { BottomNav } from "./components/BottomNav";
import { UploadMusicPage } from "./components/UploadMusicPage";
import { AuthPage } from "./components/AuthPage";
import { SupabaseConfigMissing } from "./components/SupabaseConfigMissing";
import { Toaster } from "./components/ui/sonner";
import { useLibrary, type Playlist } from "./context/LibraryContext";
import bgImage from "figma:asset/755a0ad35d80d322f261566363a27bca5637a26e.png";

const PAGE_LABELS: Record<string, string> = {
  descobrir: "Descobrir",
  playlist: "Playlist",
  favoritos: "Favoritos",
  perfil: "Perfil",
  configuracoes: "Configurações",
  "carregar-musica": "Carregar Música AI",
};

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const pageTransition = {
  type: "tween" as const,
  ease: "easeInOut" as const,
  duration: 0.3,
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-center" />
      <AppGate />
    </AuthProvider>
  );
}

function AppGate() {
  const { isAuthenticated, authHydrated, isBackendConfigured } = useAuth();

  if (!isBackendConfigured) {
    return <SupabaseConfigMissing />;
  }

  if (!authHydrated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#1c1315", color: "#a19a9b" }}
      >
        <p className="text-sm">A carregar sessão…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AnimatePresence>
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AuthPage />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <LibraryProvider>
      <FavoritesProvider>
        <MusicProvider>
          <AuthenticatedShell />
        </MusicProvider>
      </FavoritesProvider>
    </LibraryProvider>
  );
}

function LibraryErrorBanner() {
  const { libraryError, refreshLibrary } = useLibrary();
  if (!libraryError) return null;
  return (
    <div
      className="shrink-0 mx-4 sm:mx-6 lg:mx-[37px] mt-3 rounded-lg border border-[#ff164c]/40 bg-[#ff164c]/10 px-4 py-3 text-sm text-[#f8f8f8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      role="alert"
    >
      <span className="min-w-0">Não foi possível carregar a biblioteca: {libraryError}</span>
      <button
        type="button"
        onClick={() => void refreshLibrary()}
        className="shrink-0 px-3 py-1.5 rounded-md bg-[#ff164c] text-white font-semibold text-xs hover:opacity-90"
      >
        Tentar de novo
      </button>
    </div>
  );
}

function AuthenticatedShell() {
  const { signOut } = useAuth();
  const [activeNav, setActiveNav] = useState("inicio");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [browseCreatorId, setBrowseCreatorId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (searchQuery.trim()) {
        setActiveNav("descobrir");
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [searchQuery]);

  return (
    <div
      className="h-screen overflow-hidden relative"
      style={{ backgroundColor: "var(--color-bg-base)" }}
    >
      <div className="fixed inset-0 pointer-events-none z-0">
        <img
          src={bgImage}
          alt=""
          className="w-full h-full object-cover opacity-10"
          style={{ mixBlendMode: "lighten" }}
        />
      </div>

      <div className="flex h-screen relative z-10">
        <Sidebar
          activeItem={activeNav}
          onNavChange={(item) => {
            setActiveNav(item);
            setSidebarOpen(false);
          }}
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />

        <div className="flex flex-col flex-1 h-screen overflow-hidden lg:ml-0">
          <Navbar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onMenuToggle={() => setSidebarOpen(true)}
            onAvatarClick={() => setActiveNav("configuracoes")}
            onUploadClick={() => setActiveNav("carregar-musica")}
          />

          <LibraryErrorBanner />

          <div className="flex-1 overflow-y-auto scrollbar-hide pb-[132px] lg:pb-[90px] relative">
            <AnimatePresence mode="wait">
              {activeNav === "inicio" ? (
                <motion.div
                  key="inicio"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <HomePage
                    onNavigateToDiscover={() => setActiveNav("descobrir")}
                    onOpenCreatorProfile={(userId) => {
                      setBrowseCreatorId(userId);
                      setActiveNav("criador-perfil");
                    }}
                  />
                </motion.div>
              ) : activeNav === "criador-perfil" && browseCreatorId ? (
                <motion.div
                  key="criador-perfil"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <ProfilePage
                    isPublic={true}
                    profileUserId={browseCreatorId}
                    onBack={() => {
                      setBrowseCreatorId(null);
                      setActiveNav("inicio");
                    }}
                  />
                </motion.div>
              ) : activeNav === "descobrir" ? (
                <motion.div
                  key="descobrir"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <DiscoverPage
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                  />
                </motion.div>
              ) : activeNav === "playlist" ? (
                <motion.div
                  key="playlist"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <PlaylistsPage
                    onPlaylistClick={(pl) => {
                      setSelectedPlaylist(pl);
                      setActiveNav("playlist-detail");
                    }}
                  />
                </motion.div>
              ) : activeNav === "playlist-detail" ? (
                <motion.div
                  key="playlist-detail"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <PlaylistDetailPage
                    playlist={selectedPlaylist}
                    onBack={() => setActiveNav("playlist")}
                    onPlaylistDeleted={() => {
                      setSelectedPlaylist(null);
                      setActiveNav("playlist");
                    }}
                  />
                </motion.div>
              ) : activeNav === "favoritos" ? (
                <motion.div
                  key="favoritos"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <FavoritesPage />
                </motion.div>
              ) : activeNav === "perfil" ? (
                <motion.div
                  key="perfil"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <ProfilePage
                    isPublic={false}
                    onEditProfile={() => setActiveNav("configuracoes")}
                    onViewPublicProfile={() => setActiveNav("perfil-publico")}
                  />
                </motion.div>
              ) : activeNav === "perfil-publico" ? (
                <motion.div
                  key="perfil-publico"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <ProfilePage isPublic={true} />
                </motion.div>
              ) : activeNav === "configuracoes" ? (
                <motion.div
                  key="configuracoes"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <SettingsPage onLogout={() => signOut()} />
                </motion.div>
              ) : activeNav === "carregar-musica" ? (
                <motion.div
                  key="carregar-musica"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <UploadMusicPage onCancel={() => setActiveNav("inicio")} />
                </motion.div>
              ) : (
                <motion.div
                  key={activeNav}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <PlaceholderPage title={PAGE_LABELS[activeNav] ?? activeNav} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <BottomNav activeItem={activeNav} onNavChange={setActiveNav} />
      <MusicPlayer />
      <MiniPlayer />
      <FullScreenMobilePlayer />
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8"
      style={{ color: "var(--color-text-muted)" }}
    >
      <svg
        width="52"
        height="52"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ opacity: 0.2 }}
      >
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </svg>
      <p
        className="font-semibold"
        style={{ fontSize: "18px", color: "var(--color-text-primary)" }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: "13px",
          textAlign: "center",
          maxWidth: "300px",
          lineHeight: 1.7,
        }}
      >
        Esta seção está sendo desenvolvida. Continue explorando a plataforma!
      </p>
    </div>
  );
}
