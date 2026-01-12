import LayoutWrapper from "@/components/LayoutWrapper";
import { FooterComponent } from "../LandingPage/components/FooterComponent";
import { PublicGalleryApiHooks } from "./api";
import { Carousel, Image } from "antd";
import { CarouselRef } from "antd/es/carousel";
import { imageResizerDimension } from "@/utils/helper";
import { Link, useNavigate } from "react-router-dom";
import { PublicBlogApiHooks } from "../Blog/api";
import Lucide from "@/components/Base/Lucide";
import moment from "moment";
import { LandingPageApiHooks } from "../LandingPage/api";
import { FadeAnimation } from "@/components/Animations";
import { useRef, useState } from "react";
import { paths } from "@/router/paths";
import { AlbumImages } from "./components/AlbumImages";
import { LatestGame, SeventyFive } from "@/assets/images/illustrations/illustrations";


export const PublicGalleries = () => {
  const navigate = useNavigate();
  const sliderRef = useRef<CarouselRef>(null);
  const [carouselActiveIndex, setCarouselActiveIndex] = useState(0);

  const { data } = PublicGalleryApiHooks.useGetFeaturedGallery(
    {
      queries: {
        limit: 7
      }
    }
  );
  const { data: albumsData } = PublicGalleryApiHooks.useGetGalleryAlbums(
    {
      queries: {
        limit: 7
      }
    }
  );

  const { data: blogData } = PublicBlogApiHooks.useGetBlogFeatured(
    {
      queries: {
        limit: 9
      }
    }
  );
  return (
    <>
      <LayoutWrapper className="grid grid-cols-12 gap-4 sm:gap-8 mt-4 sm:mt-8 min-h-[calc(100vh-300px)]">
        <FadeAnimation className="md:col-span-8 col-span-12 grid grid-cols-12 gap-0" direction="up">
          <div className="col-span-12 mb-0 bg-gray-100 rounded-t-xl">
            {data?.data && <Carousel
              ref={sliderRef}
              className="w-full aspect-video rounded-xl overflow-hidden flex justify-center items-center mb-0"
              slidesToScroll={1}
              slidesToShow={1}
              afterChange={setCarouselActiveIndex}
              swipeToSlide
              autoplay
              autoplaySpeed={3000}>
              {data?.data?.map((image, index) => (
                <div className="relative" key={index}>
                  <div className="absolute bottom-0 right-0 left-0 w-full bg-black bg-opacity-40 flex flex-col py-2 px-4">
                    <h3 className="text-white font-semibold text-lg capitalize text-ellipsis line-clamp-1">{image.name}</h3>
                    <span className="text-white text-xs capitalize line-clamp-2 text-ellipsis">{image.description}</span>
                    <Link to={paths.galleries.detail({ id: image.uuid || "" }).$} className="text-white">See More</Link>
                  </div>
                  <img
                    key={index}
                    src={imageResizerDimension(image.link, 600, "h")}
                    className="flex max-h-full w-full object-cover aspect-video"
                    onClick={() => navigate(paths.galleries.detail({ id: image.uuid || "" }).$)}
                  />
                </div>
              ))}
            </Carousel>
            }
          </div>
          <div className="col-span-12 grid grid-cols-7 md:gap-2 gap-1 md:p-4 py-2 bg-gray-100 rounded-b-xl">
            {data?.data?.map((image, index) => (
              <div key={index} className="flex flex-col col-span-1 aspect-square overflow-hidden rounded-xl">
                <img
                  src={imageResizerDimension(image.link, 220, "h")}
                  className={`flex h-full w-full object-cover aspect-square cursor-pointer md:border-4 border-2 rounded-xl hover:border-[#EBCE56] ${carouselActiveIndex == index ? '!border-[#EBCE56]' : 'border-emerald-800'}`}
                  onClick={() => sliderRef.current?.goTo(index)}
                />
              </div>
            ))}
          </div>
          <div className="col-span-12 mt-4">
            {/* <span className="text-emerald-800 font-semibold text-xl py-4 flex">LATEST <span className="font-bold">&nbsp;GAME</span></span> */}
            <div className="col-span-12 rounded-3xl w-full relative bg-[#BE453E] mt-2">
              <div className="flex flex-col absolute left-0 top-8 [text-shadow:0_2px_0px_0_rgba(0,0,0,1)] z-[0]">
                <SeventyFive className="h-10 min-w-36 ml-10 -mb-5 z-[1]" />
                <LatestGame className="h-24 min-w-48 ml-4" />
              </div>
              <div className="flex flex-row !overflow-x-scroll scrollbar-hidden !w-full gap-4 pt-4 px-4 z-[4] relative">
                <div className="flex min-w-48"></div>
                {(data?.data?.length ?? 0) > 0 ? (
                  data?.data?.map((image, index) => (
                    <div key={index} className="flex flex-col min-w-40 aspect-square shadow-lg border-4 border-[#EBCE56] box-shadow-[0_0_10px_0_rgba(0,0,0,0.1)] overflow-hidden rounded-2xl">
                      <img
                        src={imageResizerDimension(image.link, 220, "h")}
                        className="flex h-full w-full object-cover aspect-square"
                        onClick={() => navigate(paths.galleries.detail({ id: image.uuid || "" }).$)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="min-w-80 w-full flex items-center justify-center py-8 pr-4">
                    <div className="flex flex-col items-center justify-center rounded-2xl px-6 py-4 text-center border border-white/20 bg-white/10 backdrop-blur">
                      <Lucide icon="Image" className="w-8 h-8 text-white" />
                      <div className="mt-2 text-white font-semibold">No gallery yet</div>
                      <div className="text-xs text-white/80 mt-1">Please check back later.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </FadeAnimation>
        <FadeAnimation className="col-span-4 hidden md:flex flex-col space-y-2" direction="down">
          {blogData?.data?.map((blog, index) => (
            <div key={index} className="flex flex-row overflow-hidden h-fit rounded-xl border p-2 slide-in-top">
              <Image
                src={imageResizerDimension(blog.image_cover, 220, "h")}
                className="h-full !w-16 min-w-16 rounded-md object-cover aspect-square"
                onClick={() => navigate(paths.news.detail({ uuid: blog.uuid || "" }).$)}
              />
              <div className="flex flex-col w-full justify-center ml-2">
                <h3 className="text-sm font-semibold text-emerald-800 text-ellipsis line-clamp-2">{blog.title}</h3>
                <div className="flex flex-row mt-1">
                  <p className="text-gray-500 text-[11px] font-light flex flex-row"><Lucide icon="Calendar" className="h-4" />{moment(blog.createdAt).format('DD MMM YYYY')}</p>
                  <p className="text-gray-500 text-[11px] font-light flex flex-row ml-1">by {blog.author}</p>
                </div>
              </div>
            </div>
          ))}
        </FadeAnimation>
        <FadeAnimation className="col-span-12">
          <span className="text-emerald-800 font-semibold text-xl uppercase flex py-4">Seventy <span className="font-bold">&nbsp;Five's&nbsp;</span> Albums</span>
          <div className="col-span-12 grid grid-cols-12 gap-6 sm:gap-8 mt-2 rounded-xl">
            {(albumsData?.data?.length ?? 0) > 0 ? (
              albumsData?.data?.map((image, index) => (
                <Link key={index} to={paths.galleries.detail({ id: image.uuid || "" }).$} className="flex flex-col col-span-12 sm:col-span-2 rounded-xl items-center">
                  <AlbumImages
                    className="w-full"
                    image1={image.media?.link || ""}
                    image2={image.galleries?.[0].link || ""}
                    image3={image.galleries?.[1].link || ""}
                  />
                  <div className="flex flex-col w-full justify-center">
                    <h3 className="text-sm font-semibold text-emerald-800 text-ellipsis line-clamp-2 capitalize mt-2">{image.name}</h3>
                    <span className="text-gray-500 text-[11px] font-light flex flex-row">{moment(image.createdAt).format('DD MMM YYYY')}</span>
                    <span className="text-gray-500 text-[11px] font-light flex flex-row">{moment(image.createdAt ? image.createdAt : '').format('DD MMM YYYY')} By {image.createdAt}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-12 w-full flex items-center justify-center py-12">
                <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 border border-emerald-800/10 px-6 py-6 text-center w-full">
                  <Lucide icon="Image" className="w-10 h-10 text-emerald-800" />
                  <div className="mt-2 text-emerald-800 font-semibold">No albums available</div>
                  <div className="text-xs text-gray-500 mt-1">Please check back later.</div>
                </div>
              </div>
            )}
          </div>
        </FadeAnimation>
        {/* <PartnersComponent className="col-span-12 mb-8" /> */}
      </LayoutWrapper>
    </>
  )
}