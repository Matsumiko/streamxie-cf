import { useMemo, useState } from "react";
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
import { useStreamCatalog } from "@/hooks/useStreamCatalog";
import { getStreamProviderLabel } from "@/lib/streamxie";

type BrowsePageProps = {
  myList: string[];
  onToggleList: (id: string) => void;
};

export const BrowsePage = ({ myList, onToggleList }: BrowsePageProps) => {
  const { items: catalogItems, loading, source } = useStreamCatalog();

  useDocumentMeta(
    "Browse | streamXie",
    "Filter and explore streamXie&#39;s movie, series, anime, drama, and variety catalog.",
  );
  const location = useLocation();
  const navigate = useNavigate();
  const initialCategory = new URLSearchParams(location.search).get("category") || "All";
  const [activeChip, setActiveChip] = useState(initialCategory);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<BrowseFilters>({
    genre: "All",
    year: "All",
    type: "All",
    country: "All",
    status: "All",
    provider: "All",
    sort: "Popularity",
  });

  const providerChips = ["TMDB"];
  const chips = ["All", "Movies", "Series", ...providerChips];

  const filterOptions = useMemo(() => {
    const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort();

    return {
      genres: unique(catalogItems.flatMap((item) => item.genres)),
      years: unique(catalogItems.map((item) => String(item.year))).sort((a, b) => Number(b) - Number(a)),
      countries: unique(catalogItems.map((item) => item.country)),
      statuses: unique(catalogItems.map((item) => item.status)),
      contentTypes: ["Movies", "Series"],
      providers: unique(catalogItems.map((item) => getStreamProviderLabel(item.provider))),
      sortOptions: ["Popularity", "Latest", "Rating"],
    };
  }, [catalogItems]);

  const filtered = useMemo(() => {
    let items = [...catalogItems];
    if (activeChip !== "All" && providerChips.includes(activeChip)) {
      items = items.filter((item) => getStreamProviderLabel(item.provider) === activeChip);
    } else if (activeChip !== "All") {
      items = items.filter((item) => item.category === activeChip);
    }
    if (filters.genre !== "All") items = items.filter((item) => item.genres.includes(filters.genre));
    if (filters.year !== "All") items = items.filter((item) => `${item.year}` === filters.year);
    if (filters.type !== "All") items = items.filter((item) => item.category === filters.type || item.type === filters.type.toLowerCase());
    if (filters.country !== "All") items = items.filter((item) => item.country === filters.country);
    if (filters.status !== "All") items = items.filter((item) => item.status === filters.status);
    if (filters.provider !== "All") items = items.filter((item) => getStreamProviderLabel(item.provider) === filters.provider);
    if (filters.sort === "Latest") items.sort((a, b) => b.year - a.year);
    if (filters.sort === "Rating") items.sort((a, b) => Number(b.rating) - Number(a.rating));
    return items;
  }, [activeChip, catalogItems, filters, providerChips]);

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => k !== "sort" && v !== "All");

  const resetFilters = () => {
    setFilters({ genre: "All", year: "All", type: "All", country: "All", status: "All", provider: "All", sort: "Popularity" });
    setActiveChip("All");
  };

  return (
    <PageContainer className="pt-32 pb-16">
      <h1 className="sr-only">Browse catalog</h1>
      <SectionHeader
        title="Browse"
        subtitle={`${filtered.length} title${filtered.length !== 1 ? "s" : ""} ${source === "live" ? "from TMDB metadata" : "found"}`}
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
        {/* Quick chips */}
        <QuickFilterChips
          filters={chips}
          active={activeChip}
          onChange={(v) => {
            setActiveChip(v);
            navigate(v === "All" ? "/browse" : `/browse?category=${encodeURIComponent(v)}`, { replace: true });
          }}
        />

        {/* Filter panel toggle */}
        <div>
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className={`mb-3 min-h-10 rounded-lg border px-4 py-2 text-sm transition-colors ${filterOpen ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary hover:text-primary"}`}
          >
            {filterOpen ? "Hide Filters" : "Show Filters"}
            {hasActiveFilters && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {Object.values(filters).filter((v) => v !== "All" && v !== "Popularity").length}
              </span>
            )}
          </button>
          {filterOpen && <FilterPanel filters={filters} setFilters={setFilters} options={filterOptions} />}
        </div>

        {/* Results grid */}
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
            {filtered.map((item) => (
              <PosterCard
                key={item.id}
                item={item}
                inList={myList.includes(item.id)}
                onToggleList={onToggleList}
              />
            ))}
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
};
