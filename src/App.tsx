import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { StreamingLoader } from "@/components/common/StreamingLoader";
import {
  getMyList,
  getWatchProgress,
  toggleMyList,
  WATCH_PROGRESS_UPDATED_EVENT,
} from "@/lib/storage";
import { STREAM_SECTION_ROUTES } from "@/lib/streamxie";
import { toast } from "@/hooks/use-toast";

const HomePage = lazy(() =>
  import("@/pages/HomePage").then((module) => ({ default: module.HomePage })),
);
const BrowsePage = lazy(() =>
  import("@/pages/BrowsePage").then((module) => ({ default: module.BrowsePage })),
);
const MovieDetailPage = lazy(() =>
  import("@/pages/MovieDetailPage").then((module) => ({ default: module.MovieDetailPage })),
);
const SeriesDetailPage = lazy(() =>
  import("@/pages/SeriesDetailPage").then((module) => ({ default: module.SeriesDetailPage })),
);
const WatchPage = lazy(() =>
  import("@/pages/WatchPage").then((module) => ({ default: module.WatchPage })),
);
const SearchPage = lazy(() =>
  import("@/pages/SearchPage").then((module) => ({ default: module.SearchPage })),
);
const MyListPage = lazy(() =>
  import("@/pages/MyListPage").then((module) => ({ default: module.MyListPage })),
);
const ProfilePage = lazy(() =>
  import("@/pages/ProfilePage").then((module) => ({ default: module.ProfilePage })),
);
const GenrePage = lazy(() =>
  import("@/pages/GenrePage").then((module) => ({ default: module.GenrePage })),
);
const CollectionPage = lazy(() =>
  import("@/pages/CollectionPage").then((module) => ({ default: module.CollectionPage })),
);
const StreamxieProviderPage = lazy(() =>
  import("@/pages/StreamxieProviderPage").then((module) => ({ default: module.StreamxieProviderPage })),
);
const StreamxieCollectionPage = lazy(() =>
  import("@/pages/StreamxieCollectionPage").then((module) => ({ default: module.StreamxieCollectionPage })),
);
const StaticPage = lazy(() =>
  import("@/pages/StaticPage").then((module) => ({ default: module.StaticPage })),
);
const LoginPage = lazy(() =>
  import("@/pages/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("@/pages/RegisterPage").then((module) => ({ default: module.RegisterPage })),
);
const ForgotPasswordPage = lazy(() =>
  import("@/pages/ForgotPasswordPage").then((module) => ({ default: module.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import("@/pages/ResetPasswordPage").then((module) => ({ default: module.ResetPasswordPage })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })),
);
const CommandPalette = lazy(() =>
  import("@/components/common/CommandPalette").then((module) => ({ default: module.CommandPalette })),
);

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname, location.search]);

  return null;
};

const AppRoutes = () => {
  const [commandOpen, setCommandOpen] = useState(false);
  const commandTriggerRef = useRef<HTMLElement | null>(null);
  const [myList, setMyList] = useState<string[]>([]);
  const [progressVersion, setProgressVersion] = useState(0);

  useEffect(() => {
    setMyList(getMyList());
    const syncMyList = () => setMyList(getMyList());
    const syncProgress = () => setProgressVersion((current) => current + 1);
    window.addEventListener("storage", syncMyList);
    window.addEventListener("storage", syncProgress);
    window.addEventListener(WATCH_PROGRESS_UPDATED_EVENT, syncProgress);
    return () => {
      window.removeEventListener("storage", syncMyList);
      window.removeEventListener("storage", syncProgress);
      window.removeEventListener(WATCH_PROGRESS_UPDATED_EVENT, syncProgress);
    };
  }, []);

  const progressMap = useMemo(() => {
    const progress = getWatchProgress();
    return Object.fromEntries(
      Object.entries(progress).map(([key, value]) => [key, value.progress]),
    );
  }, [progressVersion]);

  const handleToggleList = (id: string) => {
    const prev = myList;
    const next = toggleMyList(id);
    setMyList(next);
    const added = next.length > prev.length;
    toast({
      title: added ? "Added to My List" : "Removed from My List",
      variant: added ? "success" : "default",
    });
  };

  const handleOpenCommand = (trigger?: HTMLElement | null) => {
    if (trigger) commandTriggerRef.current = trigger;
    setCommandOpen(true);
  };

  const handleCommandOpenChange = (nextOpen: boolean) => {
    setCommandOpen(nextOpen);
    if (nextOpen) return;
    window.setTimeout(() => {
      const trigger = commandTriggerRef.current;
      if (trigger && trigger.isConnected) {
        trigger.focus();
        return;
      }
      const fallbackTrigger = document.querySelector<HTMLElement>("button[aria-label='Open search'], button[aria-label='Search']");
      if (fallbackTrigger) fallbackTrigger.focus();
    }, 260);
  };

  return (
    <>
      <ScrollToTop />
      <AppLayout onOpenCommand={handleOpenCommand}>
        <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center px-4"><StreamingLoader label="Memuat halaman" compact /></div>}>
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  myList={myList}
                  onToggleList={handleToggleList}
                  progressMap={progressMap}
                />
              }
            />
            <Route
              path="/browse"
              element={
                <BrowsePage myList={myList} onToggleList={handleToggleList} />
              }
            />
            <Route
              path="/streamxie1"
              element={
                <StreamxieProviderPage
                  scope="streamxie1"
                  myList={myList}
                  onToggleList={handleToggleList}
                />
              }
            />
            <Route
              path="/streamxie2"
              element={
                <StreamxieProviderPage
                  scope="streamxie2"
                  myList={myList}
                  onToggleList={handleToggleList}
                />
              }
            />
            <Route
              path="/streamxie3"
              element={
                <StreamxieProviderPage
                  scope="streamxie3"
                  myList={myList}
                  onToggleList={handleToggleList}
                />
              }
            />
            <Route
              path="/movie/:slug"
              element={
                <MovieDetailPage
                  myList={myList}
                  onToggleList={handleToggleList}
                />
              }
            />
            <Route
              path="/series/:slug"
              element={
                <SeriesDetailPage
                  myList={myList}
                  onToggleList={handleToggleList}
                />
              }
            />
            <Route
              path="/watch/:id"
              element={<WatchPage progressMap={progressMap} />}
            />
            <Route
              path="/search"
              element={
                <SearchPage myList={myList} onToggleList={handleToggleList} />
              }
            />
            <Route
              path="/my-list"
              element={
                <MyListPage
                  myList={myList}
                  onToggleList={handleToggleList}
                  progressMap={progressMap}
                />
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/genre/:name"
              element={<GenrePage myList={myList} onToggleList={handleToggleList} />}
            />
            <Route
              path="/:scope/:collectionType/:collectionSlug"
              element={
                <StreamxieCollectionPage
                  myList={myList}
                  onToggleList={handleToggleList}
                />
              }
            />
            <Route path="/privacy" element={<StaticPage page="privacy" />} />
            <Route path="/terms" element={<StaticPage page="terms" />} />
            <Route path="/cookies" element={<StaticPage page="cookies" />} />
            <Route path="/about" element={<StaticPage page="about" />} />
            <Route path="/streaming-tips" element={<StaticPage page="streaming-tips" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            {STREAM_SECTION_ROUTES.map((route) => (
              <Route
                key={route.slug}
                path={`/${route.slug}`}
                element={
                  <CollectionPage
                    myList={myList}
                    onToggleList={handleToggleList}
                    sectionSlug={route.slug}
                  />
                }
              />
            ))}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AppLayout>
      {commandOpen ? (
        <Suspense fallback={null}>
          <CommandPalette open={commandOpen} onOpenChange={handleCommandOpenChange} />
        </Suspense>
      ) : null}
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
