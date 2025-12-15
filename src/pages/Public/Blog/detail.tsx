import LayoutWrapper from "@/components/LayoutWrapper";
import { PublicBlogApiHooks } from "./api";
import { useNavigate, useParams } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import { Breadcrumb, Divider } from "antd";
import moment from "moment";
import Lucide from "@/components/Base/Lucide";
import { imageResizerDimension } from "@/utils/helper";
import { FadeAnimation } from "@/components/Animations";


export const PublicNewsDetail = () => {
  const navigate = useNavigate();
  const { uuid } = useRouteParams(paths.news.detail);

  const { data } = PublicBlogApiHooks.useGetBlogDetail(
    {
      params: {
        uuid: uuid || ""
      }
    }
  );
  const { data: newsData } = PublicBlogApiHooks.useGetBlogFeatured(
    {
      queries: {
        limit: 7
      }
    }, {
    enabled: !!uuid || !!data?.data?.uuid
  }
  );

  const breadcrumbItems = [
    {
      title: "Home",
      href: "/"
    },
    {
      title: "News",
      href: "/news"
    },
    ...(data?.data?.tags?.length ? [{
      title: `#${data.data.tags.find((tag, i) => i == 0)?.name}`,
      href: paths.news.tags({ tag: data.data.tags.find((tag, i) => i == 0)?.name || "" }).$,
    }] : []),
    {
      title: data?.data?.title,
      href: "/news/detail/:uuid"
    }
  ];

  const content = decodeURIComponent(data?.data?.content || "")?.split("<p>").map((item, index) => {
    if (index == 1) {
      return `<span class='font-semibold'>(${moment(data?.data?.createdAt).format('DD/MM/YYYY')})</span>&nbsp;` + item;
    }
    return item
  }).join("<p>");

  return (
    <>
      <LayoutWrapper className="grid grid-cols-12 gap-4 sm:gap-8 mt-4 sm:mt-8 text-primary">
        <FadeAnimation className="col-span-12 md:col-span-8">
          {/* breate breadcumbs */}
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-4xl font-bold mt-4 mb-2 text-emerald-800">{data?.data?.title}</h1>
          <p className="text-gray-500 text-sm font-light flex flex-row items-center border-t border-b border-emerald-800 border-opacity-10 py-2.5 mt-4"><Lucide icon="Calendar" className="w-4 h-4" />&nbsp;{moment(data?.data?.createdAt).format('DD MMM YYYY')} By {data?.data?.author}</p>
          <div className="mt-4">
            <img
              src={imageResizerDimension(data?.data?.image_cover || "", 600, "h")}
              className="w-full aspect-square object-cover rounded-xl"
            />
          </div>
          <div className="mt-4 text-gray-800 leading-7 inline-flex text-base">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
          <Divider className="w-full border-emerald-800 flex" />
        </FadeAnimation>
        <FadeAnimation className="col-span-12 md:col-span-4 md:flex flex-col space-y-2" direction="down">
          <span className="text-emerald-800 font-semibold text-xl md:hidden flex uppercase">Featured&nbsp;<span className="font-bold">NEWS</span></span>
          {newsData?.data?.map((blog, index) => (
            <div key={index} className="flex flex-row overflow-hidden h-fit rounded-xl border p-2 slide-in-top">
              <img
                src={imageResizerDimension(blog.image_cover, 220, "h")}
                className="h-20 rounded-md object-cover aspect-video"
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
      </LayoutWrapper>
    </>
  );
};