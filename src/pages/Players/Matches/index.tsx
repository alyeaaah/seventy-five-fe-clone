
import { useAtomValue } from "jotai";
import { useState, Suspense } from "react";
import { userAtom } from "@/utils/store";
import { IconLogo, IconVS } from "@/assets/images/icons";
import moment from "moment";
import { PlayerMatchApiHooks } from "./api";
import { PublicMatchApiHooks } from "@/pages/Public/Match/api";
import { Link } from "react-router-dom";
import Lucide from "@/components/Base/Lucide";
import { NestedImage } from "@/components/NestedImage";
import { AskForChallenger, Upcoming } from "@/assets/images/illustrations/illustrations";
import { paths } from "@/router/paths";
import { PlayerMatchFull } from "../Home/components/PlayerMatchFull";
import { PlayerRecentTournaments } from "../Home/components/PlayerRecentTournaments";
import { PlayerTournaments } from "../Home/components/PlayerTournaments";
import { StandingsComponent } from "@/pages/Public/LandingPage/components/StandingsComponent";
import { FeaturedPlayer } from "@/pages/Public/LandingPage/components/FeaturedPlayerComponent";
import { matchStatusEnum } from "@/pages/Admin/MatchDetail/api/schema";
import { PlayerHomeApiHooks } from "../Home/api";
import { Divider } from "antd";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import Button from "@/components/Base/Button";
import { ChallengerModal } from "./Challenger.modal";
import Tippy from "@/components/Base/Tippy";

export const PlayerMatches = () => {
  const userData = useAtomValue(userAtom);
  const [isChallengerModalOpen, setIsChallengerModalOpen] = useState(false);
  const { data: upcomingMatches, isLoading: isUpcomingLoading } = PlayerMatchApiHooks.useGetPlayerMatches({
    queries: {
      status: matchStatusEnum.Values.UPCOMING,
    }
  });
  const { data: recentMatches, isLoading: isRecentLoading } = PlayerMatchApiHooks.useGetPlayerMatches({
    queries: {
      status: [matchStatusEnum.Values.ENDED, matchStatusEnum.Values.ONGOING]
    }
  });
  const { data: playerData, isLoading: isPlayerDataLoading } = PlayerHomeApiHooks.useGetPlayersDetail({
    params: {
      uuid: userData?.uuid || ""
    }
  });

  const { data: challengerList, isLoading: isChallengerListLoading } = PublicMatchApiHooks.useGetPublicChallengerList(
    {
      queries: {
        player_uuid: userData?.uuid || "",
      }
    },
    {
      enabled: !!userData?.uuid,
    }
  );
  const { data: upcomingTournaments, isLoading: isUpcomingTournamentsLoading } = PlayerMatchApiHooks.useGetPlayerTournamentsUpcoming();
  const { data: joinedTournaments, isLoading: isJoinedTournamentsLoading } = PlayerMatchApiHooks.useGetPlayerTournamentsJoined();

  const isLoading = isUpcomingLoading || isRecentLoading || isPlayerDataLoading || isChallengerListLoading || isUpcomingTournamentsLoading || isJoinedTournamentsLoading;

  if (isLoading) {
    return (
      <div className="my-5 grid grid-cols-12 gap-4">
        <div className="col-span-12 flex items-center justify-center h-96">
          <LoadingAnimation autoplay loop label="Loading matches..." className="py-4" />
        </div>
      </div>
    );
  }
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
                  <span className="text-emerald-800 font-semibold border px-2 py-1 border-emerald-800 rounded-full">{moment(match.time).format('ddd, DD MMM YYYY HH:mm')}</span>
                </div>
              </div>
            </Link>
          ))}
          {upcomingMatches?.data?.length === 0 && <div className="col-span-12 flex flex-col items-center justify-center h-44  text-white">
            <Lucide icon="RefreshCw" className="w-4 h-4 mr-2" /> No Upcoming Matches
          </div>}
        </div>
      </div>
      <div className="col-span-12 lg:col-span-12 xl:col-span-5 2xl:col-span-5 flex flex-col gap-4">
        <div className="flex flex-col box rounded-2xl overflow-hidden bg-emerald-800 p-4 h-fit gap-2">

          <div className="flex flex-col lg:flex-row items-center justify-around border-[#EBCE56] border rounded-lg p-4">
            <div className="h-24 aspect-[2/1] animate-pulse">
              <AskForChallenger className="w-full h-full" />
            </div>
            <div className="flex flex-col text-[#EBCE56] items-center lg:items-start">
              <span className="text-xl font-bold">Ready to play?</span>
              <span className="font">Ask for a challenger now, get your points!</span>
              <Button
                variant="primary"
                className="bg-[#EBCE56] text-emerald-800 mt-3 w-fit"
                onClick={() => setIsChallengerModalOpen(true)}
              >
                Ask Challenger
              </Button>
            </div>
          </div>
          {
            isChallengerListLoading &&
            <LoadingAnimation light autoplay loop label="Loading..." className="py-2" />
          }
          {(!isChallengerListLoading && !!challengerList?.data?.length) && (
            <div className="flex flex-col items-center justify-around gap-2">
              {
                challengerList?.data?.map((challenger) => (
                  <div key={challenger.id} className="flex flex-col box w-full p-2">
                    <div className="flex flex-row justify-between border-b mb-1 pb-1">
                      <div className="flex flex-row gap-1 items-center w-full">
                        <Lucide icon="Calendar" className="w-4 h-4" />
                        <span>{moment(challenger.time).format('DD MMM YYYY HH:mm')}</span>
                      </div>
                      <div className="uppercase text-xs border font-medium rounded px-2 py-0.5 h-fit border-emerald-800 text-emerald-800">{challenger.status === "OPEN" ? "Requested" : challenger.status}</div>
                      <Tippy
                        className="w-full"
                        content={challenger.court.name || ""}>
                        <div className="flex flex-row gap-1 ml-1 items-center justify-end w-full">
                          <Lucide icon="MapPin" className="w-4 h-4" />
                          <span className="w-full text-ellipsis line-clamp-1">{challenger.court.name}</span>
                        </div>
                      </Tippy>
                    </div>
                    <div className="flex flex-row">
                      {(() => {
                        const challengerPlayers = [challenger.challengerA, challenger.challengerB].filter(
                          (p): p is NonNullable<typeof challenger.challengerA> => !!p
                        );
                        const opponentPlayers = [challenger.opponentA, challenger.opponentB].filter(
                          (p): p is NonNullable<typeof challenger.opponentA> => !!p
                        );

                        return (
                          <div className="flex flex-col w-full">
                            {challengerPlayers.map((player) => (
                              <div key={player.uuid}>
                                {player.uuid === userData?.uuid ? <span className="font-bold">You</span> : player.name}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                      <IconVS className="h-12 min-w-16" />
                      {(() => {
                        const opponentPlayers = [challenger.opponentA, challenger.opponentB].filter(
                          (p): p is NonNullable<typeof challenger.opponentA> => !!p
                        );

                        if (opponentPlayers.length === 0) {
                          return (
                            <div className="flex flex-row gap-2 items-center h-12 animate-pulse w-full justify-end">
                              <Lucide icon="UserSearch" className="w-6 h-6" />
                              <span>Waiting for opponent</span>
                            </div>
                          );
                        }

                        return (
                          <div className="flex flex-col w-full items-end">
                            {opponentPlayers.map((player) => (
                              <div key={player.uuid}>
                                {player.uuid === userData?.uuid ? <span className="font-bold">You</span> : player.name}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
        <div className="flex flex-col box col-span-2 flex-1">
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
      </div>
      <div className="col-span-12 lg:col-span-12 xl:col-span-4 2xl:col-span-4 flex flex-col gap-3">
        <div className="grid grid-cols-12 box !h-fit bg-[url('/src/assets/images/tennis-racket.webp')] bg-cover bg-center">
          <div className="col-span-12 font-medium text-primary uppercase text-base px-4 pt-4">
            <div className="w-full flex justify-center items-center text-white [text-shadow:0_0_4px_rgba(0,0,0,0.5)]">
              <span>SEVENTYFIVE's <span className="font-bold">Tournaments</span></span>
            </div>
          </div>
          <div className="col-span-12 flex flex-col gap-4 p-4 min-h-[30vh] h-fit">
            {upcomingTournaments?.data?.length ? upcomingTournaments?.data?.map((tournament, idx) => (
              <PlayerTournaments key={idx} tournament={tournament} />
            )) : (
              <div className="flex flex-col items-center justify-center h-full flex-1 [text-shadow:0_0_4px_rgba(0,0,0,0.5)]">
                <Lucide icon="Calendar" className="w-8 h-8 text-white" />
                <span className="text-white mt-2">No Upcoming Tournaments</span>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-2 flex-1  flex flex-col box">
          <div className="col-span-12 font-medium text-primary uppercase text-base px-4 pt-4">
            <div className="w-full flex justify-between items-center">
              <span>Recent <span className="font-bold">Tournaments</span></span>
            </div>
            <Divider className="mt-2 my-0" />
          </div>
          <div className="col-span-12 flex flex-col gap-4 p-4 max-h-[60vh] overflow-scroll">
            {joinedTournaments?.data?.length ? joinedTournaments?.data?.map((tournament, idx) => (
              <PlayerRecentTournaments key={idx} tournament={tournament} playerUuid={userData?.uuid || ""} />
            )) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Lucide icon="Calendar" className="w-8 h-8 text-gray-400" />
                <span className="text-gray-400 mt-2">No Recent Tournaments</span>
              </div>
            )}
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

      <ChallengerModal
        open={isChallengerModalOpen}
        onClose={() => setIsChallengerModalOpen(false)}
        userUuid={userData?.uuid || ""}
      />
    </div>
  );
}

