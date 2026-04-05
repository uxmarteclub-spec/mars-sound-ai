import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
  useOutletContext,
} from "react-router";
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
import { BottomNav } from "./components/BottomNav";
import { SupabaseConfigMissing } from "./components/SupabaseConfigMissing";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { Toaster } from "./components/ui/sonner";
import { useLibrary, type Playlist } from "./context/LibraryContext";
import bgImage from "figma:asset/755a0ad35d80d322f261566363a27bca5637a26e.png";

const DiscoverPage = lazy(() =>
  import("./components/DiscoverPage").then((m) => ({ default: m.DiscoverPage }))
);
const PlaylistsPage = lazy(() =>
  import("./components/PlaylistsPage").then((m) => ({ default: m.PlaylistsPage }))
);
const PlaylistDetailPage = lazy(() =>
  import("./components/PlaylistDetailPage").then((m) => ({
    default: m.PlaylistDetailPage,
  }))
);
const FavoritesPage = lazy(() =>
  import("./components/FavoritesPage").then((m) => ({ default: m.FavoritesPage }))
);
const ProfilePage = lazy(() =>
  import("./components/ProfilePage").then((m) => ({ default: m.ProfilePage }))
);
const SettingsPage = lazy(() =>
  import("./components/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);
const UploadMusicPage = lazy(() =>
  import("./components/UploadMusicPage").then((m) => ({ default: m.UploadMusicPage }))
);
const AuthPage = lazy(() =>
  import("./components/AuthPage").then((m) => ({ default: m.AuthPage }))
);

const NAV_PATHS: Record<string, string> = {
  inicio: "/inicio",
  descobrir: "/descobrir",
  playlist: "/playlists",
  favoritos: "/favoritos",
  perfil: "/perfil",
};

export type ShellOutletContext = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
};

function sidebarIdFromPath(pathname: string): string {
  if (pathname === "/" || pathname === "/inicio") return "inicio";
  if (pathname.startsWith("/descobrir")) return "descobrir";
  if (pathname.startsWith("/playlists")) return "playlist";
  if (pathname.startsWith("/favoritos")) return "favoritos";
  if (pathname === "/perfil/publico") return "perfil-publico";
  if (pathname.startsWith("/perfil")) return "perfil";
  if (pathname.startsWith("/configuracoes")) return "configuracoes";
  if (pathname.startsWith("/carregar-musica")) return "carregar-musica";
  if (pathname.startsWith("/u/")) return "criador-perfil";
  return "inicio";
}

function navigateToNavItem(navigate: (to: string) => void, item: string) {
  const path = NAV_PATHS[item];
  if (path) navigate(path);
}

/** Preserva `?profile=` / `?playlist=` ao normalizar `/` → `/inicio`. */
function IndexToInicioRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/inicio${search}`} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-center" />
      <AppGate />
    </AuthProvider>
  );
}

function RouteFallback() {
  return (
    <div
      className="flex min-h-[50vh] w-full items-center justify-center text-sm"
      style={{ color: "var(--color-text-muted)" }}
    >
      A carregar…
    </div>
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
      <Suspense
        fallback={
          <div
            className="min-h-screen flex items-center justify-center text-sm"
            style={{ background: "#1c1315", color: "#a19a9b" }}
          >
            A carregar…
          </div>
        }
      >
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
      </Suspense>
    );
  }

  return (
    <LibraryProvider>
      <FavoritesProvider>
        <MusicProvider>
          <Routes>
            <Route element={<AuthenticatedShellLayout />}>
              <Route index element={<IndexToInicioRedirect />} />
              <Route path="inicio" element={<HomePageRoute />} />
              <Route path="descobrir" element={<DiscoverPageRoute />} />
              <Route path="playlists" element={<PlaylistsPageRoute />} />
              <Route path="playlists/:playlistId" element={<PlaylistDetailRoute />} />
              <Route path="favoritos" element={<FavoritesPage />} />
              <Route path="perfil" element={<ProfilePrivateRoute />} />
              <Route path="perfil/publico" element={<ProfilePage isPublic={true} />} />
              <Route path="configuracoes" element={<SettingsPageRoute />} />
              <Route path="carregar-musica" element={<UploadMusicPageRoute />} />
              <Route path="u/:userId" element={<CreatorProfileRoute />} />
              <Route path="termos" element={<PlaceholderPage title="Termos de utilização" />} />
              <Route path="privacidade" element={<PlaceholderPage title="Política de privacidade" />} />
              <Route path="*" element={<UnknownSectionPlaceholder />} />
            </Route>
          </Routes>
        </MusicProvider>
      </FavoritesProvider>
    </LibraryProvider>
  );
}

function HomePageRoute() {
  const navigate = useNavigate();
  return (
    <HomePage
      onNavigateToDiscover={() => navigate("/descobrir")}
      onOpenCreatorProfile={(userId) => navigate(`/u/${userId}`)}
    />
  );
}

function DiscoverPageRoute() {
  const { searchQuery, setSearchQuery } = useOutletContext<ShellOutletContext>();
  return (
    <DiscoverPage searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
  );
}

function PlaylistsPageRoute() {
  const navigate = useNavigate();
  return (
    <PlaylistsPage onPlaylistClick={(pl) => navigate(`/playlists/${pl.id}`)} />
  );
}

function PlaylistDetailRoute() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const { playlists, libraryLoading } = useLibrary();
  const navigate = useNavigate();

  if (libraryLoading) {
    return <RouteFallback />;
  }
  if (!playlistId) {
    return <Navigate to="/playlists" replace />;
  }
  const pl = playlists.find((p) => p.id === playlistId);
  if (!pl) {
    return <Navigate to="/playlists" replace />;
  }
  return (
    <PlaylistDetailPage
      playlist={pl}
      onBack={() => navigate("/playlists")}
      onPlaylistDeleted={() => navigate("/playlists")}
    />
  );
}

function SettingsPageRoute() {
  const { signOut } = useAuth();
  return <SettingsPage onLogout={() => void signOut()} />;
}

function UploadMusicPageRoute() {
  const navigate = useNavigate();
  return <UploadMusicPage onCancel={() => navigate("/inicio")} />;
}

function CreatorProfileRoute() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  if (!userId?.trim()) {
    return <Navigate to="/inicio" replace />;
  }
  return (
    <ProfilePage
      isPublic={true}
      profileUserId={userId}
      onBack={() => navigate("/inicio")}
    />
  );
}

function ProfilePrivateRoute() {
  const navigate = useNavigate();
  return (
    <ProfilePage
      isPublic={false}
      onEditProfile={() => navigate("/configuracoes")}
      onViewPublicProfile={() => navigate("/perfil/publico")}
    />
  );
}

function UnknownSectionPlaceholder() {
  return <PlaceholderPage title="Página não encontrada" />;
}

function LegacyQueryRedirects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { playlists, libraryLoading } = useLibrary();
  const profileHandled = useRef(false);
  const playlistHandled = useRef(false);

  useEffect(() => {
    if (profileHandled.current) return;
    const prid = searchParams.get("profile")?.trim();
    if (!prid) return;
    profileHandled.current = true;
    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const next = new URLSearchParams(searchParams);
    next.delete("profile");
    if (!uuidRe.test(prid)) {
      toast.error("Link de perfil inválido.");
      setSearchParams(next, { replace: true });
      return;
    }
    setSearchParams(next, { replace: true });
    navigate(`/u/${prid}`, { replace: true });
  }, [searchParams, setSearchParams, navigate]);

  useEffect(() => {
    if (playlistHandled.current || libraryLoading) return;
    const pid = searchParams.get("playlist")?.trim();
    if (!pid) return;
    playlistHandled.current = true;
    const next = new URLSearchParams(searchParams);
    next.delete("playlist");
    const found = playlists.find((p: Playlist) => p.id === pid);
    if (found) {
      setSearchParams(next, { replace: true });
      navigate(`/playlists/${pid}`, { replace: true });
    } else {
      toast.error("Playlist não encontrada nesta conta.");
      setSearchParams(next, { replace: true });
    }
  }, [libraryLoading, playlists, searchParams, setSearchParams, navigate]);

  return null;
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

function AuthenticatedShellLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeNav = sidebarIdFromPath(location.pathname);

  const pageVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
      };

  const pageTransition = prefersReducedMotion
    ? { duration: 0 }
    : {
        type: "tween" as const,
        ease: "easeInOut" as const,
        duration: 0.3,
      };

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (searchQuery.trim()) {
        navigate("/descobrir");
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [searchQuery, navigate]);

  const outletContext: ShellOutletContext = { searchQuery, setSearchQuery };

  return (
    <div
      className="min-h-dvh h-dvh overflow-hidden relative flex flex-col"
      style={{ backgroundColor: "var(--color-bg-base)" }}
    >
      <LegacyQueryRedirects />
      <div className="fixed inset-0 pointer-events-none z-0">
        <img
          src={bgImage}
          alt=""
          className="w-full h-full object-cover opacity-10"
          style={{ mixBlendMode: "lighten" }}
        />
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar
          activeItem={activeNav}
          onNavChange={(item) => {
            navigateToNavItem(navigate, item);
            setSidebarOpen(false);
          }}
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
          prefersReducedMotion={prefersReducedMotion}
        />

        <div className="flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden lg:ml-0">
          <Navbar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onMenuToggle={() => setSidebarOpen(true)}
            onAvatarClick={() => navigate("/configuracoes")}
            onUploadClick={() => navigate("/carregar-musica")}
          />

          <LibraryErrorBanner />

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-[132px] lg:pb-[90px] relative">
            <Suspense fallback={<RouteFallback />}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <Outlet context={outletContext} />
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </div>
        </div>
      </div>

      <BottomNav
        activeItem={activeNav}
        onNavChange={(item) => navigateToNavItem(navigate, item)}
      />
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
        Esta secção está em desenvolvimento. Explora o resto da plataforma.
      </p>
    </div>
  );
}
