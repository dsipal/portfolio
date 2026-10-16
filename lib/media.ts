import type { StrapiMedia } from "./types";

/**
 * Resolve a Strapi media URL. Absolute URLs (Cloudinary) pass through.
 * Relative uploads get the Strapi base: the internal URL by default (for
 * next/image, which fetches on the server), or the public URL when `public`
 * is set (for metadata such as og:image that browsers and crawlers fetch).
 */
export function getStrapiMedia(
  media: Pick<StrapiMedia, "url"> | null | undefined,
  { public: isPublic = false } = {},
) {
  if (!media?.url) return null;
  if (!media.url.startsWith("/")) return media.url;
  const base = isPublic
    ? process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"
    : process.env.STRAPI_INTERNAL_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
  return `${base}${media.url}`;
}
