import type {
  CastMember,
  ContentItem,
  Episode,
  Season,
  TmdbCollectionSummary,
  TmdbDetailFact,
  TmdbMediaAsset,
} from "@/types/content";

export const STREAM_PROVIDERS = ["xie-1", "kacain-1", "kacain-3", "kacain-4"] as const;

export type StreamProvider = (typeof STREAM_PROVIDERS)[number];
type CatalogProvider = StreamProvider | "tmdb";
const KACAIN_PROVIDERS = new Set<StreamProvider>(["kacain-1", "kacain-3", "kacain-4"]);
export type StreamxiePageKey = "streamxie1" | "streamxie2" | "streamxie3";
export type StreamSearchScope = "tmdb" | StreamxiePageKey;
export type StreamxieFilterKind = "genre" | "year" | "country";

export type StreamHomeSection = {
  id: string;
  provider?: CatalogProvider;
  slug?: string;
  viewAllHref?: string;
  title: string;
  subtitle: string;
  items: ContentItem[];
};

export type StreamSectionRoute = {
  slug: string;
  title: string;
  subtitle: string;
  href: string;
};

export type StreamSectionPage = StreamSectionRoute & {
  page: number;
  totalPages: number;
  items: ContentItem[];
};

export type TmdbBrowseScope = "all" | "movie" | "tv";

export type TmdbBrowsePage = {
  page: number;
  totalPages: number;
  totalResults: number;
  items: ContentItem[];
};

export type TmdbBrowseFilters = {
  genreId?: number;
  year?: number;
  language?: string;
  status?: "All" | "Released" | "Upcoming";
};

export type TmdbBrowseFacet = {
  value: string;
  label: string;
};

export type TmdbBrowseFacets = {
  genres: TmdbBrowseFacet[];
  languages: TmdbBrowseFacet[];
};

export type StreamPlaybackSource = {
  server: string;
  url: string;
  type?: string;
  active?: boolean;
  noAds?: boolean;
  provider?: StreamProvider;
};

export type StreamPlayback = {
  embedUrl: string | null;
  sources: StreamPlaybackSource[];
  downloadUrl?: string;
};

type EndpointQuery = Record<string, string | number | undefined>;

type TmdbEndpointPlan = {
  slug: string;
  path: string;
  title: string;
  subtitle: string;
  mediaType?: "movie" | "tv";
  query?: EndpointQuery;
};

type StreamxieSectionPlan = {
  slug: string;
  title: string;
  subtitle: string;
  path: string;
  query?: EndpointQuery;
};

export type StreamxiePageConfig = {
  key: StreamxiePageKey;
  label: string;
  href: string;
  provider: StreamProvider;
  subtitle: string;
  sections: StreamxieSectionPlan[];
};

export type StreamxieFilterOption = {
  title: string;
  slug: string;
  count: number;
  href: string;
  apiPath?: string;
};

export type StreamxieFilterOptions = {
  genres: StreamxieFilterOption[];
  years: StreamxieFilterOption[];
  countries: StreamxieFilterOption[];
};

export type StreamxieCollectionPage = {
  scope: StreamxiePageKey;
  kind: "section" | StreamxieFilterKind;
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  page: number;
  totalPages: number;
  hasMore: boolean;
  items: ContentItem[];
};

export const PROVIDER_LABELS: Record<StreamProvider, string> = {
  "xie-1": "streamxie-s1",
  "kacain-1": "streamxie-s2",
  "kacain-3": "streamxie-s3",
  "kacain-4": "streamxie-s4",
};

const CATALOG_PROVIDER_LABELS: Record<CatalogProvider, string> = {
  ...PROVIDER_LABELS,
  tmdb: "TMDB",
};

export const getStreamProviderLabel = (provider?: string) =>
  provider && provider in CATALOG_PROVIDER_LABELS
    ? CATALOG_PROVIDER_LABELS[provider as CatalogProvider]
    : "Provider";

const STREAMXIE_PAGE_CONFIGS: Record<StreamxiePageKey, StreamxiePageConfig> = {
  streamxie1: {
    key: "streamxie1",
    label: "streamxie1",
    href: "/streamxie1",
    provider: "kacain-1",
    subtitle: "Provider feed optimized for top rated drops, episode updates, and latest releases.",
    sections: [
      {
        slug: "top-rated",
        title: "Top Rated",
        subtitle: "Highest rated picks from streamxie1.",
        path: "kacain-1/top-rated",
      },
      {
        slug: "episode-terbaru",
        title: "Episode Terbaru",
        subtitle: "Newest episode updates from streamxie1.",
        path: "kacain-1/episode-terbaru",
      },
      {
        slug: "latest",
        title: "Latest",
        subtitle: "Latest catalog updates from streamxie1.",
        path: "kacain-1/latest",
      },
    ],
  },
  streamxie2: {
    key: "streamxie2",
    label: "streamxie2",
    href: "/streamxie2",
    provider: "kacain-3",
    subtitle: "Provider feed focused on latest drops, movies, series, and Japanese drama.",
    sections: [
      {
        slug: "latest",
        title: "Latest",
        subtitle: "Latest catalog updates from streamxie2.",
        path: "kacain-3/latest",
      },
      {
        slug: "movies",
        title: "Movies",
        subtitle: "Movies feed from streamxie2.",
        path: "kacain-3/movies",
        query: { limit: 24 },
      },
      {
        slug: "series",
        title: "Series",
        subtitle: "Series feed from streamxie2.",
        path: "kacain-3/series-rest",
        query: { limit: 24 },
      },
      {
        slug: "drama-japan",
        title: "Drama Japan",
        subtitle: "Japanese drama collection from streamxie2.",
        path: "kacain-3/drama-japan",
      },
    ],
  },
  streamxie3: {
    key: "streamxie3",
    label: "streamxie3",
    href: "/streamxie3",
    provider: "kacain-4",
    subtitle: "Provider feed with mixed and category-focused discovery lanes.",
    sections: [
      {
        slug: "latest",
        title: "Latest",
        subtitle: "Latest catalog updates from streamxie3.",
        path: "kacain-4/latest",
      },
      {
        slug: "box-office",
        title: "Box Office",
        subtitle: "Box office lane from streamxie3.",
        path: "kacain-4/box-office",
      },
      {
        slug: "mixed",
        title: "Mixed",
        subtitle: "Mixed lane from streamxie3.",
        path: "kacain-4/mixed",
      },
      {
        slug: "rebahin",
        title: "Rebahin",
        subtitle: "Rebahin lane from streamxie3.",
        path: "kacain-4/rebahin",
      },
      {
        slug: "dunia21",
        title: "Dunia21",
        subtitle: "Dunia21 lane from streamxie3.",
        path: "kacain-4/dunia21",
      },
      {
        slug: "movies",
        title: "Movies",
        subtitle: "Movies feed from streamxie3.",
        path: "kacain-4/movies",
        query: { limit: 24 },
      },
      {
        slug: "tv-series",
        title: "TV Series Terbaru",
        subtitle: "Latest TV series lane from streamxie3.",
        path: "kacain-4/tv-series",
      },
      {
        slug: "series",
        title: "Series",
        subtitle: "Series feed from streamxie3.",
        path: "kacain-4/series",
        query: { limit: 24 },
      },
      {
        slug: "animation",
        title: "Animation",
        subtitle: "Animation lane from streamxie3.",
        path: "kacain-4/animation",
      },
      {
        slug: "bintang-kelas",
        title: "Bintang Kelas",
        subtitle: "Bintang Kelas lane from streamxie3.",
        path: "kacain-4/bintang-kelas",
      },
    ],
  },
};

export const STREAMXIE_PAGES: StreamxiePageConfig[] = [
  STREAMXIE_PAGE_CONFIGS.streamxie1,
  STREAMXIE_PAGE_CONFIGS.streamxie2,
  STREAMXIE_PAGE_CONFIGS.streamxie3,
];

export const getStreamxiePageConfig = (value?: string | null): StreamxiePageConfig | null => {
  if (!value) return null;
  if (value in STREAMXIE_PAGE_CONFIGS) return STREAMXIE_PAGE_CONFIGS[value as StreamxiePageKey];
  return null;
};

export const getStreamxieScopeFromPath = (pathname: string): StreamSearchScope => {
  if (pathname.startsWith("/streamxie1")) return "streamxie1";
  if (pathname.startsWith("/streamxie2")) return "streamxie2";
  if (pathname.startsWith("/streamxie3")) return "streamxie3";
  return "tmdb";
};

export const getStreamSearchScopeLabel = (scope: StreamSearchScope) => {
  if (scope === "streamxie1") return "streamxie1";
  if (scope === "streamxie2") return "streamxie2";
  if (scope === "streamxie3") return "streamxie3";
  return "tmdb";
};

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const STREAMXIE_UPSTREAM_HOST = "api.streamxie.indevs.in";
const MAX_SEASONS_TO_LOAD = 3;
const TMDB_MOVIE_DETAIL_APPEND = "videos,credits,images,recommendations,similar,keywords,external_ids,release_dates";
const TMDB_TV_DETAIL_APPEND = "videos,credits,images,recommendations,similar,keywords,external_ids,content_ratings";

const TMDB_HOME_ENDPOINTS: TmdbEndpointPlan[] = [
  {
    slug: "trending-today",
    path: "trending/all/day",
    title: "Trending Today",
    subtitle: "Daily TMDB titles moving fastest right now.",
  },
  {
    slug: "trending-this-week",
    path: "trending/all/week",
    title: "Trending This Week",
    subtitle: "TMDB titles getting the most attention this week.",
  },
  {
    slug: "trending-movies",
    path: "trending/movie/week",
    title: "Trending Movies",
    subtitle: "Movie momentum from TMDB trend signals.",
    mediaType: "movie",
  },
  {
    slug: "trending-series",
    path: "trending/tv/week",
    title: "Trending Series",
    subtitle: "Series viewers are watching and discussing this week.",
    mediaType: "tv",
  },
  {
    slug: "popular-movies",
    path: "movie/popular",
    title: "Popular Movies",
    subtitle: "Widely watched movies from TMDB.",
    mediaType: "movie",
    query: { page: 1 },
  },
  {
    slug: "popular-series",
    path: "tv/popular",
    title: "Popular Series",
    subtitle: "Popular TV catalog from TMDB.",
    mediaType: "tv",
    query: { page: 1 },
  },
  {
    slug: "top-rated-movies",
    path: "movie/top_rated",
    title: "Top Rated Movies",
    subtitle: "Highly rated movies from TMDB voters.",
    mediaType: "movie",
    query: { page: 1 },
  },
  {
    slug: "top-rated-series",
    path: "tv/top_rated",
    title: "Top Rated Series",
    subtitle: "Highly rated series from TMDB voters.",
    mediaType: "tv",
    query: { page: 1 },
  },
  {
    slug: "now-playing",
    path: "movie/now_playing",
    title: "Now Playing",
    subtitle: "Current movie releases tracked by TMDB.",
    mediaType: "movie",
    query: { page: 1 },
  },
  {
    slug: "upcoming-movies",
    path: "movie/upcoming",
    title: "Upcoming Movies",
    subtitle: "Upcoming releases from TMDB.",
    mediaType: "movie",
    query: { page: 1 },
  },
  {
    slug: "airing-today",
    path: "tv/airing_today",
    title: "Airing Today",
    subtitle: "Series with episodes airing today.",
    mediaType: "tv",
    query: { page: 1 },
  },
  {
    slug: "on-the-air",
    path: "tv/on_the_air",
    title: "On The Air",
    subtitle: "Series currently in active release windows.",
    mediaType: "tv",
    query: { page: 1 },
  },
  {
    slug: "action-movies",
    path: "discover/movie",
    title: "Action Movies",
    subtitle: "Action picks discovered through TMDB genre filters.",
    mediaType: "movie",
    query: { with_genres: 28, page: 1 },
  },
  {
    slug: "comedy-movies",
    path: "discover/movie",
    title: "Comedy Movies",
    subtitle: "Comedy picks discovered through TMDB genre filters.",
    mediaType: "movie",
    query: { with_genres: 35, page: 1 },
  },
  {
    slug: "netflix-series",
    path: "discover/tv",
    title: "Netflix Series",
    subtitle: "TV titles discovered through TMDB network metadata.",
    mediaType: "tv",
    query: { with_networks: 213, page: 1 },
  },
];

const FALLBACK_TMDB_GENRES: Record<number, string> = {
  12: "Adventure",
  14: "Fantasy",
  16: "Animation",
  18: "Drama",
  27: "Horror",
  28: "Action",
  35: "Comedy",
  36: "History",
  37: "Western",
  53: "Thriller",
  80: "Crime",
  99: "Documentary",
  878: "Science Fiction",
  9648: "Mystery",
  10749: "Romance",
  10751: "Family",
  10752: "War",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  10402: "Music",
  10770: "TV Movie",
};

const isStreamProvider = (value: string): value is StreamProvider =>
  STREAM_PROVIDERS.includes(value as StreamProvider);

const isCatalogProvider = (value: string): value is CatalogProvider =>
  value === "tmdb" || isStreamProvider(value);

const isKacainProvider = (provider: StreamProvider) => KACAIN_PROVIDERS.has(provider);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const fallbackAt = (index: number): ContentItem => ({
  id: `live-fallback-${index}`,
  slug: `live-fallback-${index}`,
  title: "Untitled",
  description: "",
  longDescription: "",
  type: "movie",
  category: "Movies",
  genres: [],
  rating: "0.0",
  year: 0,
  duration: "",
  country: "",
  status: "",
  heroImage: "",
  posterImage: "",
  backdropImage: "",
  heroAlt: "",
  posterAlt: "",
  tags: [],
  cast: [],
});

const normalizeText = (value: unknown, fallback = "") => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};

const cleanTitle = (value: unknown, fallback: string) =>
  normalizeText(value, fallback)
    .replace(/^Permalink\s+(?:ke|to):?\s*/i, "")
    .replace(/^Nonton\s+/i, "")
    .replace(/\s+Sub(?:title)?\s+Indo(?:nesia)?/i, "")
    .replace(/\s+di\s+Lk21$/i, "")
    .replace(/\s+-\s+Nonton.+$/i, "")
    .trim() || fallback;

const numberFrom = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/[^\d.]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const yearFrom = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const match = value.match(/\b(19|20)\d{2}\b/);
    if (match) return Number(match[0]);
  }
  return fallback;
};

const firstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
};

const safeImage = (value: unknown, fallback: string) => {
  const src = normalizeText(value);
  if (src.startsWith("https://")) {
    try {
      const url = new URL(src);
      if (url.hostname === STREAMXIE_UPSTREAM_HOST && url.pathname.startsWith("/api/")) {
        return `/api/xie/${url.pathname.replace(/^\/api\//, "")}${url.search}`;
      }
    } catch {
      return fallback;
    }

    return src;
  }
  if (src.startsWith("/api/")) return `/api/xie/${src.replace(/^\/api\//, "")}`;
  if (src.startsWith("/")) return src;
  return fallback;
};

const toEmbeddableTrailerUrl = (value: unknown, fallback = "") => {
  const raw = normalizeText(value);
  if (!raw) return normalizeText(fallback);

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();

    if (host.includes("youtube.com")) {
      if (url.pathname.startsWith("/embed/")) return url.toString();
      const key = url.searchParams.get("v");
      if (key) return `https://www.youtube.com/embed/${key}`;
    }

    if (host === "youtu.be") {
      const key = url.pathname.replace(/^\/+/, "");
      if (key) return `https://www.youtube.com/embed/${key}`;
    }

    if (host.includes("vimeo.com")) {
      const segments = url.pathname.split("/").filter(Boolean);
      const key = segments.length > 0 ? segments[segments.length - 1] : "";
      if (key) return `https://player.vimeo.com/video/${key}`;
    }

    return url.toString();
  } catch {
    const youtubeMatch = raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/i);
    if (youtubeMatch?.[1]) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    return normalizeText(fallback);
  }
};

const tmdbImage = (value: unknown, size: string, fallback: string) => {
  const src = normalizeText(value);
  if (src.startsWith("https://")) return src;
  if (src.startsWith("/")) return `${TMDB_IMAGE_BASE}/${size}${src}`;
  return fallback;
};

const stringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string") return entry;
        if (isRecord(entry) && "title" in entry) return String(entry.title);
        if (isRecord(entry) && "name" in entry) return String(entry.name);
        return "";
      })
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
};

const providerRouteType = (rawType: string) => {
  const value = rawType.toLowerCase();
  if (value === "tv") return "tv";
  if (value.includes("episode")) return "episode";
  if (value.includes("series")) return "series";
  if (value.includes("movie")) return "movie";
  return value || "movie";
};

const contentTypeFor = (rawType: string) => {
  const type = rawType.toLowerCase();
  return type.includes("series") || type.includes("episode") || type === "tv" ? "series" : "movie";
};

const routeId = (provider: CatalogProvider, type: string, key: string | number) =>
  `${provider}--${providerRouteType(type)}--${encodeURIComponent(String(key))}`;

export const parseStreamRouteId = (value: string | undefined | null) => {
  if (!value) return null;
  const [provider, type, ...rest] = value.split("--");
  if (!provider || !type || rest.length === 0 || !isCatalogProvider(provider)) return null;

  return {
    provider,
    type,
    key: decodeURIComponent(rest.join("--")),
  };
};

const endpointToProxyPath = (endpoint: unknown) => {
  const value = normalizeText(endpoint);
  if (!value) return "";
  try {
    const url = value.startsWith("http") ? new URL(value) : new URL(value, "https://streamxie.invalid");
    return `${url.pathname.replace(/^\/api\//, "")}${url.search}`;
  } catch {
    return value.replace(/^\/?api\//, "").replace(/^\//, "");
  }
};

const PROVIDER_REQUEST_TIMEOUT_MS = 8_000;
const TMDB_REQUEST_TIMEOUT_MS = 15_000;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const fetchSameOriginJson = async (basePath: "/api/xie" | "/api/tmdb", proxyPath: string, query?: EndpointQuery) => {
  const normalizedPath = proxyPath.replace(/^\/+/, "");
  const url = new URL(normalizedPath ? `${basePath}/${normalizedPath}` : basePath, window.location.origin);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });

  const timeoutMs = basePath === "/api/xie" ? PROVIDER_REQUEST_TIMEOUT_MS : TMDB_REQUEST_TIMEOUT_MS;
  const maxAttempts = basePath === "/api/tmdb" ? 2 : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          accept: "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const httpError = new Error(`streamXie API request failed with ${response.status}`) as Error & { status?: number };
        httpError.status = response.status;
        throw httpError;
      }

      return response.json();
    } catch (error) {
      const status = typeof (error as { status?: unknown })?.status === "number"
        ? Number((error as { status: number }).status)
        : 0;
      const aborted = error instanceof DOMException && error.name === "AbortError";
      const transientHttp = status >= 500 || status === 429;
      const transientNetwork = status === 0 || aborted;
      const shouldRetry = basePath === "/api/tmdb" && attempt < maxAttempts && (transientHttp || transientNetwork);

      if (!shouldRetry) {
        if (aborted) throw new Error(`streamXie API request timed out after ${timeoutMs}ms`);
        throw error;
      }

      await wait(250 * attempt);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  throw new Error("streamXie API request failed after retry attempts");
};

const fetchProviderJson = (proxyPath: string, query?: EndpointQuery) =>
  fetchSameOriginJson("/api/xie", proxyPath, query);

const fetchTmdbJson = (proxyPath: string, query?: EndpointQuery) =>
  fetchSameOriginJson("/api/tmdb", proxyPath, query);

const payloadData = (response: unknown) => {
  if (!isRecord(response)) return response;
  return response.data ?? response;
};

const buildDetailEndpoint = (provider: StreamProvider, type: string, key: string | number) => {
  const routeType = providerRouteType(type);
  if (provider === "xie-1") return `/api/xie-1`;
  return `/api/${provider}/detail/${routeType || "movie"}/${key}`;
};

const buildStreamEndpoint = (provider: StreamProvider, type: string, key: string | number) => {
  const routeType = providerRouteType(type);
  if (provider === "xie-1") return `/api/xie-1/watch/${routeType === "series" ? "tv" : routeType}/${key}`;
  return `/api/${provider}/streams/${routeType || "movie"}/${key}`;
};

const categoryFor = (provider: StreamProvider, rawType: string) => {
  const type = contentTypeFor(rawType);
  if (type === "series") return isKacainProvider(provider) ? "Drama" : "Series";
  return "Movies";
};

const peopleToCast = (rawPeople: unknown, fallback: ContentItem): CastMember[] => {
  const people = stringArray(rawPeople).slice(0, 8);
  if (people.length === 0) return fallback.cast;

  return people.map((name, index) => ({
    name,
    role: index === 0 ? "Cast" : "Supporting Cast",
    image: "",
  }));
};

const tmdbPeopleToCast = (rawPeople: unknown, fallback: ContentItem): CastMember[] => {
  if (!Array.isArray(rawPeople)) return fallback.cast;

  const cast = rawPeople
    .filter(isRecord)
    .slice(0, 12)
    .map((person, index) => ({
      name: firstString(person.name, person.original_name, `Cast ${index + 1}`),
      role: firstString(person.character, person.job, "Cast"),
      image: tmdbImage(person.profile_path, "w185", ""),
    }));

  return cast.length > 0 ? cast : fallback.cast;
};

const tmdbCrewToCast = (rawPeople: unknown): CastMember[] => {
  if (!Array.isArray(rawPeople)) return [];

  const priorityJobs = new Set([
    "Director",
    "Writer",
    "Screenplay",
    "Story",
    "Creator",
    "Executive Producer",
    "Producer",
    "Original Music Composer",
    "Director of Photography",
  ]);

  return rawPeople
    .filter(isRecord)
    .filter((person) => priorityJobs.has(firstString(person.job)))
    .slice(0, 10)
    .map((person, index) => ({
      name: firstString(person.name, person.original_name, `Crew ${index + 1}`),
      role: firstString(person.job, person.department, "Crew"),
      image: tmdbImage(person.profile_path, "w185", ""),
    }));
};

const normalizeEpisodes = (raw: Record<string, unknown>, fallback: ContentItem): Season[] | undefined => {
  const rawEpisodes = Array.isArray(raw.episodes) ? raw.episodes : [];
  if (rawEpisodes.length === 0) return undefined;

  const episodes: Episode[] = rawEpisodes
    .filter(isRecord)
    .map((episode, index) => ({
      id: firstString(episode.id, episode.slug, `episode-${index + 1}`),
      title: cleanTitle(firstString(episode.title, episode.name), `Episode ${index + 1}`),
      duration: normalizeText(episode.duration, "Episode"),
      synopsis: normalizeText(episode.synopsis, normalizeText(episode.description, "Episode detail is available from the provider.")),
      thumbnail: safeImage(firstString(episode.thumbnail, episode.thumb, episode.poster), fallback.backdropImage),
      streamEndpoint: firstString(episode.stream_endpoint, episode.watch_endpoint),
    }));

  return episodes.length > 0
    ? [
        {
          id: `${fallback.id}-season-1`,
          name: "Season 1",
          episodes,
        },
      ]
    : undefined;
};

export const normalizeProviderItem = (
  rawValue: unknown,
  provider: StreamProvider,
  index = 0,
): ContentItem | null => {
  if (!isRecord(rawValue)) return null;
  const raw = rawValue;
  const fallback = fallbackAt(index);
  const nestedType = normalizeText(raw.type, normalizeText(raw.type_label, "movie"));
  const contentType = contentTypeFor(nestedType);
  const routeType = providerRouteType(nestedType);
  const providerKey = firstString(raw.id, raw.slug, raw.tmdb_id, raw.imdb_id, raw.title, raw.name);

  if (!providerKey) return null;

  const title = cleanTitle(
    firstString(raw.title_clean, raw.title, raw.title_full, raw.original_title, raw.name),
    fallback.title,
  );
  const description = normalizeText(
    firstString(raw.overview, raw.synopsis, raw.description, raw.tagline),
    fallback.description,
  );
  const posterSource = provider === "kacain-1"
    ? firstString(raw.thumb, raw.thumbnail, raw.backdrop, raw.backdrop_path, raw.poster_path)
    : firstString(raw.poster, raw.thumb, raw.poster_path);
  const backdropSource = provider === "kacain-1"
    ? firstString(raw.thumb, raw.backdrop, raw.backdrop_path, raw.thumbnail)
    : firstString(raw.backdrop, raw.backdrop_path, raw.thumb, raw.poster);
  const poster = safeImage(posterSource, fallback.posterImage);
  const backdrop = safeImage(backdropSource, fallback.backdropImage);
  const genres = stringArray(raw.genres).length > 0 ? stringArray(raw.genres) : stringArray(raw.genre);
  const year = yearFrom(firstString(raw.year, raw.release_date, raw.release), fallback.year);
  const detailEndpoint = firstString(raw.detail_endpoint, buildDetailEndpoint(provider, routeType, providerKey));
  const streamEndpoint = firstString(
    raw.stream_endpoint,
    raw.watch_endpoint,
    buildStreamEndpoint(provider, routeType, providerKey),
  );
  const info = isRecord(raw.info) ? raw.info : {};
  const country = firstString(raw.country, info.Country, info.Negara, fallback.country);
  const duration = firstString(raw.duration, raw.runtime ? `${raw.runtime} min` : "", fallback.duration);

  return {
    id: routeId(provider, routeType, providerKey),
    slug: routeId(provider, routeType, providerKey),
    title,
    description,
    longDescription: normalizeText(firstString(raw.description, raw.synopsis, raw.overview), description),
    type: contentType,
    category: categoryFor(provider, nestedType),
    genres: genres.length > 0 ? genres.slice(0, 4) : fallback.genres,
    rating: String(numberFrom(firstString(raw.rating, raw.rating_score), Number(fallback.rating) || 0) || fallback.rating),
    year,
    duration,
    country,
    status: normalizeText(firstString(raw.status, raw.quality), fallback.status),
    heroImage: backdrop,
    posterImage: poster,
    backdropImage: backdrop,
    heroAlt: `${title} backdrop`,
    posterAlt: `${title} poster`,
    tags: [
      PROVIDER_LABELS[provider],
      normalizeText(firstString(raw.quality, raw.type_label, raw.type), contentType === "series" ? "Series" : "Movie"),
      year ? String(year) : "",
    ].filter(Boolean),
    featured: index < 6,
    cast: peopleToCast(raw.actors ?? raw.cast ?? info.Cast ?? info["Bintang Film"], fallback),
    seasons: normalizeEpisodes(raw, fallback),
    trailerUrl: toEmbeddableTrailerUrl(firstString(raw.trailer), fallback.trailerUrl),
    provider,
    providerType: routeType,
    providerSlug: String(providerKey),
    detailEndpoint,
    streamEndpoint,
    watchEndpoint: firstString(raw.watch_endpoint),
    sourceUrl: firstString(raw.url, raw.link),
  };
};

const extractGenreRows = (response: unknown) => {
  const data = payloadData(response);
  const rows: unknown[] = [];

  if (Array.isArray(data)) rows.push(...data);
  if (isRecord(data)) {
    if (Array.isArray(data.genres)) rows.push(...data.genres);
    if (Array.isArray(data.results)) rows.push(...data.results);
    Object.values(data).forEach((value) => {
      if (Array.isArray(value) && value.some((entry) => isRecord(entry) && "id" in entry && "name" in entry)) {
        rows.push(...value);
      }
    });
  }

  return rows.filter(isRecord);
};

const extractLanguageRows = (response: unknown) => {
  const data = payloadData(response);
  if (Array.isArray(data)) return data.filter(isRecord);
  if (isRecord(data) && Array.isArray(data.results)) return data.results.filter(isRecord);
  return [] as Record<string, unknown>[];
};

const fetchTmdbGenreMap = async () => {
  const map = new Map<number, string>(
    Object.entries(FALLBACK_TMDB_GENRES).map(([id, name]) => [Number(id), name]),
  );

  const responses = await Promise.allSettled([
    fetchTmdbJson("genre/movie/list"),
    fetchTmdbJson("genre/tv/list"),
  ]);

  responses.forEach((result) => {
    if (result.status !== "fulfilled") return;
    extractGenreRows(result.value).forEach((entry) => {
      const id = numberFrom(entry.id, 0);
      const name = firstString(entry.name);
      if (id && name) map.set(id, name);
    });
  });

  return map;
};

let tmdbBrowseFacetsCache: TmdbBrowseFacets | null = null;
let tmdbBrowseFacetsPending: Promise<TmdbBrowseFacets> | null = null;

export const fetchTmdbBrowseFacets = async (): Promise<TmdbBrowseFacets> => {
  if (tmdbBrowseFacetsCache) return tmdbBrowseFacetsCache;
  if (tmdbBrowseFacetsPending) return tmdbBrowseFacetsPending;

  tmdbBrowseFacetsPending = Promise.allSettled([
    fetchTmdbGenreMap(),
    fetchTmdbJson("configuration/languages"),
  ])
    .then((results) => {
      const genreMap = results[0].status === "fulfilled"
        ? results[0].value
        : new Map<number, string>(Object.entries(FALLBACK_TMDB_GENRES).map(([id, name]) => [Number(id), name]));

      const genres: TmdbBrowseFacet[] = Array.from(genreMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([id, name]) => ({
          value: String(id),
          label: name,
        }));

      const languages: TmdbBrowseFacet[] = results[1].status === "fulfilled"
        ? extractLanguageRows(results[1].value)
          .map((entry) => {
            const code = firstString(entry.iso_639_1).toLowerCase();
            if (!code || code.length !== 2) return null;
            const localName = firstString(entry.name);
            const englishName = firstString(entry.english_name);
            const name = localName || englishName || code.toUpperCase();
            return {
              value: code.toUpperCase(),
              label: `${name} (${code.toUpperCase()})`,
            } as TmdbBrowseFacet;
          })
          .filter((entry): entry is TmdbBrowseFacet => Boolean(entry))
          .sort((a, b) => a.label.localeCompare(b.label))
        : [];

      const resolved: TmdbBrowseFacets = {
        genres,
        languages,
      };
      tmdbBrowseFacetsCache = resolved;
      return resolved;
    })
    .finally(() => {
      tmdbBrowseFacetsPending = null;
    });

  return tmdbBrowseFacetsPending;
};

const tmdbGenres = (raw: Record<string, unknown>, genreMap: Map<number, string>, fallback: ContentItem) => {
  const namedGenres = stringArray(raw.genres);
  if (namedGenres.length > 0) return namedGenres.slice(0, 4);

  if (Array.isArray(raw.genre_ids)) {
    const mapped = raw.genre_ids
      .map((id) => genreMap.get(numberFrom(id, 0)) ?? "")
      .filter(Boolean);
    if (mapped.length > 0) return mapped.slice(0, 4);
  }

  return fallback.genres;
};

const tmdbTrailerUrl = (raw: Record<string, unknown>, fallback?: string) => {
  const videos = isRecord(raw.videos) && Array.isArray(raw.videos.results) ? raw.videos.results : [];
  const trailer = videos
    .filter(isRecord)
    .find((video) =>
      firstString(video.site).toLowerCase() === "youtube" &&
      ["trailer", "teaser"].includes(firstString(video.type).toLowerCase()) &&
      firstString(video.key),
    );

  const key = trailer && isRecord(trailer) ? firstString(trailer.key) : "";
  return key ? toEmbeddableTrailerUrl(`https://www.youtube.com/watch?v=${key}`, fallback) : normalizeText(fallback);
};

const formatCurrency = (value: unknown) => {
  const amount = numberFrom(value, 0);
  if (!amount) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompactNumber = (value: unknown) => {
  const amount = numberFrom(value, 0);
  if (!amount) return "";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
};

const languageName = (value: unknown) => {
  const code = firstString(value).toLowerCase();
  if (!code) return "";

  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
};

const tmdbKeywordLabels = (raw: Record<string, unknown>) => {
  const keywords = isRecord(raw.keywords) ? raw.keywords : {};
  const rows = Array.isArray(keywords.keywords)
    ? keywords.keywords
    : Array.isArray(keywords.results)
      ? keywords.results
      : [];

  return rows
    .filter(isRecord)
    .map((entry) => firstString(entry.name))
    .filter(Boolean)
    .slice(0, 24);
};

const tmdbMediaGallery = (raw: Record<string, unknown>, title: string): TmdbMediaAsset[] => {
  const images = isRecord(raw.images) ? raw.images : {};
  const fromRows = (rows: unknown, type: TmdbMediaAsset["type"], size: string, limit: number) =>
    (Array.isArray(rows) ? rows : [])
      .filter(isRecord)
      .slice(0, limit)
      .flatMap((entry, index): TmdbMediaAsset[] => {
        const src = tmdbImage(entry.file_path, size, "");
        return src
          ? [
              {
                src,
                type,
                alt: `${title} ${type} ${index + 1}`,
                width: numberFrom(entry.width, 0) || undefined,
                height: numberFrom(entry.height, 0) || undefined,
              },
            ]
          : [];
      });

  return [
    ...fromRows(images.backdrops, "backdrop", "w780", 10),
    ...fromRows(images.posters, "poster", "w342", 8),
    ...fromRows(images.logos, "logo", "w300", 4),
  ];
};

const tmdbCollectionSummary = (raw: Record<string, unknown>): TmdbCollectionSummary | undefined => {
  const collection = isRecord(raw.belongs_to_collection) ? raw.belongs_to_collection : null;
  if (!collection) return undefined;

  const id = firstString(collection.id);
  const title = firstString(collection.name, collection.title);
  if (!id || !title) return undefined;

  return {
    id,
    title,
    description: firstString(collection.overview, `${title} collection`),
    posterImage: tmdbImage(collection.poster_path, "w342", ""),
    backdropImage: tmdbImage(collection.backdrop_path, "w780", ""),
  };
};

const tmdbDetailFacts = (raw: Record<string, unknown>, item: ContentItem): TmdbDetailFact[] => {
  const facts: TmdbDetailFact[] = [];
  const addFact = (label: string, value: unknown) => {
    const text = firstString(value);
    if (text) facts.push({ label, value: text });
  };

  addFact("Status", raw.status);
  addFact("Original language", languageName(raw.original_language));
  addFact(item.providerType === "tv" ? "First air date" : "Release date", firstString(raw.first_air_date, raw.release_date));
  addFact("Runtime", item.duration);
  addFact("Vote count", formatCompactNumber(raw.vote_count));
  addFact("Popularity", numberFrom(raw.popularity, 0).toFixed(1));

  if (item.providerType === "tv") {
    addFact("Seasons", formatCompactNumber(raw.number_of_seasons));
    addFact("Episodes", formatCompactNumber(raw.number_of_episodes));
    addFact("Last air date", raw.last_air_date);
    addFact("Network", stringArray(raw.networks).join(", "));
  } else {
    addFact("Budget", formatCurrency(raw.budget));
    addFact("Revenue", formatCurrency(raw.revenue));
    addFact("IMDb", isRecord(raw.external_ids) ? raw.external_ids.imdb_id : raw.imdb_id);
  }

  return facts.slice(0, 12);
};

const normalizeTmdbItem = (
  rawValue: unknown,
  mediaType: "movie" | "tv" | undefined,
  index: number,
  genreMap: Map<number, string>,
): ContentItem | null => {
  if (!isRecord(rawValue)) return null;
  const raw = rawValue;
  const fallback = fallbackAt(index);
  const routeType = firstString(raw.media_type, mediaType, raw.first_air_date ? "tv" : "movie") === "tv" ? "tv" : "movie";
  const providerKey = firstString(raw.id);
  if (!providerKey) return null;

  const title = cleanTitle(
    firstString(raw.title, raw.name, raw.original_title, raw.original_name),
    fallback.title,
  );
  const description = normalizeText(firstString(raw.overview, raw.synopsis, raw.description), fallback.description);
  const releaseDate = firstString(raw.release_date, raw.first_air_date);
  const year = yearFrom(releaseDate, fallback.year);
  const vote = numberFrom(raw.vote_average, Number(fallback.rating) || 0);
  const runtime = numberFrom(raw.runtime, 0);
  const episodeRuntime = Array.isArray(raw.episode_run_time) ? numberFrom(raw.episode_run_time[0], 0) : 0;
  const episodeCount = numberFrom(raw.number_of_episodes, 0);
  const seasonCount = numberFrom(raw.number_of_seasons, 0);
  const duration = runtime
    ? `${runtime} min`
    : episodeCount
      ? `${episodeCount} Episodes`
      : episodeRuntime
        ? `${episodeRuntime} min episodes`
        : routeType === "tv"
          ? "Series"
          : "Movie";
  const castSource = isRecord(raw.credits) ? raw.credits.cast : raw.cast;
  const country = firstString(
    stringArray(raw.production_countries).join(", "),
    stringArray(raw.origin_country).join(", "),
    firstString(raw.original_language).toUpperCase(),
    fallback.country,
  );
  const genres = tmdbGenres(raw, genreMap, fallback);
  const poster = tmdbImage(raw.poster_path, "w342", fallback.posterImage);
  const backdrop = tmdbImage(raw.backdrop_path, "w780", poster || fallback.backdropImage);
  const status = firstString(raw.status, releaseDate && Date.parse(releaseDate) > Date.now() ? "Upcoming" : "Released");

  return {
    id: routeId("tmdb", routeType, providerKey),
    slug: routeId("tmdb", routeType, providerKey),
    title,
    description,
    longDescription: normalizeText(firstString(raw.overview), description),
    type: routeType === "tv" ? "series" : "movie",
    category: routeType === "tv" ? "Series" : "Movies",
    genres,
    rating: vote ? vote.toFixed(1) : fallback.rating,
    year,
    duration,
    country,
    status,
    heroImage: backdrop,
    posterImage: poster,
    backdropImage: backdrop,
    heroAlt: `${title} backdrop`,
    posterAlt: `${title} poster`,
    tags: ["TMDB", routeType === "tv" ? "Series" : "Movie", year ? String(year) : ""].filter(Boolean),
    featured: index < 6,
    cast: tmdbPeopleToCast(castSource, fallback),
    trailerUrl: tmdbTrailerUrl(raw, fallback.trailerUrl),
    provider: "tmdb",
    providerType: routeType,
    providerSlug: providerKey,
    detailEndpoint: `/api/tmdb/${routeType}/${providerKey}?append_to_response=${routeType === "tv" ? TMDB_TV_DETAIL_APPEND : TMDB_MOVIE_DETAIL_APPEND}`,
    sourceUrl: `https://www.themoviedb.org/${routeType === "tv" ? "tv" : "movie"}/${providerKey}`,
    seasons: routeType === "tv" && seasonCount > 0 ? [] : undefined,
  };
};

const extractTmdbItems = (response: unknown): unknown[] => {
  const body = isRecord(response) ? response : {};
  const data = payloadData(response);
  const dataRecord = isRecord(data) ? data : {};
  const candidates = [
    body.results,
    body.items,
    Array.isArray(body.data) ? body.data : undefined,
    dataRecord.results,
    dataRecord.items,
    Array.isArray(dataRecord.data) ? dataRecord.data : undefined,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};

const normalizeTmdbRelatedItems = (
  response: unknown,
  mediaType: "movie" | "tv",
  genreMap: Map<number, string>,
  currentProviderSlug: string,
  indexBase: number,
) =>
  extractTmdbItems(response)
    .map((entry, index) => normalizeTmdbItem(entry, mediaType, indexBase + index, genreMap))
    .filter((item): item is ContentItem => Boolean(item))
    .filter((item) => item.providerSlug !== currentProviderSlug)
    .slice(0, 24);

const enrichTmdbDetailMetadata = (
  item: ContentItem,
  raw: Record<string, unknown>,
  mediaType: "movie" | "tv",
  genreMap: Map<number, string>,
): ContentItem => {
  const credits = isRecord(raw.credits) ? raw.credits : {};
  const similarItems = normalizeTmdbRelatedItems(raw.similar, mediaType, genreMap, item.providerSlug ?? "", 3000);
  const recommendationItems = normalizeTmdbRelatedItems(raw.recommendations, mediaType, genreMap, item.providerSlug ?? "", 4000);
  const relatedItems = dedupeItems([...similarItems, ...recommendationItems]).slice(0, 24);
  const crew = tmdbCrewToCast(credits.crew);
  const keywords = tmdbKeywordLabels(raw);
  const mediaGallery = tmdbMediaGallery(raw, item.title);
  const collection = tmdbCollectionSummary(raw);
  const detailFacts = tmdbDetailFacts(raw, item);

  return {
    ...item,
    relatedItems,
    recommendationItems,
    crew,
    keywords,
    mediaGallery,
    collection,
    detailFacts,
  };
};

const normalizeTmdbSectionsFromResponse = (
  plan: TmdbEndpointPlan,
  response: unknown,
  indexBase: number,
  genreMap: Map<number, string>,
): StreamHomeSection[] => {
  const items = extractTmdbItems(response)
    .map((entry, index) => normalizeTmdbItem(entry, plan.mediaType, indexBase + index, genreMap))
    .filter((item): item is ContentItem => Boolean(item));

  return items.length > 0
    ? [
        {
          id: `tmdb-${plan.slug}`,
          provider: "tmdb",
          slug: plan.slug,
          viewAllHref: `/${plan.slug}`,
          title: plan.title,
          subtitle: plan.subtitle,
          items,
        },
      ]
    : [];
};

const normalizeTmdbSeason = (
  item: ContentItem,
  seasonResponse: unknown,
  fallbackIndex: number,
): Season | null => {
  const data = payloadData(seasonResponse);
  if (!isRecord(data)) return null;

  const seasonNumber = numberFrom(data.season_number, fallbackIndex + 1);
  const rawEpisodes = Array.isArray(data.episodes) ? data.episodes : [];
  const episodes: Episode[] = rawEpisodes
    .filter(isRecord)
    .map((episode, index) => {
      const episodeNumber = numberFrom(episode.episode_number, index + 1);
      const title = cleanTitle(firstString(episode.name, episode.title), `Episode ${episodeNumber}`);

      return {
        id: `${item.id}-s${seasonNumber}e${episodeNumber}`,
        title,
        duration: firstString(episode.runtime ? `${episode.runtime} min` : "", "Episode"),
        synopsis: normalizeText(firstString(episode.overview, episode.synopsis), "Episode detail is available from TMDB."),
        thumbnail: tmdbImage(episode.still_path, "w300", item.backdropImage),
        streamEndpoint: `/api/xie-1/watch/tv/${item.providerSlug}/${seasonNumber}/${episodeNumber}`,
      };
    });

  if (episodes.length === 0) return null;

  return {
    id: `${item.id}-season-${seasonNumber}`,
    name: cleanTitle(firstString(data.name), `Season ${seasonNumber}`),
    episodes,
  };
};

const enrichTmdbSeriesSeasons = async (item: ContentItem, raw: unknown) => {
  if (item.provider !== "tmdb" || item.providerType !== "tv" || !item.providerSlug) return item;
  if (!isRecord(raw) || !Array.isArray(raw.seasons)) return item;

  const seasonNumbers = raw.seasons
    .filter(isRecord)
    .map((season) => numberFrom(season.season_number, 0))
    .filter((seasonNumber) => seasonNumber > 0)
    .slice(0, MAX_SEASONS_TO_LOAD);

  if (seasonNumbers.length === 0) return item;

  const responses = await Promise.allSettled(
    seasonNumbers.map((seasonNumber) =>
      fetchTmdbJson(`tv/${item.providerSlug}/season/${seasonNumber}`),
    ),
  );

  const seasons = responses
    .map((result, index) =>
      result.status === "fulfilled" ? normalizeTmdbSeason(item, result.value, index) : null,
    )
    .filter((season): season is Season => Boolean(season));

  return seasons.length > 0
    ? { ...item, seasons, duration: `${seasons.reduce((count, season) => count + season.episodes.length, 0)} Episodes` }
    : item;
};

const looksLikeContentItem = (entry: unknown) => {
  if (!isRecord(entry)) return false;
  const hasTitle = Boolean(firstString(entry.title, entry.title_clean, entry.title_full, entry.name, entry.original_title));
  const hasContentSignal = Boolean(
    firstString(
      entry.poster,
      entry.thumb,
      entry.backdrop,
      entry.overview,
      entry.synopsis,
      entry.description,
      entry.release_date,
      entry.stream_endpoint,
      entry.watch_endpoint,
      entry.detail_endpoint,
      entry.rating,
    ),
  );
  return hasTitle && hasContentSignal;
};

const extractRawProviderItems = (response: unknown): unknown[] => {
  const body = isRecord(response) ? response : {};
  const data = payloadData(response);
  const dataRecord = isRecord(data) ? data : {};
  const candidates = [
    body.results,
    body.items,
    Array.isArray(body.data) ? body.data : undefined,
    dataRecord.results,
    dataRecord.items,
    dataRecord.parts,
    Array.isArray(dataRecord.data) ? dataRecord.data : undefined,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.some(looksLikeContentItem)) return candidate;
  }

  return [];
};

const dedupeItems = (items: ContentItem[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.provider && item.providerSlug
      ? `${item.provider}-${item.providerType}-${item.providerSlug}`
      : `${item.title.toLowerCase()}-${item.year}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const STREAM_SECTION_ROUTES: StreamSectionRoute[] = TMDB_HOME_ENDPOINTS.map((plan) => ({
  slug: plan.slug,
  title: plan.title,
  subtitle: plan.subtitle,
  href: `/${plan.slug}`,
}));

export const getStreamSectionRoute = (slug?: string | null): StreamSectionRoute | null =>
  slug ? STREAM_SECTION_ROUTES.find((route) => route.slug === slug) ?? null : null;

const clampTmdbPage = (page: number) => {
  const normalized = Number.isFinite(page) ? Math.trunc(page) : 1;
  return Math.min(500, Math.max(1, normalized));
};

const totalPagesFromTmdbResponse = (response: unknown, fallbackPage: number) => {
  const body = isRecord(response) ? response : {};
  const data = payloadData(response);
  const dataRecord = isRecord(data) ? data : {};
  const totalPages = numberFrom(dataRecord.total_pages ?? body.total_pages, fallbackPage);
  return Math.max(fallbackPage, Math.min(500, Math.trunc(totalPages) || fallbackPage));
};

const totalResultsFromTmdbResponse = (response: unknown) => {
  const body = isRecord(response) ? response : {};
  const data = payloadData(response);
  const dataRecord = isRecord(data) ? data : {};
  const totalResults = numberFrom(dataRecord.total_results ?? body.total_results, 0);
  return Math.max(0, Math.trunc(totalResults));
};

const tmdbDiscoverSortBy = (mediaType: "movie" | "tv", sort: "Popularity" | "Latest" | "Rating") => {
  if (sort === "Latest") return mediaType === "movie" ? "primary_release_date.desc" : "first_air_date.desc";
  if (sort === "Rating") return "vote_average.desc";
  return "popularity.desc";
};

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

const queryForTmdbDiscover = (
  mediaType: "movie" | "tv",
  page: number,
  sort: "Popularity" | "Latest" | "Rating",
  filters?: TmdbBrowseFilters,
) => {
  const query: EndpointQuery = {
    page,
    sort_by: tmdbDiscoverSortBy(mediaType, sort),
  };

  if (filters?.genreId && Number.isFinite(filters.genreId) && filters.genreId > 0) {
    query.with_genres = Math.trunc(filters.genreId);
  }

  if (filters?.year && Number.isFinite(filters.year) && filters.year >= 1900 && filters.year <= 2100) {
    const safeYear = Math.trunc(filters.year);
    if (mediaType === "movie") query.primary_release_year = safeYear;
    if (mediaType === "tv") query.first_air_date_year = safeYear;
  }

  if (filters?.language) {
    const normalizedLanguage = filters.language.trim().toLowerCase();
    if (/^[a-z]{2}$/.test(normalizedLanguage)) {
      query.with_original_language = normalizedLanguage;
      if (mediaType === "tv") query.with_origin_country = normalizedLanguage.toUpperCase();
    }
  }

  if (filters?.status === "Released" || filters?.status === "Upcoming") {
    const today = todayIsoDate();
    const isReleased = filters.status === "Released";
    if (mediaType === "movie") {
      query[isReleased ? "primary_release_date.lte" : "primary_release_date.gte"] = today;
    } else {
      query[isReleased ? "first_air_date.lte" : "first_air_date.gte"] = today;
    }
  }

  return query;
};

const normalizeTmdbDiscoverPage = (
  response: unknown,
  mediaType: "movie" | "tv",
  safePage: number,
  indexBase: number,
  genreMap: Map<number, string>,
): TmdbBrowsePage => {
  const items = dedupeItems(
    extractTmdbItems(response)
      .map((entry, index) => normalizeTmdbItem(entry, mediaType, indexBase + index, genreMap))
      .filter((item): item is ContentItem => Boolean(item)),
  );

  return {
    page: safePage,
    totalPages: totalPagesFromTmdbResponse(response, safePage),
    totalResults: totalResultsFromTmdbResponse(response),
    items,
  };
};

export const fetchTmdbBrowsePage = async (
  scope: TmdbBrowseScope,
  page = 1,
  sort: "Popularity" | "Latest" | "Rating" = "Popularity",
  filters?: TmdbBrowseFilters,
): Promise<TmdbBrowsePage> => {
  const safePage = clampTmdbPage(page);
  const genreMap = await fetchTmdbGenreMap();

  if (scope === "movie") {
    const response = await fetchTmdbJson("discover/movie", queryForTmdbDiscover("movie", safePage, sort, filters));
    return normalizeTmdbDiscoverPage(response, "movie", safePage, (safePage - 1) * 1000, genreMap);
  }

  if (scope === "tv") {
    const response = await fetchTmdbJson("discover/tv", queryForTmdbDiscover("tv", safePage, sort, filters));
    return normalizeTmdbDiscoverPage(response, "tv", safePage, 500000 + (safePage - 1) * 1000, genreMap);
  }

  const [movieResponse, tvResponse] = await Promise.all([
    fetchTmdbJson("discover/movie", queryForTmdbDiscover("movie", safePage, sort, filters)),
    fetchTmdbJson("discover/tv", queryForTmdbDiscover("tv", safePage, sort, filters)),
  ]);
  const moviePage = normalizeTmdbDiscoverPage(movieResponse, "movie", safePage, (safePage - 1) * 1000, genreMap);
  const tvPage = normalizeTmdbDiscoverPage(tvResponse, "tv", safePage, 500000 + (safePage - 1) * 1000, genreMap);

  return {
    page: safePage,
    totalPages: Math.min(500, Math.max(moviePage.totalPages, tvPage.totalPages, safePage)),
    totalResults: moviePage.totalResults + tvPage.totalResults,
    items: dedupeItems([...moviePage.items, ...tvPage.items]),
  };
};

export const fetchStreamSectionPage = async (
  slug: string,
  page = 1,
): Promise<StreamSectionPage | null> => {
  const plan = TMDB_HOME_ENDPOINTS.find((entry) => entry.slug === slug);
  if (!plan) return null;

  const safePage = clampTmdbPage(page);
  const genreMap = await fetchTmdbGenreMap();
  const response = await fetchTmdbJson(plan.path, { ...plan.query, page: safePage });
  const planIndex = TMDB_HOME_ENDPOINTS.findIndex((entry) => entry.slug === slug);
  const indexBase = Math.max(0, planIndex) * 100000 + (safePage - 1) * 1000;
  const items = dedupeItems(
    extractTmdbItems(response)
      .map((entry, index) => normalizeTmdbItem(entry, plan.mediaType, indexBase + index, genreMap))
      .filter((item): item is ContentItem => Boolean(item)),
  );

  return {
    slug: plan.slug,
    title: plan.title,
    subtitle: plan.subtitle,
    href: `/${plan.slug}`,
    page: safePage,
    totalPages: totalPagesFromTmdbResponse(response, safePage),
    items,
  };
};

export const fetchStreamHome = async (): Promise<{
  sections: StreamHomeSection[];
  items: ContentItem[];
}> => {
  const genreMap = await fetchTmdbGenreMap();
  const responses = await Promise.allSettled(
    TMDB_HOME_ENDPOINTS.map(async (plan, index) => ({
      plan,
      response: await fetchTmdbJson(plan.path, plan.query),
      index,
    })),
  );

  const sections = responses.flatMap((result) =>
    result.status === "fulfilled"
      ? normalizeTmdbSectionsFromResponse(result.value.plan, result.value.response, result.value.index * 1000, genreMap)
      : [],
  );

  const items = dedupeItems(sections.flatMap((section) => section.items));
  return { sections, items };
};

const streamxieFilterCache = new Map<StreamxiePageKey, StreamxieFilterOptions>();
const streamxieFilterPending = new Map<StreamxiePageKey, Promise<StreamxieFilterOptions>>();

const clampProviderPage = (page: number) => {
  const normalized = Number.isFinite(page) ? Math.trunc(page) : 1;
  return Math.min(500, Math.max(1, normalized));
};

const providerCollectionMeta = (response: unknown, requestedPage: number) => {
  const body = isRecord(response) ? response : {};
  const data = payloadData(response);
  const dataRecord = isRecord(data) ? data : {};
  const pagination = isRecord(dataRecord.pagination)
    ? dataRecord.pagination
    : isRecord(body.pagination)
      ? body.pagination
      : {};

  const page = Math.max(
    1,
    Math.trunc(
      numberFrom(
        dataRecord.page ?? body.page ?? pagination.current_page ?? pagination.page,
        requestedPage,
      ),
    ),
  );
  const totalFromPagination = numberFrom(
    pagination.total_page ?? pagination.total_pages ?? dataRecord.total_pages ?? body.total_pages,
    0,
  );
  const totalPages = totalFromPagination > 0 ? Math.max(page, Math.trunc(totalFromPagination)) : page;
  const hasNextFromPagination = typeof pagination.has_next === "boolean"
    ? pagination.has_next
    : typeof pagination.next_page === "number"
      ? pagination.next_page > page
      : totalFromPagination > 0
        ? page < totalPages
        : false;

  return {
    page,
    totalPages,
    hasNextFromPagination,
  };
};

const normalizeProviderItemsFromResponse = (
  response: unknown,
  provider: StreamProvider,
  indexBase: number,
) =>
  dedupeItems(
    extractRawProviderItems(response)
      .map((entry, index) => normalizeProviderItem(entry, provider, indexBase + index))
      .filter((item): item is ContentItem => Boolean(item)),
  );

const extractProviderFilterRows = (response: unknown) => {
  const body = isRecord(response) ? response : {};
  const data = payloadData(response);
  const dataRecord = isRecord(data) ? data : {};
  const candidates = [
    dataRecord.results,
    dataRecord.items,
    body.results,
    body.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.some(isRecord)) return candidate.filter(isRecord);
  }

  return [] as Record<string, unknown>[];
};

const slugLabel = (slug: string) =>
  slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const buildFilterPath = (provider: StreamProvider, kind: StreamxieFilterKind, slug: string) => {
  const encoded = encodeURIComponent(slug);
  if (kind === "genre") return `${provider}/genres/${encoded}`;
  if (kind === "year") return `${provider}/years/${encoded}`;
  return `${provider}/countries/${encoded}`;
};

const buildFilterPaths = (provider: StreamProvider, kind: StreamxieFilterKind, slug: string) => {
  const encoded = encodeURIComponent(slug);
  if (kind === "genre") return [`${provider}/genres/${encoded}`, `${provider}/genre/${encoded}`];
  if (kind === "year") return [`${provider}/years/${encoded}`, `${provider}/year/${encoded}`];
  return [`${provider}/countries/${encoded}`, `${provider}/country/${encoded}`];
};

const normalizeFilterOptions = (
  scope: StreamxiePageKey,
  kind: StreamxieFilterKind,
  rows: Record<string, unknown>[],
) => {
  const options: StreamxieFilterOption[] = [];

  rows.forEach((row) => {
    const title = firstString(row.title, row.name, row.label).trim();
    const slug = firstString(row.slug, row.id).trim();
    const count = numberFrom(row.count, 0);
    if (!title || !slug) return;

    const option: StreamxieFilterOption = {
      title,
      slug,
      count,
      href: `/${scope}/${kind}/${encodeURIComponent(slug)}`,
    };
    const apiPath = endpointToProxyPath(row.endpoint);
    if (apiPath) option.apiPath = apiPath;
    options.push(option);
  });

  if (kind === "year") {
    const currentYear = new Date().getFullYear() + 1;
    return options
      .filter((entry) => /^\d{4}$/.test(entry.slug) && Number(entry.slug) >= 1900 && Number(entry.slug) <= currentYear)
      .sort((a, b) => Number(b.slug) - Number(a.slug));
  }

  return options.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.title.localeCompare(b.title);
  });
};

const findStreamxieSection = (scope: StreamxiePageKey, sectionSlug: string) =>
  getStreamxiePageConfig(scope)?.sections.find((section) => section.slug === sectionSlug) ?? null;

export const fetchStreamxieFilterOptions = async (scope: StreamxiePageKey): Promise<StreamxieFilterOptions> => {
  const cached = streamxieFilterCache.get(scope);
  if (cached) return cached;

  const pending = streamxieFilterPending.get(scope);
  if (pending) return pending;

  const page = getStreamxiePageConfig(scope);
  if (!page) return { genres: [], years: [], countries: [] };

  const request = Promise.allSettled([
    fetchProviderJson(`${page.provider}/genres`),
    fetchProviderJson(`${page.provider}/years`),
    fetchProviderJson(`${page.provider}/countries`),
  ])
    .then((results) => {
      const genres = results[0].status === "fulfilled"
        ? normalizeFilterOptions(scope, "genre", extractProviderFilterRows(results[0].value))
        : [];
      const years = results[1].status === "fulfilled"
        ? normalizeFilterOptions(scope, "year", extractProviderFilterRows(results[1].value))
        : [];
      const countries = results[2].status === "fulfilled"
        ? normalizeFilterOptions(scope, "country", extractProviderFilterRows(results[2].value))
        : [];

      return { genres, years, countries };
    })
    .finally(() => {
      streamxieFilterPending.delete(scope);
    });

  streamxieFilterPending.set(scope, request);
  const resolved = await request;
  streamxieFilterCache.set(scope, resolved);
  return resolved;
};

export const fetchStreamxieHome = async (
  scope: StreamxiePageKey,
): Promise<{ page: StreamxiePageConfig; sections: StreamHomeSection[]; items: ContentItem[] }> => {
  const page = getStreamxiePageConfig(scope);
  if (!page) throw new Error("Provider page is not registered.");

  const responses = await Promise.allSettled(
    page.sections.map(async (section, index) => ({
      section,
      response: await fetchProviderJson(section.path, { ...section.query, page: 1 }),
      index,
    })),
  );

  const sections: StreamHomeSection[] = responses.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    const items = normalizeProviderItemsFromResponse(
      result.value.response,
      page.provider,
      result.value.index * 1000,
    );
    if (items.length === 0) return [];

    return [
      {
        id: `${scope}-${result.value.section.slug}`,
        provider: page.provider,
        slug: result.value.section.slug,
        viewAllHref: `/${scope}/section/${result.value.section.slug}`,
        title: result.value.section.title,
        subtitle: result.value.section.subtitle,
        items,
      },
    ];
  });

  return {
    page,
    sections,
    items: dedupeItems(sections.flatMap((section) => section.items)),
  };
};

export const fetchStreamxieSectionPage = async (
  scope: StreamxiePageKey,
  sectionSlug: string,
  page = 1,
): Promise<StreamxieCollectionPage | null> => {
  const pageConfig = getStreamxiePageConfig(scope);
  const section = findStreamxieSection(scope, sectionSlug);
  if (!pageConfig || !section) return null;

  const safePage = clampProviderPage(page);
  const response = await fetchProviderJson(section.path, { ...section.query, page: safePage });
  const meta = providerCollectionMeta(response, safePage);
  const items = normalizeProviderItemsFromResponse(response, pageConfig.provider, (safePage - 1) * 1000);
  const hasMore = meta.hasNextFromPagination || (meta.totalPages > meta.page) || items.length > 0;

  return {
    scope,
    kind: "section",
    slug: section.slug,
    title: section.title,
    subtitle: section.subtitle,
    href: `/${scope}/section/${section.slug}`,
    page: meta.page,
    totalPages: meta.totalPages > meta.page ? meta.totalPages : hasMore ? meta.page + 1 : meta.page,
    hasMore,
    items,
  };
};

export const fetchStreamxieFilterPage = async (
  scope: StreamxiePageKey,
  kind: StreamxieFilterKind,
  slug: string,
  page = 1,
): Promise<StreamxieCollectionPage | null> => {
  const pageConfig = getStreamxiePageConfig(scope);
  if (!pageConfig || !slug) return null;

  const filters = await fetchStreamxieFilterOptions(scope).catch(() => ({ genres: [], years: [], countries: [] }));
  const options = kind === "genre" ? filters.genres : kind === "year" ? filters.years : filters.countries;
  const selected = options.find((entry) => entry.slug === slug);
  const safePage = clampProviderPage(page);
  const pathCandidates = Array.from(
    new Set([
      ...(selected?.apiPath ? [selected.apiPath] : []),
      ...buildFilterPaths(pageConfig.provider, kind, slug),
      buildFilterPath(pageConfig.provider, kind, slug),
    ].filter(Boolean)),
  );

  let response: unknown = null;
  let lastError: unknown = null;

  for (const path of pathCandidates) {
    try {
      response = await fetchProviderJson(path, { page: safePage });
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!response) {
    throw lastError instanceof Error ? lastError : new Error("Unable to load provider filter page.");
  }

  const meta = providerCollectionMeta(response, safePage);
  const items = normalizeProviderItemsFromResponse(response, pageConfig.provider, (safePage - 1) * 1000);
  const label = selected?.title ?? slugLabel(decodeURIComponent(slug));
  const title = `${kind === "genre" ? "Genre" : kind === "year" ? "Year" : "Country"} · ${label}`;
  const subtitle = `${scope} filtered by ${label}.`;
  const hasMore = meta.hasNextFromPagination || (meta.totalPages > meta.page) || items.length > 0;

  return {
    scope,
    kind,
    slug,
    title,
    subtitle,
    href: `/${scope}/${kind}/${encodeURIComponent(slug)}`,
    page: meta.page,
    totalPages: meta.totalPages > meta.page ? meta.totalPages : hasMore ? meta.page + 1 : meta.page,
    hasMore,
    items,
  };
};

export const searchTmdbCatalog = async (query: string) => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const [genreMap, response] = await Promise.all([
    fetchTmdbGenreMap(),
    fetchTmdbJson("search/multi", { q: normalizedQuery, page: 1 }),
  ]);

  return dedupeItems(
    extractTmdbItems(response)
      .map((entry, index) => {
        const row = isRecord(entry) ? entry : null;
        if (!row) return null;
        const mediaType = firstString(row.media_type, row.first_air_date ? "tv" : "movie");
        if (mediaType !== "movie" && mediaType !== "tv") return null;
        return normalizeTmdbItem(row, mediaType, index, genreMap);
      })
      .filter((item): item is ContentItem => Boolean(item)),
  );
};

const searchProviderCatalog = async (provider: StreamProvider, query: string) => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const response = await fetchProviderJson(`${provider}/search`, { q: normalizedQuery, page: 1 });
  return dedupeItems(
    extractRawProviderItems(response)
      .map((entry, index) => normalizeProviderItem(entry, provider, index))
      .filter((item): item is ContentItem => Boolean(item)),
  );
};

export const searchStreamCatalogByScope = async (
  query: string,
  scope: StreamSearchScope = "tmdb",
): Promise<ContentItem[]> => {
  if (scope === "streamxie1") return searchProviderCatalog("kacain-1", query);
  if (scope === "streamxie2") return searchProviderCatalog("kacain-3", query);
  if (scope === "streamxie3") return searchProviderCatalog("kacain-4", query);
  return searchTmdbCatalog(query);
};

export const searchStreamCatalog = async (query: string): Promise<ContentItem[]> =>
  searchStreamCatalogByScope(query, "tmdb");

const normalizeXieOneSeason = (
  item: ContentItem,
  seasonResponse: unknown,
  fallbackIndex: number,
): Season | null => {
  const data = payloadData(seasonResponse);
  if (!isRecord(data)) return null;

  const seasonNumber = numberFrom(data.season_number, fallbackIndex + 1);
  const rawEpisodes = Array.isArray(data.episodes) ? data.episodes : [];
  const episodes: Episode[] = rawEpisodes
    .filter(isRecord)
    .map((episode, index) => {
      const episodeNumber = numberFrom(episode.episode_number, index + 1);

      return {
        id: `${item.id}-s${seasonNumber}e${episodeNumber}`,
        title: cleanTitle(firstString(episode.title, episode.name), `Episode ${episodeNumber}`),
        duration: firstString(episode.runtime ? `${episode.runtime} min` : "", "Episode"),
        synopsis: normalizeText(firstString(episode.overview, episode.synopsis), "Episode detail is available from the provider."),
        thumbnail: safeImage(firstString(episode.still, episode.thumbnail, episode.poster), item.backdropImage),
        streamEndpoint: `/api/xie-1/watch/tv/${item.providerSlug}/${seasonNumber}/${episodeNumber}`,
      };
    });

  if (episodes.length === 0) return null;

  return {
    id: `${item.id}-season-${seasonNumber}`,
    name: cleanTitle(firstString(data.name), `Season ${seasonNumber}`),
    episodes,
  };
};

const enrichXieOneSeriesSeasons = async (item: ContentItem, raw: unknown) => {
  if (item.provider !== "xie-1" || item.type !== "series" || !item.providerSlug) return item;
  if (!isRecord(raw) || !Array.isArray(raw.seasons)) return item;

  const seasonNumbers = raw.seasons
    .filter(isRecord)
    .map((season) => numberFrom(season.season_number, 0))
    .filter((seasonNumber) => seasonNumber > 0)
    .slice(0, MAX_SEASONS_TO_LOAD);

  if (seasonNumbers.length === 0) return item;

  const responses = await Promise.allSettled(
    seasonNumbers.map((seasonNumber) =>
      fetchProviderJson(`xie-1/season/${item.providerSlug}/${seasonNumber}`),
    ),
  );

  const seasons = responses
    .map((result, index) =>
      result.status === "fulfilled" ? normalizeXieOneSeason(item, result.value, index) : null,
    )
    .filter((season): season is Season => Boolean(season));

  return seasons.length > 0 ? { ...item, seasons, duration: `${seasons.reduce((count, season) => count + season.episodes.length, 0)} Episodes` } : item;
};

export const fetchStreamDetailByRouteId = async (routeValue: string): Promise<ContentItem | null> => {
  const parsed = parseStreamRouteId(routeValue);
  if (!parsed) return null;

  if (parsed.provider === "tmdb") {
    const genreMap = await fetchTmdbGenreMap();
    const tmdbType = parsed.type === "tv" || parsed.type === "series" ? "tv" : "movie";
    const response = await fetchTmdbJson(
      `${tmdbType}/${parsed.key}`,
      { append_to_response: tmdbType === "tv" ? TMDB_TV_DETAIL_APPEND : TMDB_MOVIE_DETAIL_APPEND },
    );
    const body = isRecord(response) ? response : {};
    const raw = isRecord(body.data) ? body.data : body;
    const item = normalizeTmdbItem(raw, tmdbType, 0, genreMap);

    if (!item) return null;

    const enrichedItem = enrichTmdbDetailMetadata(
      {
        ...item,
        id: routeValue,
        slug: routeValue,
      },
      raw,
      tmdbType,
      genreMap,
    );

    const enriched = await enrichTmdbSeriesSeasons(enrichedItem, raw);

    return enriched;
  }

  const detailEndpoint = buildDetailEndpoint(parsed.provider, parsed.type, parsed.key);
  const response = await fetchProviderJson(endpointToProxyPath(detailEndpoint));
  const body = isRecord(response) ? response : {};
  const raw = isRecord(body.data) ? body.data : body;
  const item = normalizeProviderItem(raw, parsed.provider, 0);

  if (!item) return null;

  const streamEndpoint = buildStreamEndpoint(parsed.provider, item.providerType ?? parsed.type, item.providerSlug ?? parsed.key);
  const enriched = await enrichXieOneSeriesSeasons(
    {
      ...item,
      id: routeValue,
      slug: routeValue,
      streamEndpoint: item.streamEndpoint || streamEndpoint,
    },
    raw,
  );

  return enriched;
};

const findEpisode = (item: ContentItem, episodeId?: string | null) => {
  const episodes = item.seasons?.flatMap((season) => season.episodes) ?? [];
  if (episodes.length === 0) return undefined;
  if (!episodeId) return episodes[0];
  return episodes.find((episode) => episode.id === episodeId) ?? episodes[0];
};

const episodeNumbersFromId = (episodeId?: string | null) => {
  const match = episodeId?.match(/s(\d+)e(\d+)/i);
  if (!match) return null;
  return {
    season: Number(match[1]),
    episode: Number(match[2]),
  };
};

const providerFromEndpoint = (endpoint: string): StreamProvider | null => {
  const normalized = endpointToProxyPath(endpoint).replace(/^\/+/, "");
  const firstSegment = normalized.split(/[/?#]/)[0];
  return isStreamProvider(firstSegment) ? firstSegment : null;
};

type PlaybackCandidate = {
  provider: StreamProvider;
  path: string;
};

const addPlaybackCandidate = (
  candidates: PlaybackCandidate[],
  seen: Set<string>,
  endpoint: unknown,
  provider?: StreamProvider,
) => {
  const path = endpointToProxyPath(endpoint);
  if (!path) return;

  const resolvedProvider = provider ?? providerFromEndpoint(path);
  if (!resolvedProvider || !path.startsWith(`${resolvedProvider}/`)) return;
  if (seen.has(path)) return;

  candidates.push({
    provider: resolvedProvider,
    path,
  });
  seen.add(path);
};

const collectPlaybackCandidates = (item: ContentItem, episodeId?: string | null) => {
  const candidates: PlaybackCandidate[] = [];
  const seen = new Set<string>();
  const episode = findEpisode(item, episodeId);
  const episodeNumbers = episodeNumbersFromId(episodeId);
  const providerCandidate = item.provider && isStreamProvider(item.provider) ? item.provider : undefined;

  addPlaybackCandidate(candidates, seen, episode?.streamEndpoint, providerCandidate);
  if (providerCandidate && providerCandidate !== "xie-1" && episode?.id) {
    addPlaybackCandidate(candidates, seen, `/api/${providerCandidate}/streams/episode/${episode.id}`, providerCandidate);
    addPlaybackCandidate(candidates, seen, `/api/${providerCandidate}/streams/${episode.id}?type=episode`, providerCandidate);
  }

  addPlaybackCandidate(candidates, seen, item.streamEndpoint || item.watchEndpoint, providerCandidate);

  if (item.provider === "tmdb" && item.providerSlug) {
    if (item.providerType === "movie") {
      addPlaybackCandidate(candidates, seen, `/api/xie-1/watch/movie/${item.providerSlug}`, "xie-1");
    } else if (episodeNumbers) {
      addPlaybackCandidate(
        candidates,
        seen,
        `/api/xie-1/watch/tv/${item.providerSlug}/${episodeNumbers.season}/${episodeNumbers.episode}`,
        "xie-1",
      );
    } else {
      addPlaybackCandidate(candidates, seen, `/api/xie-1/watch/tv/${item.providerSlug}`, "xie-1");
    }
  }

  if (item.provider && isStreamProvider(item.provider) && item.providerSlug) {
    if (item.provider === "xie-1") {
      if (item.type === "series" && episodeNumbers) {
        addPlaybackCandidate(
          candidates,
          seen,
          `/api/xie-1/watch/tv/${item.providerSlug}/${episodeNumbers.season}/${episodeNumbers.episode}`,
          "xie-1",
        );
      } else if (item.type === "series") {
        addPlaybackCandidate(candidates, seen, `/api/xie-1/watch/tv/${item.providerSlug}`, "xie-1");
      } else {
        addPlaybackCandidate(candidates, seen, `/api/xie-1/watch/movie/${item.providerSlug}`, "xie-1");
      }
    } else {
      addPlaybackCandidate(
        candidates,
        seen,
        `/api/${item.provider}/streams/${item.providerType ?? (item.type === "series" ? "series" : "movie")}/${item.providerSlug}`,
        item.provider,
      );
    }
  }

  return candidates;
};

const extractPlaybackFromResponse = (
  candidate: PlaybackCandidate,
  response: unknown,
): { sources: StreamPlaybackSource[]; downloadUrl?: string } => {
  const body = isRecord(response) ? response : {};
  const data = isRecord(body.data) ? body.data : body;
  const arrays = [
    data.providers,
    data.streams,
    data.sources,
    data.servers,
    body.providers,
    body.streams,
    body.sources,
  ].filter(Array.isArray) as unknown[][];

  const sources: StreamPlaybackSource[] = arrays
    .flat()
    .filter(isRecord)
    .flatMap((entry, index): StreamPlaybackSource[] => {
      const url = firstString(entry.url, entry.nested_url, entry.embed_url, entry.stream_url, entry.iframe, entry.src);
      const directUrl = firstString(entry.direct_url, entry.direct_stream_url);
      const server = firstString(entry.server, entry.name, entry.label, entry.provider, `Server ${index + 1}`);
      const source: StreamPlaybackSource = {
        server,
        url,
        type: normalizeText(firstString(entry.type, entry.resolver)),
        active: Boolean(entry.active),
        noAds: Boolean(entry.no_ads),
        provider: candidate.provider,
      };
      const sourceRows = source.url ? [source] : [];

      if (directUrl && directUrl !== url) {
        sourceRows.push({
          ...source,
          server: `${server} direct`,
          url: directUrl,
          type: normalizeText(firstString(entry.direct_type, "direct")),
        });
      }

      return sourceRows;
    })
    .filter((entry) => entry.url);

  const directEmbed = firstString(
    data.stream_embed_url,
    data.stream_url,
    data.embed_url,
    data.iframe,
    body.stream_embed_url,
    body.stream_url,
  );
  if (directEmbed && !sources.some((source) => source.url === directEmbed)) {
    sources.unshift({
      server: "Primary",
      url: directEmbed,
      active: true,
      provider: candidate.provider,
    });
  }

  const directStream = firstString(
    data.direct_stream_url,
    data.stream_direct_url,
    body.direct_stream_url,
    body.stream_direct_url,
  );
  if (directStream && !sources.some((source) => source.url === directStream)) {
    sources.unshift({
      server: "Direct",
      url: directStream,
      type: "direct",
      active: true,
      provider: candidate.provider,
    });
  }

  const download = isRecord(data.download) ? data.download : null;
  return {
    sources,
    downloadUrl: firstString(download?.url),
  };
};

const dedupeSources = (sources: StreamPlaybackSource[]) => {
  const seen = new Set<string>();
  return sources.filter((source) => {
    if (seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
};

export const fetchStreamPlayback = async (item: ContentItem, episodeId?: string | null): Promise<StreamPlayback> => {
  const candidates = collectPlaybackCandidates(item, episodeId);
  if (candidates.length === 0) return { embedUrl: null, sources: [] };

  const responses = await Promise.allSettled(
    candidates.map(async (candidate) => ({
      candidate,
      data: await fetchProviderJson(candidate.path),
    })),
  );

  const extracted = responses.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    return [extractPlaybackFromResponse(result.value.candidate, result.value.data)];
  });

  const sources = dedupeSources(extracted.flatMap((entry) => entry.sources));
  const activeSource = sources.find((source) => source.active) ?? sources.find((source) => source.noAds) ?? sources[0];
  const downloadUrl = firstString(...extracted.map((entry) => entry.downloadUrl));

  return {
    embedUrl: activeSource?.url ?? null,
    sources,
    downloadUrl: downloadUrl || undefined,
  };
};
