import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PublicChallangerApiHooks } from '../Challenger/api';
import { matchStatusEnum, ScoreUpdatePayload } from '@/pages/Admin/MatchDetail/api/schema';
import { useRouteParams } from 'typesafe-routes/react-router';
import { paths } from '@/router/paths';
import { PublicTournamentApiHooks } from '../Tournament/api';
import Lucide from '@/components/Base/Lucide';
import moment from 'moment';
import { NestedImage } from '@/components/NestedImage';
import { IconLogo, IconVS } from '@/assets/images/icons';
import Image from '@/components/Image';
import { imageResizer, imageResizerDimension } from '@/utils/helper';
import { Carousel } from 'antd';
import { clientEnv } from '@/env';
import { ScoreWebSocketListener } from '@/components/ScoreWebSocketListener';
import { useScore } from '@/utils/score.util';
import { useDebounce } from 'ahooks';
import { getAvatar } from '@/utils/faker';


export const AllMatches: React.FC = () => {
  const queryParams = useRouteParams(paths.standalone.matches);
  const { event, courts, dark } = queryParams;
  const { getCurrentMatchScores, matchScores } = useScore();
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams();
  const [lastRefetch, setLastRefetch] = useState<Date>(new Date());
  const darkMode = dark === undefined || dark === "" ? new Date().getHours() >= 18 : dark;
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
        matchStatusEnum.Values.PAUSED,
      ],
      courts: searchParams.getAll("courts") || [],
    }
  });
  const { data: ongoingMatches, refetch: refetchOngoingMatches, isLoading: isLoadingOngoingMatches } = PublicChallangerApiHooks.useGetMatches({
    queries: {
      tournament_uuids: tournamentEvent?.data?.tournaments?.map(t => t.uuid) || null,
      status: [
        matchStatusEnum.Values.ONGOING,
      ],
      courts: searchParams.getAll("courts") || [],
    }
  }, {
    onSuccess() {
      setLastRefetch(new Date());
    }
  });
  const { data: recentMatches } = PublicChallangerApiHooks.useGetMatches({
    queries: {
      tournament_uuids: tournamentEvent?.data?.tournaments?.map(t => t.uuid) || null,
      status: [
        matchStatusEnum.Values.ENDED,
      ],
    }
  });

  const { data: tournamentSponsors } = PublicTournamentApiHooks.useGetTournamentDetailSponsors(
    {
      params: {
        tournament_uuid: tournamentEvent?.data?.tournaments?.[0]?.uuid || ''
      }
    },
    {
      enabled: !!(tournamentEvent?.data?.tournaments?.[0]?.uuid || ''),
      retry: false
    }
  );
  const sponsors = [...tournamentSponsors?.data || [], ...tournamentSponsors?.data || [], ...tournamentSponsors?.data || [], ...tournamentSponsors?.data || [], ...tournamentSponsors?.data || []]
  if (eventLoading) return <div>Loading matches...</div>;
  const allCourts = Array.from(
    new Map(
      tournamentEvent?.data?.tournaments
        ?.flatMap(t => t.court_info?.fields ?? [])
        ?.map(court => [court.uuid, court])
    ).values()
  );

  const onWsChange = (dataScore: ScoreUpdatePayload[]) => {

    if (dataScore?.length !== ongoingMatches?.data?.length && !isLoadingOngoingMatches) {
      if (moment(lastRefetch).isBefore(moment().subtract(10, "second"))) {
        setLastRefetch(new Date())
        refetchOngoingMatches()
      }
    }
  }


  return (
    <div className={`grid grid-cols-12 relative ${darkMode ? 'bg-emerald-900' : ''}`}>
      <div className={`absolute top-0 right-0 text-xs sm:text-sm p-2 z-20 ${darkMode ? 'text-white' : 'text-emerald-800'}`}>{clientEnv.VERSION}</div>
      <ScoreWebSocketListener onChange={onWsChange} />
      <div className="col-span-4 hidden sm:flex flex-col px-4 h-[100vh] ">
        <div className='flex flex-col items-center justify-center py-2 col-span-4'>
          {(tournamentEvent?.data?.logo && !tournamentEvent?.data?.logo?.includes('.webm')) && <Image src={imageResizerDimension(tournamentEvent?.data?.logo, 300, "h")} className='w-full h-fit object-contain' />}
          {(tournamentEvent?.data?.logo && tournamentEvent?.data?.logo?.includes('.webm')) && <video src={tournamentEvent?.data?.logo} autoPlay loop muted playsInline className="w-full h-fit object-contain"></video>}
        </div>
        <div className='flex flex-col max-h-[calc(100vh-400px)] min-h-[40vh]'>
          <div className={`flex flex-col items-center ${!!recentMatches?.data?.length ? 'justify-end sss' : 'justify-start'} gap-2 pb-0 my-2 pt-8 relative border-2  rounded-3xl min-h-[30vh] ${!darkMode ? 'border-emerald-800' : 'border-gray-300'}`}>
            <span className={`text-xl font-semibold w-fit absolute -top-1 m-auto -mt-4 px-4 py-1 text-center rounded-full z-10 ${!darkMode ? 'text-white bg-emerald-800' : 'text-emerald-900 bg-gray-200'}`}>RECENT MATCHES</span>
            <div className='max-h-[calc(100%+32px)] min-h-[20vh] overflow-scroll w-full -mt-16 pt-4 px-4 rounded-2xl'>
              {!!recentMatches?.data?.length ? <Carousel
                vertical
                autoplay
                dots={false}
                slidesToScroll={1}
                slidesToShow={recentMatches?.data?.length > 7 ? 7 : recentMatches?.data?.length}
                className='pt-2 min-h-[480px]'
              >
                {recentMatches?.data?.map((item, idx) =>
                  <Link key={idx} className='pb-2 h-24 w-full mb-4' to={paths.challenger.match({ matchUuid: item.uuid || "" }).$}>
                    <div className='flex flex-col justify-center items-center shadow-md rounded-3xl bg-gray-200 mr-0 px-2 pt-2'>
                      <div className="flex bg-white rounded-full justify-between p-1 h-12 w-full">
                        <NestedImage
                          players={item.home_team?.players?.map((player) => ({
                            media_url: player.media_url || getAvatar(player.name + player.email + player.username, player.gender),
                            name: player.name || '',
                            uuid: player.uuid
                          })) || []}
                          useLinks={false}
                        />
                        <div className='flex  text-emerald-800 items-center'>
                          <div className='w-8 font-bold text-center'>
                            {item.home_team_score}
                          </div>
                          <span className='text-2xl font-semibold'>
                            <IconVS className='h-8 w-12' />
                          </span>
                          <div className='w-8 font-bold text-center'>
                            {item.away_team_score}
                          </div>
                        </div>
                        <NestedImage
                          players={item.away_team?.players?.map((player) => ({
                            media_url: player.media_url || getAvatar(player.name + player.email + player.username, player.gender),
                            name: player.name || '',
                            uuid: player.uuid
                          })) || []}
                          useLinks={false}
                        />
                      </div>
                      <div className='flex flex-row justify-between px-4 py-1 capitalize w-full text-xs'>
                        <div className="flex flex-col justify-start font-bold uppercase">
                          {item.home_team?.players?.map((player, idx) => (
                            <span key={idx} className="line-clamp-1">{player.name}</span>
                          ))}
                        </div>
                        <div className="flex flex-col justify-end font-bold uppercase">
                          {item.away_team?.players?.map((player, idx) => (
                            <span key={idx} className="text-end line-clamp-1">{player.name}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>)
                }
              </Carousel> :
                <div className='flex flex-col items-center mt-2 justify-center text-center h-full w-full'>
                  <div className='w-full flex flex-row justify-center '>
                    <IconLogo className={`h-12 w-20 ${darkMode ? 'text-white' : 'text-emerald-800'}`} />
                  </div>
                  <span className={`text-xl ${darkMode ? 'text-white' : 'text-emerald-800'} font-semibold`}>There is no matches ended yet</span>
                </div>
              }

            </div>
          </div>

        </div>
      </div>
      <div className='col-span-12 sm:col-span-8'>
        <div className={`flex flex-row justify-center text-3xl italic relative font-extrabold my-4 ${darkMode ? 'text-white' : 'text-emerald-800'}`}>
          <div className='w-fit relative'>
            <span className='relative z-[2]'>UPCOMING MATCHES</span>
            <span className='absolute -left-0 text-[#EBCE56] blur-sm scale-y-125 scale-x-105'>UPCOMING MATCHES</span>
          </div>
        </div>
        <div className='flex flex-wrap sm:flex-row items-center justify-center gap-2 my-2 '>
          {
            allCourts?.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""))?.map(court => (
              <div
                key={court.uuid}
                className={`flex flex-col border-2 border-emerald-800 rounded-full px-2 py-1 cursor-pointer ${searchParams.getAll("courts").includes(court.uuid || "") ? (darkMode ? " bg-white border-white text-emerald-900" : " bg-emerald-800 !text-white animate-pulse") : (darkMode ? "bg-emerald-900 border-white text-white" : "bg-white text-emerald-800")}`}
                onClick={() => courts !== court.uuid ? setSearchParams({ ...queryParams, courts: court.uuid || "" }) : setSearchParams({ ...queryParams, courts: "" })}
              >
                <div className='flex flex-row justify-center items-center'>
                  <div className='flex flex-row justify-center items-center'>
                    <span className='text-xs whitespace-nowrap sm:text-md font-semibold'>{court?.name}</span>
                  </div>
                </div>
              </div>
            ))
          }
        </div>

        <div className='col-span-12 md:col-span-8 flex flex-col'>
          {ongoingMatches?.data?.map((match, idx) => {
            const curScore = getCurrentMatchScores(match.uuid || "")
            const dbCurGame = match.game_scores?.sort((a, b) => b.game - a.game)?.[0]
            const wsCurGame = curScore?.game_scores?.sort((a, b) => b.game - a.game)?.[0]

            return (
              <div key={idx} onClick={() => navigate(paths.challenger.match({ matchUuid: match.uuid || "" }).$)} className='flex flex-col justify-center items-center my-2 mx-2 shadow-md md:shadow-none rounded-3xl lg:mx-0 lg:mr-2 px-2 relative border md:border-0'>
                {/* Desktop */}
                <div className='md:flex hidden flex-row justify-center overflow-hidden items-center mt-2 -mb-3 text-gray-900 text-xs border-emerald-800 w-fit mx-auto !z-[3] relative rounded-full border'>
                  <div className='flex flex-row justify-center capitalize text-xs font-semibold py-1 px-2 bg-white'>
                    <Lucide icon='MapPin' className='w-6 h-4' /> {match.court_field?.court?.name && `${match.court_field?.court?.name} - ${match.court_field?.name}`}
                  </div>
                  <div className='flex flex-row h-full bg-emerald-800 text-white font-semibold items-center py-1 px-2'>
                    <Lucide icon='Calendar' className='w-6 h-4' />
                    <span>{moment(match.date).format('ddd, DD MMM YYYY HH:mm')}</span>
                  </div>
                </div>
                {match.status !== 'ENDED' && <div className={`md:flex hidden bg-emerald-800 text-white px-2 animate-pulse flex-row justify-center overflow-hidden text-xs rounded-full border absolute z-[2] -bottom-2 left-[calc(50%-48px)] w-24 ${match.status !== 'PAUSED' ? 'border-emerald-800 text-emerald-800 ' : 'bg-yellow-500'}`}>
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
                          <Link key={idx} to={paths.players.info({ uuid: player.uuid || "" }).$} className="line-clamp-1 w-fit text-lg font-semibold uppercase">{player.name}</Link>
                        ))}
                      </div>
                      <div className="flex flex-row items-center justify-center !w-48">
                        <span className="text-lg font-bold w-8 text-center bg-emerald-800 rounded-lg text-white">{wsCurGame?.game_score_home || dbCurGame?.game_score_home}</span>
                        <span className="text-2xl font-bold w-8 text-center">{curScore?.home_team_score || match.home_team_score}</span>
                        <IconVS className="w-16 h-8 text-emerald-800" />
                        <span className="text-2xl font-bold w-8 text-center">{curScore?.away_team_score || match.away_team_score}</span>
                        <span className="text-lg font-bold w-8 text-center bg-emerald-800 rounded-lg text-white">{wsCurGame?.game_score_away || dbCurGame?.game_score_away}</span>
                      </div>
                      <div className="flex flex-col justify-end items-end w-full">
                        {match.away_team?.players?.map((player, idx) => (
                          <Link key={idx} to={paths.players.info({ uuid: player.uuid || "" }).$} className="text-end line-clamp-1 w-fit text-lg font-semibold uppercase" >{player.name}</Link>
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
                <div className={`flex md:hidden flex-row justify-center items-center my-2 ${darkMode ? "text-gray-100" : "text-gray-800"} text-xs`} >
                  <Lucide icon='MapPin' className='w-6 h-4' /> {match.court_field?.court?.name && `${match.court_field?.court?.name} - ${match.court_field?.name}`}
                  <div className="h-3 w-3 rounded-full bg-green-500  ml-2">
                    <div className="h-3 w-3 rounded-full bg-green-500 absolute animate-ping"></div>
                  </div>
                </div>
                <div className="flex md:hidden bg-emerald-800 rounded-full justify-between p-1.5 h-14 w-full">
                  <NestedImage players={match.home_team?.players?.map((player) => ({
                    media_url: player.media_url,
                    name: player.name,
                    uuid: player.uuid
                  })) || []} />
                  <div className='flex flex-row text-white items-center'>
                    <span className="text-sm font-bold w-8 text-center border-white border rounded-lg text-white">{wsCurGame?.game_score_home || dbCurGame?.game_score_home}</span>
                    <span className="text-xl font-bold w-6 text-center">{curScore?.home_team_score || match.home_team_score}</span>
                    <IconVS className="w-16 h-8 " />
                    <span className="text-xl font-bold w-6 text-center">{curScore?.away_team_score || match.away_team_score}</span>
                    <span className="text-sm font-bold w-8 text-center border-white border rounded-lg text-white">{wsCurGame?.game_score_away || dbCurGame?.game_score_away}</span>

                  </div>
                  <NestedImage players={match.away_team?.players?.map((player) => ({
                    media_url: player.media_url,
                    name: player.name,
                    uuid: player.uuid
                  })) || []} />
                </div>
                <div className={`flex md:hidden flex-row justify-between px-2 py-1 capitalize w-full text-xs ${darkMode ? 'text-white' : 'text-emerald-800'}`}>
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
                  <span className={`text-emerald-800 font-semibold border px-2 py-1 border-emerald-800 rounded-full ${darkMode ? "bg-emerald-800 text-white" : "bg-white text-emerald-800"}`}>{moment(match.date).format('ddd, DD MMM YYYY HH:mm')}</span>
                </div>
              </div>)
          })}
          <Carousel
            autoplay
            autoplaySpeed={7500}
            slidesToShow={8}
            swipeToSlide={true}
            vertical
            dots={true}
            dotPosition='bottom'
            className='mx-2 sm:mx-0'
            slidesToScroll={1}
          >
            {upcomingMatches?.data?.map((match, idx) => (
              <div key={idx} onClick={() => navigate(paths.challenger.match({ matchUuid: match.uuid || "" }).$)} className='flex flex-col justify-center items-center my-2 shadow-md md:shadow-none rounded-3xl mx-0 lg:mx-0 lg:mr-2 px-2 relative border md:border-0'>
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
                      media_url: player.media_url || getAvatar(player.name + player.email + player.username, player.gender),
                      name: player.name,
                      uuid: player.uuid
                    })) || []} />
                  <div className="flex flex-col w-full items-center justify-center mx-2">
                    <div className='flex flex-row justify-between w-full text-emerald-800 items-center'>
                      <div className="flex flex-col justify-start w-full">
                        {match.home_team?.players?.map((player, idx) => (
                          <Link key={idx} to={paths.players.info({ uuid: player.uuid || "" }).$} className="line-clamp-1 w-fit text-lg font-semibold uppercase">{player.name}</Link>
                        ))}
                      </div>
                      <div className="flex flex-row items-center justify-center !w-48">
                        <span className="text-2xl font-bold w-8 text-center">{match.home_team_score}</span>
                        <IconVS className="w-16 h-8 text-emerald-800" />
                        <span className="text-2xl font-bold w-8 text-center">{match.away_team_score}</span>
                      </div>
                      <div className="flex flex-col justify-end items-end w-full">
                        {match.away_team?.players?.map((player, idx) => (
                          <Link key={idx} to={paths.players.info({ uuid: player.uuid || "" }).$} className="text-end line-clamp-1 w-fit text-lg font-semibold uppercase" >{player.name}</Link>
                        ))}
                      </div>
                    </div>
                  </div>
                  <NestedImage
                    players={match.away_team?.players?.map((player) => ({
                      media_url: player.media_url || getAvatar(player.name + player.email + player.username, player.gender),
                      name: player.name,
                      uuid: player.uuid
                    })) || []}
                  />
                </div>
                {/* Mobile */}
                <div className={`flex md:hidden flex-row justify-center items-center my-2 ${darkMode ? "text-gray-100" : "text-gray-800"} text-xs`} >
                  <Lucide icon='MapPin' className='w-6 h-4' /> {match.court_field?.court?.name && `${match.court_field?.court?.name} - ${match.court_field?.name}`}
                </div>
                <div className="flex md:hidden bg-emerald-800 rounded-full justify-between p-1.5 h-14 w-full">
                  <NestedImage players={match.home_team?.players?.map((player) => ({
                    media_url: player.media_url || getAvatar(player.name + player.email + player.username, player.gender),
                    name: player.name,
                    uuid: player.uuid
                  })) || []} />
                  <div className='flex flex-row text-white items-center'>
                    <IconVS className="w-16 h-8" />
                  </div>
                  <NestedImage players={match.away_team?.players?.map((player) => ({
                    media_url: player.media_url || getAvatar(player.name + player.email + player.username, player.gender),
                    name: player.name,
                    uuid: player.uuid
                  })) || []} />
                </div>
                <div className={`flex md:hidden flex-row justify-between px-2 py-1 capitalize w-full text-xs ${darkMode ? 'text-white' : 'text-emerald-800'}`}>
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
                  <span className={`text-emerald-800 font-semibold border px-2 py-1 border-emerald-800 rounded-full ${darkMode ? "bg-emerald-800 text-white" : "bg-white text-emerald-800"}`}>{moment(match.date).format('ddd, DD MMM YYYY HH:mm')}</span>
                </div>
              </div>))}
          </Carousel>
        </div>
      </div>
      {/* Bottom Section - Sponsors (20% height) */}
      <div className={`col-span-4 fixed bottom-0 right-0 left-0 items-center rounded-t-full justify-center py-3 px-4 h-[64px]`}>
        <div className="w-full h-full absolute rounded-t-full left-0 top-4 bg-[url('https://res.cloudinary.com/doqyrkqgw/image/upload/v1782314140/adboard-100-white_ykyl8b.webp')] blur-lg"></div>
        {/* Replace this section with your actual sponsor content */}
        <div

          x-data="{}"
          x-init="$nextTick(() => {
              let ul = $refs.logos;
              ul.insertAdjacentHTML('afterend', ul.outerHTML);
              ul.nextSibling.setAttribute('aria-hidden', 'true');
          })"
          className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]">
          <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll">

            {sponsors.map((image, index) => (
              <li key={index} className="flex items-center justify-center max-h-12 w-auto">
                <Image src={imageResizerDimension(image?.media_url || '', 200, 'h')} alt={`Sponsor ${index + 1}`} className="h-12 w-fit object-contain rounded-lg overflow-hidden" />
              </li>
            ))}
          </ul>
          <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll" aria-hidden="true">
            {sponsors.map((image, index) => (
              <li key={index} className="flex items-center justify-center max-h-12 w-auto">
                <Image src={imageResizerDimension(image?.media_url || '', 200, 'h')} alt={`Sponsor ${index + 1}`} className="h-12 w-fit object-contain rounded-lg overflow-hidden" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div >
  );
};