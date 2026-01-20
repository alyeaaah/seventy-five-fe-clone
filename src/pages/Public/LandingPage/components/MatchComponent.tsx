import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import { Carousel } from "antd";
import { CarouselRef } from "antd/es/carousel";
import Title from "antd/es/typography/Title";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HTMLProps, useRef } from "react";
import moment from "moment";
import { PublicTournamentApiHooks } from "../../Tournament/api";
import { NestedImage } from "@/components/NestedImage";
import { Link } from "react-router-dom";
import { paths } from "@/router/paths";

export const UpcomingMatch = ({ className }: HTMLProps<HTMLDivElement>) => {
  const breakpoint = useBreakpoint()
  const getSlideBreakpoint = () => {
    if (breakpoint.xxl) return 4;
    if (breakpoint.xl) return 3;
    if (breakpoint.lg) return 2;
    if (breakpoint.md) return 1;
    if (breakpoint.sm) return 1;
    if (breakpoint.xs) return 1;
    return 4;
  };
  const upcomingMatchRef = useRef<CarouselRef>(null);
  const { data } = PublicTournamentApiHooks.useGetUpcomingMatch();
  return (
    <div className={className}>
      <Title level={4} className="!text-emerald-800 p-4 flex flex-row items-center justify-between !mb-0">
        <div className='flex flex-row items-center uppercase'>
          Upcoming <span className="font-bold ml-1">Match</span>
        </div>
        <div className="flex flex-row justify-end items-center">
          <Button type="button" className="!text-emerald-800 !border-none shadow-none focus:ring-0 hover:animate-pulse" size="sm" onClick={() => upcomingMatchRef.current?.prev()}>
            <ChevronLeft />
          </Button>
          <Button type="button" className="!text-emerald-800 !border-none shadow-none focus:ring-0 hover:animate-pulse" size="sm" onClick={() => upcomingMatchRef.current?.next()}>
            <ChevronRight />
          </Button>
        </div>
      </Title>
      {!data?.data || data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Lucide icon="Calendar" className="h-16 w-16 text-emerald-800/60 mb-4" />
          <h3 className="text-emerald-800 text-lg font-medium mb-2">No Upcoming Matches</h3>
          <p className="text-emerald-800/80 text-sm text-center">There are currently no upcoming matches scheduled. Check back later!</p>
        </div>
      ) : (
        <Carousel autoplay ref={upcomingMatchRef} autoplaySpeed={6000} slidesToShow={getSlideBreakpoint()} slidesPerRow={1} className=''>
          {data?.data?.map((item, idx) => (
            <Link key={idx} className='pb-2 px-2' to={paths.challenger.match({ matchUuid: item.uuid || "" }).$}>
              <div className='flex flex-col justify-center items-center shadow-md rounded-3xl bg-gray-200 mr-0 lg:mr-2 px-2'>
                <div className='flex flex-row justify-center items-center my-2 text-gray-500 text-xs'>
                  <Lucide icon='MapPin' className='w-6 h-4' /> <span className="text-ellipsis line-clamp-1">{item.court_field?.court?.name && `${item.court_field?.court?.name} - ${item.court_field?.name}`}</span>
                </div>
                <div className="flex bg-white rounded-full justify-between p-1 h-12 w-full">
                  <NestedImage players={item.home_team?.players?.map((player) => ({
                    media_url: player.media_url || '',
                    name: player.name || '',
                    uuid: player.uuid
                  })) || []} />
                  <div className='flex  text-emerald-800 items-center'>
                    <span className='text-2xl font-semibold'>VS</span>
                  </div>
                  <NestedImage players={item.away_team?.players?.map((player) => ({
                    media_url: player.media_url || '',
                    name: player.name || '',
                    uuid: player.uuid
                  })) || []} />
                </div>
                <div className='flex flex-row justify-between px-4 py-1 capitalize w-full text-xs'>
                  <div className="flex flex-col justify-start">
                    {item.home_team?.players?.map((player, idx) => (
                      <span key={idx} className="line-clamp-1">{player.name}</span>
                    ))}
                  </div>
                  <div className="flex flex-col justify-end">
                    {item.away_team?.players?.map((player, idx) => (
                      <span key={idx} className="text-end line-clamp-1">{player.name}</span>
                    ))}
                  </div>
                </div>
                <div className='flex flex-row justify-center px-6 capitalize w-full text-xs py-2'>
                  <span className="text-emerald-800 font-semibold border px-2 py-1 border-emerald-800 rounded-full">{moment(item.date).format('ddd, DD MMM YYYY HH:mm')}</span>
                </div>
              </div>
            </Link>
          ))}
        </Carousel>
      )}
    </div>
  );
};