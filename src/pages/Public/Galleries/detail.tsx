import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import LayoutWrapper from "@/components/LayoutWrapper";
import { FadeAnimation } from "@/components/Animations";
import { PublicGalleryApiHooks } from "./api";
import { Breadcrumb, Image } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { imageResizer, imageResizerDimension } from "@/utils/helper";
import ImagePreview from "@/components/ImagePreview/ImagePreview";
import Lucide from "@/components/Base/Lucide";
import moment from "moment";
import { AlbumImages } from "./components/AlbumImages";

export const PublicGalleriesDetail = () => {
  const queryParams = useRouteParams(paths.galleries.detail);
  const navigate = useNavigate();
  const { data } = PublicGalleryApiHooks.useGetGalleryDetailAlbum(
    {
      params: {
        uuid: queryParams.id
      },
      queries: {
        image: queryParams.image
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

  const breadcrumbItems = [
    {
      title: "Home",
      href: "/"
    },
    {
      title: "Galleries",
      href: paths.galleries.index
    },
    ...(data?.data?.tags?.length ? [{
      title: `#${data.data.tags.find((tag, i) => i == 0)?.name}`,
      href: paths.news.tags({ tag: data.data.tags.find((tag, i) => i == 0)?.name || "" }).$,
    }] : []),
    {
      title: data?.data?.name || "",
      href: "#"
    }
  ];
  return (
    <LayoutWrapper className="grid grid-cols-12 gap-4 sm:gap-8 mt-4 sm:mt-8 min-h-[calc(100vh-300px)]">
      <FadeAnimation className="col-span-12 md:col-span-8 flex flex-col gap-2">
        <div className="h-fit">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-4xl font-bold mt-4 mb-2 text-emerald-800">{data?.data?.name}</h1>
          <div className="flex flex-row items-center text-gray-500 border-t border-b border-opacity-10 border-gray-500 py-2 text-xs">
            <Lucide icon="Calendar" className="h-4 mr-1" />
            <span className="text-sm">{moment(data?.data?.createdAt).format('DD MMM YYYY')} By {data?.data?.author}</span>
          </div>
          <p className="text-gray-500 text-sm my-2 capitalize">{data?.data?.description}</p>
        </div>
        <div className="grid grid-cols-12 gap-4">
          {data?.data?.galleries?.map((gallery, index) => (
            <div key={index} className="md:col-span-3 col-span-6 overflow-hidden aspect-square flex flex-col !p-0 !m-0 shadow-lg bg-gray-100 rounded-lg">
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
        </div>
      </FadeAnimation>
      <FadeAnimation className="md:col-span-4 col-span-12 flex flex-col space-y-4">
        <span className="text-emerald-800 font-semibold text-xl  flex">OTHER <span className="font-bold">&nbsp;ALBUMS</span></span>
        {albumsData?.data?.map((gallery, index) => (
          <Link key={index} to={paths.galleries.detail({ id: gallery.uuid || "" }).$} className="flex flex-row overflow-hidden h-fit rounded-xl bg-gray-100 shadow-lg p-3 slide-in-top hover:bg-gray-200 cursor-pointer">
            <AlbumImages
              className="w-24 mr-2"
              image1={gallery.media?.link || ""}
              image2={gallery.galleries?.[0].link || ""}
              image3={gallery.galleries?.[1].link || ""}
            />
            <div className="flex flex-col w-full justify-center ml-2">
              <h3 className="text-sm font-semibold text-emerald-800 text-ellipsis line-clamp-2">{gallery.name}</h3>
              <div className="flex flex-row items-center mt-1 max-w-full text-gray-500 text-[11px] font-light">
                <Lucide icon="Calendar" className="h-4 flex" />
                <span className="flex flex-row ml-1 items-center justify-center !line-clamp-1 !text-ellipsis">{moment(gallery.createdAt).format('DD MMM YYYY')}&nbsp;by {gallery.author}</span>
              </div>
            </div>
          </Link>
        ))}
      </FadeAnimation>
    </LayoutWrapper>
  );
};