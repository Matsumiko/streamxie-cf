import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { CommandPalette } from "@/components/common/CommandPalette";
import { HomePage } from "@/pages/HomePage";
import { BrowsePage } from "@/pages/BrowsePage";
import { MovieDetailPage } from "@/pages/MovieDetailPage";
import { SeriesDetailPage } from "@/pages/SeriesDetailPage";
import { WatchPage } from "@/pages/WatchPage";
import { SearchPage } from "@/pages/SearchPage";
import { MyListPage } from "@/pages/MyListPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { GenrePage } from "@/pages/GenrePage";
import { CollectionPage } from "@/pages/CollectionPage";
import { StreamxieProviderPage } from "@/pages/StreamxieProviderPage";
import { StreamxieCollectionPage } from "@/pages/StreamxieCollectionPage";
import { StaticPage } from "@/pages/StaticPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { getMyList, getWatchProgress, toggleMyList } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";

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
    window.addEventListener("storage", syncMyList);
    const interval = window.setInterval(
      () => setProgressVersion((current) => current + 1),
      1000,
    );
    return () => {
      window.removeEventListener("storage", syncMyList);
      window.clearInterval(interval);
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
          <Route
            path="/:sectionSlug"
            element={
              <CollectionPage myList={myList} onToggleList={handleToggleList} />
            }
          />
        </Routes>
      </AppLayout>
      <CommandPalette open={commandOpen} onOpenChange={handleCommandOpenChange} />
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
