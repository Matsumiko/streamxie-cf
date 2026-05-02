import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TwitterLogo, InstagramLogo, GithubLogo } from "@phosphor-icons/react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { Navbar, MobileNavMenu } from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { Toaster } from "@/components/ui/Toaster-provider";

type AppLayoutProps = {
  children: ReactNode;
  onOpenCommand: () => void;
};

export const AppLayout = ({ children, onOpenCommand }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-foreground"
      >
        Skip to content
      </a>
      <Navbar onOpenCommand={onOpenCommand} />
      <motion.main
        id="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="flex-1 pb-20 md:pb-8"
      >
        {children}
      </motion.main>

      {/* Kaki halaman */}
      <footer className="border-t border-border bg-card/50">
        <PageContainer className="py-12">
          <div className="grid gap-10 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr_1fr_1fr]">
            {/* Merek */}
            <div className="space-y-4">
              <Link to="/" className="inline-flex text-foreground hover:text-primary">
                <BrandLogo size="sm" textClassName="text-lg" />
              </Link>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Movies, anime, drama, variety — one cinematic platform. Dark by default, seamless by design.
              </p>
              <div className="flex gap-3">
                {[
                  { Icon: TwitterLogo, label: "Twitter" },
                  { Icon: InstagramLogo, label: "Instagram" },
                  { Icon: GithubLogo, label: "GitHub" },
                ].map(({ Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    aria-label={label}
                    title={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Icon size={16} weight="bold" />
                  </button>
                ))}
              </div>
            </div>

            {/* Jelajah */}
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-foreground">Browse</p>
              <ul className="space-y-2.5">
                {["Movies", "Series", "Anime", "Drama", "Variety"].map((cat) => (
                  <li key={cat}>
                    <Link to={`/browse?category=${cat}`} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Akun */}
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-foreground">Account</p>
              <ul className="space-y-2.5">
                {[
                  { label: "My List", href: "/my-list" },
                  { label: "Search", href: "/search" },
                  { label: "Profile", href: "/profile" },
                  { label: "Sign In", href: "/login" },
                  { label: "Create Account", href: "/register" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Informasi legal */}
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-foreground">Legal</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Use", href: "/terms" },
                  { label: "Cookie Settings", href: "/cookies" },
                  { label: "Streaming Tips", href: "/streaming-tips" },
                  { label: "About", href: "/about" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              © 2026 streamXie. Built for fast catalog discovery and account-synced watch continuity.
            </p>
            <p className="text-xs text-muted-foreground">
              Metadata is sourced from TMDB and selected providers through secured server-side proxies.
            </p>
          </div>
        </PageContainer>
      </footer>

      <MobileNavMenu />
      <Toaster />
    </div>
  );
};
