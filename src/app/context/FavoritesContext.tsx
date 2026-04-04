import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { useAuth } from "./AuthContext";

function storageKeyForUser(userId: string | undefined): string {
  const id = userId ?? "anon";
  return `mars-sound-favorite-ids-${id}`;
}

function loadIds(userId: string | undefined): Set<string> {
  try {
    const raw = sessionStorage.getItem(storageKeyForUser(userId));
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveIds(userId: string | undefined, ids: Set<string>) {
  try {
    sessionStorage.setItem(
      storageKeyForUser(userId),
      JSON.stringify([...ids])
    );
  } catch {
    /* ignore */
  }
}

interface FavoritesContextValue {
  favoriteIds: ReadonlySet<string>;
  isFavorite: (trackId: string) => boolean;
  toggleFavorite: (trackId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined
);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() =>
    loadIds(user?.id)
  );

  useEffect(() => {
    if (!user?.id) {
      setFavoriteIds(new Set());
      return;
    }
    const sb = getSupabase();
    if (!sb) return;
    let cancelled = false;
    void sb
      .from("favorites")
      .select("track_id")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (cancelled || error) return;
        const next = new Set(
          (data ?? []).map((r: { track_id: string }) => r.track_id)
        );
        setFavoriteIds(next);
        saveIds(user.id, next);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const isFavorite = useCallback(
    (trackId: string) => favoriteIds.has(trackId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    (trackId: string) => {
      if (!user?.id) return;
      const sb = getSupabase();
      if (!sb) return;

      const willFavorite = !favoriteIds.has(trackId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (willFavorite) next.add(trackId);
        else next.delete(trackId);
        saveIds(user.id, next);
        return next;
      });

      void (async () => {
        try {
          if (willFavorite) {
            const { error } = await sb.from("favorites").insert({
              user_id: user.id,
              track_id: trackId,
            });
            if (error) throw error;
          } else {
            const { error } = await sb
              .from("favorites")
              .delete()
              .eq("user_id", user.id)
              .eq("track_id", trackId);
            if (error) throw error;
          }
        } catch {
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (willFavorite) next.delete(trackId);
            else next.add(trackId);
            saveIds(user.id, next);
            return next;
          });
        }
      })();
    },
    [user?.id, favoriteIds]
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds,
      isFavorite,
      toggleFavorite,
    }),
    [favoriteIds, isFavorite, toggleFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
