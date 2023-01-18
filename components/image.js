import { getStrapiMedia } from "../lib/media";
import NextImage from "next/image";

const Image = ({ image,className }) => {

  const { alternativeText, width, height } = image.data.attributes;

  return (
    <NextImage
      //layout="responsive"
      width={width}
      height={height}
      className={className}
      src={getStrapiMedia(image)}
      alt={alternativeText || ""}
    />
  );
};

export default Image;