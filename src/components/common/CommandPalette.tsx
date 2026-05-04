import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MagnifyingGlass, FilmStrip } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MediaPlaceholder } from "@/components/common/MediaPlaceholder";
import { StreamingLoader } from "@/components/common/StreamingLoader";
import { getSearchHistory, saveSearchTerm } from "@/lib/storage";
import { useStreamCatalog } from "@/hooks/useStreamCatalog";
import {
  fetchStreamxieFilterOptions,
  getStreamSearchScopeLabel,
  getStreamxieScopeFromPath,
  searchTmdbCatalog,
  searchStreamCatalogByScope,
} from "@/lib/streamxie";
import type { ContentItem } from "@/types/content";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CommandPalette = ({ open, onOpenChange }: CommandPaletteProps) => {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [liveResults, setLiveResults] = useState<ContentItem[]>([]);
  const [scopeKeywords, setScopeKeywords] = useState<string[]>([]);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const restoreTimerRef = useRef<number | null>(null);
  const { items: catalogItems } = useStreamCatalog();
  const location = useLocation();
  const navigate = useNavigate();
  const scope = getStreamxieScopeFromPath(location.pathname);
  const scopeLabel = getStreamSearchScopeLabel(scope);
  const withScopeQuery = (value: string) =>
    scope === "tmdb"
      ? value
        ? `/search?q=${encodeURIComponent(value)}`
        : "/search"
      : value
        ? `/search?scope=${scope}&q=${encodeURIComponent(value)}`
        : `/search?scope=${scope}`;

  const suggestedKeywords = useMemo(() => {
    if (scope !== "tmdb") return scopeKeywords.slice(0, 8);
    const values = catalogItems.flatMap((item) => item.genres);
    return Array.from(new Set(values.filter(Boolean))).slice(0, 8);
  }, [catalogItems, scope, scopeKeywords]);

  useEffect(() => {
    setRecent(getSearchHistory());
  }, [open]);

  useLayoutEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      wasOpenRef.current = true;
      return;
    }

    if (!wasOpenRef.current) return;
    const previous = previousFocusRef.current;
    if (restoreTimerRef.current) window.clearTimeout(restoreTimerRef.current);
    restoreTimerRef.current = window.setTimeout(() => {
      if (previous && previous.isConnected) {
        previous.focus();
        return;
      }
      const fallbackTrigger = document.querySelector<HTMLElement>("button[aria-label='Open search'], button[aria-label='Search']");
      if (fallbackTrigger) fallbackTrigger.focus();
    }, 320);
    wasOpenRef.current = false;
  }, [open]);

  useEffect(() => {
    return () => {
      if (restoreTimerRef.current) window.clearTimeout(restoreTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    if (scope === "tmdb") {
      setScopeKeywords([]);
      return () => {
        mounted = false;
      };
    }

    fetchStreamxieFilterOptions(scope)
      .then((options) => {
        if (!mounted) return;
        setScopeKeywords(options.genres.map((entry) => entry.title));
      })
      .catch(() => {
        if (mounted) setScopeKeywords([]);
      });

    return () => {
      mounted = false;
    };
  }, [scope]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  useEffect(() => {
    let mounted = true;
    const normalized = query.trim();

    if (!normalized) {
      setLiveResults([]);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    const searchPromise = scope === "tmdb"
      ? searchTmdbCatalog(normalized)
      : searchStreamCatalogByScope(normalized, scope);

    searchPromise
      .then((items) => {
        if (mounted) setLiveResults(items);
      })
      .catch(() => {
        if (mounted) setLiveResults([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [query, scope]);

  const results = useMemo(() => {
    if (!query.trim()) return catalogItems.slice(0, 5);
    return liveResults;
  }, [catalogItems, liveResults, query]);

  const goToResult = (value: string, href?: string) => {
    const nextRecent = saveSearchTerm(value);
    setRecent(nextRecent);
    onOpenChange(false);
    if (href) {
      navigate(href);
    } else {
      navigate(withScopeQuery(value));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[86vh] flex-col border-border bg-card text-card-foreground sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-left text-xl font-medium uppercase tracking-[0.1em] text-foreground">
            Quick search · {scopeLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-6">
          <div className="flex items-center gap-3 rounded-md border border-border bg-input px-4">
            <MagnifyingGlass
              size={32}
              weight="duotone"
              className="text-muted-foreground"
            />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                const normalized = query.trim();
                if (!normalized) return;
                event.preventDefault();
                goToResult(normalized);
              }}
              aria-label={`Search ${scopeLabel}`}
              placeholder={`Search ${scopeLabel} titles, genres, cast, or keywords`}
              className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>

          {!query.trim() ? (
            <div className="space-y-5">
              <div>
                <p className="mb-3 text-sm text-muted-foreground">
                  Recent searches
                </p>
                <div className="flex flex-wrap gap-3">
                  {recent.length > 0 ? (
                    recent.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => goToResult(term)}
                        className="rounded-full border border-border bg-muted px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        {term}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No recent searches yet.
                    </p>
                  )}
                </div>
              </div>

              {suggestedKeywords.length > 0 ? (
                <div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Trending keywords
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {suggestedKeywords.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => goToResult(term)}
                        className="rounded-full border border-border bg-secondary/30 px-4 py-2 text-sm text-secondary-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <ul className="space-y-3" aria-label="Search results">
              {loading ? (
                <li className="rounded-lg border border-border bg-background px-4 py-10">
                  <div className="flex items-center justify-center">
                    <StreamingLoader
                      compact
                      label="Searching"
                      words={["titles...", "metadata...", "matches...", "results..."]}
                    />
                  </div>
                </li>
              ) : results.length > 0 ? (
                results.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() =>
                        goToResult(
                          item.title,
                          item.type === "movie"
                            ? `/movie/${item.slug}`
                            : `/series/${item.slug}`,
                        )
                      }
                      className="flex w-full items-center gap-4 rounded-lg border border-border bg-background px-4 py-4 text-left transition-colors hover:border-primary"
                    >
                      <div className="h-20 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.posterImage ? (
                          <img
                            src={item.posterImage}
                            alt={item.posterAlt || item.title}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <MediaPlaceholder title={item.title} variant="poster" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base text-foreground">
                          {item.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.category} · {item.year} ·{" "}
                          {item.genres.join(", ")}
                        </p>
                      </div>
                      <FilmStrip
                        size={32}
                        weight="duotone"
                        className="text-primary"
                      />
                    </button>
                  </li>
                ))
              ) : (
                <li className="rounded-lg border border-border bg-background px-4 py-10 text-center">
                  <p className="text-base text-foreground">
                    No quick matches found.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Press enter on the search page for broader results.
                  </p>
                </li>
              )}
            </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
