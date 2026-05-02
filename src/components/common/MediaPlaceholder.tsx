import { FilmStrip, User } from "@phosphor-icons/react";

type MediaPlaceholderProps = {
  title?: string;
  variant?: "poster" | "backdrop" | "avatar" | "video";
  className?: string;
};

const initialsFrom = (value?: string) => {
  const parts = (value ?? "")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "SX";
};

export const MediaPlaceholder = ({
  title,
  variant = "poster",
  className = "",
}: MediaPlaceholderProps) => {
  const isAvatar = variant === "avatar";
  const Icon = isAvatar ? User : FilmStrip;

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_35%_20%,rgba(0,245,212,0.20),transparent_38%),linear-gradient(135deg,rgba(20,26,34,0.98),rgba(6,10,15,0.98))] p-4 text-center text-muted-foreground ${className}`}
    >
      {isAvatar ? (
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-base font-semibold text-primary">
          {initialsFrom(title)}
        </span>
      ) : (
        <Icon size={variant === "backdrop" || variant === "video" ? 42 : 34} weight="duotone" className="text-primary/80" />
      )}
      {!isAvatar ? (
        <span className="line-clamp-2 max-w-full text-xs font-medium uppercase tracking-[0.12em] text-foreground/80">
          {title || "streamXie"}
        </span>
      ) : null}
    </div>
  );
};
