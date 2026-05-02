import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowsOut,
  CaretDown,
  FastForward,
  Pause,
  Play,
  SpeakerHigh,
  SpeakerLow,
  SpeakerSlash,
  Subtitles,
  CornersIn,
  CornersOut,
  SkipForward,
  ArrowsIn,
} from "@phosphor-icons/react";
import { saveWatchProgress } from "@/lib/storage";
import { MediaPlaceholder } from "@/components/common/MediaPlaceholder";
import { StreamingLoader } from "@/components/common/StreamingLoader";
import { getStreamProviderLabel, STREAM_PROVIDERS, type StreamPlaybackSource, type StreamProvider } from "@/lib/streamxie";
import type { ContentItem } from "@/types/content";

type Episode = {
  id: string;
  title: string;
  duration: string;
};

type VideoPlayerProps = {
  item: ContentItem;
  episodeId?: string | null;
  /** All episodes flat (used for next-episode wiring) */
  allEpisodes?: Episode[];
  embedUrl?: string | null;
  streamSources?: StreamPlaybackSource[];
  playbackLoading?: boolean;
};

type SourceGroup = {
  key: string;
  label: string;
  providerLabel: string;
  sources: StreamPlaybackSource[];
};

const isNativeStreamUrl = (value?: string | null) =>
  Boolean(value && /\.(mp4|webm|ogg|m3u8)(\?|$)/i.test(value));

const normalizeServerLabel = (value: string, index: number) => {
  const cleaned = value
    .replace(/^[^-]+ -\s*/, "")
    .replace(/[_-]+/g, " ")
    .trim();

  return cleaned || `server ${index + 1}`;
};

const buildSourceGroups = (sources: StreamPlaybackSource[]): SourceGroup[] => {
  const groups = new Map<string, StreamPlaybackSource[]>();

  sources.forEach((source, index) => {
    const key = source.provider ?? `source-${index}`;
    const group = groups.get(key) ?? [];
    group.push(source);
    groups.set(key, group);
  });

  const orderedGroups = [...groups.entries()]
    .filter(([key]) => STREAM_PROVIDERS.includes(key as StreamProvider))
    .sort(
      ([left], [right]) =>
        STREAM_PROVIDERS.indexOf(left as StreamProvider) - STREAM_PROVIDERS.indexOf(right as StreamProvider),
    )
    .map(([key, group]) => {
      const provider = key as StreamProvider;
      return {
        key,
        label: getStreamProviderLabel(provider),
        providerLabel: `${group.length} source${group.length > 1 ? "s" : ""}`,
        sources: group,
      };
    });

  const extraGroups = [...groups.entries()]
    .filter(([key]) => !STREAM_PROVIDERS.includes(key as StreamProvider))
    .map(([key, group], index) => ({
      key,
      label: `streamxie-s${STREAM_PROVIDERS.length + index + 1}`,
      providerLabel: normalizeServerLabel(group[0]?.server ?? "Provider", index),
      sources: group,
    }));

  return [...orderedGroups, ...extraGroups];
};

const SourceSelector = ({
  groups,
  selectedUrl,
  onSelect,
}: {
  groups: SourceGroup[];
  selectedUrl: string | null;
  onSelect: (url: string) => void;
}) => {
  if (groups.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-2 md:max-w-[420px]">
      {groups.map((group, groupIndex) => {
        const activeInGroup = group.sources.some((source) => source.url === selectedUrl);

        return (
          <details
            key={group.key}
            open={activeInGroup || groupIndex === 0}
            className="group/source overflow-hidden rounded-lg border border-border bg-card/80"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm text-foreground transition-colors hover:bg-primary/10 [&::-webkit-details-marker]:hidden">
              <span className="flex min-w-0 items-center gap-2">
                <span className="font-medium lowercase text-primary">{group.label}</span>
                <span className="truncate text-xs text-muted-foreground">({group.providerLabel})</span>
                {group.sources.length === 0 && (
                  <span className="shrink-0 rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                    unavailable
                  </span>
                )}
              </span>
              <CaretDown size={14} weight="bold" className="shrink-0 text-muted-foreground transition-transform group-open/source:rotate-180" />
            </summary>
            <div className="grid max-h-56 gap-1 overflow-y-auto border-t border-border p-2 sm:grid-cols-2">
              {group.sources.length === 0 ? (
                <div className="rounded-md border border-dashed border-border bg-background/60 px-2.5 py-2 text-xs text-muted-foreground sm:col-span-2">
                  No matching source from this provider.
                </div>
              ) : group.sources.map((source, sourceIndex) => {
                const selected = source.url === selectedUrl;

                return (
                  <button
                    key={`${source.server}-${source.url}`}
                    type="button"
                    onClick={() => onSelect(source.url)}
                    className={`flex min-h-9 items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors ${
                      selected
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border bg-background/70 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">{normalizeServerLabel(source.server, sourceIndex)}</span>
                    {(source.active || source.noAds) && (
                      <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] uppercase text-primary">
                        {source.active ? "active" : "no ads"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
};

const formatTime = (secs: number): string => {
  if (!isFinite(secs) || secs < 0) return "0:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const timeLeft = (current: number, total: number): string => {
  const rem = total - current;
  if (!isFinite(rem) || rem <= 0) return "";
  return `-${formatTime(rem)} left`;
};

export const VideoPlayer = ({
  item,
  episodeId,
  allEpisodes = [],
  embedUrl,
  streamSources = [],
  playbackLoading = false,
}: VideoPlayerProps) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef<number | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [theaterMode, setTheaterMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showNextBadge, setShowNextBadge] = useState(false);
  const [autoplayCountdown, setAutoplayCountdown] = useState<number | null>(null);
  const [selectedSourceUrl, setSelectedSourceUrl] = useState<string | null>(null);
  const autoplayTimerRef = useRef<number | null>(null);
  const sourceGroups = useMemo(() => buildSourceGroups(streamSources), [streamSources]);
  const preferredSource = useMemo(
    () =>
      streamSources.find((source) => source.url === embedUrl) ??
      streamSources.find((source) => source.active) ??
      streamSources.find((source) => source.noAds) ??
      streamSources[0],
    [embedUrl, streamSources],
  );
  const activeUrl = selectedSourceUrl ?? preferredSource?.url ?? embedUrl ?? null;

  // Compute next episode
  const currentEpIndex = allEpisodes.findIndex((ep) => ep.id === episodeId);
  const nextEpisode = currentEpIndex >= 0 && currentEpIndex < allEpisodes.length - 1
    ? allEpisodes[currentEpIndex + 1]
    : null;

  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = window.setTimeout(() => setControlsVisible(false), 2800);
    }
  }, [playing]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = () => resetHideTimer();
    const onLeave = () => { if (playing) setControlsVisible(false); };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [resetHideTimer, playing]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === " ") { e.preventDefault(); togglePlay(); }
      if (e.key === "ArrowRight" && videoRef.current) { videoRef.current.currentTime += 10; resetHideTimer(); }
      if (e.key === "ArrowLeft" && videoRef.current) { videoRef.current.currentTime -= 10; resetHideTimer(); }
      if (e.key.toLowerCase() === "m") toggleMute();
      if (e.key.toLowerCase() === "f") toggleFullscreen();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    setSelectedSourceUrl(preferredSource?.url ?? embedUrl ?? null);
  }, [embedUrl, preferredSource?.url]);

  // Show "next episode" badge when < 30 s remain
  useEffect(() => {
    if (!nextEpisode) return;
    const remaining = duration - currentTime;
    if (remaining > 0 && remaining <= 30 && playing) {
      setShowNextBadge(true);
    } else {
      setShowNextBadge(false);
    }
  }, [currentTime, duration, playing, nextEpisode]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
    resetHideTimer();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !videoRef.current.muted;
    videoRef.current.muted = next;
    setMuted(next);
  };

  const handleVolumeChange = (val: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = val / 100;
    setVolume(val);
    const isMuted = val === 0;
    videoRef.current.muted = isMuted;
    setMuted(isMuted);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await el.requestFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    const dur = v.duration || 1;
    const curr = v.currentTime;
    setCurrentTime(curr);
    setDuration(v.duration || 0);
    setProgress((curr / dur) * 100);
    if (v.buffered.length > 0) {
      setBuffered((v.buffered.end(v.buffered.length - 1) / dur) * 100);
    }
    saveWatchProgress({
      contentId: item.id,
      episodeId: episodeId ?? undefined,
      progress: (curr / dur) * 100,
      duration: v.duration || 0,
      updatedAt: Date.now(),
    });
  };

  const handleSeek = (pct: number) => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || 0;
    videoRef.current.currentTime = (pct / 100) * dur;
    setProgress(pct);
  };

  const cancelAutoplay = () => {
    if (autoplayTimerRef.current) window.clearInterval(autoplayTimerRef.current);
    setAutoplayCountdown(null);
  };

  const goToNextEpisode = () => {
    cancelAutoplay();
    if (!nextEpisode) return;
    navigate(`/watch/${item.id}?episode=${nextEpisode.id}`);
  };

  const VolumeIcon = muted || volume === 0 ? SpeakerSlash : volume < 50 ? SpeakerLow : SpeakerHigh;
  const nativeVideoUrl = isNativeStreamUrl(activeUrl) ? activeUrl : null;

  if (playbackLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="relative aspect-video bg-black">
          <div className="absolute inset-0 flex items-center justify-center">
            <StreamingLoader
              compact
              label="Streaming"
              words={["sources...", "providers...", "embed...", "buffer..."]}
            />
          </div>
        </div>

        <div className="border-t border-border px-5 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="truncate text-lg font-medium text-foreground">{item.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeUrl) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="relative aspect-video bg-black">
          <MediaPlaceholder title={item.title} variant="video" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 px-6 text-center">
            <div>
              <p className="text-base font-medium text-foreground">Stream source unavailable</p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                No matching playable source was returned for this title.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border px-5 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="truncate text-lg font-medium text-foreground">{item.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
            <SourceSelector groups={sourceGroups} selectedUrl={activeUrl} onSelect={setSelectedSourceUrl} />
          </div>
        </div>
      </div>
    );
  }

  if (activeUrl && !nativeVideoUrl) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="relative aspect-video bg-black">
          <iframe
            key={activeUrl}
            title={`Watch ${item.title}`}
            src={activeUrl}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="border-t border-border px-5 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="truncate text-lg font-medium text-foreground">{item.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
            <SourceSelector groups={sourceGroups} selectedUrl={activeUrl} onSelect={setSelectedSourceUrl} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {item.genres.map((g) => (
              <span key={g} className="rounded-full border border-border bg-card/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-background ${theaterMode ? "rounded-none border-x-0" : ""}`}>
      <div
        ref={containerRef}
        className="relative aspect-video bg-black cursor-pointer select-none"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      >
        <video
          key={nativeVideoUrl}
          ref={videoRef}
          className="h-full w-full"
          src={nativeVideoUrl ?? undefined}
          poster={item.backdropImage || undefined}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
          onPlay={() => { setPlaying(true); resetHideTimer(); cancelAutoplay(); }}
          onPause={() => { setPlaying(false); setControlsVisible(true); }}
          onEnded={() => {
            setPlaying(false);
            setControlsVisible(true);
            if (nextEpisode) {
              setAutoplayCountdown(5);
              autoplayTimerRef.current = window.setInterval(() => {
                setAutoplayCountdown((prev) => {
                  if (prev === null || prev <= 1) {
                    window.clearInterval(autoplayTimerRef.current!);
                    navigate(`/watch/${item.id}?episode=${nextEpisode.id}`);
                    return null;
                  }
                  return prev - 1;
                });
              }, 1000);
            }
          }}
        />

        {/* Center play indicator (shown when paused) */}
        {!playing && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm">
              <Play size={36} weight="fill" />
            </div>
          </div>
        )}

        {/* Next Episode badge */}
        {showNextBadge && nextEpisode && (
          <div className="absolute bottom-20 right-5 z-20">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goToNextEpisode(); }}
              className="flex items-center gap-3 rounded-xl border border-primary/40 bg-card/90 px-5 py-3 text-sm font-medium text-foreground backdrop-blur-md transition-all hover:scale-105 hover:border-primary hover:bg-primary/10"
            >
              <SkipForward size={16} weight="fill" className="text-primary" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Up Next</p>
                <p className="text-sm font-medium">{nextEpisode.title}</p>
              </div>
            </button>
          </div>
        )}

        {/* Auto-play countdown overlay */}
        {autoplayCountdown !== null && nextEpisode && (
          <div className="absolute inset-0 z-30 flex items-end justify-end p-6">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-xl w-72">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Up Next</p>
              <p className="text-sm font-medium text-foreground leading-tight">{nextEpisode.title}</p>
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8 shrink-0">
                  <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="13" fill="none" stroke="hsl(var(--color-border))" strokeWidth="3" />
                    <circle
                      cx="16" cy="16" r="13" fill="none"
                      stroke="hsl(var(--color-primary))"
                      strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 13}`}
                      strokeDashoffset={`${2 * Math.PI * 13 * (autoplayCountdown / 5)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">{autoplayCountdown}</span>
                </div>
                <div className="flex flex-1 gap-2">
                  <button
                    type="button"
                    onClick={cancelAutoplay}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={goToNextEpisode}
                    className="flex-1 rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110"
                  >
                    Play now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls overlay */}
        <div
          className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${controlsVisible || !playing ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top gradient */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background/60 to-transparent" />
          {/* Bottom gradient */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background/95 to-transparent" />

          {/* Title bar */}
          <div className="relative px-5 pt-4">
            <p className="text-sm font-medium text-white drop-shadow md:text-base">{item.title}</p>
          </div>

          {/* Seekbar */}
          <div className="relative px-5 pb-2 pt-4">
            {/* Time tooltip could go here */}
            <div
              className="group/seek relative h-1.5 cursor-pointer rounded-full bg-white/20 hover:h-2.5 transition-all duration-150"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                handleSeek(((e.clientX - rect.left) / rect.width) * 100);
              }}
            >
              {/* Buffered */}
              <div className="absolute inset-y-0 left-0 rounded-full bg-white/25" style={{ width: `${buffered}%` }} />
              {/* Progress */}
              <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-primary" style={{ width: `${progress}%` }} />
              {/* Thumb */}
              <div
                className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full bg-primary opacity-0 shadow transition-opacity group-hover/seek:opacity-100"
                style={{ left: `${progress}%` }}
              />
            </div>
            {/* Time below seekbar */}
            <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-white/60">
              <span>{formatTime(currentTime)}</span>
              <span>{duration > 0 ? timeLeft(currentTime, duration) : formatTime(duration)}</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="relative flex items-center justify-between gap-2 px-5 pb-4">
            {/* Left */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Rewind 10s"
                onClick={() => videoRef.current && (videoRef.current.currentTime -= 10)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
              >
                <FastForward size={18} weight="bold" className="rotate-180" />
              </button>
              <button
                type="button"
                aria-label={playing ? "Pause" : "Play"}
                onClick={togglePlay}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                {playing ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
              </button>
              <button
                type="button"
                aria-label="Forward 10s"
                onClick={() => videoRef.current && (videoRef.current.currentTime += 10)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
              >
                <FastForward size={18} weight="bold" />
              </button>

              {/* Volume group */}
              <div
                className="relative flex items-center gap-2"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button
                  type="button"
                  aria-label={muted ? "Unmute" : "Mute"}
                  onClick={toggleMute}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                >
                  <VolumeIcon size={18} weight="bold" />
                </button>
                <div className={`flex items-center overflow-hidden transition-all duration-200 ${showVolumeSlider ? "w-24 opacity-100" : "w-0 opacity-0"}`}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={muted ? 0 : volume}
                    aria-label="Volume"
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-full accent-[hsl(var(--color-primary))]"
                  />
                </div>
              </div>

              {/* Inline time display */}
              <span className="hidden select-none text-xs text-white/70 sm:inline font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1">
              {nextEpisode && (
                <button
                  type="button"
                  onClick={goToNextEpisode}
                  className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <SkipForward size={13} weight="bold" />
                  Next
                </button>
              )}
              <button
                type="button"
                className="hidden sm:flex items-center rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                1080p
              </button>
              <button
                type="button"
                aria-label="Subtitles"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
              >
                <Subtitles size={18} weight="bold" />
              </button>
              <button
                type="button"
                aria-label={theaterMode ? "Exit theater" : "Theater mode"}
                onClick={() => setTheaterMode((v) => !v)}
                className="hidden md:flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
              >
                {theaterMode ? <CornersIn size={18} weight="bold" /> : <CornersOut size={18} weight="bold" />}
              </button>
              <button
                type="button"
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                onClick={toggleFullscreen}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
              >
                {isFullscreen ? <ArrowsIn size={18} weight="bold" /> : <ArrowsOut size={18} weight="bold" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Under-player meta */}
      <div className="border-t border-border px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="truncate text-lg font-medium text-foreground">{item.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
          </div>
          <div className="shrink-0 text-left text-xs text-muted-foreground lg:text-right">
            <p>{item.year} · {item.duration}</p>
            <p className="mt-0.5">{item.country}</p>
          </div>
        </div>
        <div className="mt-4">
          <SourceSelector groups={sourceGroups} selectedUrl={activeUrl} onSelect={setSelectedSourceUrl} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {item.genres.map((g) => (
            <span key={g} className="rounded-full border border-border bg-card/60 px-2.5 py-1 text-[11px] text-muted-foreground">
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
