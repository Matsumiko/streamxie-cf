import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PosterCard } from "@/components/content/PosterCard";
import { EmptyState } from "@/components/common/EmptyState";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useStreamCatalog } from "@/hooks/useStreamCatalog";

type GenrePageProps = {
  myList: string[];
  onToggleList: (id: string) => void;
};

// Pemetaan genre ke aksen warna untuk header sinematik
const genreAccents: Record<string, string> = {
  "Sci-Fi": "from-cyan-500/30 to-blue-900/60",
  "Fantasy": "from-violet-500/30 to-indigo-900/60",
  "Thriller": "from-red-600/30 to-rose-900/60",
  "Romance": "from-pink-500/30 to-rose-800/60",
  "Drama": "from-amber-500/30 to-orange-900/60",
  "Anime": "from-orange-500/30 to-amber-900/60",
  "Action": "from-red-500/30 to-orange-900/60",
  "Mystery": "from-purple-500/30 to-violet-900/60",
  "Crime": "from-rose-600/30 to-red-900/60",
  "Cyberpunk": "from-teal-400/30 to-cyan-900/60",
  "Variety": "from-yellow-400/30 to-amber-900/60",
  "Historical": "from-stone-500/30 to-stone-900/60",
  "Documentary": "from-green-500/30 to-emerald-900/60",
  "Political": "from-blue-600/30 to-sky-900/60",
  "Adventure": "from-emerald-400/30 to-green-900/60",
  "Travel": "from-sky-400/30 to-blue-900/60",
};

export const GenrePage = ({ myList, onToggleList }: GenrePageProps) => {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name ?? "");
  const { items: catalogItems } = useStreamCatalog();

  const filtered = useMemo(
    () => catalogItems.filter((item) => item.genres.includes(decodedName)),
    [catalogItems, decodedName],
  );

  useDocumentMeta(`${decodedName} | streamXie`, `Browse all ${decodedName} content on streamXie.`);

  const gradient = genreAccents[decodedName] ?? "from-primary/30 to-background";
  // Gunakan backdrop item pertama yang cocok untuk latar hero
  const heroBg = filtered[0]?.backdropImage ?? null;

  return (
    <>
      {/* Header genre sinematik */}
      <div className={`relative overflow-hidden pt-[72px]`} style={{ minHeight: 280 }}>
        {/* Lapisan gambar backdrop */}
        {heroBg && (
          <img
            src={heroBg}
            alt={`Backdrop genre ${decodedName}`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-20"
          />
        )}
        {/* Lapisan tint warna */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-70`} />
        {/* Fade bawah ke warna latar */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background" />

        <PageContainer className="relative pb-12 pt-12">
          <Link
            to="/browse"
            className="mb-6 inline-flex items-center gap-2 rounded-lg border border-border/50 bg-card/40 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowLeft size={16} weight="bold" />
            Back to Browse
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <h1 className="text-5xl font-medium uppercase tracking-[0.12em] text-foreground drop-shadow-lg md:text-8xl">
              {decodedName}
            </h1>
            <div className="mt-4 flex items-center gap-3">
              <span className="h-0.5 w-12 rounded-full bg-primary/70" />
              <p className="text-sm text-muted-foreground">
                {filtered.length} title{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </motion.div>
        </PageContainer>
      </div>

      <PageContainer className="py-10">
        {filtered.length === 0 ? (
          <EmptyState
            title="No content in this genre yet"
            description="Check back soon — new titles are added regularly."
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6"
          >
            {filtered.map((item) => (
              <PosterCard
                key={item.id}
                item={item}
                inList={myList.includes(item.id)}
                onToggleList={onToggleList}
              />
            ))}
          </motion.div>
        )}
      </PageContainer>
    </>
  );
};
