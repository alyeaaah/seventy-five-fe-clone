import Image from "@/components/Image";
import Lucide from "@/components/Base/Lucide";
import { HTMLProps } from "react";
import { useNavigate } from "react-router-dom";
import { imageResizerDimension } from "@/utils/helper";
import { PublicGalleryApiHooks } from "../../Galleries/api";
import { paths } from "@/router/paths";

export const Galleries = ({ className }: HTMLProps<HTMLDivElement>) => {
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
        {!data?.data || data.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 px-4 z-10 relative">
            <Lucide icon="Image" className="h-16 w-16 text-emerald-800/60 mb-4" />
            <h3 className="text-emerald-800 text-lg font-medium mb-2">No Gallery Images</h3>
            <p className="text-emerald-800/80 text-sm text-center">There are currently no gallery images available. Check back later!</p>
          </div>
        ) : (
          <>
            <div className="flex flex-row h-1/2">
              {
                data?.data?.map((image, originalIndex) => {
                  if (originalIndex % 2 !== 0) return null;
                  const uniqueKey = image.uuid || image.link || `gallery-even-${originalIndex}`;
                  return (
                    <Image
                      key={uniqueKey}
                      src={imageResizerDimension(image.link, 220, "h")}
                      className="flex h-full object-cover hover:cursor-pointer hover:border-2 hover:border-[#EBCE56] hover:scale-110 transition-all duration-300"
                      alt={JSON.stringify(image)}
                      onClick={() => {
                        if (image.album_uuid && image.uuid) {
                          navigate(paths.galleries.detail({ id: image.album_uuid || "", image: image.uuid || "" }).$)
                        }
                        if (image.product_uuid) {
                          navigate(paths.shop.detail({ uuid: image.product_uuid || "" }).$)
                        }
                        if (image.blog_uuid) {
                          navigate(paths.news.detail({ uuid: image.blog_uuid || "" }).$)
                        }
                        if (image.match_uuid) {
                          navigate(paths.tournament.match({ matchUuid: image.match_uuid || "" }).$)
                        }
                        if (image.tournament_uuid) {
                          navigate(paths.tournament.index({ uuid: image.tournament_uuid || "" }).$)
                        }
                      }}
                    />
                  );
                }).filter((item): item is JSX.Element => item !== null)
              }
            </div>
            <div className="flex flex-row h-1/2">
              {
                data?.data?.map((image, originalIndex) => {
                  if (originalIndex % 2 === 0) return null;
                  const uniqueKey = image.uuid || image.link || `gallery-odd-${originalIndex}`;
                  return (
                    <Image
                      key={uniqueKey}
                      src={imageResizerDimension(image.link, 220, "h")}
                      className="flex h-full object-cover hover:cursor-pointer hover:border-2 hover:border-[#EBCE56] hover:scale-110 transition-all duration-300"
                      alt={JSON.stringify(image)}
                      onClick={() => {
                        if (image.album_uuid && image.uuid) {
                          navigate(paths.galleries.detail({ id: image.album_uuid || "", image: image.uuid || "" }).$)
                        }
                        if (image.product_uuid) {
                          navigate(paths.shop.detail({ uuid: image.product_uuid || "" }).$)
                        }
                        if (image.blog_uuid) {
                          navigate(paths.news.detail({ uuid: image.blog_uuid || "" }).$)
                        }
                        if (image.match_uuid) {
                          navigate(paths.tournament.match({ matchUuid: image.match_uuid || "" }).$)
                        }
                        if (image.tournament_uuid) {
                          navigate(paths.tournament.index({ uuid: image.tournament_uuid || "" }).$)
                        }
                      }}
                    />
                  );
                }).filter((item): item is JSX.Element => item !== null)
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
};