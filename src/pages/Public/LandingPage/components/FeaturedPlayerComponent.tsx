import { IconLogoAlt } from "@/assets/images/icons";
import Lucide from "@/components/Base/Lucide";
import { Carousel } from "antd";
import { ChevronRight } from "lucide-react";
import { HTMLProps, useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LandingPageApiHooks } from "../api";
import { defaultAvatar } from "@/utils/faker";
import { paths } from "@/router/paths";
import { toBlob, toPng } from "html-to-image";

interface FeaturedPlayerProps extends HTMLProps<HTMLDivElement> {
  title?: string;
}

export const FeaturedPlayer = ({ className, title }: FeaturedPlayerProps) => {
  const navigate = useNavigate();
  const { data: featuredPlayer } = LandingPageApiHooks.useGetFeaturedPlayer();

  const storyRef = useRef<HTMLDivElement | null>(null);
  const [storyPlayer, setStoryPlayer] = useState<any>(null);

  const downloadDataUrl = useCallback((dataUrl: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  const shareOrDownloadStory = useCallback(
    async (item: any) => {
      try {
        setStoryPlayer(item);

        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        if (!storyRef.current) return;

        const fileBase = `player-story-${item?.uuid || "export"}`;
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
              title: item?.name ? `${item.name} | Player Story` : "Player Story",
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
    <div className={className}>
      <div className="bg-[#f8cab0]  rounded-3xl mb-6  overflow-hidden shadow-lg">
        <div className="flex flex-row justify-center items-center uppercase text-emerald-800 text-lg font-medium py-2 mb-4">
          <IconLogoAlt className="w-12 h-12 mr-1" /> {!!title?.split(" ")?.length && title?.split(" ")?.length >= 0 ? title.split(" ")[0] : 'player'}<span className="!font-bold">{!!title?.split(" ")?.length && title?.split(" ")?.length >= 1 ? title.split(" ")[1] : 'profile'}</span>
        </div>
        {!featuredPlayer?.data || featuredPlayer.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 h-[360px]">
            <Lucide icon="User" className="h-16 w-16 text-emerald-800/60 mb-4" />
            <h3 className="text-emerald-800 text-lg font-medium mb-2 text-center">No Featured Players</h3>
            <p className="text-emerald-800/80 text-sm text-center">There are currently no featured players available.</p>
          </div>
        ) : (
          <Carousel swipeToSlide autoplay infinite autoplaySpeed={11000}>
            {featuredPlayer?.data?.map((item, idx) => (<div key={idx} className='flex flex-col justify-center items-center h-max'>
              <div className='flex flex-row relative w-full cursor-pointer' onClick={() => navigate(paths.players.info({ uuid: item.uuid || "" }).$)}>
                <div className="flex flex-col absolute left-6">
                  {Object.keys(item.skills || {}).map((key, keyIdx) => (
                    <div key={keyIdx} className="flex flex-col text-emerald-800">
                      <span className="text-xs uppercase font-medium tracking-tight">{key}</span>
                      <span className="text-2xl font-bold">{item.skills?.[key as keyof typeof item.skills] || 0}</span>
                    </div>
                  ))}
                </div>
                <div className='flex pl-10 h-[360px] w-full justify-items-end'>
                  <img
                    src={item.avatar_url || (item.gender === 'm' ? defaultAvatar.m : defaultAvatar.f)}
                    className='w-full  object-contain object-right-bottom'
                  />
                </div>
              </div>
              <div className='flex flex-row justify-between items-center bg-emerald-800 p-4 text-white'>
                <div className="flex flex-col w-full relative">
                  <span className="text-lg uppercase font-semibold tracking-tight">{item.name}</span>
                  <span className="text-sm uppercase  tracking-tight">{item.nickname}</span>
                  <div className="flex flex-row  justify-between items-center h-full mt-2 ">
                    <div className="flex flex-row uppercase border border-[#EBCE56] text-[#EBCE56] text-xs px-2 py-1 rounded-lg ">
                      <span className='font-semibold italic uppercase'>{item.level}</span>
                      <span className='text-xs inline-flex'><Lucide icon='CircleDollarSign' className='h-4 w-4 mx-1' /> {item.point}</span>
                    </div>
                    <div className=" flex flex-row items-center gap-3">
                      <button
                        type="button"
                        className="absolute right-2 top-4 flex flex-row font-semibold border border-white/30 px-3 py-1 rounded-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          void shareOrDownloadStory(item);
                        }}
                      >
                        <Lucide icon='Share2' className='h-5 w-5' />
                      </button>
                      <Link className="flex flex-row font-semibold" to={paths.players.info({ uuid: item.uuid || "" }).$}>
                        <span className='hidden 2xl:inline'>Player</span><span className='ml-1'>Detail</span><ChevronRight className='h-5' />
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            </div>))}
          </Carousel>
        )}
      </div>

      <div style={{ position: "fixed", left: "-99999px", top: 0, width: 1080, height: 1920 }}>
        <div
          ref={storyRef}
          style={{ width: 1080, height: 1920 }}
          className="bg-emerald-800 text-white flex flex-col justify-between overflow-hidden"
        >
          <div className="p-16">
            <div className="flex flex-row items-center text-2xl font-semibold uppercase tracking-tight">
              <IconLogoAlt className="w-16 h-16 mr-3" />
              <span>Seventy</span>
              <span className="font-bold">Five</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center px-16">
            <div className="w-full bg-white/10 rounded-[48px] overflow-hidden">
              <div className="flex flex-col">
                <div className="relative w-full" style={{ height: 1100 }}>
                  <div className="absolute left-16 top-16 flex flex-col gap-6">
                    {Object.keys(storyPlayer?.skills || {}).slice(0, 4).map((key: string) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-xl uppercase font-medium tracking-tight">{key}</span>
                        <span className="text-6xl font-bold leading-none">{storyPlayer?.skills?.[key] || 0}</span>
                      </div>
                    ))}
                  </div>

                  <div className="absolute right-0 bottom-0 left-0 flex justify-end" style={{ height: 1100 }}>
                    <img
                      src={storyPlayer?.avatar_url || (storyPlayer?.gender === 'm' ? defaultAvatar.m : defaultAvatar.f)}
                      className="h-full object-contain object-right-bottom"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>

                <div className="p-16">
                  <div className="text-6xl uppercase font-semibold tracking-tight leading-tight">{storyPlayer?.name}</div>
                  <div className="text-3xl uppercase tracking-tight opacity-90 mt-3">{storyPlayer?.nickname}</div>

                  <div className="mt-10 flex flex-row justify-between items-center">
                    <div className="flex flex-row uppercase border border-[#EBCE56] text-[#EBCE56] text-2xl px-6 py-3 rounded-2xl">
                      <span className="font-semibold italic uppercase">{storyPlayer?.level}</span>
                      <span className="inline-flex ml-4">{storyPlayer?.point}</span>
                    </div>
                    <div className="text-2xl uppercase tracking-tight opacity-90">@seventyfive</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-16 opacity-90">
            <div className="text-2xl uppercase tracking-tight">Share this story</div>
          </div>
        </div>
      </div>
    </div>
  );
};