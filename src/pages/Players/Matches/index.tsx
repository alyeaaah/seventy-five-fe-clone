
import { useAtomValue } from "jotai";
import { userAtom } from "@/utils/store";
import { IconLogo, IconVS } from "@/assets/images/icons";
import moment from "moment";
import { PlayerMatchApiHooks } from "./api";
import { Link } from "react-router-dom";
import Lucide from "@/components/Base/Lucide";
import { NestedImage } from "@/components/NestedImage";
import { Upcoming } from "@/assets/images/illustrations/illustrations";
import { paths } from "@/router/paths";
import { Divider } from "antd";
import { PlayerMatch } from "../Home/components/PlayerMatch";
import { PlayerMatchFull } from "../Home/components/PlayerMatchFull";
import { PlayerRecentTournaments } from "../Home/components/PlayerRecentTournaments";
import { PlayerTournaments } from "../Home/components/PlayerTournaments";
import { StandingsComponent } from "@/pages/Public/LandingPage/components/StandingsComponent";
import { FeaturedPlayer } from "@/pages/Public/LandingPage/components/FeaturedPlayerComponent";
import { matchStatusEnum } from "@/pages/Admin/MatchDetail/api/schema";
import { PlayerHomeApiHooks } from "../Home/api";

export const PlayerMatches = () => {
  const userData = useAtomValue(userAtom);
  const { data: upcomingMatches } = PlayerMatchApiHooks.useGetPlayerMatches({
    queries: {
      status: matchStatusEnum.Values.UPCOMING,
    }
  });
  const { data: recentMatches } = PlayerMatchApiHooks.useGetPlayerMatches({
    queries: {
      status: matchStatusEnum.Values.ENDED,
    }
  });
  const { data: playerData } = PlayerHomeApiHooks.useGetPlayersDetail({
    params: {
      uuid: userData?.uuid || ""
    }
  });
  const { data: upcomingTournaments } = PlayerMatchApiHooks.useGetPlayerTournamentsUpcoming();
  const { data: joinedTournaments } = PlayerMatchApiHooks.useGetPlayerTournamentsJoined();
  return (
    <div className="my-5 grid grid-cols-12 gap-4">
      {/* Your upcoming match section */}
      <div className="col-span-12 relative">
        <div className="absolute left-0 top-0 w-full h-full rounded-2xl  bg-[url('/src/assets/images/tennis-ball.webp')] bg-cover bg-center z-0 overflow-hidden">
          <div className="h-full aspect-square flex items-center justify-center">
            <span className="text-white text-2xl font-bold w-fit border-4 p-2 rounded-xl shadow-[0_0_4px_0_rgba(0,0,0,0.5)] [text-shadow:0_0_4px_rgba(0,0,0,0.5)]">Your
              <br />
              Upcoming
              <br />
              Matches</span>
          </div>
        </div>
        <div className="col-span-12 flex flex-row overflow-x-scroll gap-2 mt-4 rounded-xl px-4 z-[2] relative scrollbar-hidden">
          <div className="flex min-w-48 h-full z-10"></div>
          {upcomingMatches?.data?.map((match, idx) => (
            <Link key={idx} className='z-10 min-w-80' to={paths.challenger.match({ matchUuid: match.uuid || "" }).$}>
              <div className='flex flex-col justify-center items-center shadow-md rounded-3xl bg-white mr-0 lg:mr-2 px-2'>
                <div className='flex flex-row justify-center items-center my-2 text-gray-500 text-xs'>
                  <Lucide icon='MapPin' className='w-6 h-4' /> {match.court_field?.name}
                </div>
                <div className="flex flex-row bg-emerald-800 rounded-full justify-between p-1 w-full h-12">
                  <NestedImage players={match.home_team?.players?.map((player) => ({
                    media_url: player.player?.media_url || '',
                    name: player.player?.name || '',
                    uuid: player.player?.uuid || ''
                  })) || []} />
                  <div className='flex flex-row text-white items-center'>
                    <IconVS className="w-16 h-8" />
                  </div>
                  <NestedImage
                    players={match.away_team?.players?.map((player) => ({
                      media_url: player.player?.media_url || '',
                      name: player.player?.name || '',
                      uuid: player.player?.uuid || ''
                    })) || []} />
                </div>
                <div className='flex flex-row justify-between px-2 py-1 capitalize w-full text-xs text-emerald-800'>
                  <div className="flex flex-col justify-start">
                    {match.home_team ? match.home_team?.players?.map((player, idx) => (
                      <span key={idx} className="line-clamp-1">{player.player?.name || ''}</span>
                    )) : <span className="line-clamp-1">To Be Drawn</span>}
                  </div>
                  <div className="flex flex-col justify-end">
                    {match.away_team ? match.away_team?.players?.map((player, idx) => (
                      <span key={idx} className="text-end line-clamp-1">{player.player?.name || ''}</span>
                    )) : <span className="text-end line-clamp-1">To Be Drawn</span>}
                  </div>
                </div>
                <div className='flex flex-row justify-center px-6 capitalize w-full text-xs py-2'>
                  <span className="text-emerald-800 font-semibold border px-2 py-1 border-emerald-800 rounded-full">{moment(match.time).format('ddd, DD MMM YYYY hh:mm')}</span>
                </div>
              </div>
            </Link>
          ))}
          {upcomingMatches?.data?.length === 0 && <div className="col-span-12 flex flex-col items-center justify-center h-44  text-white">
            <Lucide icon="RefreshCw" className="w-4 h-4 mr-2" /> No Upcoming Matches
          </div>}
        </div>
      </div>
      <div className="col-span-12 lg:col-span-12 xl:col-span-5 2xl:col-span-5 flex flex-col box ">
        <div className="font-medium h-fit text-primary uppercase text-base px-4 pt-4">
          <div className="w-full flex justify-between items-center">
            <span>Recent <span className="font-bold">Matches</span></span>
          </div>
          <Divider className="mt-2 my-0" />
        </div>
        <div className="flex flex-col gap-4 p-4 justify-start">
          {recentMatches?.data?.map((match, idx) => (
            <PlayerMatchFull key={idx} match={match} playerUuid={userData?.uuid || ""} />
          ))}
          {recentMatches?.data?.length === 0 && <div className="col-span-12 flex flex-col items-center justify-center h-44">
            <Lucide icon="RefreshCw" className="w-4 h-4 mr-2" /> No Recent Matches
          </div>}
        </div>
      </div>
      <div className="col-span-12 lg:col-span-12 xl:col-span-4 2xl:col-span-4 flex flex-col gap-3">
        <div className="grid grid-cols-12 box !h-fit bg-[url('/src/assets/images/tennis-racket.webp')] bg-cover bg-center">
          <div className="col-span-12 font-medium text-primary uppercase text-base px-4 pt-4">
            <div className="w-full flex justify-center items-center text-white [text-shadow:0_0_4px_rgba(0,0,0,0.5)]">
              <span>SEVENTYFIVE's <span className="font-bold">Tournaments</span></span>
            </div>
          </div>
          <div className="col-span-12 flex flex-col gap-4 p-4 min-h-[30vh] h-fit">
            {upcomingTournaments?.data?.map((tournament, idx) => (
              <PlayerTournaments key={idx} tournament={tournament} />
            ))}
          </div>
        </div>
        <div className="col-span-2  grid grid-cols-12 box h-fit">
          <div className="col-span-12 font-medium text-primary uppercase text-base px-4 pt-4">
            <div className="w-full flex justify-between items-center">
              <span>Recent <span className="font-bold">Tournaments</span></span>
            </div>
            <Divider className="mt-2 my-0" />
          </div>
          <div className="col-span-12 flex flex-col gap-4 p-4 max-h-[60vh] overflow-scroll">
            {joinedTournaments?.data?.map((tournament, idx) => (
              <PlayerRecentTournaments key={idx} tournament={tournament} playerUuid={userData?.uuid || ""} />
            ))}
          </div>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-3">
        <StandingsComponent
          className="aspect-[16/19] overflow-hidden relative flex flex-col"
          league={playerData?.data?.league}
        />
        <FeaturedPlayer
          title="Double Mates"
          className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3 p-0" />
      </div>
    </div>
  );
}

