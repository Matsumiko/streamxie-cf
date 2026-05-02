import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowSquareOut, CaretLeft, CaretRight, Images, Info, Tag, X } from "@phosphor-icons/react";
import { CastGrid } from "@/components/details/CastGrid";
import type { ContentItem } from "@/types/content";

type TmdbDetailPanelsProps = {
  item: ContentItem;
};

export const TmdbDetailPanels = ({ item }: TmdbDetailPanelsProps) => {
  const facts = item.detailFacts ?? [];
  const keywords = item.keywords ?? [];
  const media = item.mediaGallery ?? [];
  const crew = item.crew ?? [];
  const hasInfo = facts.length > 0 || keywords.length > 0 || Boolean(item.sourceUrl);
  const mediaRailRef = useRef<HTMLDivElement | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);
  const activeMedia = activeMediaIndex === null ? null : media[activeMediaIndex] ?? null;
  const canNavigateMedia = media.length > 1;

  const mediaCardClasses = useMemo(
    () => (assetType: string) => (assetType === "poster" ? "w-[150px] shrink-0 md:w-[180px]" : "w-[280px] shrink-0 md:w-[360px]"),
    [],
  );

  const scrollMedia = (direction: "prev" | "next") => {
    const rail = mediaRailRef.current;
    if (!rail) return;
    const amount = Math.max(rail.clientWidth * 0.8, 260);
    rail.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  const movePreview = (direction: "prev" | "next") => {
    if (activeMediaIndex === null || media.length === 0) return;
    const delta = direction === "next" ? 1 : -1;
    const next = (activeMediaIndex + delta + media.length) % media.length;
    setActiveMediaIndex(next);
  };

  return (
    <>
      {crew.length > 0 ? <CastGrid title="Crew Highlights" cast={crew} /> : null}

      {hasInfo ? (
        <section className="py-8 md:py-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3">
              <Info size={22} weight="duotone" className="text-primary" />
              <h2 className="text-2xl font-medium uppercase tracking-[0.12em] text-foreground">
                TMDB Details
              </h2>
            </div>

            {item.sourceUrl ? (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Open on TMDB
                <ArrowSquareOut size={15} weight="bold" />
              </a>
            ) : null}
          </div>

          <div className={`grid gap-7 ${facts.length > 0 && keywords.length > 0 ? "lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.4fr)]" : ""}`}>
            {facts.length > 0 ? (
              <dl className="grid border-y border-border/70 sm:grid-cols-2 xl:grid-cols-3">
                {facts.map((fact) => (
                  <div key={`${fact.label}-${fact.value}`} className="border-b border-border/50 py-4 sm:pr-6">
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {fact.label}
                    </dt>
                    <dd className="mt-2 text-sm font-semibold text-foreground">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {keywords.length > 0 ? (
              <div className="border-y border-border/70 py-4 lg:border-y-0 lg:border-l lg:py-0 lg:pl-7">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Tag size={16} weight="duotone" className="text-primary" />
                  Keywords
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {media.length > 0 ? (
        <section className="py-8 md:py-10">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              <Images size={22} weight="duotone" className="text-primary" />
              <h2 className="text-2xl font-medium uppercase tracking-[0.12em] text-foreground">
                Media
              </h2>
            </div>
            {canNavigateMedia ? (
              <div className="hidden items-center gap-2 md:flex">
                <button
                  type="button"
                  onClick={() => scrollMedia("prev")}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
                  aria-label="Previous media"
                >
                  <CaretLeft size={16} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollMedia("next")}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
                  aria-label="Next media"
                >
                  <CaretRight size={16} weight="bold" />
                </button>
              </div>
            ) : null}
          </div>
          <div
            ref={mediaRailRef}
            className="flex gap-4 overflow-x-auto pb-3 hide-scrollbar"
            style={{ scrollSnapType: "x mandatory" }}
            onWheel={(event) => {
              if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
              event.preventDefault();
              const rail = mediaRailRef.current;
              if (!rail) return;
              rail.scrollBy({ left: event.deltaY, behavior: "auto" });
            }}
          >
            {media.map((asset, index) => (
              <div
                key={`${asset.type}-${asset.src}-${index}`}
                className={mediaCardClasses(asset.type)}
                style={{ scrollSnapAlign: "start" }}
              >
                <button
                  type="button"
                  onClick={() => setActiveMediaIndex(index)}
                  aria-label={`Buka pratinjau ${asset.type}: ${asset.alt}`}
                  title={`Buka pratinjau ${asset.type}`}
                  className={`${asset.type === "poster" ? "aspect-[2/3]" : "aspect-video"} block w-full overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary`}
                >
                  <img src={asset.src} alt={asset.alt} loading="lazy" className="h-full w-full object-cover" />
                </button>
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">{asset.type}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {item.collection ? (
        <section className="py-8 md:py-10">
          <div className="relative overflow-hidden rounded-xl border border-border bg-card">
            {item.collection.backdropImage ? (
              <img
                src={item.collection.backdropImage}
                alt={`${item.collection.title} backdrop`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-45"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30" />
            <div className="relative flex min-h-[220px] flex-col justify-end gap-4 p-6 md:p-8">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-primary">Collection</p>
                <h2 className="mt-2 text-2xl font-medium text-foreground md:text-3xl">{item.collection.title}</h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{item.collection.description}</p>
              </div>
              <Link
                to={`/search?q=${encodeURIComponent(item.collection.title)}`}
                className="inline-flex min-h-10 w-fit items-center rounded-lg border border-border bg-card/90 px-4 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                View Collection
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {activeMedia ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setActiveMediaIndex(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label="Close media preview"
          >
            <X size={18} weight="bold" />
          </button>

          {canNavigateMedia ? (
            <>
              <button
                type="button"
                onClick={() => movePreview("prev")}
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
                aria-label="Previous media"
              >
                <CaretLeft size={18} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => movePreview("next")}
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
                aria-label="Next media"
              >
                <CaretRight size={18} weight="bold" />
              </button>
            </>
          ) : null}

          <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-xl border border-border bg-card">
            <img src={activeMedia.src} alt={activeMedia.alt} className="max-h-[90vh] w-full object-contain" />
          </div>
        </div>
      ) : null}
    </>
  );
};
