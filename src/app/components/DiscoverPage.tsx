import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { SearchInput } from "./ui/SearchInput";
import { CategoryChip } from "./ui/CategoryChip";
import { MusicCard } from "./ui/MusicCard";
import { GenreCategorySelect } from "./ui/GenreCategorySelect";
import { Track } from "../context/MusicContext";
import { Button } from "./ui/button";
import { useLibrary } from "../context/LibraryContext";
import type { DiscoverTrack } from "../../types/music";
import {
  MUSIC_GENRES_CATALOG,
  mergeGenreNameLists,
} from "../../data/musicGenresCatalog";

const PAGE_SIZE = 16;
const SEARCH_DEBOUNCE_MS = 300;

function DiscoverGridSkeleton() {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6"
      aria-hidden="true"
    >
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} className="flex flex-col gap-3 animate-pulse">
          <div className="aspect-square w-full rounded-lg bg-white/10" />
          <div className="h-4 w-4/5 rounded bg-white/10" />
          <div className="h-3 w-3/5 rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}

interface DiscoverPageProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

export function DiscoverPage({
  searchQuery,
  onSearchQueryChange,
}: DiscoverPageProps) {
  const {
    discoverTracks,
    discoverCategories,
    searchPublishedTracks,
    libraryLoading,
    libraryError,
    refreshLibrary,
    createGenre,
  } = useLibrary();
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchRemote, setSearchRemote] = useState<DiscoverTrack[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const hasSearchQuery = searchQuery.trim().length > 0;

  const genrePickerOptions = useMemo(
    () =>
      mergeGenreNameLists(
        discoverCategories.filter((c) => c !== "Todos"),
        [...MUSIC_GENRES_CATALOG]
      ),
    [discoverCategories]
  );

  const popularChipCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of discoverTracks) {
      const c = t.category?.trim();
      if (!c) continue;
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    const sorted = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([n]) => n);
    const fallback = [
      "Pop",
      "Rock",
      "Gospel",
      "Eletrônica",
      "Samba",
      "Pagode",
      "MPB",
      "Clássica",
      "Emo",
    ];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const x of [...sorted, ...fallback]) {
      if (seen.has(x)) continue;
      seen.add(x);
      out.push(x);
      if (out.length >= 10) break;
    }
    return out;
  }, [discoverTracks]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchRemote(null);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    let cancelled = false;
    const id = window.setTimeout(() => {
      void searchPublishedTracks(q).then((rows) => {
        if (!cancelled) {
          setSearchRemote(rows);
          setSearchLoading(false);
        }
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [searchQuery, searchPublishedTracks]);

  const baseTracks = useMemo((): DiscoverTrack[] => {
    if (!hasSearchQuery) return discoverTracks;
    if (searchLoading) return [];
    return searchRemote ?? [];
  }, [hasSearchQuery, searchLoading, searchRemote, discoverTracks]);

  const filteredTracks = useMemo(() => {
    let result: DiscoverTrack[] = baseTracks;

    if (activeCategory !== "Todos") {
      result = result.filter((track) => track.category === activeCategory);
    }

    return result;
  }, [activeCategory, baseTracks]);

  const gridSlice = useMemo(
    () => filteredTracks.slice(0, visibleCount),
    [filteredTracks, visibleCount]
  );

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredTracks.length));
  }, [filteredTracks.length]);

  const handleCreateGenre = useCallback(
    async (name: string) => {
      try {
        await createGenre(name);
        toast.success(`Categoria “${name}” criada.`);
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Não foi possível criar a categoria.";
        toast.error(msg);
        throw e;
      }
    },
    [createGenre]
  );

  return (
    <div className="w-full min-h-full">
      <div className="px-4 sm:px-6 lg:px-[37px] py-6 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-[var(--color-text-primary)] mb-2">
            Descobrir
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm sm:text-base">
            Encontre sua próxima música criada com AI
          </p>
          {libraryError ? (
            <div className="mt-4 rounded-lg border border-[var(--color-brand)]/40 bg-[var(--color-active-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span>Não foi possível carregar as músicas.</span>
              <button
                type="button"
                onClick={() => void refreshLibrary()}
                className="shrink-0 px-3 py-1.5 rounded-md bg-[var(--color-brand)] text-white font-semibold text-xs"
              >
                Tentar de novo
              </button>
            </div>
          ) : null}
          {libraryLoading && discoverTracks.length === 0 && !hasSearchQuery ? (
            <p className="mt-4 text-sm text-[var(--color-text-secondary)]" aria-live="polite">
              A carregar músicas…
            </p>
          ) : null}
        </div>

        {hasSearchQuery ? (
          <div className="mb-6">
            <SearchInput
              value={searchQuery}
              onChange={onSearchQueryChange}
              placeholder="Buscar músicas ou artistas"
            />
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-lg border border-[var(--color-border-subtle)] flex flex-col sm:flex-row transition-colors focus-within:border-[var(--color-brand)] overflow-visible bg-[var(--color-bg-base)]">
              <div className="flex-1 min-w-0 border-b sm:border-b-0 sm:border-r border-[var(--color-border-subtle)] sm:rounded-tl-lg sm:rounded-bl-lg overflow-hidden">
                <SearchInput
                  variant="toolbar"
                  value={searchQuery}
                  onChange={onSearchQueryChange}
                  placeholder="Buscar músicas ou artistas"
                />
              </div>
              <div className="sm:w-[min(100%,280px)] shrink-0 sm:rounded-tr-lg sm:rounded-br-lg overflow-visible relative z-10">
                <GenreCategorySelect
                  aria-label="Filtrar por categoria"
                  value={activeCategory}
                  allValue="Todos"
                  allLabel="Categorias"
                  options={genrePickerOptions}
                  onChange={(next) => {
                    setActiveCategory(next);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  onCreateGenre={handleCreateGenre}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-8">
              <span className="text-[13px] font-semibold text-[var(--color-text-muted)] shrink-0">
                Mais visitadas
              </span>
              <div
                className="flex flex-wrap gap-2"
                style={{ scrollbarWidth: "none" }}
              >
                <CategoryChip
                  label="Todos"
                  active={activeCategory === "Todos"}
                  onClick={() => {
                    setActiveCategory("Todos");
                    setVisibleCount(PAGE_SIZE);
                  }}
                />
                {popularChipCategories.map((category) => (
                  <CategoryChip
                    key={category}
                    label={category}
                    active={activeCategory === category}
                    onClick={() => {
                      setActiveCategory(category);
                      setVisibleCount(PAGE_SIZE);
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {hasSearchQuery ? (
          <div className="space-y-4">
            {searchLoading ? (
              <p className="text-[var(--color-text-secondary)] text-sm mb-4" aria-live="polite">
                A pesquisar na base de dados…
              </p>
            ) : filteredTracks.length > 0 ? (
              <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                {filteredTracks.length} resultado
                {filteredTracks.length !== 1 ? "s" : ""} encontrado
                {filteredTracks.length !== 1 ? "s" : ""}
              </p>
            ) : null}
            {filteredTracks.length > 0 ? (
              <div className="space-y-2">
                {filteredTracks.map((track) => (
                  <MusicCard
                    key={track.id}
                    track={track}
                    variant="list"
                    quickActionsMode="othersOnly"
                    playbackQueue={filteredTracks as Track[]}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-[var(--color-text-secondary)] text-lg mb-4">
                  Nenhum resultado encontrado
                </p>
                <p className="text-[var(--color-text-muted)] text-sm">
                  Tente buscar por outro termo
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {libraryLoading && discoverTracks.length === 0 ? (
              <DiscoverGridSkeleton />
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
              {gridSlice.map((track) => (
                <MusicCard
                  key={track.id}
                  track={track}
                  variant="grid"
                  quickActionsMode="othersOnly"
                  playbackQueue={filteredTracks as Track[]}
                />
              ))}
            </div>
            )}

            {visibleCount < filteredTracks.length && (
              <div className="flex justify-center pt-10">
                <Button variant="outline" type="button" onClick={loadMore}>
                  Carregar mais
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
