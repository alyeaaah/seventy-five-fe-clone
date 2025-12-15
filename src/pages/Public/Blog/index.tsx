import LayoutWrapper from "@/components/LayoutWrapper"
import { FooterComponent } from "../LandingPage/components/FooterComponent"
import { useRef, useState } from "react";
import Carousel, { CarouselRef } from "antd/es/carousel";
import { PublicGalleryApiHooks } from "../Galleries/api";
import { PublicBlogApiHooks } from "../Blog/api";
import { LandingPageApiHooks } from "../LandingPage/api";
import { Link, useNavigate } from "react-router-dom";
import { imageResizerDimension } from "@/utils/helper";
import moment from "moment";
import { FadeAnimation } from "@/components/Animations";
import Image from "@/components/Image";
import Lucide from "@/components/Base/Lucide";
import { paths } from "@/router/paths";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";

export const PublicNews = () => {
  const navigate = useNavigate();
  const sliderRef = useRef<CarouselRef>(null);
  const [carouselActiveIndex, setCarouselActiveIndex] = useState(0);
  const screens = useBreakpoint();

  const { data: galleryData } = PublicGalleryApiHooks.useGetFeaturedGallery(
    {
      queries: {
        limit: 7
      }
    }
  );

  const { data } = PublicBlogApiHooks.useGetBlogFeatured(
    {
      queries: {
        limit: 5
      }
    }
  );
  const igReel = (url: string) => {
    return (
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
      >
        <a href={url}>View Reel</a>
      </blockquote>
    );
  };

  return (
    <>
      <LayoutWrapper className="grid grid-cols-12 gap-4 sm:gap-8 mt-4 sm:mt-8">
        <FadeAnimation className="md:col-span-8 col-span-12 grid grid-cols-12 gap-0" direction="down">
          <div className="md:col-span-5 col-span-12 bg-gray-100 rounded-l-xl">
            <Carousel
              vertical={(screens.lg || screens.md || screens.xxl || screens.xl)}
              ref={sliderRef}
              className="w-full aspect-square rounded-xl overflow-hidden flex justify-center items-center"
              slidesToScroll={1}
              slidesToShow={1}
              afterChange={setCarouselActiveIndex}
              swipeToSlide
              autoplay
              autoplaySpeed={3000}>
              {data?.data?.map((blog, index) => (
                <Link to={paths.news.detail({ uuid: blog.uuid }).$} className="relative" key={index}>
                  <div className="absolute bottom-0 right-0 left-0 w-full bg-black bg-opacity-40 flex flex-col py-2 px-4">
                    <h3 className="text-white font-semibold text-lg capitalize text-ellipsis line-clamp-1">{blog.title}</h3>
                    <span className="text-white text-xs capitalize line-clamp-2 text-ellipsis" dangerouslySetInnerHTML={{ __html: decodeURIComponent(blog.content) }}></span>
                    <Link to={paths.news.detail({ uuid: blog.uuid }).$} className="text-white">See More</Link>
                  </div>
                  <img
                    key={index}
                    src={imageResizerDimension(blog.image_cover, 600, "h")}
                    className="flex max-h-full w-full object-cover aspect-square"
                    onClick={() => navigate(paths.news.detail({ uuid: blog.uuid }).$)}
                  />
                </Link>
              ))}
            </Carousel>
          </div>
          <div className="md:col-span-7 col-span-12 p-2 bg-gray-100 rounded-r-xl flex md:flex-col flex-row justify-between">
            {data?.data?.map((blog, index) => (
              <div key={index} className="flex flex-row h-16 overflow-hidden rounded-xl items-center">
                <div className="h-full aspect-square">
                  <img
                    src={imageResizerDimension(blog.image_cover, 220, "h")}
                    className={`w-full object-cover aspect-square cursor-pointer border-4 rounded-xl hover:border-[#EBCE56] ${carouselActiveIndex == index ? '!border-[#EBCE56]' : 'border-emerald-800'}`}
                    onClick={() => sliderRef.current?.goTo(index)}
                  />
                </div>
                <div className="w-full ml-2 md:flex flex-col hidden">
                  <h3 className="text-sm font-semibold text-emerald-800 text-ellipsis line-clamp-1">{blog.title}</h3>
                  <span className="line-clamp-1 text-ellipsis text-gray-500 text-[11px] font-light">
                    <span dangerouslySetInnerHTML={{ __html: decodeURIComponent(decodeURIComponent(blog.content)) }}></span>
                  </span>
                  <p className="text-gray-500 text-[11px] font-light">{moment(blog.createdAt).format('DD MMM YYYY')} By {blog.author}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="col-span-12 mt-4 xl:mt-8">
            <span className="text-emerald-800 font-semibold text-lg">LATEST <span className="font-bold">NEWS</span></span>
            <div className="col-span-12 grid grid-cols-12 overflow-scroll gap-3 mt-2 rounded-xl">
              {data?.data?.map((blog, index) => (
                <Link to={paths.news.detail({ uuid: blog.uuid }).$} key={index} className="flex flex-row md:col-span-4 col-span-12 items-center overflow-hidden rounded-xl border border-emerald-800">
                  <img
                    src={imageResizerDimension(blog.image_cover, 220, "h")}
                    className="flex w-16 object-cover aspect-square m-2 rounded-lg"
                    onClick={() => navigate(paths.news.detail({ uuid: blog.uuid }).$)}
                  />
                  <div className="w-full ml-2">
                    <h3 className="text-sm font-semibold text-emerald-800 text-ellipsis line-clamp-1">{blog.title}</h3>
                    <span className="line-clamp-1 text-ellipsis text-gray-500 text-[11px] font-light w-full">
                      <span dangerouslySetInnerHTML={{ __html: decodeURIComponent(decodeURIComponent(blog.content)) }}></span>
                    </span>
                    <p className="text-gray-500 text-[11px] font-light">{moment(blog.createdAt).format('DD MMM YYYY')} By {blog.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </FadeAnimation>
        <FadeAnimation className="col-span-4 hidden md:flex flex-col space-y-2" direction="up">
          <span className="text-emerald-800 font-semibold text-lg">FEATURED <span className="font-bold">GALLERY</span></span>
          {galleryData?.data?.map((gallery, index) => (
            <div
              key={index}
              className="flex flex-row overflow-hidden h-fit rounded-xl border p-2 slide-in-top hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                if (!!gallery.album_uuid && !!gallery.uuid) {
                  navigate(paths.galleries.detail({ id: gallery.album_uuid  || "", image: gallery.uuid || "" }).$)
                }
                if (!!gallery.product_uuid) {
                  navigate(paths.shop.detail({ uuid: gallery.product_uuid || "" }).$)
                }
                if (!!gallery.blog_uuid) {
                  navigate(paths.news.detail({ uuid: gallery.blog_uuid || "" }).$)
                }
                if (!!gallery.match_uuid) {
                  navigate(paths.tournament.match({ matchUuid: gallery.match_uuid || "" }).$)
                }
                if (!!gallery.tournament_uuid) {
                  navigate(paths.tournament.index({ uuid: gallery.tournament_uuid || "" }).$)
                }
              }}>
              <img
                src={imageResizerDimension(gallery.link, 220, "h")}
                className="h-full !w-16 min-w-16 rounded-md object-cover !aspect-square"
                onClick={() => navigate(paths.galleries.detail({ id: gallery.uuid || "" }).$)}
              />
              <div className="flex flex-col w-full justify-center ml-2">
                <h3 className="text-sm font-semibold text-emerald-800 text-ellipsis line-clamp-2">{gallery.name}</h3>
                <div className="flex flex-row items-center mt-1 max-w-full text-gray-500 text-[11px] font-light">
                  <Lucide icon="Calendar" className="h-4 flex" />
                  <span className="flex flex-row ml-1 items-center justify-center !line-clamp-1 !text-ellipsis">{moment(gallery.featured_at).format('DD MMM YYYY')}&nbsp;by {gallery.name}</span>
                </div>
              </div>
            </div>
          ))}
        </FadeAnimation>
        <FadeAnimation className="col-span-12 mt-4 p-4 bg-emerald-800 rounded-3xl xl:mt-8" direction="up">
          <div className="text-[#fff] w-full text-center font-semibold text-xl mt-2 mb-4"><span className="border-b-white border-b-4 pb-1">FEATURED </span><span className="font-bold border-b-[#EBCE56] border-b-4 pb-1">NEWS</span></div>
          <div className="col-span-12 grid grid-cols-12 overflow-scroll md:gap-8 space-y-4 md:space-y-0 md:p-4 p-2 rounded-2xl">
            {data?.data?.filter((_, i) => i < 4)?.map((blog, index) => (
              <div key={index} className="flex flex-col md:col-span-3 col-span-12 items-center overflow-hidden rounded-2xl border border-emerald-800 bg-[#EBCE56]">
                <img
                  src={imageResizerDimension(blog.image_cover, 220, "h")}
                  className="flex w-full object-cover aspect-video rounded-lg"
                  onClick={() => navigate(paths.news.detail({ uuid: blog.uuid }).$)}
                />
                <div className="w-full px-4 py-2">
                  <h3 className="text-lg font-semibold text-emerald-800 text-ellipsis line-clamp-1">{blog.title}</h3>
                  <span className="line-clamp-1 text-ellipsis text-gray-800 text-[11px] font-light w-full">
                    <span dangerouslySetInnerHTML={{ __html: decodeURIComponent(decodeURIComponent(blog.content)) }}></span>
                  </span>
                  <p className="text-gray-600 text-[11px] font-light">{moment(blog.createdAt).format('DD MMM YYYY')} By {blog.author}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeAnimation>
        <FadeAnimation className="col-span-12 sm:col-span-8">
          <span className="text-emerald-800 font-semibold text-lg uppercase">Seventy <span className="font-bold">Five's</span> Feeds</span>
          <div className="col-span-12 grid grid-cols-12 gap-4 sm:gap-6 mt-2 rounded-xl">
            {data?.data?.map((image, index) => (
              <Link to={paths.news.detail({ uuid: image.uuid }).$} key={index} className="flex flex-row col-span-12 rounded-xl">
                <img
                  src={imageResizerDimension(image.image_cover, 220, "h")}
                  className=" object-cover relative h-24 aspect-video rounded-xl"
                />
                <div className="flex flex-col w-full justify-center ml-2">
                  <h3 className="text-lg font-semibold text-emerald-800 text-ellipsis line-clamp-2 capitalize mt-2">{image.title}</h3>
                  <span className="text-gray-500 text-[11px] font-light flex flex-row line-clamp-1 text-ellipsis items-center">
                    <Lucide icon="Calendar" className="h-4 flex mr-1" />
                    {moment(image.createdAt ? image.createdAt : '').format('DD MMM YYYY')} By {image.author}</span>
                </div>
              </Link>
            ))}
          </div>
        </FadeAnimation>
        <FadeAnimation className="col-span-12 sm:col-span-4 border border-emerald-800 rounded-2xl p-4">
          <div className="col-span-12 grid grid-cols-12 gap-4 sm:gap-6 mt-2 rounded-xl">
            <div className="flex flex-row col-span-12 rounded-xl">
              {igReel("https://www.instagram.com/reel/DKd-ebIBnIs/")}
            </div>
            {data?.data?.map((image, index) => (
              <Link to={paths.news.detail({ uuid: image.uuid }).$} key={index} className="flex flex-row col-span-12 rounded-xl">
                <img
                  src={imageResizerDimension(image.image_cover, 220, "h")}
                  className=" object-cover relative h-24 aspect-video rounded-xl"
                />
                <div className="flex flex-col w-full justify-center ml-2">
                  <h3 className="text-sm font-semibold text-emerald-800 text-ellipsis line-clamp-2 capitalize mt-2">{image.title}</h3>
                  <span className="text-gray-500 text-[11px] font-light flex flex-row line-clamp-1 text-ellipsis items-center">
                    <Lucide icon="Calendar" className="h-4 flex mr-1" />
                    {moment(image.createdAt ? image.createdAt : '').format('DD MMM YYYY')} By {image.author}</span>
                </div>
              </Link>
            ))}
          </div>
        </FadeAnimation>
      </LayoutWrapper>
    </>
  )
}