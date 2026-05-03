import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookmarkSimple, Play, Star, VideoCamera } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GenreChip } from "@/components/common/GenreChip";
import { EmptyState } from "@/components/common/EmptyState";
import { MediaPlaceholder } from "@/components/common/MediaPlaceholder";
import { StreamingLoader } from "@/components/common/StreamingLoader";
import { SynopsisSection } from "@/components/details/SynopsisSection";
import { CastGrid } from "@/components/details/CastGrid";
import { TmdbDetailPanels } from "@/components/details/TmdbDetailPanels";
import { ContentCarousel } from "@/components/content/ContentCarousel";
import { PosterCard } from "@/components/content/PosterCard";
import { TrailerModal } from "@/components/common/TrailerModal";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { fetchStreamDetailByRouteId, parseStreamRouteId } from "@/lib/streamxie";
import type { ContentItem } from "@/types/content";

type MovieDetailPageProps = {
  myList: string[];
  onToggleList: (id: string) => void;
};

export const MovieDetailPage = ({ myList, onToggleList }: MovieDetailPageProps) => {
  const { slug } = useParams();
  const [liveItem, setLiveItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const item = liveItem;
  const relatedItems = item?.relatedItems ?? [];
  const tmdbRecommendations = item?.recommendationItems ?? [];
  const inList = item ? myList.includes(item.id) : false;

  useEffect(() => {
    let mounted = true;
    const parsed = parseStreamRouteId(slug);

    if (!slug || !parsed) {
      setLiveItem(null);
      setLoadError("This movie route is not a valid live streamXie title.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    fetchStreamDetailByRouteId(slug)
      .then((detail) => {
        if (!mounted) return;
        setLiveItem(detail);
        setLoadError(detail ? null : "TMDB did not return this movie.");
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        setLiveItem(null);
        setLoadError(error instanceof Error ? error.message : "Unable to load this movie.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  useDocumentMeta(
    item ? `${item.title} | streamXie` : "Movie unavailable | streamXie",
    item?.description ?? "Live movie metadata is unavailable.",
  );

  if (loading) {
    return (
      <PageContainer className="pt-32 pb-16">
        <h1 className="sr-only">Movie details</h1>
        <div className="flex min-h-[44vh] items-center justify-center rounded-xl border border-border bg-card/30">
          <StreamingLoader
            label="Movie"
            words={["metadata...", "cast...", "trailers...", "images..."]}
          />
        </div>
      </PageContainer>
    );
  }

  if (!item) {
    return (
      <PageContainer className="pt-32 pb-16">
        <h1 className="sr-only">Movie unavailable</h1>
        <EmptyState
          title="Movie unavailable"
          description={loadError ?? "This title is not available from the live catalog."}
          actionLabel="Back to Home"
          actionHref="/"
        />
      </PageContainer>
    );
  }

  return (
    <>
      {/* Hero backdrop */}
      <section className="relative min-h-[75vh] overflow-hidden pt-[72px]">
        {item.backdropImage ? (
          <motion.img
            key={item.id}
            initial={{ scale: 1.04, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            src={item.backdropImage}
            alt={item.heroAlt || item.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0">
            <MediaPlaceholder title={item.title} variant="backdrop" />
          </div>
        )}
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

        <PageContainer className="relative flex min-h-[75vh] items-end py-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex flex-col gap-5 md:flex-row md:items-end md:gap-8"
          >
            {/* Poster */}
            <div className="hidden md:block w-44 shrink-0">
              <div className="aspect-[2/3] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
                {item.posterImage ? (
                  <img
                    src={item.posterImage}
                    alt={item.posterAlt || item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <MediaPlaceholder title={item.title} variant="poster" />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="max-w-2xl space-y-4">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl font-medium uppercase tracking-[0.08em] text-foreground md:text-5xl lg:text-6xl">
                {item.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-200">
                <span className="flex items-center gap-1">
                  <Star size={13} weight="fill" className="text-warning" />
                  {item.rating}
                </span>
                <span className="text-gray-500">·</span>
                {item.year > 0 ? (
                  <>
                    <span>{item.year}</span>
                    <span className="text-gray-500">·</span>
                  </>
                ) : null}
                {item.duration ? <span>{item.duration}</span> : null}
                {item.country ? (
                  <>
                    <span className="text-gray-500">·</span>
                    <span>{item.country}</span>
                  </>
                ) : null}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {item.genres.map((genre) => (
                  <GenreChip key={genre} label={genre} />
                ))}
              </div>

              <p className="max-w-xl text-base leading-relaxed text-gray-200 md:text-lg">
                {item.description}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  to={`/watch/${item.id}`}
                  className="inline-flex min-h-[52px] items-center gap-3 rounded-xl bg-gradient-primary px-8 py-3 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.03] hover:brightness-110"
                >
                  <Play size={20} weight="fill" />
                  Watch Now
                </Link>
                <button
                  type="button"
                  onClick={() => setTrailerOpen(true)}
                  className="inline-flex min-h-[52px] items-center gap-3 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-base font-medium text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/20"
                >
                  <VideoCamera size={20} weight="duotone" />
                  Trailer
                </button>
                <button
                  type="button"
                  onClick={() => onToggleList(item.id)}
                  className={`inline-flex min-h-[52px] items-center gap-3 rounded-xl border px-6 py-3 text-base font-medium transition-all ${inList ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-foreground hover:border-primary hover:text-primary"}`}
                >
                  <BookmarkSimple size={20} weight={inList ? "fill" : "bold"} />
                  {inList ? "Saved" : "Add to List"}
                </button>
              </div>
            </div>
          </motion.div>
        </PageContainer>
      </section>

      <PageContainer className="py-8 md:py-12">
        <SynopsisSection text={item.longDescription} />
        <CastGrid cast={item.cast} />
        <TmdbDetailPanels item={item} />
        {relatedItems.length > 0 ? (
          <ContentCarousel title="Related Content" subtitle="Similar titles from TMDB based on genres, keywords, and audience overlap.">
            {relatedItems.map((related, index) => (
              <div key={`${related.id}-${index}`} className="w-[160px] shrink-0 md:w-[200px]" style={{ scrollSnapAlign: "start" }}>
                <PosterCard item={related} inList={myList.includes(related.id)} onToggleList={onToggleList} />
              </div>
            ))}
          </ContentCarousel>
        ) : null}
        {tmdbRecommendations.length > 0 ? (
          <ContentCarousel title="Recommended by TMDB" subtitle="Recommendation signals from TMDB for this title.">
            {tmdbRecommendations.map((related, index) => (
              <div key={`${related.id}-${index}`} className="w-[160px] shrink-0 md:w-[200px]" style={{ scrollSnapAlign: "start" }}>
                <PosterCard item={related} inList={myList.includes(related.id)} onToggleList={onToggleList} />
              </div>
            ))}
          </ContentCarousel>
        ) : null}
      </PageContainer>

      <TrailerModal
        open={trailerOpen}
        title={item.title}
        trailerUrl={item.trailerUrl}
        onClose={() => setTrailerOpen(false)}
      />
    </>
  );
};
