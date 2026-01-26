import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import Image from "@/components/Image";
import { PublicBlogApiHooks } from "@/pages/Public/Blog/api";
import { Typography } from "antd";
import { ChevronRight } from "lucide-react";
import { HTMLProps } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SsrProvider } from "../SSR/SsrProvider";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";
import { paths } from "@/router/paths";
const { Title, Text } = Typography;

interface LatestNewsProps extends HTMLProps<HTMLDivElement> {
  dehydratedState?: unknown; // Or use DehydratedState from @tanstack/react-query
}

export const LatestNews = ({ className, dehydratedState }: LatestNewsProps) => {
  // const navigate = useNavigate();
  const breakpoints = useBreakpoint();
  const getThumbnailBreakpoint = () => {
    // if breakpoint was 2xl use 6 and md use 6 else use 4
    if (breakpoints.xxl) return 6;
    if (breakpoints.xl) return 4;
    if (breakpoints.lg) return 4;
    if (breakpoints.md) return 6;
    return 4;
  };
  const { data } = PublicBlogApiHooks.useGetBlogFeatured({
    queries: {
      limit: getThumbnailBreakpoint()
    }
  });

  return (
    // <SsrProvider dehydratedState={dehydratedState}>
    <div className={className}>
      <Title level={4} className="!text-emerald-800 pl-4 py-0 flex flex-row items-center justify-between !mb-0">
        <div className='flex flex-row items-center uppercase'>
          LATEST<span className="font-bold ml-1">UPDATE</span>
        </div>
        <Button
          type="button"
          className="flex flex-row justify-end items-center !text-emerald-800 !border-none shadow-none focus:ring-0 hover:animate-pulse font-semibold"
        >
          <span>See More</span>
          <ChevronRight />
        </Button>
      </Title>
      {!data?.data || data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Lucide icon="Newspaper" className="h-16 w-16 text-emerald-800/60 mb-4" />
          <h3 className="text-emerald-800 text-lg font-medium mb-2 text-center">No Latest News</h3>
          <p className="text-emerald-800/80 text-sm text-center">There are currently no news updates available. Check back later!</p>
        </div>
      ) : (
        <div className='grid grid-cols-12 gap-6 w-full line-clamp-2'>
          {data?.data?.map((item, idx) => (
            <Link key={idx} className='col-span-12 sm:col-span-6 2xl:col-span-4 flex flex-col mt-2' to={paths.news.detail({ uuid: item.uuid || "" }).$}>
              <Image
                src={item.galleries?.length ? item.galleries[0].link : undefined}
                className='w-full aspect-video object-cover rounded-xl'
              />
              <div className=' tracking-tight py-1 text-emerald-800 px-2 font-semibold capitalize text-ellipsis line-clamp-2'>
                {item.title}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
    // </SsrProvider>
  );
};