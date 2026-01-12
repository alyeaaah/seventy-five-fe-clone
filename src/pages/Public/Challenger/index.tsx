import LayoutWrapper from "@/components/LayoutWrapper";
import { FooterComponent } from "../LandingPage/components/FooterComponent";
import { PublicTournamentApiHooks } from "./api";
import { imageResizerDimension } from "@/utils/helper";
import { Link, useNavigate } from "react-router-dom";
import { PublicBlogApiHooks } from "../Blog/api";
import Lucide from "@/components/Base/Lucide";
import moment from "moment";
import { FadeAnimation } from "@/components/Animations";
import { useRef } from "react";
import { CarouselRef } from "antd/es/carousel";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import { IconLogoAlt, IconVS } from "@/assets/images/icons";
import { Upcoming } from "@/assets/images/illustrations/illustrations";
import { PartnersComponent } from "../LandingPage/components/PartnersComponent";
import { NestedImage } from "@/components/NestedImage";

export const PublicChallenger = () => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.tournament.index);
  const { uuid } = queryParams;
  const sliderRef = useRef<CarouselRef>(null);
  const { data: liveMatch } = PublicTournamentApiHooks.useGetOngoingMatch();
  const { data: upcomingMatch } = PublicTournamentApiHooks.useGetUpcomingMatch({
    queries: {
      limit: 20
    }
  },);


  const { data: blogData } = PublicBlogApiHooks.useGetBlogFeatured(
    {
      queries: {
        limit: 9
      }
    }, {
  }
  );
  return (
    <>
      <LayoutWrapper className="grid grid-cols-12 gap-4 sm:gap-8 mt-4 sm:mt-12 min-h-[calc(100vh-300px)]">
        <FadeAnimation className="col-span-12 md:col-span-8 grid grid-cols-12 gap-0 h-max" direction="up">
          <div className="col-span-12  relative rounded-2xl">
            <div className="absolute left-0 top-0 w-full h-full rounded-2xl bg-gradient-to-r from-emerald-800 to-[#EBCE56] z-0 overflow-hidden">
              <div className="h-full aspect-square -translate-x-1 scale-[1.4] translate-y-1">
                <Upcoming className="h-full w-full flex justify-start flex-row" />
              </div>
            </div>
            <div className="col-span-12 flex flex-row overflow-x-scroll gap-2 mt-4 rounded-xl px-4 z-[2] relative scrollbar-hidden">
              <div className="flex min-w-48 h-full z-10"></div>
              {(upcomingMatch?.data?.length ?? 0) > 0 ? (
                upcomingMatch?.data?.map((match, idx) => (
                  <Link key={idx} className='z-10 min-w-80' to={paths.challenger.match({ matchUuid: match.uuid || "" }).$}>
                    <div className='flex flex-col justify-center items-center shadow-md rounded-3xl bg-white mr-0 lg:mr-2 px-2'>
                      <div className='flex flex-row justify-center items-center my-2 text-gray-500 text-xs'>
                        <Lucide icon='MapPin' className='w-6 h-4' /> {match.court_field?.court?.name && `${match.court_field?.court?.name} - ${match.court_field?.name}`}
                      </div>
                      <div className="flex flex-row bg-emerald-800 rounded-full justify-between p-1 w-full h-12">
                        <NestedImage players={match.home_team?.players?.map((player) => ({
                          media_url: player.media_url,
                          name: player.name,
                          uuid: player.uuid
                        })) || []} />
                        <div className='flex flex-row text-white items-center'>
                          <IconVS className="w-16 h-8" />
                        </div>
                        <NestedImage
                          players={match.away_team?.players?.map((player) => ({
                            media_url: player.media_url,
                            name: player.name,
                            uuid: player.uuid
                          })) || []} />
                      </div>
                      <div className='flex flex-row justify-between px-2 py-1 capitalize w-full text-xs text-emerald-800'>
                        <div className="flex flex-col justify-start">
                          {match.home_team?.players?.map((player, idx) => (
                            <span key={idx} className="line-clamp-1">{player.name}</span>
                          ))}
                        </div>
                        <div className="flex flex-col justify-end">
                          {match.away_team?.players?.map((player, idx) => (
                            <span key={idx} className="text-end line-clamp-1">{player.name}</span>
                          ))}
                        </div>
                      </div>
                      <div className='flex flex-row justify-center px-6 capitalize w-full text-xs py-2'>
                        <span className="text-emerald-800 font-semibold border px-2 py-1 border-emerald-800 rounded-full">{moment(match.date).format('ddd, DD MMM YYYY hh:mm')}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="z-10 min-w-80 w-full flex items-center justify-center py-8">
                  <div className="flex flex-col items-center justify-center  rounded-3xl px-6 py-3 text-center">
                    <Lucide icon="Calendar" className="w-8 h-8 text-white" />
                    <div className="mt-2 text-white font-semibold">No upcoming matches</div>
                    <div className="text-xs text-white mt-1">Please check back later.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="col-span-12 grid grid-cols-12 gap-2 mt-4 h-max">
            <div className="col-span-12 text-emerald-800 flex flex-row my-4">
              <IconLogoAlt className="h-10 w-20" />
              <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
                <div className="h-10 absolute -right-12 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
                <span className="hidden sm:flex">RECENT&nbsp;</span>MATCHES
              </div>
            </div>
            <div className="col-span-12 flex flex-col gap-4">
              {(liveMatch?.data?.length ?? 0) > 0 ? (
                liveMatch?.data?.map((match, idx) => (
                  <Link key={idx} to={paths.challenger.match({ matchUuid: match.uuid || "" }).$} className='flex flex-col justify-center items-center shadow-md md:shadow-none rounded-3xl bg-white mr-0 lg:mr-2 px-2 relative border md:border-0'>
                    {/* Desktop */}
                    <div className='md:flex hidden flex-row justify-center overflow-hidden items-center mt-2 -mb-3 z-10 text-gray-500 text-xs border-emerald-800 rounded-full border'>
                      <div className='flex flex-row justify-center capitalize text-xs font-semibold py-1 px-2 bg-white'>
                        <Lucide icon='MapPin' className='w-6 h-4' /> {match.court_field?.court?.name && `${match.court_field?.court?.name} - ${match.court_field?.name}`}
                      </div>
                      <div className='flex flex-row h-full bg-emerald-800 text-white font-semibold items-center py-1 px-2'>
                        <Lucide icon='Calendar' className='w-6 h-4' />
                        <span>{moment(match.date).format('ddd, DD MMM YYYY hh:mm')}</span>
                      </div>
                    </div>
                    <div className="hidden md:flex flex-row bg-gray-100 rounded-full justify-between p-2.5 w-full h-20 relative">
                      <NestedImage
                        players={match.home_team?.players?.map((player) => ({
                          media_url: player.media_url,
                          name: player.name,
                          uuid: player.uuid
                        })) || []} />
                      <div className="flex flex-col w-full items-center justify-center mx-2">
                        <div className='flex flex-row justify-between w-full text-emerald-800 items-center'>
                          <div className="flex flex-col justify-start w-full">
                            {match.home_team?.players?.map((player, idx) => (
                              <Link key={idx} to={paths.players.info({ uuid: player.uuid || "" }).$} className="line-clamp-1 w-fit">{player.name}</Link>
                            ))}
                          </div>
                          <IconVS className="w-32 h-8 text-emerald-800" />
                          <div className="flex flex-col justify-end items-end w-full">
                            {match.away_team?.players?.map((player, idx) => (
                              <Link key={idx} to={paths.players.info({ uuid: player.uuid || "" }).$} className="text-end line-clamp-1 w-fit" >{player.name}</Link>
                            ))}
                          </div>
                        </div>
                      </div>
                      <NestedImage
                        players={match.away_team?.players?.map((player) => ({
                          media_url: player.media_url,
                          name: player.name,
                          uuid: player.uuid
                        })) || []}
                      />
                    </div>
                    {/* Mobile */}
                    <div className='flex md:hidden flex-row justify-center items-center my-2 text-gray-500 text-xs'>
                      <Lucide icon='MapPin' className='w-6 h-4' /> {match.court_field?.court?.name && `${match.court_field?.court?.name} - ${match.court_field?.name}`}
                    </div>
                    <div className="flex md:hidden bg-emerald-800 rounded-full justify-between p-1.5 h-14 w-full">
                      <NestedImage players={match.home_team?.players?.map((player) => ({
                        media_url: player.media_url,
                        name: player.name,
                        uuid: player.uuid
                      })) || []} />
                      <div className='flex flex-row text-white items-center'>
                        <IconVS className="w-16 h-8" />
                      </div>
                      <NestedImage players={match.away_team?.players?.map((player) => ({
                        media_url: player.media_url,
                        name: player.name,
                        uuid: player.uuid
                      })) || []} />
                    </div>
                    <div className='flex md:hidden flex-row justify-between px-2 py-1 capitalize w-full text-xs text-emerald-800 hover:text-emerald-800'>
                      <div className="flex flex-col justify-start">
                        {match.home_team?.players?.map((player, idx) => (
                          <Link key={idx} to={paths.players.info({ uuid: player.uuid || "" }).$} className="line-clamp-1 text-ellipsis overflow-hidden hover:text-emerald-800">{player.name}</Link>
                        ))}
                      </div>
                      <div className="flex  flex-col justify-end">
                        {match.away_team?.players?.map((player, idx) => (
                          <Link key={idx} to={paths.players.info({ uuid: player.uuid || "" }).$} className="text-end line-clamp-1 text-ellipsis overflow-hidden hover:text-emerald-800">{player.name}</Link>
                        ))}
                      </div>
                    </div>
                    <div className='flex md:hidden flex-row justify-center px-6 capitalize w-full text-xs py-2'>
                      <span className="text-emerald-800 font-semibold border px-2 py-1 border-emerald-800 rounded-full">{moment(match.date).format('ddd, DD MMM YYYY hh:mm')}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="w-full flex items-center justify-center py-10">
                  <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-5 text-center w-full">
                    <Lucide icon="Calendar" className="w-8 h-8 text-emerald-800" />
                    <div className="mt-2 text-emerald-800 font-semibold">Matches not available yet</div>
                    <div className="text-xs text-gray-500 mt-1">Matches will appear here once they are available.</div>
                  </div>
                </div>
              )}

            </div>
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
        <FadeAnimation className="col-span-12 mb-24">
          <div className="col-span-12 text-emerald-800 flex flex-row my-4">
            <IconLogoAlt className="h-10 w-20" />
            <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
              <div className="h-10 absolute -right-12 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
              Sponsors
            </div>
          </div>
          <PartnersComponent hideTitle />
        </FadeAnimation>
        {/* <PartnersComponent className="col-span-12 mb-8" /> */}
      </LayoutWrapper>
    </>
  )
}