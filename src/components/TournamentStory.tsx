import { IconLogoAlt } from "@/assets/images/icons";
import Lucide from "@/components/Base/Lucide";
import { HTMLProps, useCallback, useRef, useState } from "react";
import { imageResizerDimension } from "@/utils/helper";
import moment from "moment";
import { toBlob, toPng } from "html-to-image";
import { PublicTournamentDetail } from "@/pages/Public/Tournament/api/schema";
import { IMatch } from "./TournamentDrawing/interfaces";
import { TournamentMatchDetail } from "@/pages/Admin/Tournaments/api/schema";
import { matchStatusEnum } from "@/pages/Admin/MatchDetail/api/schema";

interface TournamentStoryProps extends HTMLProps<HTMLDivElement> {
  tournament: PublicTournamentDetail;
  matches: TournamentMatchDetail[]
}

export const TournamentStory = ({ tournament, matches }: TournamentStoryProps) => {
  const storyRef = useRef<HTMLDivElement | null>(null);

  const downloadDataUrl = useCallback((dataUrl: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);
  const champs: TournamentMatchDetail | undefined = matches?.reduce((prev, curr) => {
    return (prev?.round !== null && prev?.round !== undefined ? prev?.round : -1) > (curr?.round !== null && curr?.round !== undefined ? curr?.round : -1) ? prev : curr;
  });

  const shareOrDownloadStory = useCallback(
    async (item: any) => {
      try {
        // settournament(item);

        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        if (!storyRef.current) return;

        const fileBase = `tournament-story-${item?.uuid || "export"}`;
        const dataUrl = await toPng(storyRef.current, {
          cacheBust: true,
          pixelRatio: 2,
        });

        const blob = await toBlob(storyRef.current, {
          cacheBust: true,
          pixelRatio: 2,
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
              title: item?.name ? `${item.name} | Tournament Story` : "Tournament Story",
            });
            return;
          }
        }

        downloadDataUrl(dataUrl, `${fileBase}.png`);
      } catch {
        return;
      }
    },
    [downloadDataUrl]
  );

  return (
    <>
      <button
        type="button"
        className="flex flex-row items-center gap-2 bg-white text-emerald-800 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors w-full lg:w-fit border-emerald-800 border"
        onClick={() => shareOrDownloadStory(tournament)}
      >
        <Lucide icon='Share2' className='h-4 w-4' />
        <span className="text-sm font-medium">Share Story</span>
      </button>

      <div style={{ position: "fixed", left: "-0.99999px", top: 0, width: 1080, height: 1920 }} className="z-[9999] scale-50">
        <div
          ref={storyRef}
          style={{ width: 1080, height: 1920 }}
          className="bg-emerald-800 text-white flex flex-col justify-between overflow-hidden"
        >
          <div className="p-16 mt-16">
            <div className="flex flex-row items-center text-2xl font-semibold uppercase tracking-tight">
              <IconLogoAlt className="w-16 h-16 mr-3" />
              <span>Seventy</span>
              <span className="font-bold">Five</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center px-16">
            <div className="w-full bg-white/10 rounded-[48px] overflow-hidden">
              <div className="flex flex-col">

                <div className="flex justify-start items-center pt-24 px-16" style={{ height: 400 }} >
                  <div className="aspect-square h-full">
                    <img
                      src={tournament?.media_url ? imageResizerDimension(tournament?.media_url, 800, "h") : ''}
                      className="h-full object-contain object-center rounded-xl overflow-hidden"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
                <div className="relative w-full" style={{ height: 600 }}>
                  <div className="absolute left-16 top-16 right-16 flex flex-col gap-8">
                    <div className="flex flex-col">
                      <span className="text-4xl uppercase  tracking-wider opacity-90">Tournament</span>
                      <span className="text-6xl font-bold leading-tight">{tournament?.name}</span>
                      <div className="text-2xl opacity-90 mt-4 line-clamp-5">
                        {tournament?.description}
                      </div>
                    </div>

                    <div className="flex flex-row justify-between">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-row items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Lucide icon="MapPin" className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xl font-semibold">{tournament?.court_info?.name}</span>
                            <span className="text-lg opacity-90">{tournament?.court_info?.city}</span>
                          </div>
                        </div>
                        <div className="flex flex-row items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Lucide icon="Calendar" className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xl font-semibold">
                              {moment(tournament?.start_date).format('DD MMM YYYY') === moment(tournament?.end_date).format('DD MMM YYYY')
                                ? moment(tournament?.start_date).format('DD MMM YYYY')
                                : `${moment(tournament?.start_date).format('DD MMM')} - ${moment(tournament?.end_date).format('DD MMM YYYY')}`
                              }
                            </span>
                            <span className="text-lg opacity-90">
                              {moment(tournament?.start_date).format('HH:mm')} - {moment(tournament?.end_date).format('HH:mm')}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-row items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Lucide icon="Trophy" className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xl font-semibold">{tournament?.level}</span>
                            <span className="text-lg opacity-90">{tournament?.strict_level === false ? "Open Tournament" : "Strict Level"}</span>
                          </div>
                        </div>
                      </div>
                      {champs?.status === matchStatusEnum.Values.ENDED && <div className="flex justify-end items-end">
                        <div className="px-16 flex-1 flex flex-col w-full justify-end items-center">
                          <div className="text-4xl font-bold mb-4 text-center">
                            🏆 CHAMPS!!
                          </div>
                          {
                            (champs?.away_team_score !== null && champs?.away_team_score !== undefined ? champs?.away_team_score : 0) > (champs?.home_team_score !== null && champs?.home_team_score !== undefined ? champs?.home_team_score : 0) ?
                              <div className="flex flex-col w-full justify-center items-center ">
                                <div className="flex flex-row border items-center justify-stretch border-[#EBCE56] rounded-xl overflow-hidden">
                                  <div className="flex flex-col px-5 py-3 flex-1 gap-3">
                                    <div className="text-2xl font-semibold  ">{champs?.away_team?.players?.[0]?.name}</div>
                                    <div className="text-2xl font-semibold">{champs?.away_team?.players?.[1]?.name}</div>
                                  </div>
                                  <div className="flex flex-col h-full bg-[#EBCE56] justify-center items-center px-4 py-4 gap-1.5">
                                    <div className="text-2xl font-semibold text-emerald-800 uppercase ">{champs?.away_team?.name}</div>
                                    <div className="text-lg flex flex-row items-center justify-center text-[#EBCE56] bg-emerald-800 h-fit px-2 py-1 rounded-lg w-20 font-bold">{champs?.away_team_score} - {champs?.home_team_score}</div>
                                  </div>
                                </div>
                              </div>
                              :
                              <div className="flex flex-col w-full justify-center items-center ">
                                <div className="flex flex-row border items-center justify-stretch border-[#EBCE56] rounded-xl overflow-hidden w-[60%]">
                                  <div className="flex flex-col px-5 py-4 flex-1 gap-3">
                                    <div className="text-3xl font-semibold  ">{champs?.home_team?.players?.[0]?.name}</div>
                                    <div className="text-3xl font-semibold">{champs?.home_team?.players?.[1]?.name}</div>
                                  </div>
                                  <div className="flex flex-col h-full bg-[#EBCE56] justify-center items-center px-4 py-5 gap-2">
                                    <div className="text-3xl font-semibold text-emerald-800 uppercase ">{champs?.home_team?.name}</div>
                                    <div className="text-xl flex flex-row items-center justify-center text-[#EBCE56] bg-emerald-800 h-fit px-2 py-1 rounded-lg w-20 font-bold">{champs?.home_team_score} - {champs?.away_team_score}</div>
                                  </div>
                                </div>
                              </div>
                          }
                        </div>
                      </div>}

                    </div>
                  </div>

                </div>

                <div className="p-16">
                  <div className="text-4xl uppercase font-semibold tracking-tight leading-tight line-clamp-3">
                    {/* {tournament?.name} */}
                  </div>

                  <div className="mt-10 flex flex-row justify-between items-center">
                    <div className="flex flex-row uppercase border border-[#EBCE56] text-[#EBCE56] text-2xl px-6 py-3 rounded-2xl">
                      <span className="font- italic uppercase">{tournament?.strict_level === false ? <span>Open<strong>Level</strong></span> : tournament?.level}</span>

                    </div>
                    <div className="text-2xl opacity-90 uppercase">@75<strong>Tennis</strong>Club</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-16 opacity-90 mb-16">
            <div className="text-2xl uppercase tracking-tight">seventy<strong>five</strong>.club</div>
          </div>
        </div>
      </div>
    </>
  );
};
