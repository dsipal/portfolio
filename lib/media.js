import { getStrapiURL } from "./api";

export function getStrapiMedia(media) {
  if (!media?.data?.attributes) return null;
  const { url } = media.data.attributes;
  const imageUrl = url.startsWith("/") ? getStrapiURL(url) : url;
  return imageUrl;
}