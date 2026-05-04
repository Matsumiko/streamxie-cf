import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, SpinnerGap } from "@phosphor-icons/react";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { PosterCard } from "@/components/content/PosterCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import {
  fetchStreamxieFilterPage,
  fetchStreamxieSectionPage,
  getStreamxiePageConfig,
  type StreamxieCollectionPage as StreamxieCollectionPayload,
  type StreamxieFilterKind,
  type StreamxiePageKey,
} from "@/lib/streamxie";
import type { ContentItem } from "@/types/content";

type StreamxieCollectionPageProps = {
  myList: string[];
  onToggleList: (id: string) => void;
};

const mergeItems = (current: ContentItem[], next: ContentItem[]) => {
  const seen = new Set(current.map((item) => item.id));
  return [...current, ...next.filter((item) => !seen.has(item.id))];
};

const isCollectionType = (value: string): value is "section" | StreamxieFilterKind =>
  value === "section" || value === "genre" || value === "year" || value === "country";

const isScope = (value: string): value is StreamxiePageKey =>
  value === "streamxie1" || value === "streamxie2" || value === "streamxie3";

const slugLabel = (slug: string) =>
  decodeURIComponent(slug)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const fallbackCollectionCopy = (
  pageLabel: string,
  type: "section" | StreamxieFilterKind | null,
  slug: string,
) => {
  if (!type || !slug) {
    return {
      title: `${pageLabel} Collection`,
      subtitle: `${pageLabel} catalog collection.`,
    };
  }

  const label = slugLabel(slug);
  if (type === "section") {
    return {
      title: label,
      subtitle: `${pageLabel} collection for ${label}.`,
    };
  }

  const prefix = type === "genre" ? "Genre" : type === "year" ? "Year" : "Country";
  return {
    title: `${prefix} · ${label}`,
    subtitle: `${pageLabel} filtered by ${label}.`,
  };
};

export const StreamxieCollectionPage = ({
  myList,
  onToggleList,
}: StreamxieCollectionPageProps) => {
  const { scope, collectionType, collectionSlug } = useParams<{
    scope?: string;
    collectionType?: string;
    collectionSlug?: string;
  }>();

  const pageScope = scope && isScope(scope) ? scope : null;
  const type = collectionType && isCollectionType(collectionType) ? collectionType : null;
  const slug = collectionSlug ?? "";
  const pageConfig = pageScope ? getStreamxiePageConfig(pageScope) : null;
  const fallbackCopy = useMemo(
    () => fallbackCollectionCopy(pageConfig?.label ?? "streamXie", type, slug),
    [pageConfig?.label, slug, type],
  );

  const [items, setItems] = useState<ContentItem[]>([]);
  const [title, setTitle] = useState(fallbackCopy.title);
  const [subtitle, setSubtitle] = useState(fallbackCopy.subtitle);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const documentTitle = useMemo(() => {
    if (!pageConfig || !type || !slug) return "Collection unavailable | streamXie";
    return title ? `${title} | streamXie` : `${pageConfig.label} collection | streamXie`;
  }, [pageConfig, slug, title, type]);

  useDocumentMeta(
    documentTitle,
    subtitle || "Load more streamxie provider titles by section, genre, year, or country.",
  );

  const loadPage = async (requestedPage: number): Promise<StreamxieCollectionPayload | null> => {
    if (!pageScope || !type || !slug) return null;
    if (type === "section") return fetchStreamxieSectionPage(pageScope, slug, requestedPage);
    return fetchStreamxieFilterPage(pageScope, type, slug, requestedPage);
  };

  useEffect(() => {
    let mounted = true;

    setItems([]);
    setTitle(fallbackCopy.title);
    setSubtitle(fallbackCopy.subtitle);
    setPage(1);
    setTotalPages(1);
    setHasMore(false);
    setError(null);

    if (!pageScope || !type || !slug) {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    loadPage(1)
      .then((payload) => {
        if (!mounted) return;
        if (!payload) {
          setError("Collection route is not available.");
          return;
        }

        setItems(payload.items);
        setTitle(payload.title);
        setSubtitle(payload.subtitle);
        setPage(payload.page);
        setTotalPages(payload.totalPages);
        setHasMore(payload.hasMore && payload.items.length > 0);
      })
      .catch(() => {
        if (mounted) setError("Unable to load provider collection right now.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [fallbackCopy.subtitle, fallbackCopy.title, pageScope, slug, type]);

  const loadMore = async () => {
    if (!hasMore || !pageScope || !type || !slug || loadingMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    setError(null);

    try {
      const payload = await loadPage(nextPage);
      if (!payload) {
        setHasMore(false);
        return;
      }

      setItems((current) => mergeItems(current, payload.items));
      setPage(payload.page);
      setTotalPages(payload.totalPages);
      setHasMore(payload.hasMore && payload.items.length > 0);
    } catch {
      setError("Unable to load more titles right now.");
    } finally {
      setLoadingMore(false);
    }
  };

  if (!pageScope || !pageConfig || !type || !slug) {
    return (
      <PageContainer className="pt-32 pb-16">
        <h1 className="sr-only">Collection not found</h1>
        <EmptyState
          title="Collection not found"
          description="This streamxie collection route is not registered."
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
          to={`/${pageScope}`}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <ArrowLeft size={16} weight="bold" />
          {pageConfig.label}
        </Link>
      </div>

      <SectionHeader
        headingLevel="h1"
        title={title || `${pageConfig.label} Collection`}
        subtitle={loading ? subtitle || pageConfig.subtitle : `${subtitle || pageConfig.subtitle} Showing ${items.length} titles.`}
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
          description="This provider endpoint did not return titles for the requested page."
          actionLabel={`Back to ${pageConfig.label}`}
          actionHref={`/${pageScope}`}
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
            {hasMore ? (
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
              <p className="text-sm text-muted-foreground">
                All available titles are loaded (page {page} of {totalPages}).
              </p>
            )}
          </div>
        </>
      )}
    </PageContainer>
  );
};
