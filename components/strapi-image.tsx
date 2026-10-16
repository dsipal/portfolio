import Image, { type ImageProps } from "next/image";
import { getStrapiMedia } from "@/lib/media";
import type { StrapiMedia } from "@/lib/types";

type Props = Omit<ImageProps, "src" | "alt" | "width" | "height"> & {
  image: StrapiMedia | null | undefined;
  alt?: string;
};

/** next/image for a Strapi media entry. Pass `fill` to cover a sized parent. */
export function StrapiImage({ image, alt, fill, ...props }: Props) {
  const src = getStrapiMedia(image);
  if (!image || !src) return null;

  const sizeProps = fill ? { fill: true } : { width: image.width ?? 1200, height: image.height ?? 800 };

  return <Image src={src} alt={alt ?? image.alternativeText ?? ""} {...sizeProps} {...props} />;
}
