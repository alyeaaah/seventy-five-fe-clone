import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import Tippy from "@/components/Base/Tippy";
import Image from "@/components/Image";
import { Carousel } from "antd";
import { CarouselRef } from "antd/es/carousel";
import Title from "antd/es/typography/Title";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HTMLProps, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { imageResizer } from "@/utils/helper";
import { useMatchesScore } from "@/pages/Admin/MatchDetail/api/firestore";
import { PublicTournamentApiHooks } from "../../Tournament/api";
import { paths } from "@/router/paths";

export const LiveMatch = ({ className }: HTMLProps<HTMLDivElement>) => {
  const navigate = useNavigate();

  const liveMatchRef = useRef<CarouselRef>(null);
  const { data: liveMatch } = PublicTournamentApiHooks.useGetOngoingMatch();

  const { data: scores, unsubscribe: unsubscribeFirestore, isLoading: isLoadingScore, fetchScores } = useMatchesScore(
    liveMatch?.data?.map((match) => match.uuid || "") || [],
    () => { }
  );
  return (
    <div className={className}>
      <Title level={4} className="bg-emerald-800 !text-white p-4 flex flex-row items-center justify-between rounded-t-3xl">
        <div className='flex flex-row items-center text-base'>
          <div className="h-3 w-3 rounded-full bg-green-500  mr-2">
            <div className="h-3 w-3 rounded-full bg-green-500 absolute animate-ping"></div>
          </div>
          Live Score
        </div>
        <div className="flex flex-row justify-end items-center">
          <Button type="button" className="!text-white border-none" size="sm" onClick={() => liveMatchRef.current?.prev()}>
            <ChevronLeft />
          </Button>
          <Button type="button" className="!text-white border-none" size="sm" onClick={() => liveMatchRef.current?.next()}>
            <ChevronRight />
          </Button>
        </div>
      </Title>
      {!liveMatch?.data || liveMatch.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4 px-4">
          <Lucide icon="Activity" className="h-16 w-16 text-white/60 mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">No Live Matches</h3>
          <p className="text-white/80 text-sm text-center">There are currently no ongoing matches. Check back later!</p>
        </div>
      ) : (
        <Carousel ref={liveMatchRef} swipeToSlide autoplay={false} autoplaySpeed={9000} className="relative w-full overflow-hidden">
          {liveMatch?.data?.map((match) => {
            const matchScore = scores?.find((score) => score.match_uuid === match.uuid);
            const lastScore = matchScore?.matchScore?.[matchScore?.matchScore?.length - 1];

            return (
              <Link key={match.id} className='flex flex-col justify-center items-center h-max w-full' to={!!match?.tournament_uuid ? paths.tournament.match({ matchUuid: match.uuid || "" }).$ : paths.challenger.match({ matchUuid: match.uuid || "" }).$}>
                <div className='flex flex-row justify-center items-center text-white mb-2 text-xs'>
                  <Lucide icon='MapPin' className='w-6 h-4' /> {match.court_field?.court?.name} - {match.court_field?.name}
                </div>
                <div className="flex bg-white mx-4 rounded-full justify-between p-1">
                  <div className='flex flex-row '>
                    <Link to={match.home_team?.players?.[0]?.uuid ? paths.players.info({ uuid: match.home_team?.players?.[0]?.uuid || "" }).$ : "#"}>
                      <Tippy
                        as="div"
                        className="w-12 h-12 image-fit zoom-in "
                        content={`${match.home_team?.name} - ${match.home_team?.players?.[0]?.name}` || ""}
                      >
                        <Image
                          src={match.home_team?.players?.[0]?.media_url ? imageResizer(match.home_team?.players?.[0]?.media_url, 50) : ''}
                          className='w-12 h-12 rounded-full object-cover border-2 border-white'
                        />
                      </Tippy>
                    </Link>
                    <Link to={match.home_team?.players?.[1]?.uuid ? paths.players.info({ uuid: match.home_team?.players?.[1]?.uuid || "" }).$ : "#"}>
                      <Tippy
                        as="div"
                        className="w-12 h-12 image-fit zoom-in ml-[-16px] xl:ml-[-16px] lg:ml-[-32px] mt-0 "
                        content={`${match.home_team?.name} - ${match.home_team?.players?.[1]?.name}` || ""}
                      >
                        <Image
                          src={match.home_team?.players?.[1]?.media_url ? imageResizer(match.home_team?.players?.[1]?.media_url, 50) : ''}
                          className='w-12 h-12 rounded-full object-cover border-2 border-white'
                        />
                      </Tippy>
                    </Link>
                  </div>
                  <div className='flex flex-row text-emerald-800 items-center'>
                    <span className='text-sm font-semibold border border-emerald-800 rounded-md w-5 text-center mr-1 bg-[#EBCE56] 2xl:block xl:hidden lg:block  block'>{lastScore?.prev?.set_score_home}</span>
                    <span className='text-xl font-bold'>{lastScore?.game_score_home}</span>
                    <span className='text-sm font-bold mx-1 animate-pulse'>:</span>
                    <span className='text-xl font-bold'>{lastScore?.game_score_away}</span>
                    <span className='text-sm font-semibold border border-emerald-800 rounded-md w-5 text-center ml-1 bg-[#EBCE56] 2xl:block xl:hidden lg:block  block'>{lastScore?.prev?.set_score_away}</span>
                  </div>
                  <div className='flex flex-row'>
                    <Link to={match.away_team?.players?.[0]?.uuid ? paths.players.info({ uuid: match.away_team?.players?.[0]?.uuid || "" }).$ : "#"}>
                      <Tippy
                        as="div"
                        className="w-12 h-12 image-fit zoom-in "
                        content={`${match.away_team?.name} - ${match.away_team?.players?.[0]?.name}` || ""}
                      >
                        <Image
                          src={match.away_team?.players?.[0]?.media_url ? imageResizer(match.away_team?.players?.[0]?.media_url, 50) : ''}
                          className='w-12 h-12 rounded-full object-cover border-2 border-white'
                        />
                      </Tippy>
                    </Link>
                    <Link to={match.away_team?.players?.[1]?.uuid ? paths.players.info({ uuid: match.away_team?.players?.[1]?.uuid || "" }).$ : "#"}>
                      <Tippy
                        as="div"
                        className="w-12 h-12 image-fit zoom-in ml-[-16px] xl:ml-[-16px] lg:ml-[-32px] mt-0 "
                        content={`${match.away_team?.name} - ${match.away_team?.players?.[1]?.name}` || ""}
                      >
                        <Image
                          src={match.away_team?.players?.[1]?.media_url ? imageResizer(match.away_team?.players?.[1]?.media_url, 50) : ''}
                          className='w-12 h-12 rounded-full object-cover border-2 border-white'
                        />
                      </Tippy>
                    </Link>
                  </div>
                </div>
                <div className='flex flex-row justify-between px-6 py-3 capitalize'>
                  <div className="flex flex-col justify-start">
                    {match.home_team?.players?.map((player, idx) => (
                      <span key={idx} className="line-clamp-1 text-white">{player.name}</span>
                    ))}
                  </div>
                  <div className="flex flex-col justify-end">
                    {match.away_team?.players?.map((player, idx) => (
                      <span key={idx} className="line-clamp-1 text-end text-white">{player.name}</span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })
          }
        </Carousel>
      )}
    </div>
  );
};