import { PlayersPartialSchema, PlayersPayload } from "@/pages/Players/Home/api/schema";
import { staticImages } from "@/utils/faker";
import { defaultAvatar } from "@/utils/faker";

export const HeaderProfile = ({ data, isPreview }: { data?: PlayersPartialSchema, isPreview?: boolean }) => {
  if (!data) return null;
  return <div className={`col-span-12 mt-4 px-4 text-white flex flex-row items-center justify-start md:justify-between !bg-green-pattern bg-repeat rounded-2xl overflow-visible border border-white z-10 relative`}>
    <img src={isPreview ? staticImages.myPlayer : staticImages.playerOverview} alt="" className={` ${isPreview ? "h-16 my-8" : "h-32"} object-contain`} />
    <div className="flex w-full h-full flex-row justify-end items-center relative">
      <h1 className="text-5xl mr-48 text-end font-bold text-[#E5E6DA] items-center md:flex hidden">{data?.name}</h1>
      <div className='w-40 justify-items-end absolute right-4 md:bottom-0 -bottom-4'>
        <img
          src={data?.avatar_url || (data?.gender === 'm' ? defaultAvatar.m : defaultAvatar.f)}
          className='w-full object-right-bottom'
        />
      </div>
    </div>
  </div>
    
}