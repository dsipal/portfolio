import { getStrapiMedia } from "@/lib/media";
import { getSiteInfo } from "@/lib/site";
import { ogImage, ogShareImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Site preview";
export const revalidate = 3600;

/** The CMS share image (global → defaultSeo → shareImage) when set, otherwise a generated card */
export default async function Image() {
  const { name, description, global } = await getSiteInfo();
  const shareImage = getStrapiMedia(global?.defaultSeo?.shareImage);
  return (
    (shareImage && (await ogShareImage(shareImage))) ??
    ogImage({ eyebrow: description, title: name, footer: name.toLowerCase() })
  );
}
