import LayoutWrapper from "@/components/LayoutWrapper";
import { FooterComponent } from "../LandingPage/components/FooterComponent";
import { PublicMatchApiHooks } from "./api";
import { Divider, Progress } from "antd";
import { getCurrentMatch } from "@/utils/helper";
import { Link, useNavigate } from "react-router-dom";
import Lucide from "@/components/Base/Lucide";
import moment from "moment";
import { FadeAnimation } from "@/components/Animations";
import { useRef, useState } from "react";
import { CarouselRef } from "antd/es/carousel";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import { IconLogo, IconLogoAlt, IconVS } from "@/assets/images/icons";
import { PartnersComponent } from "../LandingPage/components/PartnersComponent";
import { PublicTournamentApiHooks } from "../Tournament/api";
import { useMatchScore } from "@/pages/Admin/MatchDetail/api/firestore";
import YouTube from "react-youtube";
import { useAtomValue } from "jotai";
import { userAtom } from "@/utils/store";
import Button from "@/components/Base/Button";
import { matchStatusEnum } from "@/pages/Admin/MatchDetail/api/schema";
import { Helmet } from "react-helmet";
import Modal from "antd/es/modal/Modal";
import { KudosModal } from "@/pages/Players/Components/KudosModal";

export const PublicMatchDetail = () => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.tournament.match);
  const { matchUuid } = queryParams;
  const sliderRef = useRef<CarouselRef>(null);
  const { data: liveMatch } = PublicTournamentApiHooks.useGetOngoingMatch();
  const userData = useAtomValue(userAtom);
  const [modalKudos, setModalKudos] = useState<{
    open: boolean;
    matchUuid: string;
    playerUuid: string;
    playerName: string;
  }>({
    open: false,
    matchUuid: "",
    playerUuid: "",
    playerName: ""
  });

  const { data } = PublicMatchApiHooks.useGetMatchDetail({
    params: {
      uuid: matchUuid
    },
  }, {
    onSuccess: () => {
    },
    retry: false
  });
  const { data: tournamentInfo } = PublicTournamentApiHooks.useGetTournamentDetail({
    params: {
      uuid: data?.data?.tournament_uuid || ""
    },
  }, {
    enabled: !!data?.data?.tournament_uuid
  });

  const { data: detailPointConfig } = PublicMatchApiHooks.useGetPointConfig(
    {
      params: {
        uuid: tournamentInfo?.data?.point_config_uuid || 0
      }
    }, {
    enabled: (!!tournamentInfo?.data?.point_config_uuid)
  });

  const { data: scores, unsubscribe: unsubscribeFirestore, isLoading: isLoadingScore, fetchScores } = useMatchScore(
    matchUuid,
    () => { }
  );
  const handlePopState = useRef((event: PopStateEvent) => {
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
    event.preventDefault();
  });
  window.addEventListener("popstate", handlePopState.current);
  const currentScore = getCurrentMatch(scores || []);
  const getPlayerKudos = (playerUuid: string) => {
    return userData?.uuid ? data?.data?.player_kudos?.filter((item) => item.player_uuid === playerUuid) : [];
  }
  const showGiveKudosButton = (playerUuid: string) => {
    if (!userData?.uuid) return false;
    if (data?.data?.status !== matchStatusEnum.Values.ENDED) return false;
    if (playerUuid == userData.uuid) return false;
    const isPlayerPlaying = data?.data?.home_team?.players?.find((item) => item.uuid === userData.uuid) || data?.data?.away_team?.players?.find((item) => item.uuid === userData.uuid);
    if (!isPlayerPlaying) return false;
    // return false if userData.uuid is already sent kudos
    const isAlreadySentKudos = data?.data?.player_kudos?.find((item) => item.player_uuid === playerUuid && item.by_uuid === userData.uuid && item.player_uuid !== userData.uuid);
    return !isAlreadySentKudos;
  }

  return (
    <>
      <LayoutWrapper className="grid grid-cols-12 gap-4 sm:gap-8 mt-4 sm:mt-8 min-h-[calc(100vh-300px)]">
        <Helmet
          title={`75 Tennis Club | ${tournamentInfo?.data?.name} - Match ${data?.data?.tournament_uuid && data?.data?.seed_index}`}
        />
        <FadeAnimation className="col-span-12 md:col-span-12 grid grid-cols-12 gap-0 h-max" direction="up">
          <div className="col-span-12 grid grid-cols-12 gap-2 h-max">
            {data?.data?.youtube_url &&
              <>
                <div className="col-span-12 text-emerald-800 flex flex-row justify-center md:justify-start">
                  <IconLogoAlt className="h-10 w-20" />
                  <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
                    MATCH VIDEO
                  </div>
                  <div className="h-10 ml-1.5 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
                </div>
                <div className="col-span-12 rounded-3xl overflow-hidden aspect-video" key={data?.data?.youtube_url}>
                  <YouTube videoId={(data?.data?.youtube_url)?.split("?v=").pop()} iframeClassName="w-full h-full" className="w-full h-full" />
                </div>
              </>}
            <div className="col-span-12 mt-4 text-emerald-800 flex flex-row justify-center md:justify-start">
              <IconLogoAlt className="h-10 w-20" />
              <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
                <span className="hidden sm:flex">MATCH&nbsp;</span>INFORMATION
              </div>
              <div className="h-10 ml-1.5 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
            </div>

            <div className=" col-span-12 !z-0 text-emerald-800">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 flex flex-col justify-center items-center">
                  <div className="text-xl font-bold capitalize">
                    {!data?.data?.tournament_uuid && "Custom "}Match {data?.data?.tournament_uuid && data?.data?.seed_index}
                  </div>
                  <div className="hidden sm:flex text-sm text-center text-emerald-800">
                    {tournamentInfo?.data?.name}{tournamentInfo?.data?.type == "KNOCKOUT" && ` - Round ${data?.data?.round}`}
                  </div>
                  <div className="sm:hidden flex flex-col text-sm text-center text-emerald-800">
                    {tournamentInfo?.data?.name}{tournamentInfo?.data?.type == "KNOCKOUT" && <span className="">Round {data?.data?.round}</span>}
                  </div>
                  <div className="text-xs text-center text-gray-600 flex flex-col sm:flex-row items-center justify-center mt-2">
                    <div className="flex flex-row items-center sm:mr-2 border rounded-md px-2 py-1 border-gray-400 mb-1">
                      <Lucide icon="MapPin" className="mr-1" />
                      {`${data?.data?.court_field?.court?.name} - ${data?.data?.court_field?.name}`}
                    </div>
                    <div className="flex flex-row items-center border rounded-md px-2 py-1  border-gray-400 mb-1">
                      <Lucide icon="Calendar" className="mr-1" />
                      {moment(data?.data?.date).format('dddd, DD MMM YYYY')}
                    </div>
                  </div>
                </div>
                {/* BEGIN: Score */}
                <div className="sm:col-span-5 col-span-6 grid grid-cols-12">
                  {/* START: Score Left Side */}
                  <div className="col-span-12 flex flex-row justify-end items-center">
                    <div className="flex flex-col">
                      <div className={`border font-bold text-emerald-800 bg-white border-emerald-800 w-14 h-14 flex items-center justify-center rounded-xl ${["WIN", "LOSE"].includes(currentScore?.game_score_home + "") ? "text-lg" : "text-3xl"}`}>
                        {currentScore?.game_score_home || 0}
                      </div>
                    </div>
                    <div className="flex flex-col ml-2 ">
                      <div className="border text-3xl font-bold text-white bg-emerald-800 border-emerald-800 w-14 h-14 flex items-center justify-center rounded-xl">
                        {currentScore?.prev?.set_score_home || 0}
                      </div>
                    </div>
                  </div>
                  {/* END: Score Left Side */}
                  <Divider className="col-span-12 my-2" />
                  <div className="col-span-12 flex flex-col items-end">
                    <h2 className="text-lg font-bold capitalize">{data?.data?.home_team?.name} </h2>
                    <h3 className="text-base font-normal capitalize">{data?.data?.home_team?.alias}</h3>
                  </div>
                </div>
                <div className="col-span-0 hidden sm:col-span-2 sm:flex flex-col justify-center items-center">
                  <div className="h-16 w-24 relative">
                    <IconVS className="h-16 w-full text-warning absolute top-0 -left-0.5" />
                    <IconVS className="h-16 w-full text-emerald-800 absolute top-0 left-0.5" />
                  </div>
                  {![currentScore?.game_score_away, currentScore?.game_score_home].includes("WIN") ?
                    <h1 className="text-xs font-bold">Game {currentScore?.set || 1}</h1>
                    :
                    <h1 className="text-xs font-bold">Match Ended</h1>
                  }
                </div>
                <div className="sm:col-span-5 col-span-6 grid grid-cols-12">
                  {/* START: Score Right Side */}
                  <div className="col-span-12 flex flex-row justify-start items-center">
                    <div className="flex flex-col mr-2">
                      <div className="border text-3xl font-bold text-white bg-emerald-800 border-emerald-800 w-14 h-14 flex items-center justify-center rounded-xl">
                        {currentScore?.prev?.set_score_away || 0}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className={`border font-bold text-emerald-800 bg-white border-emerald-800 w-14 h-14 flex items-center justify-center rounded-xl ${["WIN", "LOSE"].includes(currentScore?.game_score_away + "") ? "text-lg" : "text-3xl"}`}>
                        {currentScore?.game_score_away || 0}
                      </div>
                    </div>
                  </div>
                  {/* END: Score Right Side*/}
                  <Divider className="col-span-12 my-2" />
                  <div className="col-span-12 flex flex-col items-start">
                    <h2 className="text-lg font-bold capitalize">{data?.data?.away_team?.name} </h2>
                    <h3 className="text-base font-normal capitalize">{data?.data?.away_team?.alias}</h3>
                  </div>
                </div>
                {/* END: Score */}
                {/* BEGIN: Player SM */}
                <div className="col-span-5 hidden sm:flex flex-col justify-start">
                  <div className="grid grid-cols-12 gap-2">
                    {data?.data?.home_team?.players?.map((player, index) => (
                      <div key={index} className="col-span-6 flex flex-col gap-2 hover:text-emerald-800">
                        <Link
                          to={paths.players.info({ uuid: player?.uuid || "" }).$}
                          className="col-span-12 border rounded-lg p-2 hover:scale-105 transition-all duration-500 cursor-pointer"
                        >
                          <div className="flex flex-row items-center justify-end">
                            <div className="mr-2">
                              <h2 className="text-sm text-right font-bold capitalize">{player?.name}</h2>
                              <h3 className="text-xs text-right font-normal capitalize">{player?.nickname}</h3>
                            </div>
                            <div className="border rounded-lg p-0.5">
                              <img src={player?.media_url} alt={player?.name} className="w-12 h-12 rounded-lg object-cover" />
                            </div>
                          </div>
                        </Link>
                        <Link to={paths.players.info({ uuid: player?.uuid || "" }).$} className="col-span-12 flex flex-col gap-2">
                          <div className="px-2 flex flex-col items-end">
                            <div className="text-xs text-right font-normal capitalize">Height</div>
                            <div className="text-xs text-right font-medium capitalize">{player?.height}cm</div>
                          </div>
                          <div className="px-2 flex flex-col items-end">
                            <div className="text-xs text-right font-normal capitalize">Forehand Style</div>
                            <div className="text-xs text-right font-medium capitalize">{player?.playstyleForehand}</div>
                          </div>
                          <div className="px-2 flex flex-col items-end">
                            <div className="text-xs text-right font-normal capitalize">Backhand Style</div>
                            <div className="text-xs text-right font-medium capitalize">{player?.playstyleBackhand}</div>
                          </div>
                          <div className="px-2 flex flex-col items-end">
                            <div className="text-xs text-right font-normal capitalize">Forehand</div>
                            <Progress percent={player?.skills?.forehand || 0} style={{ direction: "rtl", color: "#000" }} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                          </div>
                          <div className="px-2 flex flex-col items-end">
                            <div className="text-xs text-right font-normal capitalize">Backhand</div>
                            <Progress percent={player?.skills?.backhand || 0} style={{ direction: "rtl", color: "#000" }} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                          </div>
                          <div className="px-2 flex flex-col items-end">
                            <div className="text-xs text-right font-normal capitalize">Serve</div>
                            <Progress percent={player?.skills?.serve || 0} style={{ direction: "rtl", color: "#000" }} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                          </div>
                          <div className="px-2 flex flex-col items-end">
                            <div className="text-xs text-right font-normal capitalize">Volley</div>
                            <Progress percent={player?.skills?.volley || 0} style={{ direction: "rtl", color: "#000" }} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                          </div>
                          <div className="px-2 flex flex-col items-end">
                            <div className="text-xs text-right font-normal capitalize">Overhead</div>
                            <Progress percent={player?.skills?.overhead || 0} style={{ direction: "rtl", color: "#000" }} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                          </div>
                        </Link>

                        {showGiveKudosButton(player?.uuid || "") && (
                          <div className="flex flex-col items-end">
                            <Button
                              variant="outline-primary"
                              className="text-emerald-800 w-full border-emerald-800"
                              onClick={() => {
                                setModalKudos({
                                  open: true,
                                  matchUuid: matchUuid || "",
                                  playerUuid: player?.uuid || "",
                                  playerName: player?.name || ""
                                });
                              }}
                            >
                              Give Kudos
                            </Button>
                          </div>
                        )}
                        {getPlayerKudos(player?.uuid || "")?.length ? (
                          <div className="flex flex-col items-end bg-gray-200 rounded-lg p-2 pt-6 px-4 relative overflow-hidden"
                          onClick={() => {
                            setModalKudos({
                              open: true,
                              matchUuid: matchUuid || "",
                              playerUuid: player?.uuid || "",
                              playerName: player?.name || ""
                            });
                          }}>
                            <div className="absolute font-bold text-5xl -top-2 -left-2 opacity-25">Kudos</div>
                            <div className="text-xs text-right font-medium capitalize flex flex-wrap gap-1">
                              {getPlayerKudos(player?.uuid || "")?.map((item, index) => (
                                <div className="px-3 py-1 rounded-full bg-emerald-800 text-white font-bold bg-opacity-80 hover:bg-opacity-100 transition-all duration-500 cursor-pointer" key={index}>{item.kudos}</div>
                              ))}
                            </div>
                            <div className="text-xs text-right font-medium capitalize flex flex-col mt-2 gap-2">
                              {getPlayerKudos(player?.uuid || "")?.filter((item) => item.kudos_text).map((item, index) => (
                                <div className="flex flex-col items-end">
                                  <div className="text-xs text-right font-medium capitalize bg-[#EBCE56] w-fit px-2 py-1 pb-0 rounded-t-lg flex flex-row">{item.by_uuid == userData?.uuid ? "You" : item.by} <Lucide icon="User" className="w-4 h-4 ml-1"/></div>
                                  <div className="px-3 py-1 rounded-b-lg rounded-tl-lg bg-white text-emerald-800 text-xs bg-opacity-80 cursor-pointer text-left" key={index}>
                                    {item.kudos_text}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        
                      </div>
                    ))}
                    <div className="col-span-6">
                    </div>
                  </div>
                </div>
                <div className="col-span-2 hidden sm:flex flex-col justify-start items-center">
                  {/* sort and remove first index */}
                  <div className="rounded-xl overflow-hidden border">
                    {(scores || []).sort((a, b) => b.set - a.set).slice(1).map((setScore, i) => (
                      <div key={setScore.refId} className="flex flex-row font-semibold">
                        <div className={`flex justify-center items-center w-8 ${i % 2 === 0 ? "bg-slate-100" : "bg-slate-50"}`}>
                          <span className={`text-sm capitalize ${setScore.game_score_home > setScore.game_score_away || setScore.game_score_home == "AD" ? "text-emerald-800" : "text-red-400"}`}>
                            {setScore.game_score_home == "WIN" ? (setScore.game_score_away == "40" ? "AD" : "40") : setScore.game_score_home}
                          </span>
                        </div>
                        <div className={`flex justify-center items-center w-20 py-2 ${i % 2 === 0 ? "bg-slate-100" : "bg-slate-50"}`}>
                          <span className="text-center capitalize text-slate-500 text-xs">Game {setScore.set}</span>
                        </div>
                        <div className={` flex justify-center items-center w-8 ${i % 2 === 0 ? "bg-slate-100" : "bg-slate-50"}`}>
                          <span className={`text-sm capitalize ${setScore.game_score_away > setScore.game_score_home || setScore.game_score_away == "AD" ? "text-emerald-800" : "text-red-400"}`}>
                            {setScore.game_score_away == "WIN" ? (setScore.game_score_home == "40" ? "AD" : "40") : setScore.game_score_away}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-5 hidden sm:flex flex-col justify-start">
                  <div className="grid grid-cols-12 gap-2">
                    {data?.data?.away_team?.players?.map((player, index) => (
                      <div key={index} className="col-span-6 flex flex-col gap-2 hover:text-emerald-800">
                        <Link
                          to={paths.players.info({ uuid: player?.uuid || "" }).$}
                          className="col-span-12 border rounded-lg p-2 hover:scale-105 transition-all cursor-pointer"
                          onClick={() => {
                            navigate(paths.administrator.players.edit({ player: player?.uuid || "" }).$);
                          }}
                        >
                          <div className="flex flex-row items-center">
                            <div className="border rounded-lg p-0.5">
                              <img src={player?.media_url} alt={player?.name} className="w-12 h-12 rounded-lg object-cover" />
                            </div>
                            <div className="ml-2">
                              <h2 className="text-sm text-left font-bold capitalize">{player?.name}</h2>
                              <h3 className="text-xs text-left font-normal capitalize">{player?.nickname}</h3>
                            </div>
                          </div>
                        </Link>
                        <Link to={paths.players.info({ uuid: player?.uuid || "" }).$} className="col-span-12 flex flex-col gap-2">
                          <div className="px-2 flex flex-col items-start">
                            <div className="text-xs font-normal capitalize">Height</div>
                            <div className="text-xs font-medium capitalize">{player?.height}cm</div>
                          </div>
                          <div className="px-2 flex flex-col items-start">
                            <div className="text-xs font-normal capitalize">Forehand Style</div>
                            <div className="text-xs font-medium capitalize">{player?.playstyleForehand}</div>
                          </div>
                          <div className="px-2 flex flex-col items-start">
                            <div className="text-xs font-normal capitalize">Backhand Style</div>
                            <div className="text-xs font-medium capitalize">{player?.playstyleBackhand}</div>
                          </div>
                          <div className="px-2 flex flex-col items-start">
                            <div className="text-xs font-normal capitalize">Forehand</div>
                            <Progress percent={player?.skills?.forehand || 0} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                          </div>
                          <div className="px-2 flex flex-col items-start">
                            <div className="text-xs font-normal capitalize">Backhand</div>
                            <Progress percent={player?.skills?.backhand || 0} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                          </div>
                          <div className="px-2 flex flex-col items-start">
                            <div className="text-xs font-normal capitalize">Serve</div>
                            <Progress percent={player?.skills?.serve || 0} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                          </div>
                          <div className="px-2 flex flex-col items-start">
                            <div className="text-xs font-normal capitalize">Volley</div>
                            <Progress percent={player?.skills?.volley || 0} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                          </div>
                          <div className="px-2 flex flex-col items-start">
                            <div className="text-xs font-normal capitalize">Overhead</div>
                            <Progress percent={player?.skills?.overhead || 0} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                        </div>
                        </Link>
                        {showGiveKudosButton(player?.uuid || "") && (
                          <div className="flex flex-col items-start">
                            <Button
                              variant="outline-primary"
                              className="text-emerald-800 border-emerald-800 w-full"
                              onClick={() => {
                                setModalKudos({
                                  open: true,
                                  matchUuid: matchUuid || "",
                                  playerUuid: player?.uuid || "",
                                  playerName: player?.name || ""
                                });
                              }}
                            >
                              Give Kudos
                            </Button>
                          </div>
                        )}
                        {getPlayerKudos(player?.uuid || "")?.length ? (
                          <div className="flex flex-col items-start bg-gray-200 rounded-lg p-2 pt-6 px-4 relative overflow-hidden"
                            onClick={() => {
                              setModalKudos({
                                open: true,
                                matchUuid: matchUuid || "",
                                playerUuid: player?.uuid || "",
                                playerName: player?.name || ""
                              });
                            }}>
                            <div className="absolute font-bold text-5xl -top-2 -right-2 opacity-25">Kudos</div>
                            <div className="text-xs text-left font-medium capitalize flex flex-wrap gap-1">
                              {getPlayerKudos(player?.uuid || "")?.map((item, index) => (
                                <div className="px-3 py-1 rounded-full bg-emerald-800 text-white font-bold bg-opacity-80 hover:bg-opacity-100 transition-all duration-500 cursor-pointer" key={index}>{item.kudos}</div>
                              ))}
                            </div>
                            <div className="text-xs text-left font-medium capitalize flex flex-col mt-2 gap-2">
                              {getPlayerKudos(player?.uuid || "")?.filter((item) => item.kudos_text).map((item, index) => (
                                <div className="flex flex-col items-start">
                                  { !userData && <div className="text-xs text-right font-medium capitalize bg-[#EBCE56] w-fit px-2 py-1 pb-0 rounded-t-lg flex flex-row">Someone on the court <Lucide icon="User" className="w-4 h-4 ml-1" /></div>}
                                  {userData?.uuid && <div className="text-xs text-right font-medium capitalize bg-[#EBCE56] w-fit px-2 py-1 pb-0 rounded-t-lg flex flex-row">
                                    {item.by_uuid == userData?.uuid ? "You" : item.by} <Lucide icon="User" className="w-4 h-4 ml-1" />
                                  </div>
                                  }
                                  <div className="px-3 py-1 rounded-b-lg rounded-tr-lg bg-white text-emerald-800 text-xs bg-opacity-80 cursor-pointer text-left" key={index}>
                                    {item.kudos_text}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
                {/* END: Player SM */}
                {/* BEGIN: Player XS*/}
                <div className="sm:hidden col-span-6 grid grid-cols-12">
                  {data?.data?.home_team?.players?.map((player, index) => (
                    <Link key={index} className="col-span-12 flex flex-row items-center" to={paths.players.info({ uuid: player.uuid || "" }).$}>
                      <div className="mr-2 w-full">
                        <h2 className="text-[10px] text-right font-normal capitalize text-ellipsis line-clamp-1 w-full">{player?.name}</h2>
                        <h3 className="text-[10px] text-right font-light capitalize text-ellipsis line-clamp-1">{player?.nickname}</h3>
                      </div>
                      <div className="min-w-8">
                        <img src={player?.media_url} alt={player?.name} className="w-8 h-8 rounded-lg object-cover" />
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="sm:hidden col-span-6 grid grid-cols-12">
                  {data?.data?.away_team?.players?.map((player, index) => (
                    <div key={index} className="col-span-12 flex flex-row items-center">
                      <div className="min-w-8">
                        <img src={player?.media_url} alt={player?.name} className="w-8 h-8 rounded-lg object-cover" />
                      </div>
                      <div className="ml-2 w-full">
                        <h2 className="text-[10px] text-left font-normal capitalize text-ellipsis line-clamp-1 w-full">{player?.name}</h2>
                        <h3 className="text-[10px] text-left font-light capitalize text-ellipsis line-clamp-1">{player?.nickname}</h3>
                      </div>
                    </div>
                  ))}
                </div>
                {/* END: Player XS*/}
              </div>
            </div>
          </div>
        </FadeAnimation>
        <FadeAnimation className="col-span-12 ">
          <div className="col-span-12 text-emerald-800 flex flex-row my-4 justify-center md:justify-start">
            <IconLogoAlt className="h-10 w-20" />
            <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
              <span className="hidden sm:flex">TOURNAMENT&nbsp;</span>Sponsors
            </div>
            <div className="h-10 ml-1.5 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
          </div>
          <div className="col-span-12 grid grid-cols-12 gap-4 sm:gap-6 mt-2 rounded-xl">
            <PartnersComponent className="col-span-12 mb-8" hideTitle />
          </div>
        </FadeAnimation>
      </LayoutWrapper>
      <Modal
        open={modalKudos.open}
        onCancel={() => {setModalKudos({open: false, matchUuid: "", playerUuid: "", playerName: ""})}}
        footer={null}

        title={
          <div className="flex flex-row items-center w-full !text-gray-800 border-b pb-3">
            <IconLogo className="w-16 h-10 mr-3" />
            <div className="flex flex-col items-start justify-center">
              <div className=" text-lg">Kudos for playing!</div>
              <p className="text-xs font-normal text-gray-500">Give kudos to <span className="font-bold"> {modalKudos.playerName}</span>! </p>
            </div>
          </div>
        }
      >
        <KudosModal
          key={JSON.stringify(modalKudos)}
          matchUuid={modalKudos.matchUuid || ""}
          playerUuid={modalKudos.playerUuid || ""}
          onClose={() => setModalKudos({open: false, matchUuid: "", playerUuid: "", playerName: ""})}
        />
      </Modal>
    </>
  )
}