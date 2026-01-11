import { IconLogoAlt } from "@/assets/images/icons";
import Lucide from "@/components/Base/Lucide";
import Image from "@/components/Image";
import { Carousel } from "antd";
import { ChevronRight } from "lucide-react";
import { HTMLProps } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LandingPageApiHooks } from "../api";
import { defaultAvatar } from "@/utils/faker";
import { paths } from "@/router/paths";

interface FeaturedPlayerProps extends HTMLProps<HTMLDivElement> {
  title?: string;
}

export const FeaturedPlayer = ({className, title}: FeaturedPlayerProps) => {
  const navigate = useNavigate();
  const { data: featuredPlayer } = LandingPageApiHooks.useGetFeaturedPlayer();

  return (
    <div className={className}>
      <div className="bg-[#f8cab0]  rounded-3xl mb-6  overflow-hidden shadow-lg">
        <div className="flex flex-row justify-center items-center uppercase text-emerald-800 text-lg font-medium py-2 mb-4">
          <IconLogoAlt className="w-12 h-12 mr-1" /> {!!title?.split(" ")?.length && title?.split(" ")?.length >= 0 ? title.split(" ")[0] : 'player'}<span className="!font-bold">{!!title?.split(" ")?.length && title?.split(" ")?.length >= 1 ? title.split(" ")[1] : 'profile'}</span>
        </div>
        {!featuredPlayer?.data || featuredPlayer.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 h-[360px]">
            <Lucide icon="User" className="h-16 w-16 text-emerald-800/60 mb-4" />
            <h3 className="text-emerald-800 text-lg font-medium mb-2">No Featured Players</h3>
            <p className="text-emerald-800/80 text-sm text-center">There are currently no featured players available.</p>
          </div>
        ) : (
          <Carousel swipeToSlide autoplay infinite autoplaySpeed={11000}>
            {featuredPlayer?.data?.map((item, idx) => (<div key={idx} className='flex flex-col justify-center items-center h-max'>
              <div className='flex flex-row relative w-full cursor-pointer' onClick={() => navigate(paths.players.info({uuid: item.uuid || ""}).$)}>
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
                <div className="flex flex-col w-full">
                  <span className="text-lg uppercase font-semibold tracking-tight">{item.name}</span>
                  <span className="text-sm uppercase  tracking-tight">{item.nickname}</span>
                  <div className="flex flex-row  justify-between items-center h-full mt-2 ">
                    <div className="flex flex-row uppercase border border-[#EBCE56] text-[#EBCE56] text-xs px-2 py-1 rounded-lg ">
                      <span className='font-semibold italic uppercase'>{item.level}</span>
                      <span className='text-xs inline-flex'><Lucide icon='CircleDollarSign' className='h-4 w-4 mx-1' /> {item.point}</span>
                    </div>
                    <Link className="flex flex-row font-semibold" to={paths.players.info({uuid: item.uuid || ""}).$}>
                      <span className='hidden 2xl:inline'>Player</span><span className='ml-1'>Detail</span><ChevronRight className='h-5' />
                    </Link>
                  </div>
                </div>

              </div>
            </div>))}
          </Carousel>
        )}
      </div>
    </div>
  );
};