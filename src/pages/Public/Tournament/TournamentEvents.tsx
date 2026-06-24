import { FadeAnimation } from "@/components/Animations"
import { PublicTournamentApiHooks } from "./api";
import { IconLogo, IconLogoAlt } from "@/assets/images/icons";
import TournamentEventCard from "@/components/Tournament/TournamentEventCard";
import { useAtomValue } from "jotai";
import { accessTokenAtom, userAtom } from "@/utils/store";
import { useState } from "react";
import Image from "@/components/Image";
import { imageResizer, imageResizerDimension } from "@/utils/helper";
import { paths } from "@/router/paths";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PublicBlogApiHooks } from "../Blog/api";
import Lucide from "@/components/Base/Lucide";
import { TournamentDetailParticipants } from "@/components/Tournament/TournamentDetailParticipants";
import moment from "moment";
import TournamentDetailMatches from "@/components/Tournament/TournamentDetailMatches";


export const TournamentEvents = ({ uuid }: { uuid?: string }) => {

  const accessToken = useAtomValue(accessTokenAtom);
  const user = useAtomValue(userAtom);
  const { pathname } = useLocation()
  const userIsLogin = !!(accessToken && user);
  const [filterParticipants, setFilterParticipants] = useState("")
  const navigate = useNavigate();
  const { data: tournamentEvents, isLoading: tournamentEventsLoading } = PublicTournamentApiHooks.useGetPublicTournamentEventList(
    {
      queries: {
      }
    },
    {
    }
  );
  const tournamentEvent = !!tournamentEvents?.data?.length ? tournamentEvents?.data?.[0] : null;

  const { data: tournamentDraftParticipantsData } = PublicTournamentApiHooks.useGetPublicTournamentDraftParticipants({
    params: {
      tournamentUuid: tournamentEvent?.uuid || ''
    },
    queries: {
      status: ["APPROVED", "AVAILABLE", "PICKED", "PICKING"],
      tournamentEventUuid: tournamentEvent?.uuid || ''
    }
  }, {
    enabled: false
  });
  const draftParticipants = tournamentDraftParticipantsData?.data?.participants || [];
  const [segmentActive, setSegmentActive] = useState<"PARTICIPANTS" | "MATCHES">("PARTICIPANTS")

  const { data: blogData } = PublicBlogApiHooks.useGetBlogFeatured(
    {
      queries: {
        limit: 6
      }
    }, {
  });

  const { data: tournamentSponsors } = PublicTournamentApiHooks.useGetTournamentDetailSponsors(
    {
      params: {
        tournament_uuid: tournamentEvent?.tournaments?.[0]?.uuid || ''
      }
    },
    {
      enabled: !!(tournamentEvent?.tournaments?.[0]?.uuid || ''),
      retry: false
    }
  );

  return <>
    <div className="col-span-12 md:col-span-8 flex flex-col">

      <div className="col-span-12 grid grid-cols-12 gap-2 mt-4 h-max ">
        <div className="col-span-12 text-emerald-800 flex flex-row my-4">
          <IconLogoAlt className="h-10 w-20" />
          <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
            <div className="h-10 absolute -right-12 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
            Tournament
          </div>
        </div>
        {
          !!tournamentEvents?.data?.length && (
            <TournamentEventCard
              tournamentEventUuid={tournamentEvents?.data[0].uuid || ""}
            />
          )
        }
      </div>


      {!!draftParticipants?.length && <div className="col-span-12 hidden sm:grid grid-cols-12 gap-2 mt-4 h-max">
        <div className="col-span-12 text-emerald-800 flex flex-row my-4 gap-2">
          <IconLogoAlt className="h-10 w-20" />
          <div className={`h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] items-center px-3 flex relative cursor-pointer
            ${segmentActive === "PARTICIPANTS" ? 'border-emerald-800 !text-emerald-800' : 'border-[#EBCE56] text-[#EBCE56]'}
            `}
            onClick={() => {
              setSegmentActive("PARTICIPANTS")
              setFilterParticipants("")
            }
            }
          >
            {tournamentEvent?.status === "DRAFT" ? <div className="h-10 absolute -right-12 aspect-square border-[3px] border-emerald-800 rounded-full"></div> : <></>}
            participants
          </div>
          {tournamentEvent?.status !== "DRAFT" ? <div className={`h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] items-center px-3 flex relative cursor-pointer
            ${segmentActive === "MATCHES" ? 'border-emerald-800 !text-emerald-800' : 'border-[#EBCE56] text-[#EBCE56]'}
            `}
            onClick={() => {
              setSegmentActive("MATCHES");
              setFilterParticipants(tournamentEvent?.tournaments?.[0]?.uuid || "")
            }}
          >
            MATCHES
          </div>
            : <></>}
        </div>
        <div className="col-span-12 flex flex-wrap gap-2">

          {segmentActive === "PARTICIPANTS" && <div className={`boder px-1 py-1 ${!filterParticipants ? 'border-x-2' : ''} !border-emerald-800 rounded-full text-emerald-800 cursor-pointer `} onClick={() => setFilterParticipants("")}>
            <div className={`border font-medium border-emerald-800 rounded-full px-3 py-1 ${!filterParticipants ? 'bg-emerald-800 text-white' : ''}`}>
              All participants
            </div>
          </div>}
          {tournamentEvent?.tournaments?.map((tournament) => (
            <div key={tournament.uuid} className={`boder px-1 py-1 ${tournament.uuid === filterParticipants ? 'border-x-2' : ''} !border-emerald-800 rounded-full text-emerald-800 cursor-pointer `} onClick={() => setFilterParticipants(tournament.uuid || "")}>
              <div className={`border font-medium border-emerald-800 rounded-full px-3 py-1 ${tournament.uuid === filterParticipants ? 'bg-emerald-800 text-white' : ''}`}>
                {tournament.name}
              </div>
            </div>
          ))}
        </div>
      </div>}
    </div>
    <div className="col-span-12 md:col-span-4 flex flex-col ">
      <FadeAnimation className="md:flex flex-col space-y-2 hidden" direction="down">
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
    </div>

    {segmentActive == 'PARTICIPANTS' && <div className="col-span-12 text-emerald-800 hidden sm:grid grid-cols-10 gap-3">
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
    </div>}
    {segmentActive === "MATCHES" && <FadeAnimation className="col-span-12 md:col-span-12 hidden sm:grid grid-cols-12 gap-0 h-max" direction="up">
      <TournamentDetailMatches tournamentUuid={filterParticipants} showHeader={false} />
    </FadeAnimation>}
    {
      (
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
      )
    }
    {/* <PartnersComponent className="col-span-12 mb-8" /> */}
  </>
}