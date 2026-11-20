/** Ghost's public URL (its `url` setting): what browsers and crawlers fetch */
export function ghostPublicURL() {
  return (process.env.GHOST_URL || "http://localhost:2368").replace(/\/+$/, "");
}

/** Ghost as reached from the Next.js server (the compose service in Docker) */
export function ghostInternalURL() {
  return (process.env.GHOST_INTERNAL_URL || ghostPublicURL()).replace(/\/+$/, "");
}

/**
 * Resolve a Ghost media URL. Ghost returns absolute URLs on its public
 * domain; site-relative paths ("/content/images/...") get that domain.
 *
 * By default URLs on the public domain are rewritten to the internal URL, for
 * next/image, which fetches on the server. With `public` the public URL is
 * kept, for metadata and links that browsers and crawlers fetch. Other hosts
 * (an external CDN) pass through.
 */
export function getCmsMedia(
  media: { url: string } | null | undefined,
  { public: isPublic = false } = {},
) {
  if (!media?.url) return null;
  const publicBase = ghostPublicURL();
  const absolute = media.url.startsWith("/") ? `${publicBase}${media.url}` : media.url;
  if (isPublic || !absolute.startsWith(`${publicBase}/`)) return absolute;
  return `${ghostInternalURL()}${absolute.slice(publicBase.length)}`;
}
