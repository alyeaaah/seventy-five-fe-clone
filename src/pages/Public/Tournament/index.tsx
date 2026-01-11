import LayoutWrapper from "@/components/LayoutWrapper"
import { FooterComponent } from "../LandingPage/components/FooterComponent"
import { PublicTournamentApiHooks } from "./api";
import { Carousel, Image } from "antd";
import { imageResizerDimension } from "@/utils/helper";
import { Link, useNavigate } from "react-router-dom";
import { PublicBlogApiHooks } from "../Blog/api";
import Lucide from "@/components/Base/Lucide";
import moment from "moment";
import { LandingPageApiHooks } from "../LandingPage/api";
import { FadeAnimation } from "@/components/Animations";
import { useRef, useState } from "react";
import { CarouselRef } from "antd/es/carousel";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import { IconLogo, IconLogoAlt } from "@/assets/images/icons";
import { DraggableBracket, TournamentDrawingUtils } from "@/components/TournamentDrawing";


export const PublicTournament = () => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.tournament.index);
  const { uuid } = queryParams;
  const sliderRef = useRef<CarouselRef>(null);
  const { data: liveMatch } = PublicTournamentApiHooks.useGetOngoingMatch();
  const { data: upcomingMatch } = PublicTournamentApiHooks.useGetUpcomingMatch({}, { enabled: liveMatch?.data?.length === 0 });

  const { data } = PublicTournamentApiHooks.useGetFeaturedTournament(
    {
      queries: {
        limit: 7
      }
    }, {}
  );
  const { data: detailTournament } = PublicTournamentApiHooks.useGetTournamentDetail(
    {
      params: {
        uuid: uuid || data?.data?.[0]?.uuid || ''
      }
    },
    {
      enabled: !!data?.data?.[0]?.uuid,
      retry: false
    }
  );
  const { data: tournamentMatches } = PublicTournamentApiHooks.useGetTournamentDetailMatches(
    {
      params: {
        tournament_uuid: uuid || data?.data?.[0]?.uuid || ''
      }
    },
    {
      enabled: !!data?.data?.[0]?.uuid,
      retry: false
    }
  );
  const { data: tournamentSponsors } = PublicTournamentApiHooks.useGetTournamentDetailSponsors(
    {
      params: {
        tournament_uuid: uuid || data?.data?.[0]?.uuid || ''
      }
    },
    {
      enabled: !!data?.data?.[0]?.uuid,
      retry: false
    }
  );

  const { data: blogData } = PublicBlogApiHooks.useGetBlogFeatured(
    {
      queries: {
        limit: 9
      }
    }, {
    enabled: !!uuid || !!data?.data?.[0]?.uuid
  }
  );
  return (
    <>
      <LayoutWrapper className="grid grid-cols-12 gap-4 sm:gap-8 mt-4 sm:mt-8 min-h-[calc(100vh-300px)]">
        <FadeAnimation className="col-span-12 md:col-span-8 grid grid-cols-12 gap-0 h-max" direction="up">
          <div className="col-span-12 mt-4">
            <div className="col-span-12 flex flex-row overflow-scroll gap-2 mt-2 rounded-xl">
              {data?.data?.map((tournament, index) => (
                <div key={index} className={`flex min-w-96 max-w-96 flex-row rounded-2xl bg-gray-100 hover:bg-emerald-800 group cursor-pointer border-emerald-800 ${detailTournament?.data?.uuid === tournament.uuid ? 'border-4' : ''}`} onClick={() => navigate(`${paths.tournament.index({ uuid: tournament.uuid || "" }).$}`)}>
                  <img
                    src={imageResizerDimension(tournament.media_url, 220, "h")}
                    className="flex w-32 object-cover aspect-square rounded-xl"
                  />
                  <div className="flex flex-col justify-center w-full mx-2">
                    <h3 className="text-sm font-semibold text-emerald-800 group-hover:text-[#EBCE56] text-ellipsis line-clamp-2">{tournament.name}</h3>
                    <span className="text-gray-500 group-hover:text-gray-100 text-[11px] font-light text-ellipsis line-clamp-3">{tournament.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-12 grid grid-cols-12 gap-2 mt-4 h-max">
            <div className="col-span-12 text-emerald-800 flex flex-row my-4">
              <IconLogoAlt className="h-10 w-20" />
              <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
                <div className="h-10 absolute -right-12 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
                Tournament
              </div>
            </div>
            {!detailTournament?.data ? (
              <div className="col-span-12 grid grid-cols-12 sm:gap-4 gap-2 mt-2 rounded-xl min-h-20 text-emerald-800">
                <div className="col-span-12 flex flex-col items-center justify-center py-12 px-4rounded-2xl">
                  <Lucide icon="Trophy" className="h-16 w-16 text-emerald-800/60 mb-4" />
                  <h3 className="text-emerald-800 text-lg font-medium mb-2">No Tournament Available</h3>
                  <p className="text-emerald-800/80 text-sm text-center">Please come back later once the tournament is available.</p>
                </div>
              </div>
            ) : (
              <div className="col-span-12 grid grid-cols-12 sm:gap-4 gap-2 mt-2 rounded-xl min-h-20 text-emerald-800">
                <div className="col-span-12 sm:col-span-8">
                  <h2 className="text-2xl font-bold relative pb-2">
                    {detailTournament?.data.name}
                    <div className="w-8 bottom-0 absolute border-b-4 border-b-emerald-800"></div>
                  </h2>
                  <h4 className="text-sm font-light text-gray-500 py-4 " dangerouslySetInnerHTML={{ __html: detailTournament?.data.description || "" }}></h4>
                  <div className="grid grid-cols-3">
                    <a className="col-span-2 md:col-span-1 text-gray-500 hover:text-emerald-800 text-[11px] font-light flex flex-row items-center" href={`https://www.google.com/maps/search/?api=1&query=${detailTournament?.data.court_info?.lat},${detailTournament?.data.court_info?.long}`} target="_blank" rel="noreferrer">
                      <div className="h-full aspect-square p-2">
                        <Lucide icon="MapPin" className="h-full w-full" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{detailTournament?.data.court_info?.name}</span>
                        <span className="text-xs font-normal">{detailTournament?.data.court_info?.address}</span>
                        <span className="text-xs font-light">{detailTournament?.data.court_info?.city}</span>
                      </div>
                    </a>
                    <div className="col-span-2 md:col-span-1 text-gray-500 text-[11px] font-light flex flex-row items-center">
                      <div className="h-full aspect-square p-2">
                        <Lucide icon="Calendar" className="h-full w-full" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{moment(detailTournament?.data.start_date).format('DD MMM')} -  {moment(detailTournament?.data.end_date).format('DD MMM YYYY')}</span>
                        <span className="text-xs font-semibold text-emerald-800">{moment(detailTournament?.data.start_date).format('HH:mm')} - {moment(detailTournament?.data.end_date).format('HH:mm')}</span>
                        <span className="text-xs font-normal">GMT +7</span>
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1 text-gray-500 text-[11px] font-light flex flex-row items-center">
                      <div className="h-full aspect-square p-2">
                        <Lucide icon="GitPullRequest" className="h-full w-full" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Level</span>
                        <span className="text-xs text-emerald-800 font-semibold">{detailTournament?.data.level}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-4">
                  <img src={imageResizerDimension(detailTournament?.data.media_url || '', 420, "h")} className="flex w-full object-cover aspect-square rounded-xl border" />
                </div>
                <div className="col-span-12 text-emerald-800 flex flex-row my-4">
                  <IconLogoAlt className="h-10 w-20" />
                  <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
                    <div className="h-10 absolute -right-12 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
                    <span className="hidden sm:flex">TOURNAMENT&nbsp;</span>MATCHES
                  </div>
                </div>
                <div className="col-span-12 h-fit overflow-x-scroll">
                  <DraggableBracket
                    rounds={TournamentDrawingUtils.convertMatchToRound(tournamentMatches?.data || [])}
                    readOnly
                    className=""
                    setRounds={() => null}
                    onSeedClick={(seed) => {
                      navigate(paths.tournament.match({ matchUuid: seed.uuid }).$)
                    }}
                  />
                </div>
              </div>
            )}
          </div>
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
        {detailTournament?.data && (
          <FadeAnimation className="col-span-12 ">
            <div className="col-span-12 text-emerald-800 flex flex-row my-4">
              <IconLogoAlt className="h-10 w-20" />
              <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
                <div className="h-10 absolute -right-12 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
                <span className="hidden sm:flex">TOURNAMENT&nbsp;</span>Sponsors
              </div>
            </div>
            <div className="col-span-12 grid grid-cols-12 gap-6 sm:gap-8 mt-2 rounded-xl overflow-x-scroll">
              {tournamentSponsors?.data?.map((image, index) => (
                <div key={index} className="flex flex-col col-span-4 sm:col-span-2 rounded-xl">
                  <div className="relative w-full flex">
                    <img
                      src={imageResizerDimension(image.media_url, 300, "h")}
                      className="flex h-full w-full object-contain aspect-square rounded-xl hover:scale-110 transition-all duration-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </FadeAnimation>
        )}
        {/* <PartnersComponent className="col-span-12 mb-8" /> */}
      </LayoutWrapper>
    </>
  )
}