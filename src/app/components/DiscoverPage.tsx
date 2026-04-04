import { useState, useMemo, useCallback, useEffect } from "react";
import { SearchInput } from "./ui/SearchInput";
import { CategoryChip } from "./ui/CategoryChip";
import { MusicCard } from "./ui/MusicCard";
import { Track } from "../context/MusicContext";
import { Button } from "./ui/Button";
import { useLibrary } from "../context/LibraryContext";
import type { DiscoverTrack } from "../../types/music";

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

const PAGE_SIZE = 16;

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
  } = useLibrary();
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchRemote, setSearchRemote] = useState<DiscoverTrack[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const hasSearchQuery = searchQuery.trim().length > 0;

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchRemote(null);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    let cancelled = false;
    void searchPublishedTracks(searchQuery.trim()).then((rows) => {
      if (!cancelled) {
        setSearchRemote(rows);
        setSearchLoading(false);
      }
    });
    return () => {
      cancelled = true;
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
  }, [searchQuery, activeCategory, baseTracks]);

  const gridSlice = useMemo(
    () => filteredTracks.slice(0, visibleCount),
    [filteredTracks, visibleCount]
  );

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredTracks.length));
  }, [filteredTracks.length]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-[37px] py-6 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-white mb-2">Descobrir</h1>
          <p className="text-[#a19a9b] text-sm sm:text-base">
            Encontre sua próxima música criada com AI
          </p>
          {libraryError ? (
            <div className="mt-4 rounded-lg border border-[#ff164c]/40 bg-[#ff164c]/10 px-4 py-3 text-sm text-[#f8f8f8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span>Não foi possível carregar as músicas.</span>
              <button
                type="button"
                onClick={() => void refreshLibrary()}
                className="shrink-0 px-3 py-1.5 rounded-md bg-[#ff164c] text-white font-semibold text-xs"
              >
                Tentar de novo
              </button>
            </div>
          ) : null}
          {libraryLoading && discoverTracks.length === 0 ? (
            <p className="mt-4 text-sm text-[#a19a9b]">A carregar músicas…</p>
          ) : null}
        </div>

        <div className="mb-6">
          <SearchInput
            value={searchQuery}
            onChange={onSearchQueryChange}
            placeholder="Buscar músicas ou artistas"
          />
        </div>

        {hasSearchQuery ? (
          <div className="space-y-4">
            {searchLoading ? (
              <p className="text-[#a19a9b] text-sm mb-4">A pesquisar na base de dados…</p>
            ) : (
              <p className="text-[#a19a9b] text-sm mb-4">
                {filteredTracks.length} resultado{filteredTracks.length !== 1 ? "s" : ""} encontrado{filteredTracks.length !== 1 ? "s" : ""}
              </p>
            )}
            {filteredTracks.length > 0 ? (
              <div className="space-y-2">
                {filteredTracks.map((track) => (
                  <MusicCard
                    key={track.id}
                    track={track}
                    variant="list"
                    playbackQueue={filteredTracks as Track[]}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-[#a19a9b] text-lg mb-4">Nenhum resultado encontrado</p>
                <p className="text-[#5b4f51] text-sm">Tente buscar por outro termo</p>
              </div>
            )}

          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              <span className="text-[#a19a9b] text-sm font-semibold shrink-0">Categorias</span>
              <div className="flex items-center gap-2 flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {discoverCategories.map((category) => (
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
              <button
                type="button"
                className="flex items-center gap-2 text-[#a19a9b] hover:text-white transition-colors duration-150 shrink-0"
                aria-hidden
              >
                <ChevronDownIcon />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
              {gridSlice.map((track) => (
                <MusicCard
                  key={track.id}
                  track={track}
                  variant="grid"
                  playbackQueue={filteredTracks as Track[]}
                />
              ))}
            </div>

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
