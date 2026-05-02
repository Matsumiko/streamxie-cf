import { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export const PageContainer = ({
  children,
  className = "",
}: PageContainerProps) => {
  return (
    <div
      className={`mx-auto w-full max-w-container px-4 sm:px-6 md:px-12 ${className}`}
    >
      {children}
    </div>
  );
};
