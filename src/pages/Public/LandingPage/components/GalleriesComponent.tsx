import Image from "@/components/Image";
import { HTMLProps } from "react";
import { useNavigate } from "react-router-dom";
import { imageResizerDimension } from "@/utils/helper";
import { PublicGalleryApiHooks } from "../../Galleries/api";
import { paths } from "@/router/paths";

export const Galleries = ({className}: HTMLProps<HTMLDivElement>) => {
  const navigate = useNavigate();
  const { data } = PublicGalleryApiHooks.useGetFeaturedGallery(
    {
      queries: {
        limit: 22
      }
    }
  );
  return (
    <div className={`auto-rows-min relative ${className}`}>
      <div
        className="
          absolute flex flex-col items-end justify-around right-0 pr-2 top-0 rounded-2xl bottom-0 h-full w-64
          text-6xl font-bold
          text-[rgba(6,95,70,0.4)]
          z-[1]
          [text-shadow:-6px_-6px_4px_rgba(6,95,70,0.5),6px_6px_4px_rgba(6,95,70,0.5),0px_0px_12px_rgba(213,172,0,1)]
          bg-[linear-gradient(to_right,rgba(255,255,255,0)_0%,rgba(255,255,255,0.95)_70%,rgba(255,255,255,1)_80%)]">
        <span className="!font-marker">Seventy</span>
        <span className="!font-marker">Five</span>
        <span className="!font-marker">Galleries</span>
      </div>
      <div className="flex flex-col h-[400px] justify-stretch overflow-scroll rounded-2xl shadow-lg relative">
        <div className="flex flex-row h-1/2">
          {
            data?.data?.filter((_, i) => i % 2 === 0).map((image, indx) => (
              <Image
                key={indx}
                src={imageResizerDimension(image.link, 220, "h")}
                className="flex h-full object-cover hover:cursor-pointer hover:border-2 hover:border-[#EBCE56] hover:scale-110 transition-all duration-300"
                alt={JSON.stringify(image)}
                onClick={() => {
                  if (!!image.album_uuid && !!image.uuid) {
                    navigate(paths.galleries.detail({ id: image.album_uuid  || "", image: image.uuid || "" }).$)
                  }
                  if (!!image.product_uuid) {
                    navigate(paths.shop.detail({ uuid: image.product_uuid || "" }).$)
                  }
                  if (!!image.blog_uuid) {
                    navigate(paths.news.detail({ uuid: image.blog_uuid || "" }).$)
                  }
                  if (!!image.match_uuid) {
                    navigate(paths.tournament.match({ matchUuid: image.match_uuid || "" }).$)
                  }
                  if (!!image.tournament_uuid) {
                    navigate(paths.tournament.index({ uuid: image.tournament_uuid || "" }).$)
                  }
                }}
              />
            ))
          }
        </div>
        <div className="flex flex-row h-1/2">
          {
            data?.data?.filter((_, i) => i % 2 !== 0).map((image, index) => (
              <Image
                key={index}
                src={imageResizerDimension(image.link, 220, "h")}
                className="flex h-full object-cover hover:cursor-pointer hover:border-2 hover:border-[#EBCE56] hover:scale-110 transition-all duration-300"
                alt={JSON.stringify(image)}
                onClick={() => {
                  if (!!image.album_uuid && !!image.uuid) {
                    navigate(paths.galleries.detail({ id: image.album_uuid  || "", image: image.uuid || "" }).$)
                  }
                  if (!!image.product_uuid) {
                    navigate(paths.shop.detail({ uuid: image.product_uuid || "" }).$)
                  }
                  if (!!image.blog_uuid) {
                    navigate(paths.news.detail({ uuid: image.blog_uuid || "" }).$)
                  }
                  if (!!image.match_uuid) {
                    navigate(paths.tournament.match({ matchUuid: image.match_uuid || "" }).$)
                  }
                  if (!!image.tournament_uuid) {
                    navigate(paths.tournament.index({ uuid: image.tournament_uuid || "" }).$)
                  }
                }}
              />
            ))
          }
        </div>

        
      </div>
      {/* {data?.data && <div className="w-full max-h-[440px] overflow-hidden">

        <Gallery
          thumbnailStyle={() => ({
            width: "auto",
            height: "auto",
            maxWidth: "100%",   // Optional: responsive behavior
            maxHeight: "100%",  // Optional: responsive behavior
          })}
          enableImageSelection={false}
          tileViewportStyle={{
            width: "100%",
            height: "100%",
          }}
          images={
            data?.data?.map((image) => ({
              src: imageResizerDimension(image.link, 220,'h'),
              thumbnail: imageResizerDimension(image.link, 220,'h'),
              width: 0,
              height: 0

            })) || []
        }
        />
      </div>} */}
    </div>
  );
};