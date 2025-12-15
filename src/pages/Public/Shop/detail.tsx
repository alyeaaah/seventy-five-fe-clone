import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import LayoutWrapper from "@/components/LayoutWrapper";
import { FadeAnimation } from "@/components/Animations";

import { Breadcrumb, Carousel } from "antd";
import { CarouselRef } from "antd/es/carousel";
import { Link, useNavigate } from "react-router-dom";
import Lucide from "@/components/Base/Lucide";
import { PublicShopApiHooks } from "./api";
import Button from "@/components/Base/Button";
import { useRef, useState } from "react";
import { FormInput, InputGroup } from "@/components/Base/Form";
import { useCart } from "@/utils/cart";
import { useAtomValue } from "jotai";
import { userAtom } from "@/utils/store";
import { FloatingCartButton } from "@/components/FloatingCartButton";
import { priceRender } from "@/utils/helper";

export const PublicShopDetail = () => {
  const queryParams = useRouteParams(paths.shop.detail);
  const userData = useAtomValue(userAtom);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedDetail, setSelectedDetail] = useState(0)
  const [carouselActiveIndex, setCarouselActiveIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => setQuantity(quantity + 1);
  const handleDecrease = () => setQuantity(quantity > 1 ? quantity - 1 : 1);
  const sliderRef = useRef<CarouselRef>(null);
  const carouselRef = useRef<CarouselRef>(null);
  const { data } = PublicShopApiHooks.useGetMerchandiseDetail(
    {
      params: {
        uuid: queryParams.uuid
      },
    }
  );

  const { data: featuredMerchData } = PublicShopApiHooks.useGetFeaturedMerchandise(
    {
      queries: {
        limit: 7
      }
    }
  );

  const breadcrumbItems = [
    {
      title: "Home",
      href: "/"
    },
    {
      title: "Shop",
      href: paths.shop.index
    },
    {
      title: data?.data?.name || "",
      href: "#"
    }
  ];
  return (
    <LayoutWrapper className="grid grid-cols-12 gap-4 sm:gap-8 mt-4 sm:mt-8 min-h-[calc(100vh-300px)]">
      <FadeAnimation className="col-span-12 flex flex-col gap-2">
        <div className="h-fit">
          <Breadcrumb items={breadcrumbItems} />
          {/* MD Screen Size Start */}
          <div className="hidden md:grid grid-cols-12 gap-8 mt-4">
            <div className="col-span-7 flex flex-row items-center space-x-4 relative">
              <div className="flex flex-col items-center justify-center border min-w-48 w-48 p-4 bg-gray-100 rounded-3xl space-y-4">
                {data?.data?.galleries?.map((gallery, index) => (
                  <img
                    key={index}
                    src={gallery.link}
                    className={`w-full aspect-square object-cover border-4 ${index === carouselActiveIndex ? "border-[#EBCE56]" : "border-gray-200"} rounded-3xl hover:border-[#EBCE56] hover:cursor-pointer `}
                    alt={gallery.name}
                    onClick={() => {
                      if (sliderRef.current) {
                        sliderRef.current.goTo(index, false);
                        setCarouselActiveIndex(index);
                      }
                    }}
                  />
                ))} 
              </div>
              <div className=" relative w-full aspect-square object-cover border border-[#EBCE56] rounded-2xl overflow-hidden">
              <Carousel
                ref={sliderRef}
                slidesToScroll={1}
                slidesToShow={1}
                afterChange={setCarouselActiveIndex}
                swipeToSlide
                autoplay
                autoplaySpeed={3000}
              >
                {data?.data?.galleries?.map((gallery, index) => (
                  <div className="relative" key={index}>
                    <img key={index} src={gallery.link} className="w-full aspect-square object-cover rounded-2xl" alt={gallery.name} />
                  </div>
                ))}
              </Carousel>
              </div>
            </div>
            <div className="col-span-5">
              <h1 className="text-4xl font-bold mt-4 mb-2 text-gray-700">{data?.data?.name}</h1>
              <h2 className="text-xl font-medium mt-2 mb-2 text-emerald-800">IDR {Intl.NumberFormat('id-ID').format(data?.data?.details[selectedDetail].price || 0)} <span className="text-gray-500 text-xs capitalize py-1 w-fit">/{data?.data?.unit}</span></h2>
              <div className="text-gray-500 text-sm mb-1">Variants:</div>
              <div className="flex flex-row items-center justify-stretch space-x-2">
                {data?.data?.details.map((detail, index) => (
                  <Button key={index} className={`flex items-center justify-center border font-normal rounded-lg p-2 hover:border-[#EBCE56] hover:text-[#EBCE56] min-w-10 ${selectedDetail === index ? "border-emerald-800 text-emerald-800" : "border-gray-200 text-gray-400"}`} onClick={() => setSelectedDetail(index)}>
                    {detail.size}
                  </Button>
                ))}
              </div>
              <div className={`text-sm my-2 ${data?.data?.details[selectedDetail]?.quantity || 0 > 0 ? "text-gray-500" : "text-red-500"}`}>
                {data?.data?.details[selectedDetail]?.quantity || 0 > 0 ? "Stock: " : "Out of Stock"}
                {data?.data?.details[selectedDetail]?.quantity || 0 > 0 ? Intl.NumberFormat('id-ID').format(data?.data?.details[selectedDetail]?.quantity || 0) : ""}
              </div>
              <div className="flex items-center space-x-4 text-gray-800 mt-2">
                <div className="flex items-center space-x-2">
                  <InputGroup>
                    <InputGroup.Text
                      className="flex items-center justify-center cursor-pointer active:bg-opacity-50 hover:bg-slate-200"
                      onClick={handleDecrease}
                    >
                      <Lucide icon="Minus" className="w-4 h-4" />
                    </InputGroup.Text>
                    <FormInput type="number"
                      value={quantity}
                      onChange={(e) => {
                        const productStock = data?.data?.details[selectedDetail]?.quantity || 0;
                        setQuantity(Number(e.target.value) > productStock ? productStock : Number(e.target.value))
                      }}
                      className="text-lg font-semibold w-16 text-center"
                    />
                    <InputGroup.Text
                      className="text-emerald-800 flex items-center justify-center cursor-pointer active:bg-opacity-50 hover:bg-slate-200"
                      defaultValue={0}
                      onClick={handleIncrease}
                    >
                      <Lucide icon="Plus" className="w-4 h-4" />
                    </InputGroup.Text>
                  </InputGroup>
                </div>
                <Button
                  className="bg-emerald-800 text-white py-2 px-6 rounded-md hover:bg-yellow-500 !h-12"
                  disabled={quantity <= 0}
                  onClick={() => {
                    if (!!data?.data) {
                      addToCart(data.data, data.data.details[selectedDetail].uuid || "", quantity);
                      setQuantity(1);
                    }
                  }}
                >
                  ADD TO CART
                </Button>
              </div>
              <p className="text-gray-500 text-sm my-2 capitalize" dangerouslySetInnerHTML={{ __html: decodeURIComponent(data?.data?.description || "") }}></p>
            </div>
          </div>
          {/* MD Screen Size End */}
          {/* SM Screen Size Start */}
          <div className="grid grid-cols-12 gap-4 w-full md:hidden">
            <Carousel
              slidesToShow={1}
              slidesPerRow={1}
              ref={carouselRef}
              afterChange={setCarouselActiveIndex}
              rootClassName="col-span-12 mt-4 shadow-lg rounded-2xl"
            >
              {data?.data?.galleries?.map((gallery, index) => (
                <img key={index} src={gallery.link} className="w-full aspect-square object-cover rounded-2xl" alt={gallery.name} />
              ))}
            </Carousel>
            <div className="col-span-12">
              <div className="flex flex-row items-center justify-center border min-h-16 h-24 p-2 bg-gray-100 rounded-3xl space-x-2">
                {data?.data?.galleries?.map((gallery, index) => (
                  <img
                    key={index}
                    src={gallery.link}
                    className={`h-full aspect-square object-cover border-2 ${index === carouselActiveIndex ? "border-[#EBCE56]" : "border-gray-200"} rounded-xl hover:border-[#EBCE56] hover:cursor-pointer `}
                    alt={gallery.name}
                    onClick={() => {
                      if (carouselRef.current) {
                        carouselRef.current.goTo(index, false);
                        setCarouselActiveIndex(index);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="col-span-12">
              <h1 className="text-2xl font-bold mt-4 mb-2 text-gray-700">{data?.data?.name}</h1>
              <h2 className="text-xl font-medium mt-2 mb-2 text-emerald-800">IDR {Intl.NumberFormat('id-ID').format(data?.data?.details[selectedDetail].price || 0)} <span className="text-gray-500 text-xs capitalize py-1 w-fit">/{data?.data?.unit}</span></h2>
              <div className="text-gray-500 text-sm mb-1">Variants:</div>
              <div className="flex flex-row items-center justify-stretch space-x-2">
                {data?.data?.details.map((detail, index) => (
                  <Button key={index} className={`flex items-center justify-center border font-normal rounded-lg p-2 hover:border-[#EBCE56] hover:text-[#EBCE56] min-w-10 ${selectedDetail === index ? "border-emerald-800 text-emerald-800" : "border-gray-200 text-gray-400"}`} onClick={() => setSelectedDetail(index)}>
                    {detail.size}
                  </Button>
                ))}
              </div>
              <div className="flex items-center space-x-4 text-gray-800 mt-2">
                <div className="flex items-center space-x-2">
                  <InputGroup>
                    <InputGroup.Text
                      className="flex items-center justify-center cursor-pointer active:bg-opacity-50 hover:bg-slate-200"
                      onClick={handleDecrease}
                    >
                      <Lucide icon="Minus" className="w-4 h-4" />
                    </InputGroup.Text>
                    <FormInput type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="text-lg font-semibold w-16 text-center"
                    />
                    <InputGroup.Text
                      className="text-emerald-800 flex items-center justify-center cursor-pointer active:bg-opacity-50 hover:bg-slate-200"
                      defaultValue={0}
                      onClick={handleIncrease}
                    >
                      <Lucide icon="Plus" className="w-4 h-4" />
                    </InputGroup.Text>
                  </InputGroup>
                </div>
                <Button
                  className="bg-emerald-800 text-white py-2 px-6 rounded-md hover:bg-yellow-500 w-full !h-12"
                  disabled={quantity <= 0}
                  onClick={() => {
                    if (!!data?.data) {
                      addToCart(data.data, data.data.details[selectedDetail].uuid || "", quantity);
                      setQuantity(1);
                    }
                  }}
                >
                  ADD TO CART
                </Button>
              </div>
              <p className="text-gray-500 text-sm my-2 capitalize" dangerouslySetInnerHTML={{ __html: decodeURIComponent(data?.data?.description || "") }}></p>
            </div>
          </div>
          {/* SM Screen Size End */}
        </div>
        {/* <div className="grid grid-cols-12 gap-4">
          {data?.data?.galleries?.map((gallery, index) => (
            <div key={index} className="col-span-3  overflow-hidden aspect-square flex flex-col !p-0 !m-0 shadow-lg bg-gray-100 rounded-lg">
              <div className="rounded-lg overflow-hidden">
                <ImagePreview
                  items={data?.data?.galleries?.map(g => g.link) || []}
                  preview={{
                    defaultCurrent: index,
                    title: data?.data?.name || "",
                    
                  }}
                  description={data?.data?.galleries?.map(g => g.name) || []}
                  className="w-full h-full aspect-square rounded-xl"
                >
                  <Image src={imageResizer(gallery?.link || "", 300)} className="w-full h-full object-cover" />
                </ImagePreview>
              </div>
              <div className="p-2">
                <h3 className="capitalize text-center text-sm font-medium text-emerald-800 line-clamp-2 text-ellipsis">{gallery.name}</h3>
              </div>
            </div>
          ))}
        </div> */}
      </FadeAnimation>
      <FadeAnimation className="col-span-12 flex flex-col space-y-4 my-24 relative">
        <span className="text-emerald-800 font-semibold text-xl flex">OTHER <span className="font-bold">&nbsp;PRODUCTS</span></span>
        <div className="flex flex-row gap-4 border-t border-emerald-800 relative h-fit overflow-hidden">
          <div className="flex flex-row gap-4 overflow-scroll z-[1] py-6 scrollbar-hidden">
          {featuredMerchData?.data?.concat(featuredMerchData?.data).map((item, index) => (
            <Link key={index} to={paths.shop.detail({ uuid: item.uuid || "" }).$} className="flex flex-row overflow-hidden rounded-xl border hover:border-emerald-800 border-transparent  p-3  min-w-96 w-96 cursor-pointer hover:scale-100 transition-all duration-700">
              <div className="border !aspect-square p-1 mr-2 !h-28 rounded-lg bg-white">
              <img src={item.image_cover} className="w-full h-full object-cover rounded-md overflow-hidden" />
              </div>
              <div className="flex flex-col w-full justify-center ml-2">
                <h3 className="text-lg font-semibold text-emerald-800 text-ellipsis line-clamp-2 h-14 flex items-center">{item.name}</h3>
                <span className="text-emerald-800 font-semibold w-fit text-sm border border-emerald-800 rounded-md pr-1"><span className="font-semibold text-white bg-emerald-800 px-1 text-center rounded border border-emerald-800 items-center text-sm h-full">IDR</span>&nbsp;{priceRender(item.details.map(detail => detail.price))}</span>
                <Button className="bg-transparent text-emerald-800 text-xs !shadow-none !border-none !capitalize py-2 px-6 rounded-md hover:bg-transparent !h-8 justify-start text-start p-0">View Details</Button>
              </div>
            </Link>
          ))}
          </div>
        </div>
      </FadeAnimation>
      <FloatingCartButton />
    </LayoutWrapper>
  );
};