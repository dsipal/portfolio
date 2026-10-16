import { getSiteInfo } from "@/lib/site";
import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Site preview";
export const revalidate = 3600;

export default async function Image() {
  const { name, description } = await getSiteInfo();
  return ogImage({ eyebrow: description, title: name, footer: name.toLowerCase() });
}
