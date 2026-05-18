import { getStrapiMedia } from "../lib/media";
import NextImage from "next/image";

const Image = ({ image, className }) => {
  if (!image?.data?.attributes) return null;

  const { alternativeText, width, height } = image.data.attributes;

  return (
    <NextImage
      width={width}
      height={height}
      className={className}
      src={getStrapiMedia(image)}
      alt={alternativeText || ""}
    />
  );
};

export default Image;