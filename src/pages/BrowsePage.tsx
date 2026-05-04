import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { FilterPanel, BrowseFilters } from "@/components/browse/FilterPanel";
import { QuickFilterChips } from "@/components/browse/QuickFilterChips";
import { PosterCard } from "@/components/content/PosterCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeader } from "@/components/common/SectionHeader";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import {
  fetchTmdbBrowseFacets,
  TmdbBrowseFilters,
  fetchTmdbBrowsePage,
  getStreamProviderLabel,
  TmdbBrowseScope,
} from "@/lib/streamxie";
import type { ContentItem } from "@/types/content";

type BrowsePageProps = {
  myList: string[];
  onToggleList: (id: string) => void;
};

const INITIAL_VISIBLE_ITEMS = 48;
const LOAD_MORE_STEP = 48;
const PROVIDER_CHIPS = ["TMDB"] as const;
const CHIP_OPTIONS = ["All", "Movies", "Series", ...PROVIDER_CHIPS] as const;

export const BrowsePage = ({ myList, onToggleList }: BrowsePageProps) => {
  useDocumentMeta(
    "Jelajah Film, Series, Drama & Anime | streamXie",
    "Jelajahi katalog film, series, anime, dan drama di streamXie dengan filter genre dan tahun yang cepat untuk menemukan tontonan berikutnya dalam hitungan detik.",
  );

  const location = useLocation();
  const navigate = useNavigate();
  const initialCategory = new URLSearchParams(location.search).get("category");

  const [activeChip, setActiveChip] = useState(
    initialCategory && CHIP_OPTIONS.includes(initialCategory as (typeof CHIP_OPTIONS)[number]) ? initialCategory : "All",
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_ITEMS);
  const [catalogItems, setCatalogItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedPage, setLoadedPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [genreFilterOptions, setGenreFilterOptions] = useState<string[]>([]);
  const [genreNameToId, setGenreNameToId] = useState<Map<string, number>>(new Map());
  const [languageFilterOptions, setLanguageFilterOptions] = useState<string[]>([]);
  const requestSequenceRef = useRef(0);

  const [filters, setFilters] = useState<BrowseFilters>({
    genre: "All",
    year: "All",
    type: "All",
    country: "All",
    status: "All",
    provider: "All",
    sort: "Popularity",
  });

  const sortMode = useMemo(
    () =>
      filters.sort === "Latest" || filters.sort === "Rating" || filters.sort === "Popularity"
        ? filters.sort
        : "Popularity",
    [filters.sort],
  );

  const tmdbScope = useMemo<TmdbBrowseScope>(() => {
    if (activeChip === "Movies") return "movie";
    if (activeChip === "Series") return "tv";
    if (filters.type === "Movies") return "movie";
    if (filters.type === "Series") return "tv";
    return "all";
  }, [activeChip, filters.type]);

  const tmdbServerFilters = useMemo<TmdbBrowseFilters>(() => {
    const parsedYear = Number.parseInt(filters.year, 10);
    const statusFilter = filters.status === "Released" || filters.status === "Upcoming" ? filters.status : undefined;
    return {
      genreId: filters.genre !== "All" ? genreNameToId.get(filters.genre) : undefined,
      year: filters.year !== "All" && Number.isFinite(parsedYear) ? parsedYear : undefined,
      language: filters.country !== "All" ? filters.country : undefined,
      status: statusFilter,
    };
  }, [filters.country, filters.genre, filters.status, filters.year, genreNameToId]);

  const mergeUniqueItems = useCallback((currentItems: ContentItem[], nextItems: ContentItem[]) => {
    const itemMap = new Map<string, ContentItem>();
    currentItems.forEach((item) => itemMap.set(item.id, item));
    nextItems.forEach((item) => itemMap.set(item.id, item));
    return Array.from(itemMap.values());
  }, []);

  useEffect(() => {
    const category = new URLSearchParams(location.search).get("category");
    if (!category || !CHIP_OPTIONS.includes(category as (typeof CHIP_OPTIONS)[number])) {
      if (activeChip !== "All") setActiveChip("All");
      setFilters((current) => ({ ...current, type: "All" }));
      return;
    }
    if (category !== activeChip) setActiveChip(category);
    setFilters((current) => ({
      ...current,
      type: category === "Movies" || category === "Series" ? category : "All",
    }));
  }, [activeChip, location.search]);

  useEffect(() => {
    if (filters.type === "Movies" && activeChip !== "Movies") {
      setActiveChip("Movies");
      navigate("/browse?category=Movies", { replace: true });
      return;
    }
    if (filters.type === "Series" && activeChip !== "Series") {
      setActiveChip("Series");
      navigate("/browse?category=Series", { replace: true });
      return;
    }
    if (filters.type === "All" && (activeChip === "Movies" || activeChip === "Series")) {
      setActiveChip("All");
      navigate("/browse", { replace: true });
    }
  }, [activeChip, filters.type, navigate]);

  useEffect(() => {
    if (filters.sort === "All") {
      setFilters((current) => ({ ...current, sort: "Popularity" }));
    }
  }, [filters.sort]);

  useEffect(() => {
    let mounted = true;
    fetchTmdbBrowseFacets()
      .then((facets) => {
        if (!mounted) return;
        const genreMap = new Map<string, number>();
        facets.genres.forEach((genre) => {
          const id = Number.parseInt(genre.value, 10);
          if (Number.isFinite(id) && id > 0) {
            genreMap.set(genre.label, id);
          }
        });
        setGenreNameToId(genreMap);
        setGenreFilterOptions(facets.genres.map((genre) => genre.label));
        setLanguageFilterOptions(facets.languages.map((language) => language.value));
      })
      .catch(() => {
        if (!mounted) return;
        setGenreNameToId(new Map());
        setGenreFilterOptions([]);
        setLanguageFilterOptions([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;

    setLoading(true);
    setLoadingMore(false);
    setLoadError(null);
    setCatalogItems([]);
    setLoadedPage(0);
    setTotalPages(1);
    setTotalResults(0);
    setVisibleCount(INITIAL_VISIBLE_ITEMS);

    fetchTmdbBrowsePage(tmdbScope, 1, sortMode, tmdbServerFilters)
      .then((response) => {
        if (!isMounted || requestSequenceRef.current !== requestId) return;
        setCatalogItems(response.items);
        setLoadedPage(response.page);
        setTotalPages(response.totalPages);
        setTotalResults(response.totalResults);
      })
      .catch((error: unknown) => {
        if (!isMounted || requestSequenceRef.current !== requestId) return;
        setLoadError(error instanceof Error ? error.message : "Gagal memuat katalog TMDB.");
      })
      .finally(() => {
        if (!isMounted || requestSequenceRef.current !== requestId) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tmdbScope, sortMode, tmdbServerFilters]);

  const filterOptions = useMemo(() => {
    const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort();
    const currentYear = new Date().getFullYear() + 1;
    const years = Array.from({ length: 80 }, (_, index) => String(currentYear - index));

    return {
      genres: genreFilterOptions.length > 0 ? genreFilterOptions : unique(catalogItems.flatMap((item) => item.genres)),
      years,
      countries: languageFilterOptions.length > 0 ? languageFilterOptions : unique(catalogItems.map((item) => item.country)),
      statuses: ["Released", "Upcoming"],
      contentTypes: ["Movies", "Series"],
      providers: unique(catalogItems.map((item) => getStreamProviderLabel(item.provider))),
      sortOptions: ["Popularity", "Latest", "Rating"],
    };
  }, [catalogItems, genreFilterOptions, languageFilterOptions]);

  const filtered = useMemo(() => {
    let items = [...catalogItems];
    if (activeChip !== "All" && PROVIDER_CHIPS.includes(activeChip as (typeof PROVIDER_CHIPS)[number])) {
      items = items.filter((item) => getStreamProviderLabel(item.provider) === activeChip);
    }
    if (filters.provider !== "All") items = items.filter((item) => getStreamProviderLabel(item.provider) === filters.provider);
    if (filters.sort === "Latest") items.sort((a, b) => b.year - a.year);
    if (filters.sort === "Rating") items.sort((a, b) => Number(b.rating) - Number(a.rating));
    return items;
  }, [activeChip, catalogItems, filters]);

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => key !== "sort" && value !== "All");
  const visibleItems = filtered.slice(0, visibleCount);
  const canLoadMoreResults = !loading && (visibleCount < filtered.length || loadedPage < totalPages);
  const subtitle = loading
    ? "Memuat katalog TMDB..."
    : `${visibleItems.length.toLocaleString()} title tampil · ${catalogItems.length.toLocaleString()} termuat dari ${totalResults.toLocaleString()} total TMDB`;

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_ITEMS);
  }, [activeChip, filters]);

  const resetFilters = () => {
    setFilters({
      genre: "All",
      year: "All",
      type: "All",
      country: "All",
      status: "All",
      provider: "All",
      sort: "Popularity",
    });
  };

  const loadMore = useCallback(async () => {
    if (loading || loadingMore) return;

    if (visibleCount < filtered.length) {
      setVisibleCount((current) => Math.min(current + LOAD_MORE_STEP, filtered.length));
      return;
    }

    if (loadedPage >= totalPages) return;

    const requestId = requestSequenceRef.current;
    const nextPage = loadedPage + 1;
    setLoadingMore(true);
    setLoadError(null);

    try {
      const response = await fetchTmdbBrowsePage(tmdbScope, nextPage, sortMode, tmdbServerFilters);
      if (requestSequenceRef.current !== requestId) return;
      setCatalogItems((current) => mergeUniqueItems(current, response.items));
      setLoadedPage(response.page);
      setTotalPages(response.totalPages);
      setTotalResults(response.totalResults);
      setVisibleCount((current) => current + response.items.length);
    } catch (error: unknown) {
      if (requestSequenceRef.current !== requestId) return;
      setLoadError(error instanceof Error ? error.message : "Gagal memuat halaman lanjutan TMDB.");
    } finally {
      if (requestSequenceRef.current === requestId) setLoadingMore(false);
    }
  }, [filtered.length, loadedPage, loading, loadingMore, mergeUniqueItems, sortMode, tmdbScope, tmdbServerFilters, totalPages, visibleCount]);

  return (
    <PageContainer className="pt-32 pb-16">
      <SectionHeader
        headingLevel="h1"
        title="Browse"
        subtitle={subtitle}
        action={
          hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-error hover:text-error"
            >
              Clear filters
            </button>
          ) : undefined
        }
      />

      <div className="space-y-5">
        {/* Chip kategori cepat */}
        <QuickFilterChips
          filters={[...CHIP_OPTIONS]}
          active={activeChip}
          onChange={(value) => {
            setActiveChip(value);
            setFilters((current) => ({
              ...current,
              type: value === "Movies" || value === "Series" ? value : "All",
            }));
            navigate(value === "All" ? "/browse" : `/browse?category=${encodeURIComponent(value)}`, { replace: true });
          }}
        />

        {/* Tombol buka/tutup panel filter */}
        <div>
          <button
            type="button"
            onClick={() => setFilterOpen((value) => !value)}
            className={`mb-3 min-h-10 rounded-lg border px-4 py-2 text-sm transition-colors ${filterOpen ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary hover:text-primary"}`}
          >
            {filterOpen ? "Hide Filters" : "Show Filters"}
            {hasActiveFilters ? (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {Object.values(filters).filter((value) => value !== "All" && value !== "Popularity").length}
              </span>
            ) : null}
          </button>
          {filterOpen ? <FilterPanel filters={filters} setFilters={setFilters} options={filterOptions} /> : null}
        </div>

        {/* Grid hasil */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <LoadingSkeleton key={index} className="aspect-[2/3] w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No content found"
            description="Try adjusting your filters or clearing the active genre and year selection."
          />
        ) : (
          <motion.div
            key={`${activeChip}-${JSON.stringify(filters)}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6"
          >
            {visibleItems.map((item) => (
              <PosterCard
                key={item.id}
                item={item}
                inList={myList.includes(item.id)}
                onToggleList={onToggleList}
              />
            ))}
          </motion.div>
        )}

        {loadError ? (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {loadError}
          </div>
        ) : null}

        {canLoadMoreResults ? (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="min-h-10 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingMore ? "Memuat..." : "Muat lebih banyak"}
            </button>
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
};
