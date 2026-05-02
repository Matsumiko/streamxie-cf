import { motion } from "framer-motion";
import { MediaPlaceholder } from "@/components/common/MediaPlaceholder";
import type { CastMember } from "@/types/content";

export const CastGrid = ({ cast, title = "Cast" }: { cast: CastMember[]; title?: string }) => {
  if (cast.length === 0) return null;

  return (
    <section className="py-8 md:py-10">
      <h2 className="mb-6 text-2xl font-medium uppercase tracking-[0.12em] text-foreground">
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar" style={{ scrollSnapType: "x mandatory" }}>
        {cast.map((member, i) => (
          <motion.div
            key={`${member.name}-${member.role}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="group w-[180px] shrink-0 overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 sm:w-[200px] lg:w-[224px] card-glow"
            style={{ scrollSnapAlign: "start" }}
          >
            <div className="aspect-[3/4] overflow-hidden bg-muted">
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <MediaPlaceholder title={member.name} variant="avatar" className="transition-transform duration-500 group-hover:scale-105" />
              )}
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
              <p className="truncate text-xs text-muted-foreground">{member.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
