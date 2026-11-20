import Image, { type ImageProps } from "next/image";
import { getCmsMedia } from "@/lib/media";
import type { CmsImage as CmsImageType } from "@/lib/schemas";

type Props = Omit<ImageProps, "src" | "alt" | "width" | "height"> & {
  image: CmsImageType | null | undefined;
  alt?: string;
};

/**
 * next/image for a Ghost image. Ghost doesn't report dimensions, so pass
 * `fill` to cover a sized parent; otherwise a 3:2 box is assumed.
 */
export function CmsImage({ image, alt, fill, ...props }: Props) {
  const src = getCmsMedia(image);
  if (!image || !src) return null;

  const sizeProps = fill ? { fill: true } : { width: 1200, height: 800 };

  return <Image src={src} alt={alt ?? image.alt ?? ""} {...sizeProps} {...props} />;
}
