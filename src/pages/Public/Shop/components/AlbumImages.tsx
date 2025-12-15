import { HTMLProps } from "react";
import ImagePreview from "@/components/ImagePreview/ImagePreview";
import { imageResizerDimension } from "@/utils/helper";

interface AlbumImagesProps extends HTMLProps<HTMLDivElement> {
  image1: string;
  image2: string;
  image3: string;
}
export const AlbumImages = ({ image1, image2, image3, ...props }: AlbumImagesProps) => {
  return (
    <div {...props} className={`relative ${props.className}`}>
      <img
        src={imageResizerDimension(image1 || "", 220, "h")}
        className=" h-full w-full object-cover aspect-square absolute rounded-xl -top-1 -left-1 z-[2] border"
      />
      <img
        src={imageResizerDimension(image2 || "", 220, "h")}
        className="flex h-full w-full object-cover aspect-square rounded-xl z-[1] border relative"
      />
      <img
        src={imageResizerDimension(image3 || "", 220, "h")}
        className=" h-full w-full object-cover aspect-square absolute rounded-xl top-1 left-1 z-0 border"
      />
    </div>
  );
}