export type ContentType = "movie" | "series";

export type Episode = {
  id: string;
  title: string;
  duration: string;
  synopsis: string;
  thumbnail: string;
  streamEndpoint?: string;
};

export type Season = {
  id: string;
  name: string;
  episodes: Episode[];
};

export type CastMember = {
  name: string;
  role: string;
  image: string;
};

export type TmdbMediaAsset = {
  src: string;
  alt: string;
  type: "backdrop" | "poster" | "logo";
  width?: number;
  height?: number;
};

export type TmdbCollectionSummary = {
  id: string;
  title: string;
  description: string;
  posterImage: string;
  backdropImage: string;
};

export type TmdbDetailFact = {
  label: string;
  value: string;
};

export type ContentItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  type: ContentType;
  category: "Movies" | "Series" | "Anime" | "Drama" | "Variety";
  genres: string[];
  rating: string;
  year: number;
  duration: string;
  country: string;
  status: string;
  heroImage: string;
  posterImage: string;
  backdropImage: string;
  heroAlt: string;
  posterAlt: string;
  tags: string[];
  featured?: boolean;
  cast: CastMember[];
  seasons?: Season[];
  trailerUrl?: string;
  provider?: string;
  providerType?: string;
  providerSlug?: string;
  detailEndpoint?: string;
  streamEndpoint?: string;
  watchEndpoint?: string;
  sourceUrl?: string;
  relatedItems?: ContentItem[];
  recommendationItems?: ContentItem[];
  crew?: CastMember[];
  keywords?: string[];
  mediaGallery?: TmdbMediaAsset[];
  collection?: TmdbCollectionSummary;
  detailFacts?: TmdbDetailFact[];
};
