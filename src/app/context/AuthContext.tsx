import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { AuthError, Session } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  authHydrated: boolean;
  /** URL pública do avatar em `users.avatar` (navbar, etc.). */
  profileAvatarUrl: string | null;
  /** Recarrega `users.avatar` do Supabase (ex.: após guardar perfil). */
  refreshProfile: () => Promise<void>;
  /** True quando VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidos. */
  isBackendConfigured: boolean;
  signInWithPassword: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}

function sessionToUser(session: Session | null): AuthUser | null {
  const u = session?.user;
  if (!u?.email) return null;
  const meta = u.user_metadata as { name?: string } | undefined;
  const displayName =
    (meta?.name && String(meta.name).trim()) ||
    u.email.split("@")[0] ||
    "Utilizador";
  return {
    id: u.id,
    email: u.email,
    displayName,
  };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isBackendConfigured = isSupabaseConfigured();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [authHydrated, setAuthHydrated] = useState(!isBackendConfigured);

  const fetchAvatarForUserId = useCallback(
    async (userId: string | null) => {
      if (!userId || !isBackendConfigured) {
        setProfileAvatarUrl(null);
        return;
      }
      const sb = getSupabase();
      if (!sb) {
        setProfileAvatarUrl(null);
        return;
      }
      const { data } = await sb
        .from("users")
        .select("avatar")
        .eq("id", userId)
        .maybeSingle();
      const url =
        data &&
        typeof (data as { avatar?: string | null }).avatar === "string"
          ? (data as { avatar: string }).avatar.trim()
          : "";
      setProfileAvatarUrl(url || null);
    },
    [isBackendConfigured]
  );

  const refreshProfile = useCallback(async () => {
    await fetchAvatarForUserId(user?.id ?? null);
  }, [fetchAvatarForUserId, user?.id]);

  useEffect(() => {
    void fetchAvatarForUserId(user?.id ?? null);
  }, [user?.id, fetchAvatarForUserId]);

  useEffect(() => {
    if (!isBackendConfigured) return;
    const sb = getSupabase();
    if (!sb) {
      setAuthHydrated(true);
      return;
    }

    let cancelled = false;
    sb.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!cancelled) {
          setUser(sessionToUser(session));
          setAuthHydrated(true);
        }
      })
      .catch(() => {
        if (!cancelled) setAuthHydrated(true);
      });

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(sessionToUser(session));
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [isBackendConfigured]);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const trimmed = email.trim();
      if (!trimmed || !isBackendConfigured) {
        return { error: { message: "Supabase não configurado." } as AuthError };
      }
      const sb = getSupabase();
      if (!sb) return { error: { message: "Cliente indisponível" } as AuthError };
      const { error } = await sb.auth.signInWithPassword({
        email: trimmed,
        password,
      });
      return { error };
    },
    [isBackendConfigured]
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const trimmed = email.trim();
      if (!trimmed || !isBackendConfigured) {
        return { error: { message: "Supabase não configurado." } as AuthError };
      }
      const sb = getSupabase();
      if (!sb) return { error: { message: "Cliente indisponível" } as AuthError };
      const usernameBase =
        trimmed
          .split("@")[0]
          ?.replace(/[^a-zA-Z0-9_]/g, "_")
          .toLowerCase() || "user";
      const { error } = await sb.auth.signUp({
        email: trimmed,
        password,
        options: {
          data: {
            name: displayName.trim() || usernameBase,
            username: usernameBase,
          },
        },
      });
      return { error };
    },
    [isBackendConfigured]
  );

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    await sb?.auth.signOut();
    setUser(null);
    setProfileAvatarUrl(null);
  }, []);

  const resetPasswordForEmail = useCallback(
    async (email: string) => {
      const trimmed = email.trim();
      if (!isBackendConfigured || !trimmed) {
        return { error: { message: "Supabase não configurado" } as AuthError };
      }
      const sb = getSupabase();
      if (!sb) return { error: { message: "Cliente indisponível" } as AuthError };
      const redirectTo = `${window.location.origin}/`;
      const { error } = await sb.auth.resetPasswordForEmail(trimmed, {
        redirectTo,
      });
      return { error };
    },
    [isBackendConfigured]
  );

  const updatePassword = useCallback(
    async (newPassword: string) => {
      if (!isBackendConfigured) {
        return { error: { message: "Supabase não configurado" } as AuthError };
      }
      const sb = getSupabase();
      if (!sb) return { error: { message: "Cliente indisponível" } as AuthError };
      const { error } = await sb.auth.updateUser({ password: newPassword });
      return { error };
    },
    [isBackendConfigured]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      authHydrated,
      profileAvatarUrl,
      refreshProfile,
      isBackendConfigured,
      signInWithPassword,
      signUp,
      signOut,
      resetPasswordForEmail,
      updatePassword,
    }),
    [
      user,
      authHydrated,
      profileAvatarUrl,
      refreshProfile,
      isBackendConfigured,
      signInWithPassword,
      signUp,
      signOut,
      resetPasswordForEmail,
      updatePassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
