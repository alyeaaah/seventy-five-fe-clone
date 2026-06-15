import LayoutWrapper from "@/components/LayoutWrapper";
import { PublicTournamentApiHooks } from "./api";
import { imageResizer, imageResizerDimension } from "@/utils/helper";
import { Link, useNavigate } from "react-router-dom";
import { PublicBlogApiHooks } from "../Blog/api";
import Lucide from "@/components/Base/Lucide";
import moment from "moment";
import { FadeAnimation } from "@/components/Animations";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import { IconLogo, IconLogoAlt } from "@/assets/images/icons";
import TournamentDetailCard from "@/components/Tournament/TournamentDetailCard";
import { accessTokenAtom, userAtom } from "@/utils/store";
import { useAtomValue } from "jotai";
import TournamentDetailMatches from "@/components/Tournament/TournamentDetailMatches";
import { TournamentDetailParticipants } from "@/components/Tournament/TournamentDetailParticipants";
import TournamentEventCard from "@/components/Tournament/TournamentEventCard";
import { useState } from "react";
import Image from "@/components/Image";
export const PublicTournament = () => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.tournament.index);
  const { uuid } = queryParams;
  const accessToken = useAtomValue(accessTokenAtom);
  const user = useAtomValue(userAtom);
  const userIsLogin = !!(accessToken && user);
  const [filterParticipants, setFilterParticipants] = useState("")

  const { data, isLoading: tournamentsLoading } = PublicTournamentApiHooks.useGetFeaturedTournament(
    {
      queries: {
        limit: 99
      }
    }, {}
  );
  const { data: tournamentEvents, isLoading: tournamentEventsLoading } = PublicTournamentApiHooks.useGetPublicTournamentEventList(
    {
      queries: {
      }
    },
    {
    }
  );

  const { data: recentData, isLoading: recentTournamentsLoading } = PublicTournamentApiHooks.useGetRecentTournament(
    {
      queries: {
        limit: 99
      }
    },
    {
      enabled: !tournamentsLoading && (!data?.data || data?.data?.length === 0) && !tournamentEvents?.data?.length
    }
  );


  // Use featured data if available, otherwise use recent data
  const tournamentData = data?.data && data.data.length > 0 ? data : recentData;
  const tournamentEvent = !!tournamentEvents?.data?.length ? tournamentEvents?.data?.[0] : null;
  const currentTournament = !!tournamentEvents?.data?.length ? "EVENT" : 'TOURNEY';
  const { data: detailTournament } = !userIsLogin ? PublicTournamentApiHooks.useGetTournamentDetail(
    {
      params: {
        uuid: uuid || tournamentData?.data?.[0]?.uuid || ''
      }
    },
    {
      enabled: !!tournamentData?.data?.[0]?.uuid,
      retry: false
    }
  ) : PublicTournamentApiHooks.useGetTournamentDetailAuth(
    {
      params: {
        uuid: uuid || tournamentData?.data?.[0]?.uuid || ''
      }
    },
    {
      enabled: !!tournamentData?.data?.[0]?.uuid,
      retry: false
    }
  );

  const { data: tournamentSponsors } = PublicTournamentApiHooks.useGetTournamentDetailSponsors(
    {
      params: {
        tournament_uuid: uuid || tournamentData?.data?.[0]?.uuid || tournamentEvent?.tournaments?.[0]?.uuid || ''
      }
    },
    {
      enabled: !!(uuid || tournamentData?.data?.[0]?.uuid || tournamentEvent?.tournaments?.[0]?.uuid || ''),
      retry: false
    }
  );

  const { data: tournamentTeamParticipants } = PublicTournamentApiHooks.useGetTournamentTeamParticipants({
    params: {
      uuid: uuid || ''
    },
    queries: {
      status: "approved,confirmed"
    }
  }, {
    enabled: !!uuid,
  });

  const { data: tournamentDraftParticipantsData } = PublicTournamentApiHooks.useGetPublicTournamentDraftParticipants({
    params: {
      tournamentUuid: tournamentData?.data?.[0]?.uuid || tournamentEvent?.tournaments?.[0]?.uuid || ''
    },
    queries: {
      status: ["APPROVED", "AVAILABLE", "PICKED", "PICKING"],
      tournamentEventUuid: tournamentEvent?.uuid || ''
    }
  }, {
    enabled: !!(tournamentData?.data?.[0]?.uuid || tournamentEvent?.tournaments?.[0]?.uuid || ''),
  });
  const draftParticipants = tournamentDraftParticipantsData?.data?.participants || [];

  const { data: blogData } = PublicBlogApiHooks.useGetBlogFeatured(
    {
      queries: {
        limit: 6
      }
    }, {
    enabled: true
  }
  );
  return (
    <>
      <LayoutWrapper className="grid grid-cols-12 gap-4 sm:gap-8 mt-4 sm:mt-8 min-h-[calc(100vh-300px)]">
        <FadeAnimation className="col-span-12 md:col-span-8 grid grid-cols-12 gap-0 h-max" direction="up">
          {!tournamentEvents?.data?.length && <div className="col-span-12 mt-4">
            <div className="col-span-12 flex flex-row overflow-scroll gap-2 mt-2 rounded-xl">
              {tournamentsLoading ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="flex min-w-96 max-w-96 p-2 flex-row rounded-2xl bg-gray-200 animate-pulse">
                    <div className="flex w-32 bg-gray-300 rounded-xl animate-pulse"></div>
                    <div className="flex flex-col justify-center w-full mx-2 space-y-2">
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded animate-pulse w-full"></div>
                      <div className="h-3 bg-gray-300 rounded animate-pulse w-2/3"></div>
                    </div>
                  </div>
                ))
              ) : (
                tournamentData?.data?.map((tournament, index) => (
                  <div key={index} className={`flex min-w-96 max-w-96 flex-row rounded-2xl bg-gray-100 hover:bg-emerald-800 group cursor-pointer border-emerald-800 ${uuid === tournament.uuid ? 'border-4' : ''}`} onClick={() => navigate(`${paths.tournament.index({ uuid: tournament.uuid || "" }).$}`)}>
                    <img
                      src={imageResizerDimension(tournament.media_url, 220, "h")}
                      className="flex w-32 object-cover aspect-square rounded-xl"
                    />
                    <div className="flex flex-col justify-center w-full mx-2">
                      <h3 className="text-sm font-semibold text-emerald-800 group-hover:text-[#EBCE56] text-ellipsis line-clamp-2">{tournament.name}</h3>
                      <span className="text-gray-500 group-hover:text-gray-100 text-[11px] font-light text-ellipsis line-clamp-3" dangerouslySetInnerHTML={{ __html: tournament.description || "" }}></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>}
          <div className="col-span-12 grid grid-cols-12 gap-2 mt-4 h-max">
            <div className="col-span-12 text-emerald-800 flex flex-row my-4">
              <IconLogoAlt className="h-10 w-20" />
              <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
                <div className="h-10 absolute -right-12 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
                Tournament
              </div>
            </div>
            {
              !tournamentEvents?.data?.length && (
                <TournamentDetailCard
                  tournamentUuid={uuid || tournamentData?.data?.[0]?.uuid || ""}
                />
              )
            }
            {
              !!tournamentEvents?.data?.length && (
                <TournamentEventCard
                  tournamentEventUuid={tournamentEvents?.data[0].uuid || ""}
                />
              )
            }
          </div>

          {draftParticipants?.length && <div className="col-span-12 hidden sm:grid grid-cols-12 gap-2 mt-4 h-max">
            <div className="col-span-12 text-emerald-800 flex flex-row my-4">
              <IconLogoAlt className="h-10 w-20" />
              <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
                <div className="h-10 absolute -right-12 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
                participants
              </div>
            </div>
            <div className="col-span-12 flex flex-wrap gap-2">

              <div key="all" className={`boder px-1 py-1 ${!filterParticipants ? 'border-x-2' : ''} !border-emerald-800 rounded-full text-emerald-800 cursor-pointer `} onClick={() => setFilterParticipants("")}>
                <div className={`border font-medium border-emerald-800 rounded-full px-3 py-1 ${!filterParticipants ? 'bg-emerald-800 text-white' : ''}`}>
                  All participants
                </div>
              </div>
              {tournamentEvent?.tournaments?.map((tournament) => (
                <div key={tournament.uuid} className={`boder px-1 py-1 ${tournament.uuid === filterParticipants ? 'border-x-2' : ''} !border-emerald-800 rounded-full text-emerald-800 cursor-pointer `} onClick={() => setFilterParticipants(tournament.uuid || "")}>
                  <div className={`border font-medium border-emerald-800 rounded-full px-3 py-1 ${tournament.uuid === filterParticipants ? 'bg-emerald-800 text-white' : ''}`}>
                    {tournament.name}
                  </div>
                </div>
              ))}
            </div>
            <div className="col-span-12 text-emerald-800 grid grid-cols-10 gap-3">
              {draftParticipants?.filter((participant) => !filterParticipants || participant.tournament_uuid == filterParticipants).map((participant, index) => (
                <Link to={paths.players.info({ uuid: participant.player_uuid || "" }).$} key={index} className="col-span-2 aspect-[3/4] relative overflow-hidden rounded-lg">
                  <div className="h-full w-full overflow-hidden relative z-0">
                    {participant.player?.media_url ? <Image
                      src={imageResizer(participant.player?.media_url, 200)}
                      alt={participant.player?.name || ""}
                      width={100}
                      height={100}
                      className="h-full w-full object-cover"
                    /> : <div className="h-full w-full bg-gray-200 flex items-center justify-center flex-col pb-12">
                      <IconLogo className="w-24 h-16 text-gray-400" />
                      <span className="text-sm text-gray-500 text-center flex flex-col gap-2 px-2">
                        No profile picture yet
                        <span className="text-xs">If this is you or you know them, tell them to update their profile!</span>
                      </span>
                    </div>}
                  </div>
                  <div className="absolute bg-[#ebce56]/50 backdrop-blur-sm rounded-t-xl p-2 bottom-0 min-h-12 w-full z-[1] flex flex-col">
                    <span className="text-lg font-semibold [text-shadow:_1px_1px_0px_#ebce56] line-clamp-2 capitalize">
                      {participant.player?.name.toLowerCase()}
                    </span>
                    <div className="flex flex-row items-center gap-1 line-clamp-1">
                      {(participant.player?.nickname && participant.player?.nickname !== participant.player?.name) ? <span className="text-xs capitalize">
                        ({participant.player?.nickname})
                      </span> : ""}
                      {!!participant.player?.level?.name ? <span className="text-xs text-purple-700 capitalize">
                        {participant.player?.level.name}
                      </span> : ""}
                    </div>

                  </div>
                </Link>
              ))}
              {draftParticipants?.filter((participant) => !filterParticipants || participant.tournament_uuid == filterParticipants).length === 0 && (
                <div className="col-span-12 text-center text-gray-500 aspect-video w-full flex flex-col items-center justify-center">
                  <Lucide icon="UserRoundX" className="w-16 h-16 mb-2" />
                  No Participants Found
                </div>
              )}
            </div>
          </div>}
        </FadeAnimation>

        <FadeAnimation className="col-span-4 md:flex flex-col space-y-2 hidden" direction="down">
          {blogData?.data?.map((blog, index) => (
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

        {currentTournament === "TOURNEY" && <FadeAnimation className="col-span-12 md:col-span-12 grid grid-cols-12 gap-0 h-max" direction="up">
          {(detailTournament?.data?.show_bracket == true) && (
            <TournamentDetailMatches tournamentUuid={uuid || tournamentData?.data?.[0]?.uuid || ''} />
          )}

          {((!detailTournament?.data?.show_bracket) && !!tournamentTeamParticipants?.data && tournamentTeamParticipants.data.teams.length > 0) &&
            <TournamentDetailParticipants tournamentUuid={uuid || tournamentData?.data?.[0]?.uuid || ''} />
          }
        </FadeAnimation>}
        {(currentTournament === "EVENT") && (<FadeAnimation className="col-span-12 md:col-span-12 grid grid-cols-12 gap-0 h-max" direction="up">

          <TournamentDetailParticipants tournamentUuid={uuid || tournamentData?.data?.[0]?.uuid || ''} />
        </FadeAnimation>)}
        {(
          <FadeAnimation className="col-span-12 ">
            <div className="col-span-12 text-emerald-800 flex flex-row my-4">
              <IconLogoAlt className="h-10 w-20" />
              <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
                <div className="h-10 absolute -right-12 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
                Supported By
              </div>
            </div>
            <div className="col-span-12 grid grid-cols-12 gap-6 sm:gap-8 mt-2 rounded-xl overflow-x-scroll">
              {tournamentSponsors?.data?.map((image, index) => (
                <div key={index} className="flex flex-col col-span-4 sm:col-span-2 rounded-xl">
                  <div className=" w-full flex">
                    <div className="flex border-2 w-full aspect-square relative overflow-hidden group rounded-xl">
                      <img
                        src={imageResizerDimension(image.media_url, 300, "h")}
                        className="flex h-full w-full object-contain aspect-square rounded-xl group-hover:scale-110 transition-all duration-700"
                      />
                      <div className="absolute h-fit -bottom-14 group-hover:-translate-y-16 w-full flex items-center text-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700">
                        {image.name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeAnimation>
        )}
        {/* <PartnersComponent className="col-span-12 mb-8" /> */}
      </LayoutWrapper >
    </>
  )
}