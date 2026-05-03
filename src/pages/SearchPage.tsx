import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MagnifyingGlass, SortAscending, X } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/layout/PageContainer";
import { PosterCard } from "@/components/content/PosterCard";
import { EmptyState } from "@/components/common/EmptyState";
import { StreamingLoader } from "@/components/common/StreamingLoader";
import { getSearchHistory, saveSearchTerm } from "@/lib/storage";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { motion, AnimatePresence } from "framer-motion";
import { useStreamCatalog } from "@/hooks/useStreamCatalog";
import {
  fetchStreamxieFilterOptions,
  getStreamSearchScopeLabel,
  searchTmdbCatalog,
  searchStreamCatalogByScope,
  type StreamSearchScope,
} from "@/lib/streamxie";
import type { ContentItem } from "@/types/content";

type SearchPageProps = {
  myList: string[];
  onToggleList: (id: string) => void;
};

type SortOption = "relevance" | "rating" | "year-desc" | "year-asc" | "title";

const sortLabels: Record<SortOption, string> = {
  relevance: "Relevance",
  rating: "Top Rated",
  "year-desc": "Newest First",
  "year-asc": "Oldest First",
  title: "A–Z",
};

export const SearchPage = ({ myList, onToggleList }: SearchPageProps) => {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") || "";
  const scopeParam = params.get("scope");
  const scope: StreamSearchScope = scopeParam === "streamxie1" || scopeParam === "streamxie2" || scopeParam === "streamxie3"
    ? scopeParam
    : "tmdb";
  const { items: catalogItems } = useStreamCatalog();
  const [query, setQuery] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [liveResults, setLiveResults] = useState<ContentItem[] | null>(null);
  const [scopeKeywords, setScopeKeywords] = useState<string[]>([]);
  const [activeGenres, setActiveGenres] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("relevance");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);
  const scopeLabel = getStreamSearchScopeLabel(scope);

  useDocumentMeta(
    `Search ${scopeLabel} | streamXie`,
    `Search titles from ${scopeLabel} catalog.`,
  );

  const withScopeParams = (value: string) => {
    const nextParams = new URLSearchParams();
    const normalized = value.trim();
    if (normalized) nextParams.set("q", normalized);
    if (scope !== "tmdb") nextParams.set("scope", scope);
    return nextParams;
  };

  const recent = getSearchHistory();
  const suggestedKeywords = useMemo(() => {
    if (scope !== "tmdb") return scopeKeywords.slice(0, 12);
    const values = catalogItems.flatMap((item) => item.genres);
    return Array.from(new Set(values.filter(Boolean))).slice(0, 12);
  }, [catalogItems, scope, scopeKeywords]);

  useEffect(() => {
    let mounted = true;

    if (scope === "tmdb") {
      setScopeKeywords([]);
      return () => {
        mounted = false;
      };
    }

    fetchStreamxieFilterOptions(scope)
      .then((options) => {
        if (!mounted) return;
        setScopeKeywords(options.genres.map((entry) => entry.title));
      })
      .catch(() => {
        if (mounted) setScopeKeywords([]);
      });

    return () => {
      mounted = false;
    };
  }, [scope]);

  useEffect(() => {
    let mounted = true;
    const normalized = initial.trim();

    if (!normalized) {
      setLiveResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const searchPromise = scope === "tmdb"
      ? searchTmdbCatalog(normalized)
      : searchStreamCatalogByScope(normalized, scope);

    searchPromise
      .then((items) => {
        if (mounted) setLiveResults(items);
      })
      .catch(() => {
        if (mounted) setLiveResults(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [initial, scope]);

  useEffect(() => {
    if (!showSortMenu) return;

    const closeOnOutsidePress = (event: MouseEvent | PointerEvent) => {
      const container = sortMenuRef.current;
      if (!container) return;
      if (!container.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSortMenu(false);
      }
    };

    window.addEventListener("pointerdown", closeOnOutsidePress);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutsidePress);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [showSortMenu]);

  const baseResults = useMemo(() => {
    if (!initial.trim()) return [];
    return liveResults ?? [];
  }, [initial, liveResults]);

  useEffect(() => {
    if (!initial || baseResults.length === 0) {
      setShowSortMenu(false);
    }
  }, [initial, baseResults.length]);

  const results = useMemo(() => {
    let filtered = baseResults;

    // Filter genre
    if (activeGenres.length > 0) {
      filtered = filtered.filter((item) =>
        activeGenres.every((g) => item.genres.includes(g)),
      );
    }

    // Urutkan hasil
    const sorted = [...filtered];
    if (sort === "rating") sorted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    else if (sort === "year-desc") sorted.sort((a, b) => b.year - a.year);
    else if (sort === "year-asc") sorted.sort((a, b) => a.year - b.year);
    else if (sort === "title") sorted.sort((a, b) => a.title.localeCompare(b.title));

    return sorted;
  }, [baseResults, activeGenres, sort]);

  // Kumpulkan genre yang tersedia dari hasil dasar saat ini
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    baseResults.forEach((item) => item.genres.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [baseResults]);

  const toggleGenre = (genre: string) => {
    setActiveGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const clearFilters = () => {
    setActiveGenres([]);
    setSort("relevance");
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setShowSortMenu(false);
    setActiveGenres([]);
    saveSearchTerm(query);
    setParams(withScopeParams(query));
  };

  const hasFilters = activeGenres.length > 0 || sort !== "relevance";

  return (
    <PageContainer className="pt-32 pb-16">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-medium uppercase tracking-[0.1em] text-foreground md:text-5xl">
          Search
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Search from {scopeLabel} and refine by genre and sort controls.
        </p>
        <form
          onSubmit={onSubmit}
          className="mt-8 flex items-center gap-3 rounded-lg border border-border bg-card px-5 py-4"
        >
          <MagnifyingGlass size={32} weight="duotone" className="text-primary" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={`Search ${scopeLabel}`}
            placeholder={`Search ${scopeLabel} titles, genres, and stories`}
            className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setParams(withScopeParams("")); clearFilters(); }}
              aria-label="Clear search query"
              title="Clear search"
              className="shrink-0 flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
            >
              <X size={18} weight="bold" />
            </button>
          )}
        </form>

        {/* Kata kunci terbaru + populer (muncul saat query kosong) */}
        {!initial && (
          <div className="mt-8 space-y-5">
            <div>
              <p className="mb-3 text-sm text-muted-foreground">Recent searches</p>
              <div className="flex flex-wrap justify-center gap-3">
                {recent.length > 0 ? (
                  recent.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => { setQuery(term); setParams(withScopeParams(term)); }}
                      className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {term}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent searches yet.</p>
                )}
              </div>
            </div>
            {suggestedKeywords.length > 0 ? (
              <div>
                <p className="mb-3 text-sm text-muted-foreground">Trending keywords</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {suggestedKeywords.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => { setQuery(term); setParams(withScopeParams(term)); }}
                      className="rounded-full border border-border bg-secondary/30 px-4 py-2 text-sm text-secondary-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>

      {/* Baris filter + urutkan — tampil saat ada hasil dasar */}
      <AnimatePresence>
        {initial && baseResults.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mt-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              {/* Chip genre */}
              <div className="flex flex-wrap gap-2">
                {availableGenres.map((genre) => {
                  const active = activeGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`min-h-10 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                        active
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground"
                      }`}
                    >
                      {active && <span className="mr-1">✓</span>}
                      {genre}
                    </button>
                  );
                })}
              </div>

              {/* Urutkan + bersihkan */}
              <div className="flex shrink-0 items-center gap-2">
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-red-500/60 hover:text-red-400"
                  >
                    <X size={12} weight="bold" />
                    Clear
                  </button>
                )}
                <div ref={sortMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSortMenu((v) => !v)}
                    className="flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/60"
                  >
                    <SortAscending size={13} weight="bold" />
                    {sortLabels[sort]}
                  </button>
                  {showSortMenu && (
                    <div className="absolute right-0 top-full z-30 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-card/95 py-1 shadow-xl backdrop-blur-xl">
                      {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => { setSort(key); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-xs transition-colors ${sort === key ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-card/80 hover:text-primary"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ringkasan filter */}
            {hasFilters && (
              <p className="mt-3 text-xs text-muted-foreground">
                Showing {results.length} of {baseResults.length} results
                {activeGenres.length > 0 && ` · filtered by ${activeGenres.join(", ")}`}
                {sort !== "relevance" && ` · sorted by ${sortLabels[sort]}`}
              </p>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <section className="mt-8">
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-card/35">
            <StreamingLoader
              label="Searching"
              words={["title...", "overview...", "genres...", "matches..."]}
            />
          </div>
        ) : results.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 gap-5 md:grid-cols-4 xl:grid-cols-6"
          >
            <AnimatePresence mode="popLayout">
              {results.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <PosterCard
                    item={item}
                    inList={myList.includes(item.id)}
                    onToggleList={onToggleList}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : initial ? (
          <EmptyState
            title={activeGenres.length > 0 ? `No ${activeGenres.join(" + ")} results` : "No content found."}
            description={activeGenres.length > 0 ? "Try removing some genre filters." : "Try a different keyword, broader genre, or shorter title phrase."}
          />
        ) : (
          <EmptyState
            title="Start with a title or genre"
            description="Use search to jump directly into movies, series, anime, drama, and variety."
          />
        )}
      </section>
    </PageContainer>
  );
};
