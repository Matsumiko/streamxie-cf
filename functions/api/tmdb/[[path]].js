const TMDB_ORIGIN = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const FORBIDDEN_QUERY_KEYS = new Set(["api_key", "access_token"]);

const json = (payload, init = {}) =>
  new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers ?? {}),
    },
  });

const getPathSegments = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value) return [value];
  return [];
};

const getTmdbToken = (env = {}) =>
  env.API_Read_Access_Token || env.TMDB_ACCESS_TOKEN || env.TMDB_READ_ACCESS_TOKEN || "";

const cacheHeaderFor = (segments) => {
  if (segments.some((segment) => ["raw", "watch", "watch-providers"].includes(segment))) {
    return "public, max-age=300, s-maxage=900, stale-while-revalidate=1800";
  }

  if (segments.some((segment) => ["search", "find"].includes(segment))) {
    return "public, max-age=60, s-maxage=300, stale-while-revalidate=600";
  }

  return "public, max-age=900, s-maxage=3600, stale-while-revalidate=7200";
};

const assertSafeSegments = (segments) => {
  const unsafe = segments.find((segment) => {
    const decoded = decodeURIComponent(segment);
    return decoded === "." || decoded === ".." || decoded.includes("/") || !/^[A-Za-z0-9._:-]+$/.test(decoded);
  });

  if (unsafe) {
    throw new Error("Invalid TMDB path segment.");
  }
};

const normalizeResourceSegment = (segment) =>
  segment
    .replace(/^top-rated$/, "top_rated")
    .replace(/^now-playing$/, "now_playing")
    .replace(/^airing-today$/, "airing_today")
    .replace(/^on-the-air$/, "on_the_air")
    .replace(/^external-ids$/, "external_ids")
    .replace(/^release-dates$/, "release_dates")
    .replace(/^watch-providers$/, "watch/providers")
    .replace(/^aggregate-credits$/, "aggregate_credits")
    .replace(/^alternative-titles$/, "alternative_titles")
    .replace(/^content-ratings$/, "content_ratings")
    .replace(/^episode-groups$/, "episode_groups")
    .replace(/^screened-theatrically$/, "screened_theatrically")
    .replace(/^tagged-images$/, "tagged_images")
    .replace(/^movie-credits$/, "movie_credits")
    .replace(/^tv-credits$/, "tv_credits")
    .replace(/^combined-credits$/, "combined_credits");

const normalizeTmdbSegments = (segments) => {
  if (segments[0] === "raw") return segments.slice(1);

  if (segments[0] === "movies") {
    return ["movie", normalizeResourceSegment(segments[1] || "popular"), ...segments.slice(2)];
  }

  if (segments[0] === "genres") {
    if (segments[1] === "movie" || segments[1] === "tv") return ["genre", segments[1], "list"];
    return segments;
  }

  if (segments[0] === "collections") {
    return ["collection", ...segments.slice(1)];
  }

  if (segments[0] === "watch-providers") {
    return ["watch", "providers", ...segments.slice(1)];
  }

  if (["recommendations", "similar", "related"].includes(segments[0])) {
    const [resource, type, id] = segments;
    if ((type === "movie" || type === "tv") && id) {
      return [type, id, resource === "related" ? "recommendations" : resource];
    }
  }

  if (segments[0] === "movie" || segments[0] === "tv" || segments[0] === "person") {
    return segments
      .map((segment, index) => (index >= 2 ? normalizeResourceSegment(segment) : segment))
      .flatMap((segment) => segment.split("/"));
  }

  if (segments[0] === "genre" && (segments[1] === "movie" || segments[1] === "tv") && !segments[2]) {
    return ["genre", segments[1], "list"];
  }

  return segments.map(normalizeResourceSegment).flatMap((segment) => segment.split("/"));
};

const appendSafeQuery = (targetUrl, incomingUrl) => {
  const hasOfficialSearchQuery = incomingUrl.searchParams.has("query");

  incomingUrl.searchParams.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();
    if (FORBIDDEN_QUERY_KEYS.has(normalizedKey)) return;

    if (normalizedKey === "q" && !hasOfficialSearchQuery && !targetUrl.searchParams.has("query")) {
      targetUrl.searchParams.append("query", value);
      return;
    }

    targetUrl.searchParams.append(key, value);
  });
};

const tmdbUrlFor = (segments, incomingUrl) => {
  const normalizedSegments = normalizeTmdbSegments(segments);
  if (normalizedSegments.length === 0) throw new Error("TMDB path is required.");
  assertSafeSegments(normalizedSegments);

  const upstreamUrl = new URL(`${TMDB_ORIGIN}/${normalizedSegments.join("/")}`);
  appendSafeQuery(upstreamUrl, incomingUrl);
  return upstreamUrl;
};

const serviceInfo = (configured) =>
  json({
    status: true,
    creator: "fadzPie",
    service: "tmdb",
    source: TMDB_ORIGIN,
    auth: {
      configured,
      mode: "access_token",
      note: "Set API_Read_Access_Token as a Cloudflare Pages secret. The token is only used server-side and is never returned.",
    },
    image_base_url: TMDB_IMAGE_BASE_URL,
    endpoints: {
      configuration: "/api/tmdb/configuration",
      trending: "/api/tmdb/trending/all/week?page=1",
      movie_popular: "/api/tmdb/movie/popular?page=1",
      tv_popular: "/api/tmdb/tv/popular?page=1",
      search: "/api/tmdb/search/multi?query=avatar&page=1",
      discover_movie: "/api/tmdb/discover/movie?with_genres=28&page=1",
      discover_tv: "/api/tmdb/discover/tv?with_networks=213&page=1",
      movie_detail: "/api/tmdb/movie/83533?append_to_response=videos,credits,images,recommendations",
      tv_detail: "/api/tmdb/tv/1399?append_to_response=videos,credits,images,recommendations",
      season_detail: "/api/tmdb/tv/1399/season/1",
      genres_movie: "/api/tmdb/genre/movie/list",
      genres_tv: "/api/tmdb/genre/tv/list",
      watch_providers: "/api/tmdb/watch/providers/movie",
      raw: "/api/tmdb/raw/movie/popular?language=en-US&page=1",
    },
    compatibility_aliases: {
      "movies/popular": "movie/popular",
      "movies/top-rated": "movie/top_rated",
      "movies/now-playing": "movie/now_playing",
      "tv/top-rated": "tv/top_rated",
      "tv/airing-today": "tv/airing_today",
      "tv/on-the-air": "tv/on_the_air",
      "genres/movie": "genre/movie/list",
      "genres/tv": "genre/tv/list",
      "watch-providers/movie": "watch/providers/movie",
    },
  });

const fetchTmdb = async (url, token) =>
  fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
    },
  });

const aggregateGenres = async (incomingUrl, token) => {
  const [movieResponse, tvResponse] = await Promise.all([
    fetchTmdb(tmdbUrlFor(["genre", "movie", "list"], incomingUrl), token),
    fetchTmdb(tmdbUrlFor(["genre", "tv", "list"], incomingUrl), token),
  ]);

  if (!movieResponse.ok || !tvResponse.ok) {
    return json(
      {
        status: false,
        error: "TMDB genres request failed.",
      },
      { status: movieResponse.ok ? tvResponse.status : movieResponse.status },
    );
  }

  const [moviePayload, tvPayload] = await Promise.all([movieResponse.json(), tvResponse.json()]);
  const movieGenres = Array.isArray(moviePayload.genres) ? moviePayload.genres : [];
  const tvGenres = Array.isArray(tvPayload.genres) ? tvPayload.genres : [];
  const deduped = new Map();

  [...movieGenres, ...tvGenres].forEach((genre) => {
    if (genre && typeof genre.id === "number" && typeof genre.name === "string") {
      deduped.set(genre.id, genre);
    }
  });

  return json(
    {
      status: true,
      creator: "fadzPie",
      service: "tmdb",
      source: TMDB_ORIGIN,
      data: {
        movie: movieGenres,
        tv: tvGenres,
      },
      genres: [...deduped.values()],
    },
    {
      headers: {
        "cache-control": cacheHeaderFor(["genres"]),
      },
    },
  );
};

const handleGet = async (context) => {
  const segments = getPathSegments(context.params.path);
  const token = getTmdbToken(context.env);
  const incomingUrl = new URL(context.request.url);

  if (segments.length === 0) return serviceInfo(Boolean(token));

  if (!token) {
    return json(
      {
        status: false,
        error: "TMDB access token is not configured.",
      },
      { status: 500 },
    );
  }

  if (segments.length === 1 && segments[0] === "genres") {
    return aggregateGenres(incomingUrl, token);
  }

  let upstreamUrl;
  try {
    upstreamUrl = tmdbUrlFor(segments, incomingUrl);
  } catch (error) {
    return json(
      {
        status: false,
        error: error instanceof Error ? error.message : "Invalid TMDB path.",
      },
      { status: 400 },
    );
  }

  const upstreamResponse = await fetchTmdb(upstreamUrl, token);
  const headers = new Headers(upstreamResponse.headers);
  headers.set("cache-control", cacheHeaderFor(segments));
  headers.delete("set-cookie");
  headers.delete("www-authenticate");

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  });
};

export function onRequest(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        allow: "GET, OPTIONS",
      },
    });
  }

  if (context.request.method === "GET") {
    return handleGet(context);
  }

  return json(
    {
      status: false,
      error: "Method not allowed.",
    },
    {
      status: 405,
      headers: {
        allow: "GET, OPTIONS",
      },
    },
  );
}
