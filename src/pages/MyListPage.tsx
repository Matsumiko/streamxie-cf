import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookmarkSimple, ClockCounterClockwise, Trash } from "@phosphor-icons/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageContainer } from "@/components/layout/PageContainer";
import { PosterCard } from "@/components/content/PosterCard";
import { LandscapeCard } from "@/components/content/LandscapeCard";
import { EmptyState } from "@/components/common/EmptyState";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { getWatchProgress } from "@/lib/storage";
import { fetchStreamDetailByRouteId } from "@/lib/streamxie";
import { useStreamCatalog } from "@/hooks/useStreamCatalog";
import type { ContentItem } from "@/types/content";

type MyListPageProps = {
  myList: string[];
  onToggleList: (id: string) => void;
  progressMap: Record<string, number>;
};

export const MyListPage = ({ myList, onToggleList, progressMap }: MyListPageProps) => {
  const { items: catalogItems } = useStreamCatalog();
  const [resolvedItems, setResolvedItems] = useState<Record<string, ContentItem>>({});

  useDocumentMeta(
    "My List | streamXie",
    "Manage favorites, continue watching, and recent history.",
  );
  const [tab, setTab] = useState("favorites");

  const progressData = getWatchProgress();
  const catalogById = useMemo(
    () => Object.fromEntries(catalogItems.map((item) => [item.id, item])),
    [catalogItems],
  );

  useEffect(() => {
    let mounted = true;
    const ids = Array.from(
      new Set([
        ...myList,
        ...Object.keys(progressData).filter((id) => (progressMap[id] ?? 0) > 0),
      ]),
    );

    const missing = ids.filter((id) => !catalogById[id] && !resolvedItems[id]);
    if (missing.length === 0) return () => {
      mounted = false;
    };

    Promise.all(
      missing.slice(0, 40).map(async (id) => {
        try {
          const detail = await fetchStreamDetailByRouteId(id);
          return detail ? [id, detail] : null;
        } catch {
          return null;
        }
      }),
    ).then((pairs) => {
      if (!mounted) return;
      const nextEntries = pairs.filter((entry): entry is [string, ContentItem] => Array.isArray(entry));
      if (nextEntries.length === 0) return;
      setResolvedItems((current) => ({
        ...current,
        ...Object.fromEntries(nextEntries),
      }));
    });

    return () => {
      mounted = false;
    };
  }, [catalogById, myList, progressData, progressMap, resolvedItems]);

  const resolveItem = (id: string) => catalogById[id] ?? resolvedItems[id];

  const favorites = useMemo(
    () => myList.map((id) => resolveItem(id)).filter((item): item is ContentItem => Boolean(item)),
    [myList, catalogById, resolvedItems],
  );

  const continueWatching = useMemo(
    () =>
      Object.keys(progressData)
        .map((id) => resolveItem(id))
        .filter((item): item is ContentItem => Boolean(item))
        .filter((item) => (progressMap[item.id] ?? 0) > 0 && (progressMap[item.id] ?? 0) < 98)
        .sort((a, b) => {
          const pa = progressData[a.id];
          const pb = progressData[b.id];
          return (pb?.updatedAt ?? 0) - (pa?.updatedAt ?? 0);
        }),
    [catalogById, resolvedItems, progressMap, progressData],
  );

  const history = useMemo(
    () =>
      Object.keys(progressData)
        .map((id) => resolveItem(id))
        .filter((item): item is ContentItem => Boolean(item))
        .filter((item) => (progressMap[item.id] ?? 0) > 0)
        .sort((a, b) => {
          const pa = progressData[a.id];
          const pb = progressData[b.id];
          return (pb?.updatedAt ?? 0) - (pa?.updatedAt ?? 0);
        }),
    [catalogById, resolvedItems, progressMap, progressData],
  );

  return (
    <PageContainer className="pt-32 pb-16">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-4xl font-medium uppercase tracking-[0.1em] text-foreground">My List</h1>
        <p className="text-sm text-muted-foreground">
          {favorites.length} saved · {continueWatching.length} in progress
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-8 grid h-auto min-h-11 w-full max-w-xl grid-cols-3 bg-card">
          <TabsTrigger value="favorites" className="min-h-10 text-foreground flex items-center gap-2">
            <BookmarkSimple size={15} weight="bold" />
            Saved
            {favorites.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">{favorites.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="continue" className="min-h-10 text-foreground flex items-center gap-2">
            <ClockCounterClockwise size={15} weight="bold" />
            Continue
            {continueWatching.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">{continueWatching.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="min-h-10 text-foreground">History</TabsTrigger>
        </TabsList>

        {/* ── Favorites ── */}
        <TabsContent value="favorites">
          <h2 className="sr-only">Saved titles</h2>
          {favorites.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6"
            >
              {favorites.map((item) => (
                <div key={item.id} className="relative">
                  <PosterCard item={item} inList={true} onToggleList={onToggleList} />
                  {/* Remove shortcut */}
                  <button
                    type="button"
                    onClick={() => onToggleList(item.id)}
                    aria-label={`Remove ${item.title} from list`}
                    className="absolute -right-2 -top-2 z-10 hidden h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-error shadow transition-all hover:scale-110 group-hover:flex md:flex"
                  >
                    <Trash size={13} weight="bold" />
                  </button>
                </div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              title="Your list is empty"
              description="Browse content and tap the bookmark icon to save titles here."
            />
          )}
        </TabsContent>

        {/* ── Continue Watching ── */}
        <TabsContent value="continue">
          <h2 className="sr-only">Continue watching</h2>
          {continueWatching.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid gap-5 lg:grid-cols-2"
            >
              {continueWatching.map((item) => (
                <LandscapeCard
                  key={item.id}
                  item={item}
                  progress={progressMap[item.id] ?? 0}
                  durationSeconds={progressData[item.id]?.duration}
                />
              ))}
            </motion.div>
          ) : (
            <EmptyState
              title="Nothing to resume"
              description="Start watching something and come back here to continue where you left off."
            />
          )}
        </TabsContent>

        {/* ── History ── */}
        <TabsContent value="history">
          <h2 className="sr-only">Watch history</h2>
          {history.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid gap-5 lg:grid-cols-2"
            >
              {history.map((item) => (
                <LandscapeCard
                  key={item.id}
                  item={item}
                  progress={progressMap[item.id] ?? 0}
                  durationSeconds={progressData[item.id]?.duration}
                />
              ))}
            </motion.div>
          ) : (
            <EmptyState
              title="No history yet"
              description="Your recent viewing activity will appear here after playback starts."
            />
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};
