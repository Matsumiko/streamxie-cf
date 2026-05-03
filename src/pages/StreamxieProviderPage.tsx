import { useEffect, useMemo, useState } from "react";
import { ContentCarousel } from "@/components/content/ContentCarousel";
import { EmptyState } from "@/components/common/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PosterCard } from "@/components/content/PosterCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { TopRankCard } from "@/components/content/TopRankCard";
import { StreamingLoader } from "@/components/common/StreamingLoader";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { fetchStreamxieHome, getStreamxiePageConfig, type StreamxiePageKey, type StreamHomeSection } from "@/lib/streamxie";
import type { ContentItem } from "@/types/content";

type StreamxieProviderPageProps = {
  scope: StreamxiePageKey;
  myList: string[];
  onToggleList: (id: string) => void;
};

type StreamxieProviderState = {
  loading: boolean;
  error: string | null;
  sections: StreamHomeSection[];
  items: ContentItem[];
};

const emptyState: StreamxieProviderState = {
  loading: false,
  error: null,
  sections: [],
  items: [],
};

export const StreamxieProviderPage = ({
  scope,
  myList,
  onToggleList,
}: StreamxieProviderPageProps) => {
  const pageConfig = getStreamxiePageConfig(scope);
  const [state, setState] = useState<StreamxieProviderState>({
    ...emptyState,
    loading: true,
  });

  useDocumentMeta(
    pageConfig ? `${pageConfig.label} | streamXie` : "Provider unavailable | streamXie",
    pageConfig?.subtitle ?? "streamXie provider page is unavailable.",
  );

  useEffect(() => {
    let mounted = true;

    if (!pageConfig) {
      setState({
        ...emptyState,
        loading: false,
        error: "Provider page is not registered.",
      });
      return () => {
        mounted = false;
      };
    }

    setState((current) => ({
      ...current,
      loading: true,
      error: null,
      sections: [],
      items: [],
    }));

    fetchStreamxieHome(scope)
      .then((payload) => {
        if (!mounted) return;
        setState({
          loading: false,
          error: null,
          sections: payload.sections,
          items: payload.items,
        });
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        setState({
          loading: false,
          error: error instanceof Error ? error.message : "Unable to load provider catalog.",
          sections: [],
          items: [],
        });
      });

    return () => {
      mounted = false;
    };
  }, [pageConfig, scope]);

  const subtitle = useMemo(() => {
    if (!pageConfig) return "";
    if (state.loading) return pageConfig.subtitle;
    if (state.items.length === 0) return `${pageConfig.subtitle} No titles returned.`;
    return `${pageConfig.subtitle} Showing ${state.items.length} titles from page 1 feeds.`;
  }, [pageConfig, state.items.length, state.loading]);

  if (!pageConfig) {
    return (
      <PageContainer className="pt-32 pb-16">
        <h1 className="sr-only">Provider unavailable</h1>
        <EmptyState
          title="Provider unavailable"
          description="This streamxie provider page is not registered."
          actionLabel="Back to Home"
          actionHref="/"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="pt-32 pb-16">
      <h1 className="sr-only">{pageConfig.label}</h1>
      <SectionHeader title={pageConfig.label} subtitle={subtitle} />

      {state.loading ? (
        <div className="mb-8 flex min-h-[240px] items-center justify-center rounded-xl border border-border bg-card/40">
          <StreamingLoader
            label="Loading"
            words={["provider feed...", "metadata...", "collections...", "posters..."]}
          />
        </div>
      ) : null}

      {!state.loading && state.sections.length === 0 ? (
        <EmptyState
          title="Provider feed unavailable"
          description={state.error ?? "No feed rows were returned from this provider."}
          actionLabel="Back to Home"
          actionHref="/"
        />
      ) : null}

      {state.sections.map((section) => {
        const ranked = /top rated/i.test(section.title);
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
                  <PosterCard
                    item={item}
                    inList={myList.includes(item.id)}
                    onToggleList={onToggleList}
                  />
                )}
              </div>
            ))}
          </ContentCarousel>
        );
      })}
    </PageContainer>
  );
};
