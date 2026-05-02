import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BookmarkSimple,
  CaretDown,
  FilmStrip,
  House,
  List as ListIcon,
  MagnifyingGlass,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import { getAvatar, type AvatarOption } from "@/lib/avatarStore";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { BrandLogo } from "@/components/common/BrandLogo";
import { useAuth } from "@/hooks/use-auth";
import { AVATAR_CHANGE_EVENT, LEGACY_AVATAR_CHANGE_EVENT } from "@/lib/brand";
import {
  fetchStreamxieFilterOptions,
  getStreamxiePageConfig,
  getStreamxieScopeFromPath,
  STREAMXIE_PAGES,
  type StreamxieFilterKind,
  type StreamxieFilterOption,
  type StreamxieFilterOptions,
} from "@/lib/streamxie";

type NavbarProps = {
  onOpenCommand: (trigger?: HTMLElement | null) => void;
};

const browseCategories = [
  { label: "Movies", href: "/browse?category=Movies" },
  { label: "Series", href: "/browse?category=Series" },
  { label: "Anime", href: "/browse?category=Anime" },
  { label: "Drama", href: "/browse?category=Drama" },
  { label: "Variety", href: "/browse?category=Variety" },
];

const emptyFilterOptions: StreamxieFilterOptions = {
  genres: [],
  years: [],
  countries: [],
};

const ProviderFilterDropdown = ({
  label,
  kind,
  options,
  activeSlug,
}: {
  label: string;
  kind: StreamxieFilterKind;
  options: StreamxieFilterOption[];
  activeSlug: string;
}) => {
  const hasOptions = options.length > 0;

  return (
    <NavigationMenuItem>
      <details className="group relative">
        <summary className={`flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium transition-colors ${
          activeSlug ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}>
          {label}
          <CaretDown
            size={12}
            weight="bold"
            className="transition-transform duration-200 group-open:rotate-180"
          />
          {activeSlug ? <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary" /> : null}
        </summary>
        <div className="absolute left-0 top-full z-50 mt-2 hidden w-64 overflow-hidden rounded-xl border border-border bg-card/95 py-1.5 shadow-2xl backdrop-blur-xl group-open:block">
          <div className="px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          </div>
          <div className="max-h-72 overflow-y-auto pb-1">
            {hasOptions ? (
              options.map((option) => {
                const active = activeSlug === option.slug && option.href.includes(`/${kind}/`);
                return (
                  <Link
                    key={`${kind}-${option.slug}`}
                    to={option.href}
                    className={`flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-card/80 hover:text-primary"
                    }`}
                  >
                    <span className="truncate">{option.title}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{option.count}</span>
                  </Link>
                );
              })
            ) : (
              <p className="px-4 py-2.5 text-xs text-muted-foreground">No options available.</p>
            )}
          </div>
        </div>
      </details>
    </NavigationMenuItem>
  );
};

export const Navbar = ({ onOpenCommand }: NavbarProps) => {
  const { isAnonymous } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [browseDropdownOpen, setBrowseDropdownOpen] = useState(false);
  const [avatar, setAvatarState] = useState<AvatarOption>(getAvatar());
  const [providerFilters, setProviderFilters] = useState<StreamxieFilterOptions>(emptyFilterOptions);
  const [providerFiltersLoading, setProviderFiltersLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const scope = getStreamxieScopeFromPath(location.pathname);
  const isProviderMode = scope !== "tmdb";
  const providerPage = scope !== "tmdb" ? getStreamxiePageConfig(scope) : null;
  const providerPeerPages = providerPage
    ? STREAMXIE_PAGES.filter((page) => page.key !== providerPage.key)
    : [];
  const providerNavPages = providerPage ? [providerPage, ...providerPeerPages] : [];
  const mobileProviderPages = isProviderMode && providerPage ? providerNavPages : STREAMXIE_PAGES;
  const mobileProviderActive = mobileProviderPages.some((page) => location.pathname.startsWith(page.href));

  const activeFilter = useMemo(() => {
    if (!isProviderMode) return { kind: "", slug: "" };
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length < 3) return { kind: "", slug: "" };
    return {
      kind: parts[1],
      slug: decodeURIComponent(parts[2] ?? ""),
    };
  }, [isProviderMode, location.pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 32);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setBrowseDropdownOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handler = () => setAvatarState(getAvatar());
    window.addEventListener(AVATAR_CHANGE_EVENT, handler);
    window.addEventListener(LEGACY_AVATAR_CHANGE_EVENT, handler);
    return () => {
      window.removeEventListener(AVATAR_CHANGE_EVENT, handler);
      window.removeEventListener(LEGACY_AVATAR_CHANGE_EVENT, handler);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBrowseDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    let mounted = true;

    if (!isProviderMode || !providerPage) {
      setProviderFilters(emptyFilterOptions);
      setProviderFiltersLoading(false);
      return () => {
        mounted = false;
      };
    }

    setProviderFiltersLoading(true);
    fetchStreamxieFilterOptions(providerPage.key)
      .then((options) => {
        if (mounted) setProviderFilters(options);
      })
      .catch(() => {
        if (mounted) setProviderFilters(emptyFilterOptions);
      })
      .finally(() => {
        if (mounted) setProviderFiltersLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isProviderMode, providerPage]);

  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href && !location.search;
    const [path, qs] = href.split("?");
    if (location.pathname !== path) return false;
    if (!qs) return true;
    const param = new URLSearchParams(qs);
    const locParam = new URLSearchParams(location.search);
    for (const [k, v] of param.entries()) {
      if (locParam.get(k) !== v) return false;
    }
    return true;
  };

  const isBrowseActive = location.pathname === "/browse";
  const searchHint = providerPage ? `Search ${providerPage.label}...` : "Search titles...";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${isTransparent ? "bg-transparent" : "border-b border-border/60 bg-background/95 shadow-sm backdrop-blur-md"}`}
      >
        <nav className="mx-auto flex max-w-container items-center justify-between gap-4 px-6 py-3 md:px-12 lg:gap-8">
          <Link
            to="/"
            className="shrink-0 text-foreground transition-colors hover:text-primary focus-visible:outline-none"
          >
            <BrandLogo size="sm" textClassName="hidden sm:block" />
          </Link>

          <div className="hidden flex-1 items-center justify-center lg:flex">
            <NavigationMenu>
              <NavigationMenuList className="flex items-center gap-1">
                <NavigationMenuItem>
                  <NavLink
                    to="/"
                    end
                    className={({ isActive: a }) =>
                      `relative flex h-10 items-center rounded-lg px-3.5 text-sm font-medium transition-colors ${a ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
                    }
                  >
                    {({ isActive: a }) => (
                      <>
                        Home
                        {a && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary" />}
                      </>
                    )}
                  </NavLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavLink
                    to="/my-list"
                    className={({ isActive: a }) =>
                      `relative flex h-10 items-center rounded-lg px-3.5 text-sm font-medium transition-colors ${a ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
                    }
                  >
                    {({ isActive: a }) => (
                      <>
                        My List
                        {a && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary" />}
                      </>
                    )}
                  </NavLink>
                </NavigationMenuItem>

                {isProviderMode ? (
                  <>
                    {providerPeerPages.map((page) => (
                      <NavigationMenuItem key={page.key}>
                        <NavLink
                          to={page.href}
                          className={({ isActive: a }) =>
                            `relative flex h-10 items-center rounded-lg px-3.5 text-sm font-medium transition-colors ${a ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
                          }
                        >
                          {({ isActive: a }) => (
                            <>
                              {page.label}
                              {a && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary" />}
                            </>
                          )}
                        </NavLink>
                      </NavigationMenuItem>
                    ))}
                    <ProviderFilterDropdown
                      label="Genre"
                      kind="genre"
                      options={providerFilters.genres}
                      activeSlug={activeFilter.kind === "genre" ? activeFilter.slug : ""}
                    />
                    <ProviderFilterDropdown
                      label="Year"
                      kind="year"
                      options={providerFilters.years}
                      activeSlug={activeFilter.kind === "year" ? activeFilter.slug : ""}
                    />
                    <ProviderFilterDropdown
                      label="Country"
                      kind="country"
                      options={providerFilters.countries}
                      activeSlug={activeFilter.kind === "country" ? activeFilter.slug : ""}
                    />
                  </>
                ) : (
                  <>
                    <NavigationMenuItem>
                      <div ref={dropdownRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setBrowseDropdownOpen((v) => !v)}
                          className={`relative flex h-10 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium transition-colors ${isBrowseActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          Browse
                          <CaretDown
                            size={12}
                            weight="bold"
                            className={`transition-transform duration-200 ${browseDropdownOpen ? "rotate-180" : ""}`}
                          />
                          {isBrowseActive && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary" />}
                        </button>

                        {browseDropdownOpen && (
                          <div className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-card/95 py-1.5 shadow-2xl backdrop-blur-xl">
                            <div className="px-3 py-2">
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Browse</p>
                            </div>
                            {browseCategories.map((cat) => {
                              const active = isActive(cat.href);
                              return (
                                <Link
                                  key={cat.label}
                                  to={cat.href}
                                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-card/80 hover:text-primary"}`}
                                >
                                  {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                                  {!active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-transparent" />}
                                  {cat.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </NavigationMenuItem>

                    {STREAMXIE_PAGES.map((page) => (
                      <NavigationMenuItem key={page.key}>
                        <NavLink
                          to={page.href}
                          className={({ isActive: a }) =>
                            `relative flex h-10 items-center rounded-lg px-3.5 text-sm font-medium transition-colors ${a ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
                          }
                        >
                          {({ isActive: a }) => (
                            <>
                              {page.label}
                              {a && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary" />}
                            </>
                          )}
                        </NavLink>
                      </NavigationMenuItem>
                    ))}
                  </>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <div className="mx-1 hidden h-5 w-px bg-border lg:block" />

            <button
              type="button"
              aria-label="Open search"
              onClick={(event) => onOpenCommand(event.currentTarget)}
              className="flex h-10 min-w-[180px] items-center justify-between gap-3 rounded-lg border border-border bg-card/50 px-3.5 py-2 text-sm text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/60 hover:bg-card hover:text-foreground xl:min-w-[240px]"
            >
              <span className="flex items-center gap-2">
                <MagnifyingGlass size={15} weight="bold" />
                <span className="text-xs">{searchHint}</span>
              </span>
              <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground xl:block">⌘K</kbd>
            </button>

            {isAnonymous ? (
              <Link
                to="/login"
                className="flex h-10 items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-3 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
              >
                Sign in
              </Link>
            ) : (
              <button
                type="button"
                aria-label="Go to profile"
                onClick={() => navigate("/profile")}
                className="h-10 w-10 overflow-hidden rounded-full bg-card ring-1 ring-border transition-all hover:scale-110 hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:ring-offset-background"
                title={`Profile — ${avatar.label} avatar`}
              >
                <img
                  src={avatar.image}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ objectPosition: avatar.objectPosition }}
                />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              aria-label="Search"
              onClick={(event) => onOpenCommand(event.currentTarget)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/60 text-foreground backdrop-blur-sm"
            >
              <MagnifyingGlass size={17} weight="bold" />
            </button>
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/60 text-foreground backdrop-blur-sm"
            >
              {mobileMenuOpen ? <X size={17} weight="bold" /> : <ListIcon size={17} weight="bold" />}
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="border-t border-border bg-background/98 backdrop-blur-md md:hidden">
            <div className="space-y-0.5 px-4 py-4">
              <NavLink
                to="/"
                end
                className={({ isActive: a }) =>
                  `flex min-h-[44px] items-center rounded-lg px-4 py-2.5 text-sm transition-colors ${a ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-card hover:text-primary"}`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/my-list"
                className={({ isActive: a }) =>
                  `flex min-h-[44px] items-center rounded-lg px-4 py-2.5 text-sm transition-colors ${a ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-card hover:text-primary"}`
                }
              >
                My List
              </NavLink>

              {isProviderMode && providerPage ? (
                <>
                  <details className="group rounded-lg border border-border bg-card/50" open={mobileProviderActive}>
                    <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between px-4 py-2.5 text-sm text-foreground">
                      <span className="font-medium">Providers</span>
                      <CaretDown size={13} weight="bold" className="transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-border px-2 py-2">
                      {mobileProviderPages.map((page) => (
                        <NavLink
                          key={page.key}
                          to={page.href}
                          end
                          className={({ isActive: a }) =>
                            `flex min-h-[40px] items-center rounded-md px-3 py-2 text-sm transition-colors ${a ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-background hover:text-primary"}`
                          }
                        >
                          {page.label}
                        </NavLink>
                      ))}
                    </div>
                  </details>
                  {(["genre", "year", "country"] as StreamxieFilterKind[]).map((kind) => {
                    const rows = kind === "genre"
                      ? providerFilters.genres
                      : kind === "year"
                        ? providerFilters.years
                        : providerFilters.countries;

                    return (
                      <details key={kind} className="group rounded-lg border border-border bg-card/50">
                        <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between px-4 py-2.5 text-sm text-foreground">
                          <span className="capitalize">{kind}</span>
                          <CaretDown size={13} weight="bold" className="transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="max-h-56 overflow-y-auto border-t border-border px-2 py-2">
                          {rows.map((option) => (
                            <Link
                              key={`${kind}-${option.slug}`}
                              to={option.href}
                              className={`flex min-h-[40px] items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                                activeFilter.kind === kind && activeFilter.slug === option.slug
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground hover:bg-background hover:text-primary"
                              }`}
                            >
                              <span className="truncate">{option.title}</span>
                              <span className="text-[11px] text-muted-foreground">{option.count}</span>
                            </Link>
                          ))}
                          {rows.length === 0 ? (
                            <p className="px-3 py-2 text-xs text-muted-foreground">
                              {providerFiltersLoading ? "Loading..." : "No options available."}
                            </p>
                          ) : null}
                        </div>
                      </details>
                    );
                  })}
                </>
              ) : (
                <>
                  <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Browse</p>
                  {browseCategories.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <NavLink
                        key={item.label}
                        to={item.href}
                        className={`flex min-h-[44px] items-center rounded-lg px-4 py-2.5 text-sm transition-colors ${active ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-card hover:text-primary"}`}
                      >
                        {item.label}
                      </NavLink>
                    );
                  })}

                  <details className="group rounded-lg border border-border bg-card/50" open={mobileProviderActive}>
                    <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between px-4 py-2.5 text-sm text-foreground">
                      <span className="font-medium">Providers</span>
                      <CaretDown size={13} weight="bold" className="transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-border px-2 py-2">
                      {mobileProviderPages.map((page) => (
                        <NavLink
                          key={page.key}
                          to={page.href}
                          end
                          className={({ isActive: a }) =>
                            `flex min-h-[40px] items-center rounded-md px-3 py-2 text-sm transition-colors ${a ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-background hover:text-primary"}`
                          }
                        >
                          {page.label}
                        </NavLink>
                      ))}
                    </div>
                  </details>
                </>
              )}

              <div className="mx-0 my-2 border-t border-border" />
              {isAnonymous ? (
                <Link
                  to="/login"
                  className="flex min-h-[44px] items-center gap-2.5 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary"
                >
                  <UserCircle size={17} weight="duotone" />
                  Sign in
                </Link>
              ) : (
                <NavLink
                  to="/profile"
                  className={({ isActive: a }) =>
                    `flex min-h-[44px] items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm transition-colors ${a ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-card hover:text-primary"}`
                  }
                >
                  <span className="h-6 w-6 overflow-hidden rounded-full bg-card ring-1 ring-border">
                    <img
                      src={avatar.image}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ objectPosition: avatar.objectPosition }}
                    />
                  </span>
                  Profile
                </NavLink>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export const MobileNavMenu = () => {
  const location = useLocation();
  const scope = getStreamxieScopeFromPath(location.pathname);
  const searchHref = scope === "tmdb" ? "/search" : `/search?scope=${scope}`;

  const items = [
    { label: "Home", href: "/", icon: House },
    { label: "Browse", href: "/browse", icon: FilmStrip },
    { label: "Search", href: searchHref, icon: MagnifyingGlass },
    { label: "My List", href: "/my-list", icon: BookmarkSimple },
    { label: "Profile", href: "/profile", icon: UserCircle },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex min-h-[60px] flex-col items-center justify-center gap-1 px-2 py-3 text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              aria-label={item.label}
            >
              <Icon size={22} weight={active ? "fill" : "regular"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export const SearchInlineInput = () => null;
