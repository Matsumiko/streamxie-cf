import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookmarkSimple, Play, Star } from "@phosphor-icons/react";
import { MediaPlaceholder } from "@/components/common/MediaPlaceholder";
import type { ContentItem } from "@/types/content";

type PosterCardProps = {
  item: ContentItem;
  inList: boolean;
  onToggleList: (id: string) => void;
};

const categoryColors: Record<string, string> = {
  Movies: "bg-blue-500/80 text-white",
  Series: "bg-violet-500/80 text-white",
  Anime: "bg-orange-500/80 text-white",
  Drama: "bg-rose-500/80 text-white",
  Variety: "bg-amber-500/80 text-white",
};

export const PosterCard = ({ item, inList, onToggleList }: PosterCardProps) => {
  const href = item.type === "movie" ? `/movie/${item.slug}` : `/series/${item.slug}`;
  const badgeClass = categoryColors[item.category] ?? "bg-card/80 text-foreground";
  const primaryGenre = item.genres[0] ?? item.category;

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="group relative"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted card-glow transition-shadow duration-300">
        {item.posterImage ? (
          <img
            src={item.posterImage}
            alt={item.posterAlt || item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <MediaPlaceholder title={item.title} variant="poster" className="transition-transform duration-500 group-hover:scale-105" />
        )}

        {/* Category badge */}
        <span className={`absolute left-2.5 top-2.5 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm ${badgeClass}`}>
          {item.category}
        </span>

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Hover actions */}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-3 flex-col gap-2 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Link
            to={`/watch/${item.id}`}
            className="flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-gradient-primary text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
            onClick={(e) => e.stopPropagation()}
          >
            <Play size={15} weight="fill" />
            Play
          </Link>
          <div className="flex gap-2">
            <Link
              to={href}
              className="flex flex-1 min-h-[36px] items-center justify-center rounded-lg bg-card/80 text-xs text-foreground backdrop-blur-sm transition-all hover:bg-card"
              onClick={(e) => e.stopPropagation()}
            >
              Details
            </Link>
            <button
              type="button"
              aria-label={inList ? "Remove from My List" : "Add to My List"}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleList(item.id); }}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-sm font-medium transition-all ${inList ? "bg-primary/30 text-primary ring-1 ring-primary" : "bg-card/80 text-foreground backdrop-blur-sm hover:bg-primary/20 hover:text-primary"}`}
            >
              <BookmarkSimple size={16} weight={inList ? "fill" : "bold"} />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1 px-0.5">
        <Link
          to={href}
          className="block truncate text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          {item.title}
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star size={11} weight="fill" className="shrink-0 text-warning" />
          <span>{item.rating}</span>
          {item.year > 0 ? (
            <>
              <span>·</span>
              <span>{item.year}</span>
            </>
          ) : null}
          <span>·</span>
          <span className="truncate">{primaryGenre}</span>
        </div>
      </div>
    </motion.div>
  );
};
