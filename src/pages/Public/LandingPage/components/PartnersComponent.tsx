import Image from "@/components/Image";
import ImagePreview from "@/components/ImagePreview/ImagePreview";
import Lucide from "@/components/Base/Lucide";
import { Carousel } from "antd";
import Title from "antd/es/typography/Title";
import { HTMLProps } from "react";
import { LandingPageApiHooks } from "../api";
import { imageResizerDimension } from "@/utils/helper";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";

interface PartnersComponentProps extends HTMLProps<HTMLDivElement> {
  hideTitle?: boolean;
}
export const PartnersComponent = ({ className, hideTitle }: PartnersComponentProps) => {
  const breakpoint = useBreakpoint();
  const { data } = LandingPageApiHooks.useGetSponsorsBySlot({
    queries: {
      slot: "HOME"
    }
  });

  const getSlideBreakpoint = () => {
    if (breakpoint.xxl) return 6;
    if (breakpoint.xl) return 5;
    if (breakpoint.lg) return 4;
    if (breakpoint.md) return 3;
    if (breakpoint.sm) return 3;
    if (breakpoint.xs) return 3;
    return 4;
  };
  return (
    <div className={className}>
      {!hideTitle && <Title level={4} className="col-span-12 !text-emerald-800 p-4 flex flex-row items-center justify-center !mb-0">
        <div className='flex flex-row items-center justify-center uppercase'>
          OFFICIAL <span className="font-bold ml-1">PARTNERS</span>
        </div>
      </Title>}
      <div className='col-span-12 border rounded-2xl border-emerald-800 px-6 slide-separator bg-white shadow-lg'>
        {!data?.data || data.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Lucide icon="Users" className="h-16 w-16 text-emerald-800/60 mb-4" />
            <h3 className="text-emerald-800 text-lg font-medium mb-2 text-center">No Partners or Sponsors Available</h3>
            <p className="text-emerald-800/80 text-sm text-center">There are currently no official partners or sponsors to display.</p>
          </div>
        ) : (
          <Carousel slidesPerRow={1} slidesToShow={data?.data?.length && data?.data?.length > getSlideBreakpoint() ? getSlideBreakpoint() : data?.data?.length || 0} autoplay autoplaySpeed={3000}>
            {data?.data?.map((item, index) => {
              const uniqueKey = item.uuid || item.media_url || `partner-${index}`;
              return (
                <div key={uniqueKey} className={`flex flex-row justify-center items-center p-2 `}>
                  <div className="flex flex-row items-center justify-center w-full aspect-square px-2 max-h-52 md:px-4 2xl:px-8">
                    <ImagePreview
                      items={[item.media_url]}
                    >
                      <Image src={imageResizerDimension(item.media_url, 200, 'h')} className="max-h-52" />
                    </ImagePreview>
                  </div>
                </div>
              );
            })}
          </Carousel>
        )}
      </div>
    </div>
  );
};