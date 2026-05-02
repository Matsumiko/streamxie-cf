import type { CSSProperties } from "react";

type StreamingLoaderProps = {
  label?: string;
  words?: string[];
  compact?: boolean;
};

const defaultWords = ["buffer...", "metadata...", "chunks...", "payload..."];

export const StreamingLoader = ({
  label = "Streaming",
  words = defaultWords,
  compact = false,
}: StreamingLoaderProps) => {
  const normalized = words.filter(Boolean).slice(0, 4);
  const cycleWords = normalized.length > 0 ? [...normalized, normalized[0]] : [...defaultWords, defaultWords[0]];
  const style = { "--stream-loader-duration": `${cycleWords.length * 1.5}s` } as CSSProperties;

  return (
    <div className={`stream-loader ${compact ? "stream-loader--compact" : ""}`}>
      <div className="stream-loader__spinner" aria-hidden="true" />
      <div className="stream-loader__ticker" style={style}>
        <p>{label}</p>
        <div className="stream-loader__words" aria-live="polite">
          {cycleWords.map((word, index) => (
            <span key={`${word}-${index}`} className="stream-loader__word">
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
