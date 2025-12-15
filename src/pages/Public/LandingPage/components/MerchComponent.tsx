import Image from "@/components/Image";
import ImagePreview from "@/components/ImagePreview/ImagePreview";
import { dummyProductImage } from "@/utils/faker";
import { faker } from "@faker-js/faker";
import { Carousel } from "antd";
import Title from "antd/es/typography/Title";
import { HTMLProps } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LandingPageApiHooks } from "../api";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";
import { PublicShopApiHooks } from "../../Shop/api";
import { paths } from "@/router/paths";

export const MerchComponent = ({className}: HTMLProps<HTMLDivElement>) => {
  const navigate = useNavigate();
  const { data } = PublicShopApiHooks.useGetFeaturedMerchandise();
  const breakpoints = useBreakpoint();

  const getSlideBreakpoint = () => {
    if (breakpoints.xxl) return 4;
    if (breakpoints.xl) return 3;
    if (breakpoints.lg) return 2;
    if (breakpoints.md) return 1;
    if (breakpoints.sm) return 1;
    if (breakpoints.xs) return 1;
    return 4;
  };

  return (
    <div className={className}>
      <Title level={4} className="col-span-12 !text-emerald-800 p-4 flex flex-row items-center justify-center !mb-0">
        <div className='flex flex-row items-center justify-center uppercase'>
          OFFICIAL <span className="font-bold ml-1">MERCHANDISE</span>
        </div>
      </Title>
      <div className='col-span-12'>
        {data?.data && <Carousel slidesPerRow={1} slidesToShow={data?.data?.length > getSlideBreakpoint() ? getSlideBreakpoint() : data?.data?.length } autoplay autoplaySpeed={3000}>
          {data?.data?.map((item, idx) => (
            <Link key={idx} className={`flex flex-row justify-center items-center p-2 group hover:scale-105 hover:text-emerald-800 transition-all duration-70`} to={paths.shop.detail({ uuid: item.uuid || "" }).$}>
              <div className="flex flex-row items-center justify-center w-full p-2 md:px-6 2xl:px-12">
                <img src={item.image_cover} className="h-48 aspect-square object-cover"/>
              </div>
              <div className="flex flex-col items-center justify-center w-full">
                <div className='h-1 mb-1 w-6 bg-emerald-800'></div>
                <span className="text-sm font-semibold text-left capitalize group-hover:text-emerald-800 group-hover:[text-shadow:1px_1px_12px_#EBCE56] [text-shadow:0px_0px_12px_#FFF]">{item?.name}</span>
                <span className="text-xs my-1 font-light text-left capitalize group-hover:text-emerald-800 group-hover:[text-shadow:1px_1px_12px_#EBCE56] [text-shadow:0px_0px_12px_#FFF]">IDR {Intl.NumberFormat('id-ID').format(faker.number.int({ min: 100000, max: 1000000 }))}</span>
              </div>
            </Link>
          ))}
        </Carousel>}
      </div>
    </div>
  );
};