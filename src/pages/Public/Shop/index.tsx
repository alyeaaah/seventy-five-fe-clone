import LayoutWrapper from "@/components/LayoutWrapper";
import { FooterComponent } from "../LandingPage/components/FooterComponent";
import { Carousel, Divider } from "antd";
import { imageResizerDimension, priceRender } from "@/utils/helper";
import { Link, useNavigate } from "react-router-dom";
import Lucide from "@/components/Base/Lucide";
import { FadeAnimation } from "@/components/Animations";
import { useRef, useState } from "react";
import { CarouselRef } from "antd/es/carousel";
import { paths } from "@/router/paths";
import { PublicShopApiHooks } from "./api";
import { PublicGalleryApiHooks } from "../Galleries/api";
import { imgExclusiveTreasures } from "@/assets/images/staticImages";
import { FormInput, InputGroup } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import { LottieAnimation } from "@/components/LottieAnimation";
import Cart from '@/assets/images/illustrations/gif/cart.json'
import { useCart } from "@/utils/cart";
import ReactVisibilitySensor from "react-visibility-sensor";
import { FloatingCartButton } from "@/components/FloatingCartButton";

export const PublicShop = () => {
  const navigate = useNavigate();
  const sliderRef = useRef<CarouselRef>(null);
  const [carouselActiveIndex, setCarouselActiveIndex] = useState(0);
  const [isShowFloatingCart, setIsShowFloatingCart] = useState(false);
  const { getCartQty } = useCart();
  const [isClicked, setIsClicked] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [searchBox, setSearchBox] = useState({
    focus: false,
    hasValue: false
  });

  const { data: featuredItems } = PublicShopApiHooks.useGetFeaturedMerchandise(
    {
      queries: {
        limit: 7
      }
    }
  );
  const { data } = PublicGalleryApiHooks.useGetFeaturedGallery(
    {
      queries: {
        limit: 7
      }
    }
  );
  return (
    <>
      <LayoutWrapper className="grid grid-cols-12 gap-4 sm:gap-8 mt-4 sm:mt-8 min-h-[calc(100vh-300px)] pb-8">
        <FadeAnimation className="col-span-12">
          <div className="col-span-12 mb-0 bg-gray-100 rounded-t-xl">
            <Carousel
              ref={sliderRef}
              className="w-full aspect-[5/1] rounded-xl overflow-hidden flex justify-center items-center mb-0"
              slidesToScroll={1}
              slidesToShow={1}
              afterChange={setCarouselActiveIndex}
              swipeToSlide
              autoplay
              effect="fade"
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
          </div>
        </FadeAnimation>
        <FadeAnimation className="col-span-12 md:col-span-3 flex flex-col space-y-2 mt-4" direction="down">
          <ReactVisibilitySensor onChange={(isVisible: any) => {
            setIsShowFloatingCart(!isVisible);
          }}>
            <Link to={paths.shop.cart} className="col-span-12 flex items-center justify-between border-emerald-800 border rounded-lg pl-4">
              <span className="text-emerald-800 text-base">{getCartQty() > 0 ? `${getCartQty()} Item(s) added` : "Empty Cart"}</span>
              <Button className="bg-transparent text-white shadow-none border-none p-1">
                <div className="w-10 h-10 relative">
                  <LottieAnimation
                    animationData={Cart}
                    autoplay={true}
                    loop={false}
                    isClickToPauseDisabled={true}
                    isStopped={!isClicked} // Controls whether the animation is stopped
                    eventListeners={[
                      {
                        eventName: 'complete',
                        callback: () => {
                          setIsClicked(false); // Reset after the animation is done
                        },
                      },
                    ]}
                  />
                </div>
              </Button>
            </Link>
          </ReactVisibilitySensor>
          <div className="col-span-12 flex flex-col space-y-2 text-emerald-800 ">
            <div className="text-lg flex justify-between items-center rounded-lg">
              <InputGroup className= {`rounded-lg border border-emerald-800 border-opacity-20 overflow-hidden w-full ${searchBox.focus ? "!border-emerald-800 border-opacity-100" : ""} ${searchBox.hasValue ? "border-emerald-950 border-opacity-100" : ""}`}>
                <FormInput
                  onChange={(e) => setKeyword(e.target.value)}
                  value={keyword}
                  type="search"
                  name="keyword"
                  placeholder="Search"
                  className="text-emerald-800 border-none"
                  onFocus={() => setSearchBox({ focus: true, hasValue: keyword.length > 0 })}
                  onBlur={() => setSearchBox({ focus: false, hasValue: keyword.length > 0 })}
                />
                <InputGroup.Text className="p-0 w-12 h-12 text-emerald-800 flex items-center justify-center bg-transparent overflow-hidden">
                  <Lucide icon="Search" className="w-4 h-4" />
                </InputGroup.Text>
              </InputGroup>
            </div>
            <div className="text-lg py-2 hidden md:flex justify-between items-center rounded-lg hover:bg-emerald-800 hover:text-white cursor-pointer transition-all duration-700 px-4">Tops <Lucide icon="ChevronRight" /></div>
            <div className="text-lg py-2 hidden md:flex justify-between items-center rounded-lg hover:bg-emerald-800 hover:text-white cursor-pointer transition-all duration-700 px-4">Bottoms <Lucide icon="ChevronRight" /></div>
            <div className="text-lg py-2 hidden md:flex justify-between items-center rounded-lg hover:bg-emerald-800 hover:text-white cursor-pointer transition-all duration-700 px-4">Accessories <Lucide icon="ChevronRight" /></div>
          </div>
        </FadeAnimation>
        <FadeAnimation className="col-span-12 md:col-span-9 grid grid-cols-12 gap-0" direction="up">
          <div className="col-span-12 grid grid-cols-12 gap-4 md:p-4 rounded-b-xl">
            {(featuredItems?.data?.concat(featuredItems?.data || []))?.map((item, index) => (
              <Link
                key={index}
                to={paths.shop.detail({ uuid: item.uuid || "" }).$}
                className="flex flex-col col-span-12 md:col-span-3 overflow-hidden rounded-xl hover:border-emerald-800 md:border-white border-emerald-800 border group px-2 pt-2 relative">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={imageResizerDimension(item.image_cover, 220, "h")}
                    className={`flex h-full w-full object-contain aspect-square rounded-xl`}
                    onClick={() => sliderRef.current?.goTo(index)}
                  />
                </div>
                <div className="h-32 md:h-20 mt-2"></div>
                <div className="flex flex-col px-2 justify-center items-center h-32 absolute -bottom-10 left-0 right-0 rounded-md md:group-hover:-translate-y-12 -translate-y-12 md:translate-y-0 transition-all duration-500 overflow-hidden">
                  <div className="backdrop-blur flex flex-col justify-center items-center w-full pt-2">
                    <div className='h-1 mb-1 w-6 group-hover:animate-bounce bg-emerald-800'></div>
                    <span className="text-emerald-800 font-semibold text-base leading-4 text-center my-1 h-8 flex items-center justify-center">{item.name}</span>
                    <span className="text-emerald-800 font-medium text-xs border border-emerald-800 rounded pr-1"><span className="font-semibold text-white bg-emerald-800 px-1 text-center rounded">IDR</span>&nbsp;{priceRender(item.details.map(detail => detail.price))}</span>
                  </div>
                  <Button className="w-full mt-4 bg-emerald-800 rounded-lg !text-white" onClick={() => {
                    setIsClicked(true);
                    // navigate(paths.shop.detail({ uuid: item.uuid || "" }).$)
                  }}>
                    Add to Cart
                  </Button>
                </div>
              </Link>
            ))}
          </div>
          <div className="col-span-12 my-14">
            {/* <span className="text-emerald-800 font-semibold text-xl py-4 flex">LATEST <span className="font-bold">&nbsp;GAME</span></span> */}
            <div className="col-span-12 rounded-2xl relative bg-[#FF6716] max-h-48 h-48 ml-16">
              <div className="flex flex-col absolute -left-16 top-0 bottom-0 rounded-xl overflow-hidden h-full py-4 [text-shadow:0_2px_0px_0_rgba(0,0,0,1)] z-[1]">
                <img src={imgExclusiveTreasures} className="h-full rounded-xl" />
              </div>
              <div className="flex flex-row overflow-scroll gap-4 mt-2 py-4 z-[0] relative">
                <div className="min-h-40 max-h-40  min-w-fit mr-6 aspect-[1/4] flex-col flex opacity-0">
                </div>
                {(featuredItems?.data?.concat(featuredItems?.data || []))?.map((item, index) => (
                  <div key={index} className="flex flex-col h-40 min-w-40 max-w-40 shadow-lg p-2 bg-white overflow-hidden rounded-xl relative group">
                    <img src={item.image_cover} className="w-full aspect-square object-contain rounded-xl" />
                    <div className="flex flex-col p-2 justify-start items-center absolute group-hover:-translate-y-16 top-40 left-0 right-0 bg-white transition-all duration-500 aspect-square">
                      <span className="text-emerald-800 font-semibold text-sm text-center leading-4 line-clamp-2 text-ellipsis h-8 flex items-center justify-center">{item.name}</span>
                      <span className="text-[#EBCE56] bg-emerald-800 rounded px-2 font-semibold text-xs">IDR {priceRender([item.details[0].price])}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeAnimation>
        <FloatingCartButton position="left" visible={isShowFloatingCart} />
      </LayoutWrapper>

    </>
  )
}