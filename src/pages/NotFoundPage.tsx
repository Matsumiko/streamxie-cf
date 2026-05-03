import { MagnifyingGlass, House } from "@phosphor-icons/react";
import { Link, useLocation } from "react-router-dom";
import { EmptyState } from "@/components/common/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export const NotFoundPage = () => {
  const location = useLocation();

  useDocumentMeta(
    "404 | Halaman tidak ditemukan - streamXie",
    "Halaman yang kamu buka tidak tersedia. Kembali ke beranda streamXie atau jelajahi katalog.",
    {
      noIndex: true,
      canonicalPath: "/404",
    },
  );

  return (
    <PageContainer className="pt-32 pb-20">
      <h1 className="sr-only">404 Halaman tidak ditemukan</h1>
      <div className="mx-auto max-w-3xl rounded-xl border border-border/70 bg-card/70 p-6 md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">Error 404</p>
        <p className="mb-6 text-sm text-muted-foreground">
          URL tidak ditemukan:
          {" "}
          <span className="font-medium text-foreground">{location.pathname}</span>
        </p>

        <EmptyState
          title="Halaman yang kamu cari tidak ada"
          description="Coba kembali ke beranda, buka halaman jelajah, atau gunakan pencarian untuk menemukan film dan series."
          actionLabel="Kembali ke Beranda"
          actionHref="/"
        />

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <House size={18} weight="fill" />
            Beranda
          </Link>
          <Link
            to="/browse"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <MagnifyingGlass size={18} weight="bold" />
            Jelajah Katalog
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};
