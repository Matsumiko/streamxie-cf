const UPSTREAM_ORIGIN = "https://api.streamxie.indevs.in";

const ACTIVE_PROVIDERS = ["xie-1", "kacain-1", "kacain-3", "kacain-4"];
const DIRECT_PROVIDERS = new Set(["xie-1"]);
const UPSTREAM_PROVIDERS = new Set(["kacain-1", "kacain-3", "kacain-4"]);

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

const cacheHeaderFor = (segments) => {
  const streamish = segments.some((segment) =>
    ["streams", "watch", "stream-proxy", "providers"].includes(segment),
  );
  if (streamish) return "private, max-age=30";
  return "public, max-age=60, s-maxage=300, stale-while-revalidate=600";
};

const assertPositiveInt = (value, name) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return parsed;
};

const assertMediaType = (value) => {
  if (value === "movie" || value === "tv") return value;
  throw new Error("type must be movie or tv.");
};

const movieProvidersFor = (id) => [
  { server: "2embed cc", url: `https://www.2embed.cc/embed/${id}`, type: "embed" },
  { server: "2embed skin", url: `https://2embed.skin/embed/${id}`, type: "embed" },
  { server: "2embed stream", url: `https://2embed.stream/embed/movie/${id}`, type: "embed" },
  { server: "aeonwatch", url: `https://thisiscinema.pages.dev/movie/${id}`, type: "embed" },
  { server: "cinesrc", url: `https://cinesrc.st/embed/movie/${id}`, type: "embed" },
  { server: "filmex", url: `https://fmovies4u.com/movie/${id}`, type: "embed" },
  { server: "filmku", url: `https://filmku.stream/movie/${id}`, type: "embed" },
  { server: "moviesapi", url: `https://moviesapi.to/movie/${id}`, type: "embed" },
  { server: "player4u", url: `https://player4u.xyz/embed/movie/${id}`, type: "embed" },
  { server: "peachify", url: `https://peachify.top/embed/movie/${id}`, type: "embed" },
  { server: "primesrc", url: `https://primesrc.me/movie/${id}`, type: "embed" },
  { server: "smashystream", url: `https://embed.smashystream.com/playere.php?tmdb=${id}`, type: "embed" },
  { server: "spenembed", url: `https://spencerdevs.xyz/movie/${id}`, type: "embed" },
  { server: "superembed", url: `https://multiembed.mov/?video_id=${id}&tmdb=1`, type: "embed" },
  { server: "vidapi ru", url: `https://vidapi.ru/embed/movie/${id}`, type: "embed" },
  { server: "vidapi xyz", url: `https://vidapi.xyz/embed/movie/${id}`, type: "embed" },
  { server: "vidfast pro", url: `https://vidfast.pro/movie/${id}?autoPlay=true`, type: "embed" },
  { server: "vidfast xyz", url: `https://vidfast.xyz/movie/${id}?autoPlay=true`, type: "embed" },
  { server: "vidfast pm", url: `https://vidfast.pm/movie/${id}?autoPlay=true`, type: "embed" },
  { server: "vidfast net", url: `https://vidfast.net/movie/${id}?autoPlay=true`, type: "embed" },
  { server: "vidfast me", url: `https://vidfast.me/movie/${id}?autoPlay=true`, type: "embed" },
  { server: "vidfast io", url: `https://vidfast.io/movie/${id}?autoPlay=true`, type: "embed" },
  { server: "vidfast in", url: `https://vidfast.in/movie/${id}?autoPlay=true`, type: "embed" },
  { server: "vidfun", url: `https://vidfun.pro/movie/${id}`, type: "embed" },
  { server: "vidjoy", url: `https://vidjoy.pro/embed/movie/${id}`, type: "embed" },
  { server: "vidking", url: `https://www.vidking.net/embed/movie/${id}`, type: "embed" },
  { server: "vidsrc cc", url: `https://vidsrc.cc/v2/embed/movie/${id}`, type: "embed" },
  { server: "vidsrc me ru", url: `https://vidsrcme.ru/embed/movie/${id}`, type: "embed" },
  { server: "vidsrc me su", url: `https://vidsrcme.su/embed/movie/${id}`, type: "embed" },
  { server: "vidsrc embed ru", url: `https://vidsrc-embed.ru/embed/movie/${id}`, type: "embed" },
  { server: "vidsrc embed su", url: `https://vidsrc-embed.su/embed/movie/${id}`, type: "embed" },
  { server: "vsrc su", url: `https://vsrc.su/embed/movie/${id}`, type: "embed" },
  { server: "vidsrc su", url: `https://vidsrc.su/embed/movie/${id}`, type: "embed" },
  { server: "vidsrc to", url: `https://vidsrc.to/embed/movie/${id}`, type: "embed" },
  { server: "vidsync", url: `https://vidsync.xyz/embed/movie/${id}`, type: "embed" },
  { server: "vidup", url: `https://vidup.to/embed/movie/${id}`, type: "embed" },
  { server: "vixsrc", url: `https://vixsrc.to/movie/${id}`, type: "embed" },
  { server: "vidzen", url: `https://vidzen.fun/movie/${id}`, type: "embed" },
  { server: "zxcstream", url: `https://www.zxcstream.xyz/embed/movie/${id}`, type: "embed" },
  { server: "vidrock", url: `https://vidrock.net/movie/${id}`, type: "embed", no_ads: true },
  { server: "111movies", url: `https://111movies.com/movie/${id}`, type: "embed", no_ads: false },
  { server: "vidzee", url: `https://player.vidzee.wtf/embed/movie/${id}?server=1`, type: "embed", no_ads: true },
  { server: "vidsrc 1", url: `https://www.vidsrc.wtf/api/1/movie/?id=${id}`, type: "api", no_ads: true },
  { server: "vidsrc 2", url: `https://www.vidsrc.wtf/api/2/movie/?id=${id}`, type: "api", no_ads: true },
  { server: "vidsrc 3", url: `https://www.vidsrc.wtf/api/3/movie/?id=${id}`, type: "api", no_ads: true },
  { server: "videasy", url: `https://player.videasy.net/movie/${id}`, type: "embed", no_ads: false, has_4k: true },
  { server: "vidnest", url: `https://vidnest.fun/movie/${id}`, type: "embed", no_ads: true, has_4k: true },
  { server: "rivestream", url: `https://rivestream.org/embed?type=movie&id=${id}`, type: "embed", no_ads: true },
  { server: "vidlink", url: `https://vidlink.pro/movie/${id}`, type: "embed", no_ads: false },
  { server: "vidsrc xyz", url: `https://vidsrc.xyz/embed/movie/${id}`, type: "embed", no_ads: true },
  { server: "vidsrc icu", url: `https://vidsrc.icu/embed/movie/${id}`, type: "embed", no_ads: true },
];

const tvProvidersFor = (id, season, episode) => [
  { server: "2embed cc", url: `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`, type: "embed" },
  { server: "2embed skin", url: `https://2embed.skin/embedtv/${id}&s=${season}&e=${episode}`, type: "embed" },
  { server: "2embed stream", url: `https://2embed.stream/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "aeonwatch", url: `https://thisiscinema.pages.dev/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "cinesrc", url: `https://cinesrc.st/embed/tv/${id}?s=${season}&e=${episode}`, type: "embed" },
  { server: "filmex", url: `https://fmovies4u.com/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "filmku", url: `https://filmku.stream/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "moviesapi", url: `https://moviesapi.to/tv/${id}-${season}-${episode}`, type: "embed" },
  { server: "player4u", url: `https://player4u.xyz/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "peachify", url: `https://peachify.top/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "primesrc", url: `https://primesrc.me/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "smashystream", url: `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`, type: "embed" },
  { server: "spenembed", url: `https://spencerdevs.xyz/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "superembed", url: `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`, type: "embed" },
  { server: "vidapi ru", url: `https://vidapi.ru/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "vidapi xyz", url: `https://vidapi.xyz/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "vidfast pro", url: `https://vidfast.pro/tv/${id}/${season}/${episode}?autoPlay=true`, type: "embed" },
  { server: "vidfast xyz", url: `https://vidfast.xyz/tv/${id}/${season}/${episode}?autoPlay=true`, type: "embed" },
  { server: "vidfast pm", url: `https://vidfast.pm/tv/${id}/${season}/${episode}?autoPlay=true`, type: "embed" },
  { server: "vidfast net", url: `https://vidfast.net/tv/${id}/${season}/${episode}?autoPlay=true`, type: "embed" },
  { server: "vidfast me", url: `https://vidfast.me/tv/${id}/${season}/${episode}?autoPlay=true`, type: "embed" },
  { server: "vidfast io", url: `https://vidfast.io/tv/${id}/${season}/${episode}?autoPlay=true`, type: "embed" },
  { server: "vidfast in", url: `https://vidfast.in/tv/${id}/${season}/${episode}?autoPlay=true`, type: "embed" },
  { server: "vidfun", url: `https://vidfun.pro/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "vidjoy", url: `https://vidjoy.pro/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "vidking", url: `https://www.vidking.net/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "vidsrc cc", url: `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "vidsrc me ru", url: `https://vidsrcme.ru/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "vidsrc me su", url: `https://vidsrcme.su/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "vidsrc embed ru", url: `https://vidsrc-embed.ru/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "vidsrc embed su", url: `https://vidsrc-embed.su/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "vsrc su", url: `https://vsrc.su/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "vidsrc su", url: `https://vidsrc.su/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "vidsrc to", url: `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "vidsync", url: `https://vidsync.xyz/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "vidup", url: `https://vidup.to/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "vixsrc", url: `https://vixsrc.to/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "vidzen", url: `https://vidzen.fun/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "zxcstream", url: `https://www.zxcstream.xyz/embed/tv/${id}/${season}/${episode}`, type: "embed" },
  { server: "vidrock", url: `https://vidrock.net/tv/${id}/${season}/${episode}`, type: "embed", no_ads: true },
  { server: "111movies", url: `https://111movies.com/tv/${id}/${season}/${episode}`, type: "embed", no_ads: false },
  { server: "vidzee", url: `https://player.vidzee.wtf/embed/tv/${id}/${season}/${episode}?server=1`, type: "embed", no_ads: true },
  { server: "vidsrc 1", url: `https://www.vidsrc.wtf/api/1/tv/?id=${id}&s=${season}&e=${episode}`, type: "api", no_ads: true },
  { server: "vidsrc 2", url: `https://www.vidsrc.wtf/api/2/tv/?id=${id}&s=${season}&e=${episode}`, type: "api", no_ads: true },
  { server: "vidsrc 3", url: `https://www.vidsrc.wtf/api/3/tv/?id=${id}&s=${season}&e=${episode}`, type: "api", no_ads: true },
  {
    server: "videasy",
    url: `https://player.videasy.net/tv/${id}/${season}/${episode}?nextEpisode=true&autoplay=true`,
    type: "embed",
    no_ads: true,
    has_4k: false,
  },
  { server: "vidnest", url: `https://vidnest.fun/tv/${id}/${season}/${episode}`, type: "embed", no_ads: true },
  {
    server: "rivestream",
    url: `https://rivestream.org/embed?type=tv&id=${id}&season=${season}&episode=${episode}`,
    type: "embed",
    no_ads: true,
  },
  {
    server: "vidlink",
    url: `https://vidlink.pro/tv/${id}/${season}/${episode}`,
    type: "embed",
    no_ads: false,
    auto_next: true,
  },
  { server: "vidsrc xyz", url: `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`, type: "embed", no_ads: true },
  { server: "vidsrc icu", url: `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}`, type: "embed", no_ads: true },
];

const buildProviderLinks = (type, id, season = 1, episode = 1) =>
  type === "movie" ? movieProvidersFor(id) : tvProvidersFor(id, season, episode);

const buildDownloadLink = (type, id, season = 1, episode = 1) => ({
  server: "vidvault",
  url: type === "movie" ? `https://vidvault.ru/movie/${id}` : `https://vidvault.ru/tv/${id}/${season}/${episode}`,
  type: "download",
  note: "Download URL generated from the same direct provider template used by xie-1.",
});

const xieOneInfo = () =>
  json({
    status: true,
    creator: "streamXie",
    service: "xie-1",
    source_profile: {
      wrapper: false,
      direct_from_fadzpie: false,
      playback_layer: "external embed providers",
      note: "xie-1 generates TMDB-id provider/embed URLs directly from local templates.",
    },
    endpoints: {
      watch_movie: "/api/xie/xie-1/watch/movie/83533",
      watch_tv: "/api/xie/xie-1/watch/tv/1399/1/1",
      providers_movie: "/api/xie/xie-1/providers/movie/83533",
      providers_tv: "/api/xie/xie-1/providers/tv/1399/1/1",
    },
  });

const handleXieOnePlayback = (segments) => {
  const route = segments[0];
  const type = assertMediaType(segments[1]);
  const id = assertPositiveInt(segments[2], "id");

  if (!["watch", "providers", "streams"].includes(route)) {
    return xieOneInfo();
  }

  if (type === "movie") {
    return json(
      {
        status: true,
        creator: "streamXie",
        service: "xie-1",
        type,
        id,
        source_profile: {
          wrapper: false,
          direct_from_fadzpie: false,
          note: "Direct provider/embed URLs generated from local xie-1 templates.",
        },
        data: {
          providers: buildProviderLinks(type, id),
          download: buildDownloadLink(type, id),
        },
      },
      {
        headers: {
          "cache-control": cacheHeaderFor(["xie-1", route]),
        },
      },
    );
  }

  const season = segments[3] ? assertPositiveInt(segments[3], "season") : 1;
  const episode = segments[4] ? assertPositiveInt(segments[4], "episode") : 1;

  return json(
    {
      status: true,
      creator: "streamXie",
      service: "xie-1",
      type,
      id,
      season,
      episode,
      source_profile: {
        wrapper: false,
        direct_from_fadzpie: false,
        note: "Direct provider/embed URLs generated from local xie-1 templates.",
      },
      data: {
        providers: buildProviderLinks(type, id, season, episode),
        download: buildDownloadLink(type, id, season, episode),
      },
    },
    {
      headers: {
        "cache-control": cacheHeaderFor(["xie-1", route]),
      },
    },
  );
};

const handleXieOne = (segments) => {
  if (segments.length === 0) return xieOneInfo();

  try {
    return handleXieOnePlayback(segments);
  } catch (error) {
    return json(
      {
        status: false,
        service: "xie-1",
        error: error instanceof Error ? error.message : "Invalid xie-1 request.",
      },
      { status: 400 },
    );
  }
};

const handleUpstreamProvider = async (context, segments) => {
  const token = context.env.FADZPIE_AUTH_BEARER;

  if (!token) {
    return json(
      {
        status: false,
        error: "Upstream auth is not configured.",
      },
      { status: 500 },
    );
  }

  const incomingUrl = new URL(context.request.url);
  const upstreamUrl = new URL(`${UPSTREAM_ORIGIN}/api/${segments.join("/")}`);
  upstreamUrl.search = incomingUrl.search;

  const upstreamResponse = await fetch(upstreamUrl.toString(), {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
    },
  });

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

const handleGet = async (context) => {
  const segments = getPathSegments(context.params.path);

  if (segments.length === 0 || segments[0] === "health") {
    return json({
      status: true,
      service: "streamxie-proxy",
      providers: ACTIVE_PROVIDERS,
      directProviders: [...DIRECT_PROVIDERS],
      upstreamProviders: [...UPSTREAM_PROVIDERS],
    });
  }

  const provider = segments[0];
  if (DIRECT_PROVIDERS.has(provider)) {
    return handleXieOne(segments.slice(1));
  }

  if (!UPSTREAM_PROVIDERS.has(provider)) {
    return json(
      {
        status: false,
        error: "Provider is not allowed.",
        allowedProviders: ACTIVE_PROVIDERS,
      },
      { status: 404 },
    );
  }

  return handleUpstreamProvider(context, segments);
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
