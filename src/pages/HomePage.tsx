import { useMemo } from "react";
import { HeroBanner } from "@/components/content/HeroBanner";
import { ContentCarousel } from "@/components/content/ContentCarousel";
import { PosterCard } from "@/components/content/PosterCard";
import { TopRankCard } from "@/components/content/TopRankCard";
import { LandscapeCard } from "@/components/content/LandscapeCard";
import { EmptyState } from "@/components/common/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useStreamCatalog } from "@/hooks/useStreamCatalog";

type HomePageProps = {
  myList: string[];
  onToggleList: (id: string) => void;
  progressMap: Record<string, number>;
};

export const HomePage = ({
  myList,
  onToggleList,
  progressMap,
}: HomePageProps) => {
  const { sections, items, loading, error } = useStreamCatalog();
  const featuredItems = items.slice(0, 6);
  const continueWatching = useMemo(
    () =>
      items
        .filter((item) => (progressMap[item.id] ?? 0) > 0 && (progressMap[item.id] ?? 0) < 98)
        .slice(0, 8),
    [items, progressMap],
  );

  useDocumentMeta(
    "streamXie - Nonton Film dan Series Streaming Download Movie",
    "Nonton film, series, anime, dan drama terbaru di streamXie dengan katalog trending, pencarian cepat, dan pengalaman streaming gelap yang sinematik setiap hari.",
  );

  return (
    <>
      <HeroBanner items={featuredItems} loading={loading} />
      <PageContainer className="py-8 md:py-12">
        {!loading && sections.length === 0 ? (
          <EmptyState
            title="Live catalog unavailable"
            description={error ?? "TMDB did not return catalog data for this request."}
            actionLabel="Browse"
            actionHref="/browse"
          />
        ) : null}

        {sections.slice(0, 7).map((section) => {
          const ranked = /top|trending/i.test(section.title);

          return (
            <ContentCarousel
              key={section.id}
              title={section.title}
              subtitle={section.subtitle}
              viewAllHref={section.viewAllHref}
            >
              {section.items.slice(0, 12).map((item, index) => (
                <div
                  key={`${section.id}-${item.id}-${index}`}
                  className={ranked ? "shrink-0" : "w-[160px] shrink-0 md:w-[200px]"}
                  style={{ scrollSnapAlign: "start" }}
                >
                  {ranked ? (
                    <TopRankCard item={item} rank={index + 1} />
                  ) : (
                    <PosterCard item={item} inList={myList.includes(item.id)} onToggleList={onToggleList} />
                  )}
                </div>
              ))}
            </ContentCarousel>
          );
        })}

        {continueWatching.length > 0 ? (
          <ContentCarousel title="Continue Watching" subtitle="Jump back into the stories you left in motion." viewAllHref="/my-list">
            {continueWatching.map((item, index) => (
              <div key={`cw-${item.id}-${index}`} className="w-[300px] shrink-0 md:w-[400px]" style={{ scrollSnapAlign: "start" }}>
                <LandscapeCard item={item} progress={progressMap[item.id] ?? 0} />
              </div>
            ))}
          </ContentCarousel>
        ) : null}

        {sections.slice(7).map((section) => (
          <ContentCarousel
            key={section.id}
            title={section.title}
            subtitle={section.subtitle}
            viewAllHref={section.viewAllHref}
          >
            {section.items.slice(0, 12).map((item, index) => (
              <div key={`${section.id}-${item.id}-${index}`} className="w-[160px] shrink-0 md:w-[200px]" style={{ scrollSnapAlign: "start" }}>
                <PosterCard item={item} inList={myList.includes(item.id)} onToggleList={onToggleList} />
              </div>
            ))}
          </ContentCarousel>
        ))}
      </PageContainer>
    </>
  );
};
