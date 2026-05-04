type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  headingLevel?: "h1" | "h2";
};

export const SectionHeader = ({
  title,
  subtitle,
  action,
  headingLevel = "h2",
}: SectionHeaderProps) => {
  const HeadingTag = headingLevel;

  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="space-y-1.5 min-w-0">
        <HeadingTag className="text-xl font-medium uppercase tracking-[0.12em] text-foreground md:text-2xl">
          {title}
        </HeadingTag>
        {subtitle ? (
          <p className="max-w-lg truncate text-sm text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 mt-0.5">{action}</div> : null}
    </div>
  );
};
