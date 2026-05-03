import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Play } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/PageContainer";
import { VideoPlayer } from "@/components/watch/VideoPlayer";
import { LandscapeCard } from "@/components/content/LandscapeCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { MediaPlaceholder } from "@/components/common/MediaPlaceholder";
import { StreamingLoader } from "@/components/common/StreamingLoader";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { getWatchProgress, saveWatchProgress } from "@/lib/storage";
import { fetchStreamDetailByRouteId, fetchStreamPlayback, parseStreamRouteId, type StreamPlayback } from "@/lib/streamxie";
import type { ContentItem } from "@/types/content";

type WatchPageProps = {
  progressMap: Record<string, number>;
};

export const WatchPage = ({ progressMap }: WatchPageProps) => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const episodeId = params.get("episode");

  const [liveItem, setLiveItem] = useState<ContentItem | null>(null);
  const [playback, setPlayback] = useState<StreamPlayback | null>(null);
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const item = liveItem;
  const embedWatchStartRef = useRef<number | null>(null);
  const embedBaselineProgressRef = useRef<number>(0);

  const parseDurationToSeconds = (value?: string | null): number => {
    if (!value) return 0;
    const normalized = value.trim().toLowerCase();
    if (!normalized) return 0;

    const hourMatch = normalized.match(/(\d+)\s*h/);
    const minuteMatch = normalized.match(/(\d+)\s*m/);
    const minuteOnlyMatch = normalized.match(/(\d+)\s*min/);
    const compactMatch = normalized.match(/(\d+):(\d{2})(?::(\d{2}))?/);

    if (compactMatch) {
      const left = Number(compactMatch[1] ?? 0);
      const middle = Number(compactMatch[2] ?? 0);
      const right = Number(compactMatch[3] ?? 0);
      if (compactMatch[3]) return left * 3600 + middle * 60 + right;
      return left * 60 + middle;
    }

    const hours = Number(hourMatch?.[1] ?? 0);
    const minutes = Number((minuteMatch?.[1] ?? minuteOnlyMatch?.[1]) ?? 0);
    const asNumber = Number(normalized.replace(/[^\d]/g, ""));

    if (hours > 0 || minutes > 0) return hours * 3600 + minutes * 60;
    if (Number.isFinite(asNumber) && asNumber > 0) return asNumber * 60;
    return 0;
  };

  useEffect(() => {
    let mounted = true;
    const parsed = parseStreamRouteId(id);

    if (!id || !parsed) {
      setLiveItem(null);
      setPlayback(null);
      setLoadError("This watch route is not a valid live streamXie title.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    fetchStreamDetailByRouteId(id)
      .then((detail) => {
        if (!mounted) return;
        setLiveItem(detail);
        setLoadError(detail ? null : "Live metadata was not returned for this title.");
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        setLiveItem(null);
        setLoadError(error instanceof Error ? error.message : "Unable to load this title.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;

    if (!item?.provider) {
      setPlayback(null);
      setPlaybackLoading(false);
      return;
    }

    setPlaybackLoading(true);
    setPlayback(null);

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const attemptFetch = async () => {
      const retries = [0, 800];
      let latest: StreamPlayback | null = null;

      for (let index = 0; index < retries.length; index += 1) {
        const delay = retries[index];
        if (delay > 0) await wait(delay);
        latest = await fetchStreamPlayback(item, episodeId);
        if ((latest.sources?.length ?? 0) > 0 || latest.embedUrl) {
          break;
        }
      }

      return latest;
    };

    attemptFetch()
      .then((nextPlayback) => {
        if (mounted) setPlayback(nextPlayback);
      })
      .catch(() => {
        if (mounted) setPlayback(null);
      })
      .finally(() => {
        if (mounted) setPlaybackLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [episodeId, item]);

  useEffect(() => {
    if (!item || playbackLoading) return;

    const hasPlayableSource = Boolean(playback?.embedUrl) || (playback?.sources?.length ?? 0) > 0;
    if (!hasPlayableSource) return;

    const current = getWatchProgress()[item.id];
    if (current && Number(current.progress || 0) > 0) return;

    saveWatchProgress({
      contentId: item.id,
      episodeId: episodeId ?? undefined,
      progress: 1,
      duration: Number(current?.duration || 0),
      updatedAt: Date.now(),
    });
  }, [episodeId, item, playback?.embedUrl, playback?.sources, playbackLoading]);

  useEffect(() => {
    if (!item || playbackLoading) return;

    const playbackSources = playback?.sources ?? [];
    const primaryUrl = playback?.embedUrl ?? playbackSources[0]?.url ?? "";
    const hasPlayableSource = Boolean(primaryUrl);
    if (!hasPlayableSource) return;

    const isNativeLike = (value?: string | null) =>
      Boolean(value && /\.(mp4|webm|ogg|m3u8)(\?|$)/i.test(value));

    const hasNativeCandidate =
      isNativeLike(playback?.embedUrl) || playbackSources.some((source) => isNativeLike(source.url));

    // Native sources already update progress from video timeupdate in VideoPlayer.
    if (hasNativeCandidate) return;

    const activeEpisodeDuration =
      item.seasons
        ?.flatMap((season) => season.episodes)
        .find((episode) => episode.id === (episodeId ?? ""))?.duration ?? null;

    const current = getWatchProgress()[item.id];
    const existingDuration = Number(current?.duration ?? 0);
    const estimatedDuration =
      existingDuration > 0
        ? existingDuration
        : parseDurationToSeconds(activeEpisodeDuration) || parseDurationToSeconds(item.duration) || 0;

    embedBaselineProgressRef.current = Number(current?.progress ?? 0);
    embedWatchStartRef.current = Date.now();

    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;

      const latest = getWatchProgress()[item.id];
      const latestProgress = Number(latest?.progress ?? 0);
      if (latestProgress >= 97) return;

      const startedAt = embedWatchStartRef.current ?? Date.now();
      const elapsedSeconds = Math.max(0, (Date.now() - startedAt) / 1000);

      const progressedByElapsed =
        estimatedDuration > 0
          ? embedBaselineProgressRef.current + (elapsedSeconds / estimatedDuration) * 100
          : embedBaselineProgressRef.current + elapsedSeconds / 30;

      const nextProgress = Math.min(
        97,
        Math.max(latestProgress, progressedByElapsed, embedBaselineProgressRef.current + 1),
      );

      saveWatchProgress({
        contentId: item.id,
        episodeId: episodeId ?? undefined,
        progress: nextProgress,
        duration: estimatedDuration > 0 ? estimatedDuration : Number(latest?.duration ?? 0),
        updatedAt: Date.now(),
      });
    }, 5_000);

    return () => {
      window.clearInterval(interval);
      embedWatchStartRef.current = null;
      embedBaselineProgressRef.current = 0;
    };
  }, [episodeId, item, playback?.embedUrl, playback?.sources, playbackLoading]);

  const allEpisodes = useMemo(
    () => item?.seasons?.flatMap((s) => s.episodes) ?? [],
    [item],
  );

  const [activeSeason, setActiveSeason] = useState("");

  useEffect(() => {
    const firstSeasonId = item?.seasons?.[0]?.id ?? "";
    const activeSeasonExists = item?.seasons?.some((season) => season.id === activeSeason) ?? false;

    if (firstSeasonId && !activeSeasonExists) {
      setActiveSeason(firstSeasonId);
    } else if (!firstSeasonId && activeSeason) {
      setActiveSeason("");
    }
  }, [activeSeason, item?.seasons]);

  const currentSeasonEpisodes = useMemo(
    () => item?.seasons?.find((s) => s.id === activeSeason)?.episodes ?? allEpisodes,
    [item, activeSeason, allEpisodes],
  );
  const upNext = useMemo(
    () => [...(item?.relatedItems ?? []), ...(item?.recommendationItems ?? [])].slice(0, 6),
    [item],
  );

  useDocumentMeta(
    item ? `Watch ${item.title} | streamXie` : "Watch unavailable | streamXie",
    item ? `Watch ${item.title} on streamXie.` : "Live playback metadata is unavailable.",
  );

  if (loading) {
    return (
      <PageContainer className="pt-28 pb-16">
        <h1 className="sr-only">Watch loading</h1>
        <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            <div className="relative aspect-video bg-black">
              <div className="absolute inset-0 flex items-center justify-center">
                <StreamingLoader
                  compact
                  label="Streaming"
                  words={["metadata...", "episodes...", "sources...", "buffer..."]}
                />
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!item) {
    return (
      <PageContainer className="pt-32 pb-16">
        <h1 className="sr-only">Watch unavailable</h1>
        <EmptyState
          title="Watch unavailable"
          description={loadError ?? "This title is not available from the live catalog."}
          actionLabel="Back to Home"
          actionHref="/"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="pt-28 pb-16">
      <h1 className="sr-only">Watch {item.title}</h1>
      <div className="grid min-w-0 gap-8 xl:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          <VideoPlayer
            item={item}
            episodeId={episodeId}
            allEpisodes={allEpisodes}
            embedUrl={playback?.embedUrl}
            streamSources={playback?.sources ?? []}
            playbackLoading={playbackLoading}
          />

          {/* Episode navigation for series */}
          {item.seasons && item.seasons.length > 0 && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionHeader title="Episodes" />
                {item.seasons.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {item.seasons.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setActiveSeason(s.id)}
                        className={`rounded-lg border px-4 py-2 text-sm transition-colors ${activeSeason === s.id ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-foreground hover:border-primary hover:text-primary"}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                {currentSeasonEpisodes.map((episode) => {
                  const isActive = episode.id === episodeId || (!episodeId && episode.id === allEpisodes[0]?.id);
                  return (
                    <Link
                      key={episode.id}
                      to={`/watch/${item.id}?episode=${episode.id}`}
                      className={`flex min-w-0 gap-3 overflow-hidden rounded-xl border p-3 transition-all hover:border-primary ${isActive ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-card/80"}`}
                    >
                      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {episode.thumbnail ? (
                          <img src={episode.thumbnail} alt={episode.title} className="h-full w-full object-cover" />
                        ) : (
                          <MediaPlaceholder title={episode.title} variant="video" />
                        )}
                        {isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                            <Play size={18} weight="fill" className="text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center gap-1 min-w-0">
                        <p className={`truncate text-sm font-medium ${isActive ? "text-primary" : "text-foreground"}`}>{episode.title}</p>
                        <p className="text-xs text-muted-foreground">{episode.duration}</p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">{episode.synopsis}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        {upNext.length > 0 ? (
        <aside className="hidden xl:block">
          <div className="sticky top-24 space-y-5">
            <SectionHeader title="Up Next" subtitle="Keep watching." />
            <div className="space-y-4">
              {upNext.map((rec, index) => (
                <LandscapeCard
                  key={`${rec.id}-${index}`}
                  item={rec}
                  progress={progressMap[rec.id] ?? 0}
                />
              ))}
            </div>
          </div>
        </aside>
        ) : null}
      </div>
    </PageContainer>
  );
};
