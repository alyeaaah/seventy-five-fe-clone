import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PublicChallangerApiHooks } from '../Challenger/api';
import { matchStatusEnum } from '@/pages/Admin/MatchDetail/api/schema';
import { useRouteParams } from 'typesafe-routes/react-router';
import { paths } from '@/router/paths';
import { PublicTournamentApiHooks } from '../Tournament/api';
import { match } from 'assert';
import Lucide from '@/components/Base/Lucide';
import moment from 'moment';
import { NestedImage } from '@/components/NestedImage';
import { IconVS } from '@/assets/images/icons';
import Image from '@/components/Image';
import { imageResizer, imageResizerDimension } from '@/utils/helper';
import { Carousel } from 'antd';


export const AllMatches: React.FC = () => {
  const queryParams = useRouteParams(paths.standalone.matches);
  const { event, courts } = queryParams;
  const [searchParams, setSearchParams] = useSearchParams();

  // Get tournament event detail data
  const { data: tournamentEvent, isLoading: eventLoading } = PublicTournamentApiHooks.useGetPublicTournamentEventDetail(
    {
      params: {
        uuid: event || ''
      }
    },
    {
      enabled: !!event,
      retry: false
    }
  );


  const { data: upcomingMatches } = PublicChallangerApiHooks.useGetMatches({
    queries: {
      tournament_uuids: tournamentEvent?.data?.tournaments?.map(t => t.uuid) || null,
      status: [
        matchStatusEnum.Values.UPCOMING,
        matchStatusEnum.Values.ONGOING,
        matchStatusEnum.Values.PAUSED,
      ],
      courts: searchParams.getAll("courts") || [],
    }
  });
  const { data: recentMatches } = PublicChallangerApiHooks.useGetMatches({
    queries: {
      // tournament_uuids: tournamentEvent?.data?.tournaments?.map(t => t.uuid) || null,
      status: [
        matchStatusEnum.Values.ENDED,
      ],
    }
  });

  if (eventLoading) return <div>Loading matches...</div>;
  const allCourts = Array.from(
    new Map(
      tournamentEvent?.data?.tournaments
        ?.flatMap(t => t.court_info?.fields ?? [])
        ?.map(court => [court.uuid, court])
    ).values()
  );

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-4 flex flex-col px-4 h-[100vh] ">
        <div className='flex flex-col items-center justify-center py-2 col-span-4'>
          {(tournamentEvent?.data?.logo && !tournamentEvent?.data?.logo?.includes('.webm')) && <Image src={imageResizerDimension(tournamentEvent?.data?.logo, 300, "h")} className='w-full h-fit object-contain' />}
          {(tournamentEvent?.data?.logo && tournamentEvent?.data?.logo?.includes('.webm')) && <video src={tournamentEvent?.data?.logo} autoPlay loop muted playsInline className="w-full h-fit object-contain"></video>}
        </div>
        <div className='flex flex-col max-h-[calc(100vh-400px)]'>
          <div className='flex flex-col items-center justify-center gap-2 my-2 pt-8 relative border-2 border-emerald-800 rounded-3xl min-h-[30vh] '>
            <span className='text-xl font-semibold w-fit absolute -top-1 m-auto -mt-4 px-4 py-1 text-center text-white bg-emerald-800 rounded-full z-10'>RECENT MATCHES</span>
            <div className='max-h-full overflow-scroll w-full'>
              {recentMatches?.data?.length !== 0 ?
                recentMatches?.data?.map((item, idx) =>
                  <Link key={idx} className='pb-2 px-2 w-full' to={paths.challenger.match({ matchUuid: item.uuid || "" }).$}>
                    <div className='flex flex-col justify-center items-center shadow-md rounded-3xl bg-gray-200 mr-0 lg:mr-2 px-2'>
                      <div className='flex flex-row justify-center items-center my-2 text-gray-500 text-xs'>
                        <Lucide icon='MapPin' className='w-6 h-4' /> <span className="text-ellipsis line-clamp-1">{item.court_field?.court?.name && `${item.court_field?.court?.name} - ${item.court_field?.name}`}</span>
                      </div>
                      <div className="flex bg-white rounded-full justify-between p-1 h-12 w-full">
                        <NestedImage
                          players={item.home_team?.players?.map((player) => ({
                            media_url: player.media_url || '',
                            name: player.name || '',
                            uuid: player.uuid
                          })) || []}
                          useLinks={false}
                        />
                        <div className='flex  text-emerald-800 items-center'>
                          <span className='text-2xl font-semibold'>VS</span>
                        </div>
                        <NestedImage
                          players={item.away_team?.players?.map((player) => ({
                            media_url: player.media_url || '',
                            name: player.name || '',
                            uuid: player.uuid
                          })) || []}
                          useLinks={false}
                        />
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
                    </div>
                  </Link>)
                :
                <span className='text-xl text-emerald-800 font-semibold'>NO RECENT MATCHES</span>
              }

            </div>
          </div>

        </div>
      </div>
      <div className='col-span-8'>
        <div className='flex flex-row justify-center text-3xl italic  font-extrabold text-emerald-800 my-4'>UPCOMING MATCHES</div>
        <div className='flex flex-row items-center justify-center gap-2 my-2 '>
          {
            allCourts?.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""))?.map(court => (
              <div
                key={court.uuid}
                className={`flex flex-col border-2 border-emerald-800 rounded-full px-2 py-1 cursor-pointer ${searchParams.getAll("courts").includes(court.uuid || "") ? " bg-emerald-800 !text-white animate-pulse" : "bg-white text-emerald-800"}`}
                onClick={() => courts !== court.uuid ? setSearchParams({ ...queryParams, courts: court.uuid || "" }) : setSearchParams({ ...queryParams, courts: "" })}
              >
                <div className='flex flex-row justify-center items-center'>
                  <div className='flex flex-row justify-center items-center'>
                    <span className='text-md font-semibold'>{court?.name}</span>
                  </div>
                </div>
              </div>
            ))
          }
        </div>

        <div className='col-span-12 md:col-span-8'>
          <Carousel
            autoplay
            autoplaySpeed={7500}
            slidesToShow={8}
            vertical
            dots={true}
            dotPosition='bottom'
            slidesToScroll={1}
          >
            {upcomingMatches?.data?.map((match, idx) => (
              <Link key={idx} to={paths.challenger.match({ matchUuid: match.uuid || "" }).$} className='flex flex-col justify-center items-center my-2 shadow-md md:shadow-none rounded-3xl bg-white mr-0 lg:mr-2 px-2 relative border md:border-0'>
                {/* Desktop */}
                <div className='md:flex hidden flex-row justify-center overflow-hidden items-center mt-2 -mb-3 text-gray-500 text-xs border-emerald-800 w-fit mx-auto !z-[3] relative rounded-full border'>
                  <div className='flex flex-row justify-center capitalize text-xs font-semibold py-1 px-2 bg-white'>
                    <Lucide icon='MapPin' className='w-6 h-4' /> {match.court_field?.court?.name && `${match.court_field?.court?.name} - ${match.court_field?.name}`}
                  </div>
                  <div className='flex flex-row h-full bg-emerald-800 text-white font-semibold items-center py-1 px-2'>
                    <Lucide icon='Calendar' className='w-6 h-4' />
                    <span>{moment(match.date).format('ddd, DD MMM YYYY HH:mm')}</span>
                  </div>
                </div>
                {match.status !== 'ENDED' && <div className={`md:flex hidden bg-white px-2 flex-row justify-center overflow-hidden text-xs rounded-full border absolute z-[2] -bottom-2 left-[calc(50%-48px)] w-24 ${match.status !== 'PAUSED' ? 'border-emerald-800 text-emerald-800 ' : 'bg-yellow-500'}`}>
                  {match.status}
                </div>}
                <div className="hidden md:flex flex-row bg-gray-100 rounded-full justify-between p-2.5 w-full h-20 relative !z-[1] ">
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
                          <Link key={idx} to={paths.players.info({ uuid: player.uuid || "" }).$} className="line-clamp-1 w-fit text-lg font-semibold">{player.name}</Link>
                        ))}
                      </div>
                      <div className="flex flex-row items-center justify-center !w-48">
                        <span className="text-2xl font-bold w-8 text-center">{match.home_team_score}</span>
                        <IconVS className="w-16 h-8 text-emerald-800" />
                        <span className="text-2xl font-bold w-8 text-center">{match.away_team_score}</span>
                      </div>
                      <div className="flex flex-col justify-end items-end w-full">
                        {match.away_team?.players?.map((player, idx) => (
                          <Link key={idx} to={paths.players.info({ uuid: player.uuid || "" }).$} className="text-end line-clamp-1 w-fit text-lg font-semibold" >{player.name}</Link>
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
                < div className='flex md:hidden flex-row justify-center items-center my-2 text-gray-500 text-xs' >
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
                  <span className="text-emerald-800 font-semibold border px-2 py-1 border-emerald-800 rounded-full">{moment(match.date).format('ddd, DD MMM YYYY HH:mm')}</span>
                </div>
              </Link>))}
          </Carousel>
        </div>
      </div>
    </div >
  );
};