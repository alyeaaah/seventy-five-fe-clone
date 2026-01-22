import { IconLogoAlt, IconVS } from "@/assets/images/icons";
import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import { paths } from "@/router/paths";
import { Divider, Progress } from "antd";
import { toBlob, toPng } from "html-to-image";
import moment from "moment";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import YouTube from "react-youtube";
import Image from "@/components/Image";
import { PublicMatchApiHooks } from "../api";
import { PublicTournamentApiHooks } from "../../Tournament/api";
import { Menu } from "@/components/Base/Headless";

interface MatchMediaAndInfoSectionProps {
  data: any;
  tournamentInfo: any;
  currentScore: any;
  scores: any[];
  matchUuid: string;
  userData: any;
  showGiveKudosButton: (playerUuid: string) => boolean;
  getPlayerKudos: (playerUuid: string) => any[];
  onOpenKudos: (playerUuid: string, playerName: string) => void;
}

export const MatchMediaAndInfoSection = ({
  data,
  tournamentInfo,
  currentScore,
  scores,
  matchUuid,
  userData,
  showGiveKudosButton,
  getPlayerKudos,
  onOpenKudos,
}: MatchMediaAndInfoSectionProps) => {
  const navigate = useNavigate();
  const storyRef = useRef<HTMLDivElement | null>(null);
  const winnerStoryRef = useRef<HTMLDivElement | null>(null);
  const currentRound = data?.data?.round >= 0 && data?.data?.round + 1
  const [matchTitle, setMatchTitle] = useState("");
  console.log(data);

  const { data: matches } = PublicTournamentApiHooks.useGetTournamentDetailMatches({
    params: {
      tournament_uuid: tournamentInfo?.data?.uuid || ""
    }
  }, {
    enabled: !!tournamentInfo?.data?.uuid
  })
  let title = "";
  useEffect(() => {
    if (matches) {

      const seeds = matches?.data?.filter((item: any) => item.round === 0).length || 0;
      const totalRound = Math.log2(seeds * 2);
      const fromRight = (currentRound) - totalRound;
      switch (fromRight) {
        case 0:
          title = "Final Match";
          break;
        case 1:
          title = "Semifinal";
          break;
        case 2:
          title = "Quarterfinal";
          break;
        default:
          title = '';
          break;
      }
      setMatchTitle(title);
    }



  }, [matches])


  const calcOverall = useCallback((player: any) => {
    const skills = player?.skills || {};
    const keys = ["forehand", "backhand", "serve", "volley", "overhead"] as const;
    const values = keys
      .map((k) => Number(skills?.[k] ?? 0))
      .filter((v) => Number.isFinite(v));

    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(avg);
  }, []);

  const calcTeamOverall = useCallback(
    (players: any[]) => {
      if (!players?.length) return 0;
      const vals = players.map(calcOverall).filter((v) => Number.isFinite(v));
      if (!vals.length) return 0;
      return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    },
    [calcOverall]
  );

  const downloadDataUrl = useCallback((dataUrl: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  const shareOrDownloadStory = useCallback(async () => {
    try {
      if (!storyRef.current) return;

      const fileBase = `match-story-${matchUuid || "export"}`;

      const dataUrl = await toPng(storyRef.current, {
        cacheBust: true,
        pixelRatio: 2,

        skipFonts: true, // ✅ IMPORTANT
      });

      const blob = await toBlob(storyRef.current, {
        cacheBust: true,
        pixelRatio: 2,

        skipFonts: true, // ✅ IMPORTANT
      });

      if (blob) {
        const file = new File([blob], `${fileBase}.png`, { type: "image/png" });

        if (
          typeof navigator !== "undefined" &&
          typeof navigator.canShare === "function" &&
          typeof navigator.share === "function" &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({
            files: [file],
            title: "Match Story",
          });
          return;
        }
      }

      downloadDataUrl(dataUrl, `${fileBase}.png`);
    } catch {
      return;
    }
  }, [downloadDataUrl, matchUuid]);

  const shareOrDownloadWinner = useCallback(async (title: string) => {
    try {
      const winner = currentScore?.winner;
      if (!winner) return;

      if (!winnerStoryRef.current) return;

      const fileBase = `winner-story-${matchUuid || "export"}`;

      const dataUrl = await toPng(winnerStoryRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        skipFonts: true,
      });

      const blob = await toBlob(winnerStoryRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        skipFonts: true,
      });

      if (blob) {
        const file = new File([blob], `${fileBase}.png`, { type: "image/png" });

        if (
          typeof navigator !== "undefined" &&
          typeof navigator.canShare === "function" &&
          typeof navigator.share === "function" &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({
            files: [file],
            title: title,
          });
          return;
        }
      }

      downloadDataUrl(dataUrl, `${fileBase}.png`);
    } catch (error) {
      console.error('Error sharing winner:', error);
    }
  }, [currentScore, matchUuid]);
  console.log(scores, 'c')
  return (
    <>
      <div className="lg:hidden fixed top-20 right-0 z-[50]">
        {matchTitle !== "" ? <Menu>
          <Menu.Button as={Button} variant="outline-primary" size="sm" className="text-emerald-800 border-emerald-800 h-fit">
            <Lucide icon="Share2" />
          </Menu.Button>
          <Menu.Items className="w-40 right-0 z-[50]">
            <Menu.Item onClick={() => void shareOrDownloadStory()} className={"text-emerald-800 dark:text-white"}>
              <Lucide icon="Share2" className="w-4 h-4 mr-2" />
              Share Match
            </Menu.Item>
            <Menu.Item onClick={() => void shareOrDownloadWinner(matchTitle)} className={"text-emerald-800 dark:text-white"}>
              <Lucide icon="Trophy" className="w-4 h-4 mr-2" />
              Share Winner
            </Menu.Item>
          </Menu.Items>
        </Menu> : <Button
          variant="outline-primary"
          size="sm"
          className="text-emerald-800 border-emerald-800 top-20 right-0 lg:hidden h-fit fixed z-[1]"
          onClick={() => {
            void shareOrDownloadStory();
          }}
        >
          <Lucide icon="Share2" />
        </Button>}

      </div>
      {data?.data?.youtube_url && (
        <>
          <div className="col-span-12 text-emerald-800 flex flex-row justify-center md:justify-start">
            <IconLogoAlt className="h-10 w-20" />
            <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
              MATCH VIDEO
            </div>
            <div className="h-10 ml-1.5 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
          </div>
          <div className="col-span-12 rounded-3xl overflow-hidden aspect-video" key={data?.data?.youtube_url}>
            <YouTube
              videoId={data?.data?.youtube_url?.split("?v=").pop()}
              iframeClassName="w-full h-full"
              className="w-full h-full"
            />
          </div>
        </>
      )}

      <div className="col-span-12 mt-4 text-emerald-800 flex flex-row justify-center md:justify-start items-center">
        <IconLogoAlt className="h-10 w-20" />
        <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
          <span className="hidden sm:flex">MATCH&nbsp;</span>INFORMATION
        </div>
        <div className="h-10 ml-1.5 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
        <div className="flex-1"></div>
        <div className="lg:flex hidden">
          {matchTitle !== "" ? <Menu>
            <Menu.Button as={Button} variant="outline-primary" className="text-emerald-800 border-emerald-800">
              <Lucide icon="Share2" />
            </Menu.Button>
            <Menu.Items className="w-40 right-0 ">
              <Menu.Item onClick={() => void shareOrDownloadStory()} className={"text-emerald-800 dark:text-white"}>
                <Lucide icon="Share2" className="w-4 h-4 mr-2" />
                Share Match
              </Menu.Item>
              <Menu.Item onClick={() => void shareOrDownloadWinner(matchTitle)} className={"text-emerald-800 dark:text-white"}>
                <Lucide icon="Trophy" className="w-4 h-4 mr-2" />
                Share Winner
              </Menu.Item>
            </Menu.Items>
          </Menu> :
            <Button
              variant="outline-primary"
              className="text-emerald-800 border-emerald-800 lg:flex hidden"
              onClick={() => {
                void shareOrDownloadStory();
              }}
            >
              <Lucide icon="Share2" />
            </Button>
          }
        </div>
      </div>

      <div className=" col-span-12 !z-0 text-emerald-800" key={matchTitle}>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 flex flex-col justify-center items-center">
            <div className="text-xl font-bold capitalize" key={matchTitle}>
              {!data?.data?.tournament_uuid && "Challenger "}{!!matchTitle ? matchTitle : `Match ${data?.data?.seed_index >= 0 && data?.data?.seed_index + 1}`}
            </div>
            <div className="hidden sm:flex text-sm text-center text-emerald-800">
              {tournamentInfo?.data?.name}
              {tournamentInfo?.data?.type == "KNOCKOUT" && ` - Round ${data?.data?.round >= 0 && data?.data?.round + 1}`}
            </div>
            <div className="sm:hidden flex flex-col text-sm text-center text-emerald-800">
              {tournamentInfo?.data?.name}
              {tournamentInfo?.data?.type == "KNOCKOUT" && <span className="">Round {data?.data?.round >= 0 && data?.data?.round}</span>}
            </div>
            <div className="text-xs text-center text-gray-600 flex flex-col sm:flex-row items-center justify-center mt-2">
              <div className="flex flex-row items-center sm:mr-2 border rounded-md px-2 py-1 border-gray-400 mb-1">
                <Lucide icon="MapPin" className="mr-1" />
                {`${data?.data?.court_field?.court?.name} - ${data?.data?.court_field?.name}`}
              </div>
              <div className="flex flex-row items-center border rounded-md px-2 py-1  border-gray-400 mb-1">
                <Lucide icon="Calendar" className="mr-1" />
                {moment(data?.data?.date).format("dddd, DD MMM YYYY HH:mm")}
              </div>
            </div>
          </div>
          {/* BEGIN: Score */}
          <div className="sm:col-span-5 col-span-6 grid grid-cols-12">
            {/* START: Score Left Side */}
            <div className="col-span-12 flex flex-row justify-end items-center">
              <div className="flex flex-col">
                <div
                  className={`border font-bold text-emerald-800 bg-white border-emerald-800 w-14 h-14 flex items-center justify-center rounded-xl ${["WIN", "LOSE"].includes(currentScore?.game_score_home + "") ? "text-lg" : "text-3xl"
                    }`}
                >
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
              {/* <h3 className="text-base font-normal capitalize">{data?.data?.home_team?.alias}</h3> */}
            </div>
          </div>
          <div className="col-span-0 hidden sm:col-span-2 sm:flex flex-col justify-center items-center">
            <div className="h-16 w-24 relative">
              <IconVS className="h-16 w-full text-warning absolute top-0 -left-0.5" />
              <IconVS className="h-16 w-full text-emerald-800 absolute top-0 left-0.5" />
            </div>
            {![(currentScore?.game_score_away as any), (currentScore?.game_score_home as any)].includes("WIN") ? (
              <h1 className="text-xs font-bold">Game {currentScore?.set || 1}</h1>
            ) : (
              <h1 className="text-xs font-bold">Match Ended</h1>
            )}
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
                <div
                  className={`border font-bold text-emerald-800 bg-white border-emerald-800 w-14 h-14 flex items-center justify-center rounded-xl ${["WIN", "LOSE"].includes(currentScore?.game_score_away + "") ? "text-lg" : "text-3xl"
                    }`}
                >
                  {currentScore?.game_score_away || 0}
                </div>
              </div>
            </div>
            {/* END: Score Right Side*/}
            <Divider className="col-span-12 my-2" />
            <div className="col-span-12 flex flex-col items-start">
              <h2 className="text-lg font-bold capitalize">{data?.data?.away_team?.name} </h2>
              {/* <h3 className="text-base font-normal capitalize">{data?.data?.away_team?.alias}</h3> */}
            </div>
          </div>
          {/* END: Score */}
          {/* BEGIN: Player SM */}
          <div className="col-span-5 hidden sm:flex flex-col justify-start">
            <div className="grid grid-cols-12 gap-2">
              {data?.data?.home_team?.players?.map((player: any, index: number) => (
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
                        <Image src={player?.media_url || ""} alt={player?.name} className="w-12 h-12 rounded-lg object-cover" />
                      </div>
                    </div>
                  </Link>

                  <Link to={paths.players.info({ uuid: player?.uuid || "" }).$} className="col-span-12 flex flex-col gap-2">
                    <div className="px-2 flex flex-col items-end">
                      <div className="text-xs text-right font-normal capitalize">Height</div>
                      {player?.height ? <div className="text-xs text-right font-medium capitalize">{player?.height}cm</div> : <div className="text-xs text-right font-medium capitalize">N/A</div>}
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
                      <Progress
                        percent={player?.skills?.forehand || 0}
                        style={{ direction: "rtl", color: "#000" }}
                        strokeColor="#065740"
                        className="text-xs"
                        percentPosition={{ align: "start" }}
                      />
                    </div>
                    <div className="px-2 flex flex-col items-end">
                      <div className="text-xs text-right font-normal capitalize">Backhand</div>
                      <Progress
                        percent={player?.skills?.backhand || 0}
                        style={{ direction: "rtl", color: "#000" }}
                        strokeColor="#065740"
                        className="text-xs"
                        percentPosition={{ align: "start" }}
                      />
                    </div>
                    <div className="px-2 flex flex-col items-end">
                      <div className="text-xs text-right font-normal capitalize">Serve</div>
                      <Progress
                        percent={player?.skills?.serve || 0}
                        style={{ direction: "rtl", color: "#000" }}
                        strokeColor="#065740"
                        className="text-xs"
                        percentPosition={{ align: "start" }}
                      />
                    </div>
                    <div className="px-2 flex flex-col items-end">
                      <div className="text-xs text-right font-normal capitalize">Volley</div>
                      <Progress
                        percent={player?.skills?.volley || 0}
                        style={{ direction: "rtl", color: "#000" }}
                        strokeColor="#065740"
                        className="text-xs"
                        percentPosition={{ align: "start" }}
                      />
                    </div>
                    <div className="px-2 flex flex-col items-end">
                      <div className="text-xs text-right font-normal capitalize">Overhead</div>
                      <Progress
                        percent={player?.skills?.overhead || 0}
                        style={{ direction: "rtl", color: "#000" }}
                        strokeColor="#065740"
                        className="text-xs"
                        percentPosition={{ align: "start" }}
                      />
                    </div>
                  </Link>

                  {showGiveKudosButton(player?.uuid || "") && (
                    <div className="flex flex-col items-end">
                      <Button
                        variant="outline-primary"
                        className="text-emerald-800 w-full border-emerald-800"
                        onClick={() => {
                          onOpenKudos(player?.uuid || "", player?.name || "");
                        }}
                      >
                        Give Kudos
                      </Button>
                    </div>
                  )}

                  {getPlayerKudos(player?.uuid || "")?.length ? (
                    <div
                      className="flex flex-col items-end bg-gray-200 rounded-lg p-2 pt-6 px-4 relative overflow-hidden"
                      onClick={() => {
                        onOpenKudos(player?.uuid || "", player?.name || "");
                      }}
                    >
                      <div className="absolute font-bold text-5xl -top-2 -left-2 opacity-25">Kudos</div>
                      <div className="text-xs text-right font-medium capitalize flex flex-wrap gap-1">
                        {getPlayerKudos(player?.uuid || "")?.map((item: any, kudosIndex: number) => (
                          <div
                            className="px-3 py-1 rounded-full bg-emerald-800 text-white font-bold bg-opacity-80 hover:bg-opacity-100 transition-all duration-500 cursor-pointer"
                            key={kudosIndex}
                          >
                            {item.kudos}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-right font-medium capitalize flex flex-col mt-2 gap-2">
                        {getPlayerKudos(player?.uuid || "")
                          ?.filter((item: any) => item.kudos_text)
                          .map((item: any, textIndex: number) => (
                            <div key={textIndex} className="flex flex-col items-end">
                              <div className="text-xs text-right font-medium capitalize bg-[#EBCE56] w-fit px-2 py-1 pb-0 rounded-t-lg flex flex-row">
                                {item.by_uuid == userData?.uuid ? "You" : item.by} <Lucide icon="User" className="w-4 h-4 ml-1" />
                              </div>
                              <div className="px-3 py-1 rounded-b-lg rounded-tl-lg bg-white text-emerald-800 text-xs bg-opacity-80 cursor-pointer text-left">
                                {item.kudos_text}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
              <div className="col-span-6"></div>
            </div>
          </div>

          <div className="col-span-2 hidden sm:flex flex-col justify-start items-center">
            {/* sort and remove first index */}
            <div className="rounded-xl overflow-hidden border">
              {(scores || [])
                .sort((a: any, b: any) => b.set - a.set)
                .slice(1)
                .map((setScore: any, i: number) => (
                  <div key={setScore.refId} className="flex flex-row font-semibold">
                    <div className={`flex justify-center items-center w-8 ${i % 2 === 0 ? "bg-slate-100" : "bg-slate-50"}`}>
                      <span
                        className={`text-sm capitalize ${setScore.game_score_home > setScore.game_score_away || setScore.game_score_home == "AD"
                          ? "text-emerald-800"
                          : "text-red-400"
                          }`}
                      >
                        {setScore.game_score_home == "WIN" ? (setScore.game_score_away == "40" ? "AD" : "40") : setScore.game_score_home}
                      </span>
                    </div>
                    <div className={`flex justify-center items-center w-20 py-2 ${i % 2 === 0 ? "bg-slate-100" : "bg-slate-50"}`}>
                      <span className="text-center capitalize text-slate-500 text-xs">Game {setScore.set}</span>
                    </div>
                    <div className={` flex justify-center items-center w-8 ${i % 2 === 0 ? "bg-slate-100" : "bg-slate-50"}`}>
                      <span
                        className={`text-sm capitalize ${setScore.game_score_away > setScore.game_score_home || setScore.game_score_away == "AD"
                          ? "text-emerald-800"
                          : "text-red-400"
                          }`}
                      >
                        {setScore.game_score_away == "WIN" ? (setScore.game_score_home == "40" ? "AD" : "40") : setScore.game_score_away}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="col-span-5 hidden sm:flex flex-col justify-start">
            <div className="grid grid-cols-12 gap-2">
              {data?.data?.away_team?.players?.map((player: any, index: number) => (
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
                        <Image src={player?.media_url || ""} alt={player?.name} className="w-12 h-12 rounded-lg object-cover" />
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
                          onOpenKudos(player?.uuid || "", player?.name || "");
                        }}
                      >
                        Give Kudos
                      </Button>
                    </div>
                  )}
                  {getPlayerKudos(player?.uuid || "")?.length ? (
                    <div
                      className="flex flex-col items-start bg-gray-200 rounded-lg p-2 pt-6 px-4 relative overflow-hidden"
                      onClick={() => {
                        onOpenKudos(player?.uuid || "", player?.name || "");
                      }}
                    >
                      <div className="absolute font-bold text-5xl -top-2 -right-2 opacity-25">Kudos</div>
                      <div className="text-xs text-left font-medium capitalize flex flex-wrap gap-1">
                        {getPlayerKudos(player?.uuid || "")?.map((item: any, kudosIndex: number) => (
                          <div
                            className="px-3 py-1 rounded-full bg-emerald-800 text-white font-bold bg-opacity-80 hover:bg-opacity-100 transition-all duration-500 cursor-pointer"
                            key={kudosIndex}
                          >
                            {item.kudos}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-left font-medium capitalize flex flex-col mt-2 gap-2">
                        {getPlayerKudos(player?.uuid || "")
                          ?.filter((item: any) => item.kudos_text)
                          .map((item: any, textIndex: number) => (
                            <div key={textIndex} className="flex flex-col items-start">
                              {!userData && (
                                <div className="text-xs text-right font-medium capitalize bg-[#EBCE56] w-fit px-2 py-1 pb-0 rounded-t-lg flex flex-row">
                                  Someone on the court <Lucide icon="User" className="w-4 h-4 ml-1" />
                                </div>
                              )}
                              {userData?.uuid && (
                                <div className="text-xs text-right font-medium capitalize bg-[#EBCE56] w-fit px-2 py-1 pb-0 rounded-t-lg flex flex-row">
                                  {item.by_uuid == userData?.uuid ? "You" : item.by} <Lucide icon="User" className="w-4 h-4 ml-1" />
                                </div>
                              )}
                              <div className="px-3 py-1 rounded-b-lg rounded-tr-lg bg-white text-emerald-800 text-xs bg-opacity-80 cursor-pointer text-left">
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
            {data?.data?.home_team?.players?.map((player: any, index: number) => (
              <Link key={index} className="col-span-12 flex flex-row items-center" to={paths.players.info({ uuid: player.uuid || "" }).$}>
                <div className="mr-2 w-full">
                  <h2 className="text-[10px] text-right font-normal capitalize text-ellipsis line-clamp-1 w-full">{player?.name}</h2>
                  <h3 className="text-[10px] text-right font-light capitalize text-ellipsis line-clamp-1">{player?.nickname}</h3>
                </div>
                <div className="min-w-8">
                  <Image src={player?.media_url || ""} alt={player?.name} className="w-8 h-8 rounded-lg object-cover" />
                </div>
              </Link>
            ))}
          </div>
          <div className="sm:hidden col-span-6 grid grid-cols-12">
            {data?.data?.away_team?.players?.map((player: any, index: number) => (
              <div key={index} className="col-span-12 flex flex-row items-center">
                <div className="min-w-8">
                  <Image src={player?.media_url || ""} alt={player?.name} className="w-8 h-8 rounded-lg object-cover" />
                </div>
                <div className="ml-2 w-full">
                  <h2 className="text-[10px] text-left font-normal capitalize text-ellipsis line-clamp-1 w-full">{player?.name}</h2>
                  <h3 className="text-[10px] text-left font-light capitalize text-ellipsis line-clamp-1">{player?.nickname}</h3>
                </div>
              </div>
            ))}
          </div>
          {/* END: Player XS*/}
        </div >
      </div >

      <div style={{ position: "fixed", left: "-99999px", top: "-99999px", width: 1080, height: 1920 }}>
        <div
          ref={storyRef}
          style={{ width: 1080, height: 1920 }}
          className="bg-emerald-800 text-white flex flex-col justify-between overflow-hidden"
        >
          <div className="p-16">
            <div className="flex flex-row items-center text-2xl font-semibold uppercase tracking-tight">
              <IconLogoAlt className="w-16 h-16 mr-3" />
              <span>Match</span>
              <span className="font-bold ml-2">Story</span>
            </div>
            <div className="mt-6 text-3xl uppercase font-semibold tracking-tight">
              {tournamentInfo?.data?.name || "Challenger"}
            </div>
            <div className="mt-2 text-xl opacity-90">
              {!data?.data?.tournament_uuid && ""}Match {data?.data?.tournament_uuid && data?.data?.seed_index}
            </div>
          </div>

          <div className="px-16 flex-1 flex flex-col justify-center">
            <div className="flex flex-row justify-between gap-8 mb-8">
              <div className="text-2xl uppercase font-semibold line-clamp-2 text-ellipsis w-full">{data?.data?.home_team?.alias == data?.data?.home_team?.name ? data?.data?.home_team?.name : data?.data?.home_team?.name + " " + data?.data?.home_team?.alias}</div>
              <div className="text-2xl uppercase font-semibold text-right line-clamp-2 text-ellipsis w-full">
                {data?.data?.away_team?.alias == data?.data?.away_team?.name ? data?.data?.away_team?.name : data?.data?.away_team?.name + " " + data?.data?.away_team?.alias}
              </div>
            </div>
            <div className="bg-white/10 rounded-[48px] p-12">
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col gap-3 w-[40%]">
                  <div className="flex flex-row items-center justify-start gap-2">
                    <div className="text-7xl font-bold leading-none">{currentScore?.game_score_home || 0}</div>
                    <div className="text-3xl font-semibold opacity-90 border-2 rounded-lg w-12 text-center py-1">{currentScore?.prev?.set_score_home || 0}</div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center w-[20%]">
                  <IconVS className="h-28 w-28 text-[#EBCE56]" />
                </div>
                <div className="flex flex-col gap-3 w-[40%] items-end">
                  <div className="flex flex-row items-center justify-start gap-2">
                    <div className="text-3xl font-semibold opacity-90 border-2 rounded-lg w-12 text-center py-1">{currentScore?.prev?.set_score_away || 0}</div>
                    <div className="text-7xl font-bold leading-none">{currentScore?.game_score_away || 0}</div>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-12 gap-8">
                <div className="col-span-5 flex flex-col gap-4">
                  <div className="flex flex-row items-center justify-between">
                    <div className="text-xl uppercase font-semibold opacity-90">Players</div>
                    <div className="text-xl uppercase font-semibold border border-white/30 rounded-xl px-4 py-1">
                      OVR {calcTeamOverall(data?.data?.home_team?.players || [])}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {(data?.data?.home_team?.players || []).slice(0, 2).map((p: any, i: number) => (
                      <div key={i} className="flex flex-row items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/30 bg-white/10">
                          <Image
                            src={p?.media_url || ""}
                            alt={p?.name || "Player"}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-2xl uppercase font-semibold line-clamp-1 text-ellipsis">{p?.nickname || p?.name}</div>
                          <div className="text-lg opacity-90 line-clamp-1 text-ellipsis">{p?.name}</div>
                        </div>
                        <div className="text-2xl font-bold border-2 rounded-xl px-4 py-2">{calcOverall(p)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-2" />

                <div className="col-span-5 flex flex-col gap-4">
                  <div className="flex flex-row-reverse items-center justify-between">
                    <div className="text-xl uppercase font-semibold opacity-90">Players</div>
                    <div className="text-xl uppercase font-semibold border border-white/30 rounded-xl px-4 py-1">
                      OVR {calcTeamOverall(data?.data?.away_team?.players || [])}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {(data?.data?.away_team?.players || []).slice(0, 2).map((p: any, i: number) => (
                      <div key={i} className="flex flex-row items-center gap-4 justify-end">
                        <div className="text-2xl font-bold border-2 rounded-xl px-4 py-2">{calcOverall(p)}</div>
                        <div className="flex-1 min-w-0 text-right">
                          <div className="text-2xl uppercase font-semibold line-clamp-1 text-ellipsis">{p?.nickname || p?.name}</div>
                          <div className="text-lg opacity-90 line-clamp-1 text-ellipsis">{p?.name}</div>
                        </div>
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/30 bg-white/10">
                          <Image
                            src={p?.media_url || ""}
                            alt={p?.name || "Player"}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 flex flex-row justify-between text-xl opacity-90">
                <div className="flex flex-row items-center">
                  <Lucide icon="MapPin" className="mr-2" />
                  <span>{`${data?.data?.court_field?.court?.name || ""}${data?.data?.court_field?.name ? ` - ${data?.data?.court_field?.name}` : ""}`}</span>
                </div>
                <div className="flex flex-row items-center">
                  <Lucide icon="Calendar" className="mr-2" />
                  <span>{moment(data?.data?.date).format("DD MMM YYYY HH:mm")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-16 opacity-90 flex flex-row justify-between">
            <div className="text-2xl uppercase tracking-tight">seventy<strong>five</strong>.club</div>
            <div className="text-2xl uppercase tracking-tight">@75<strong>Tennis</strong>Club</div>
          </div>
        </div>
      </div>

      <div style={{ position: "fixed", left: "-99999px", top: "99999px", width: 1080, height: 1920 }} key={JSON.stringify(currentScore)}>
        <div
          ref={winnerStoryRef}
          style={{ width: 1080, height: 1920 }}
          className="bg-emerald-800 text-white flex flex-col items-start justify-between overflow-hidden"
        >
          <div className="px-16 pt-32">
            <div className="flex flex-row items-center text-2xl font-semibold uppercase tracking-tight">
              <IconLogoAlt className="w-16 h-16 mr-3" />
              <span>Seventy</span>
              <span className="font-bold ml-2">Five</span>
            </div>
            <div className="mt-6 text-[40px] uppercase font-bold tracking-tight">
              {tournamentInfo?.data?.name || "Challenger"}
            </div>
            <div className="mt-2 text-2xl opacity-90 uppercase">
              {matchTitle}
            </div>
          </div>

          <div className="px-16 flex-1 flex flex-col w-full justify-center items-center">
            <div className="text-8xl mb-8">🏆</div>
            <div className="text-8xl font-bold mb-4 text-center">
              {matchTitle.toLowerCase().includes("final") ? "CHAMPS!!" : `${matchTitle} WINNER!`}
            </div>

            <div className="text-2xl mb-3 text-center opacity-80 flex flex-row items-center justify-center">
              <Lucide icon="MapPin" className="mr-2 h-8 w-8" /> {data?.data?.court_field?.court?.name} - {data?.data?.court_field?.name}
            </div>
            {
              data?.data?.away_team_score > data?.data?.home_team_score ?
                <div className="flex flex-col w-full justify-center items-center ">
                  <div className="flex flex-row border items-center justify-stretch border-[#EBCE56] rounded-xl overflow-hidden w-[60%]">
                    <div className="flex flex-col px-5 py-4 flex-1 gap-3">
                      <div className="text-3xl font-semibold  ">{data?.data?.away_team?.players?.[0]?.name}</div>
                      <div className="text-3xl font-semibold">{data?.data?.away_team?.players?.[1]?.name}</div>
                    </div>
                    <div className="flex flex-col h-full bg-[#EBCE56] justify-center items-center px-4 py-5 gap-2">
                      <div className="text-3xl font-semibold text-emerald-800 uppercase ">{data?.data?.away_team?.name}</div>
                      <div className="text-xl flex flex-row items-center justify-center text-[#EBCE56] bg-emerald-800 h-fit px-2 py-1 rounded-lg w-20 font-bold">{data?.data?.away_team_score} - {data?.data?.home_team_score}</div>
                    </div>
                  </div>
                  {/* <div className="flex flex-row border items-center justify-stretch border-[#EBCE56] rounded-xl overflow-hidden">
                    <div className="flex flex-col px-4 py-3 flex-1 gap-2">
                      <div className="text-2xl font-semibold  ">{data?.data?.home_team?.players?.[0]?.name}</div>
                      <div className="text-2xl font-semibold">{data?.data?.home_team?.players?.[1]?.name}</div>
                    </div>
                    <div className="text-3xl flex items-center justify-center text-emerald-800 bg-white h-fit px-2 py-2 rounded-lg mr-4 w-16 font-bold">{data?.data?.home_team_score}</div>
                    <div className="flex flex-col h-full bg-[#EBCE56] justify-center px-4">
                      <div className="text-2xl font-semibold text-emerald-800 ">{data?.data?.home_team?.name}</div>
                    </div>
                  </div> */}

                </div>
                :
                <div className="flex flex-col w-full justify-center items-center ">
                  <div className="flex flex-row border items-center justify-stretch border-[#EBCE56] rounded-xl overflow-hidden w-[60%]">
                    <div className="flex flex-col px-5 py-4 flex-1 gap-3">
                      <div className="text-3xl font-semibold  ">{data?.data?.home_team?.players?.[0]?.name}</div>
                      <div className="text-3xl font-semibold">{data?.data?.home_team?.players?.[1]?.name}</div>
                    </div>
                    <div className="flex flex-col h-full bg-[#EBCE56] justify-center items-center px-4 py-5 gap-2">
                      <div className="text-3xl font-semibold text-emerald-800 uppercase ">{data?.data?.home_team?.name}</div>
                      <div className="text-xl flex flex-row items-center justify-center text-[#EBCE56] bg-emerald-800 h-fit px-2 py-1 rounded-lg w-20 font-bold">{data?.data?.home_team_score} - {data?.data?.away_team_score}</div>
                    </div>
                  </div>
                </div>
            }
            <div className="flex flex-col gap-3 my-3">
              <div className="text-2xl text-center opacity-80 flex flex-row items-center justify-center">
                <Lucide icon="Calendar" className="mr-2 h-8 w-8" /> {moment(data?.data?.date).format('DD MMMM YYYY HH:mm')}
              </div>
            </div>
          </div>

          <div className="p-16 mb-16 opacity-90 flex flex-row justify-between w-full">
            <div className="text-2xl uppercase tracking-tight">seventy<strong>five</strong>.club</div>
            <div className="text-2xl uppercase tracking-tight">@75<strong>Tennis</strong>Club</div>
          </div>
        </div>
      </div>
    </>
  );
};
