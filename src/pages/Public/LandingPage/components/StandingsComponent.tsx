import { IconLogoAlt } from "@/assets/images/icons";
import { faker } from "@faker-js/faker";
import { Carousel } from "antd";
import { HTMLProps, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LandingPageApiHooks } from "../api";
import { PublicPlayerApiHooks } from "../../Player/api";
import { CarouselRef } from "antd/es/carousel";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import { paths } from "@/router/paths";
import { sfColor } from "@/utils/faker";
import { PlayerLeagueData } from "@/pages/Players/Home/api/schema";

interface StandingsComponentProps extends HTMLProps<HTMLDivElement> {
  league?: PlayerLeagueData | null; 
}
export const StandingsComponent = ({className, league}: StandingsComponentProps) => {
  const navigate = useNavigate();
  const sliderRef = useRef<CarouselRef>(null);
  const { data: leagueList, isLoading, refetch } = LandingPageApiHooks.useGetLeagueList({}, { enabled: !league });
  const [selectedLeague, setSelectedLeague] = useState<string>(league?.name || leagueList?.data?.[0]?.name || '');
  const { data: standings } = PublicPlayerApiHooks.useGetPlayerStandings({
    queries: {
      league: selectedLeague || leagueList?.data?.[0]?.name || ''
    }
  }, { enabled: !!(selectedLeague || leagueList?.data?.[0]?.name) });

  return (
    <div className={className}>
      <Carousel
        autoplay
        dots={false}
        autoplaySpeed={15000}
        className="sm:aspect-[16/19]"
        ref={sliderRef}
        afterChange={(e) => setSelectedLeague(leagueList?.data?.[e]?.name || '')}
        >
        {
          !league ? leagueList?.data?.map((item) => 
            <div key={item.id} className="sm:aspect-[16/19] border">
              <div className={`flex flex-col justify-center items-center rounded-t-2xl h-20 relative`} style={{ backgroundColor: item.color_scheme ? `#${item.color_scheme}` : sfColor.primary }}>
                <Link to={paths.tournament.standings({league: item.name}).$} className="flex flex-row justify-center items-center py-3">
                  <IconLogoAlt className="w-16 h-12 object-contain text-white mr-2" />
                  <div className="flex flex-col">
                    <span className="text-white text-base font-bold uppercase">2025 {item.name}</span>
                    <span className="text-white text-base font-bold uppercase">Rankings</span>
                  </div>
                </Link>
                <div className="absolute top-[calc(50%-16px)] left-2 flex flex-row">
                  {
                    item.name !== leagueList?.data?.[0].name &&
                    <Button
                    variant="primary"
                    size="sm"
                    className="bg-transparent text-white rounded-full aspect-square p-0 border-0 h-8 w-6"
                    onClick={() => sliderRef.current?.prev()}
                  >
                    <Lucide icon="ChevronLeft" className="text-white !h-6 !w-6"/>
                  </Button>}
                  {item.name !== leagueList?.data?.[leagueList?.data?.length - 1].name && <Button
                    variant="primary"
                    size="sm"
                    className="bg-transparent text-white rounded-full aspect-square p-0 border-0 h-8 w-6 ml-0"
                    onClick={() => sliderRef.current?.next()}
                  >
                    <Lucide icon="ChevronRight" className="text-white !h-6 !w-6" />
                  </Button>}
                </div>
              </div>
              <div className="flex flex-col overflow-y-scroll border-2 h-96 sm:h-[calc(100%-80px)] relative">
                {standings?.data?.map((standing, idx) => (
                  <Link to={paths.players.info({uuid: standing.uuid || ""}).$} key={idx} className={`flex flex-row justify-start items-center p-2 ${idx % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'} hover:bg-[#EBCE56]`}>
                    <div className="flex flex-row items-center justify-end w-4 text-xs font-semibold">
                      {idx + 1}.&nbsp;
                    </div>
                    <div className="flex flex-row items-center justify-between w-full">
                      <span className="text-sm font-semibold text-left uppercase">{standing.name}</span>
                      <span className="text-xs  font-bold text-right border px-2 py-1 text-white rounded-md relative" style={{ backgroundColor: item?.color_scheme ? `#${item?.color_scheme}` : sfColor.primary }}>
                        <span className="absolute !font-marker opacity-30 scale-150">{standing.point}</span>
                        <span className="">{standing.point}</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : <>
            <div className="flex flex-col justify-center items-center rounded-t-2xl h-20">
              <Link to={paths.tournament.standings({league: league?.name || ''}).$}  className="flex flex-row justify-center items-center py-3">
                <IconLogoAlt className="w-16 h-12 object-contain text-white mr-2" />
                <div className="flex flex-col">
                  <span className="text-white text-base font-bold uppercase">2025 {league?.name}</span>
                  <span className="text-white text-base font-bold uppercase">Rankings</span>
                </div>
              </Link>
            </div>
            <div className="flex flex-col overflow-scroll h-96 sm:h-full relative">
              {standings?.data?.map((item, idx) => (
                <div key={idx} className={`flex flex-row justify-start items-center p-2 ${idx % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'}`}>
                  <div className="flex flex-row items-center justify-end w-4 text-xs font-semibold">
                    {idx + 1}.&nbsp;
                  </div>
                  <div className="flex flex-row items-center justify-between w-full">
                    <span className="text-sm font-semibold text-left uppercase">{item.name}</span>
                    <span className="text-xs  font-bold text-right border px-2 py-1 text-white rounded-md relative" style={{ backgroundColor: league.color_scheme ? `#${league.color_scheme}` : sfColor.primary }}>
                      <span className="absolute !font-marker opacity-30 scale-150">{item.point}</span>
                      <span className="">{item.point}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        }
        
      </Carousel>
    </div>
  );
};