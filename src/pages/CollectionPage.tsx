import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, SpinnerGap } from "@phosphor-icons/react";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { SectionHeader } from "@/components/common/SectionHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { PosterCard } from "@/components/content/PosterCard";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { fetchStreamSectionPage, getStreamSectionRoute } from "@/lib/streamxie";
import type { ContentItem } from "@/types/content";

type CollectionPageProps = {
  myList: string[];
  onToggleList: (id: string) => void;
  sectionSlug?: string;
};

const mergeItems = (current: ContentItem[], next: ContentItem[]) => {
  const seen = new Set(current.map((item) => item.id));
  return [...current, ...next.filter((item) => !seen.has(item.id))];
};

export const CollectionPage = ({ myList, onToggleList, sectionSlug }: CollectionPageProps) => {
  const params = useParams<{ sectionSlug?: string }>();
  const activeSectionSlug = sectionSlug ?? params.sectionSlug;
  const route = useMemo(() => getStreamSectionRoute(activeSectionSlug), [activeSectionSlug]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useDocumentMeta(
    route ? `${route.title} | streamXie` : "Section unavailable | streamXie",
    route?.subtitle ?? "Explore streamXie collection pages powered by TMDB metadata.",
  );

  useEffect(() => {
    let mounted = true;

    setItems([]);
    setPage(1);
    setTotalPages(1);
    setError(null);

    if (!activeSectionSlug || !route) {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    fetchStreamSectionPage(activeSectionSlug, 1)
      .then((sectionPage) => {
        if (!mounted) return;
        if (!sectionPage) {
          setError("This streamXie section is not available.");
          setItems([]);
          return;
        }

        setItems(sectionPage.items);
        setPage(sectionPage.page);
        setTotalPages(sectionPage.items.length > 0 ? sectionPage.totalPages : sectionPage.page);
      })
      .catch(() => {
        if (mounted) setError("Unable to load this section from TMDB right now.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeSectionSlug, route]);

  const hasMore = Boolean(route) && !loading && !loadingMore && items.length > 0 && page < totalPages;

  const loadMore = async () => {
    if (!activeSectionSlug || !hasMore) return;

    const nextPage = page + 1;
    setLoadingMore(true);
    setError(null);

    try {
      const sectionPage = await fetchStreamSectionPage(activeSectionSlug, nextPage);
      if (!sectionPage) {
        setError("This streamXie section is not available.");
        return;
      }

      setItems((current) => mergeItems(current, sectionPage.items));
      setPage(sectionPage.page);
      setTotalPages(sectionPage.items.length > 0 ? sectionPage.totalPages : sectionPage.page);
    } catch {
      setError("Unable to load more titles from TMDB right now.");
    } finally {
      setLoadingMore(false);
    }
  };

  if (!route) {
    return (
      <PageContainer className="pt-32 pb-16">
        <h1 className="sr-only">Section not found</h1>
        <EmptyState
          title="Section not found"
          description="This streamXie section is not registered."
          actionLabel="Back to Home"
          actionHref="/"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="pt-32 pb-16">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <ArrowLeft size={16} weight="bold" />
          Home
        </Link>
      </div>

      <SectionHeader
        headingLevel="h1"
        title={route.title}
        subtitle={loading ? route.subtitle : `${route.subtitle} Showing ${items.length} titles.`}
      />

      {error ? (
        <div className="mb-5 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 18 }).map((_, index) => (
            <LoadingSkeleton key={index} className="aspect-[2/3] w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No titles found"
          description="TMDB did not return titles for this section page."
          actionLabel="Back to Home"
          actionHref="/"
        />
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6"
          >
            {items.map((item) => (
              <PosterCard
                key={item.id}
                item={item}
                inList={myList.includes(item.id)}
                onToggleList={onToggleList}
              />
            ))}
          </motion.div>

          <div className="mt-10 flex justify-center">
            {page < totalPages ? (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-primary/60 bg-primary/10 px-6 py-3 text-sm font-medium text-primary transition-all hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore ? (
                  <SpinnerGap size={18} weight="bold" className="animate-spin" />
                ) : (
                  <Plus size={18} weight="bold" />
                )}
                Load More
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">All available titles are loaded.</p>
            )}
          </div>
        </>
      )}
    </PageContainer>
  );
};
