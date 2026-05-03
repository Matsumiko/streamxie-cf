import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type DocumentMetaOptions = {
  canonicalPath?: string;
  noIndex?: boolean;
  ogType?: "website" | "article";
  imageUrl?: string;
};

const SITE_ORIGIN = "https://streamxie.pages.dev";
const DEFAULT_SOCIAL_IMAGE = `${SITE_ORIGIN}/streamxie-og.png`;
const AUTO_NOINDEX_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/profile",
  "/my-list",
  "/search",
]);

const upsertMetaName = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
};

const upsertMetaProperty = (property: string, content: string) => {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
};

const upsertCanonical = (href: string) => {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", href);
};

const normalizeDescription = (value: string) => {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return "Nonton film, series, anime, dan drama terbaru di streamXie dengan pencarian cepat, koleksi lengkap, dan katalog yang selalu diperbarui tiap hari.";
  }
  return cleaned.length <= 160 ? cleaned : `${cleaned.slice(0, 157)}...`;
};

export const useDocumentMeta = (
  title: string,
  description: string,
  options?: DocumentMetaOptions,
) => {
  const location = useLocation();

  useEffect(() => {
    const canonicalPath = options?.canonicalPath ?? location.pathname;
    const canonicalUrl = canonicalPath.startsWith("http")
      ? canonicalPath
      : new URL(canonicalPath || "/", SITE_ORIGIN).toString();
    const normalizedDescription = normalizeDescription(description);
    const autoNoIndex = AUTO_NOINDEX_PATHS.has(location.pathname);
    const noIndex = options?.noIndex ?? autoNoIndex;
    const robotsValue = noIndex ? "noindex, nofollow" : "index, follow";
    const ogType = options?.ogType ?? "website";
    const socialImage = options?.imageUrl ?? DEFAULT_SOCIAL_IMAGE;

    document.title = title;
    upsertMetaName("description", normalizedDescription);
    upsertMetaName("robots", robotsValue);

    upsertCanonical(canonicalUrl);

    upsertMetaProperty("og:title", title);
    upsertMetaProperty("og:description", normalizedDescription);
    upsertMetaProperty("og:type", ogType);
    upsertMetaProperty("og:url", canonicalUrl);
    upsertMetaProperty("og:image", socialImage);
    upsertMetaProperty("og:image:alt", "Logo streamXie");
    upsertMetaProperty("og:site_name", "streamXie");

    upsertMetaName("twitter:card", "summary_large_image");
    upsertMetaName("twitter:title", title);
    upsertMetaName("twitter:description", normalizedDescription);
    upsertMetaName("twitter:image", socialImage);
    upsertMetaName("twitter:image:alt", "Logo streamXie");
  }, [
    title,
    description,
    location.pathname,
    options?.canonicalPath,
    options?.imageUrl,
    options?.noIndex,
    options?.ogType,
  ]);
};
