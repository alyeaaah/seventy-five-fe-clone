import { IconVS } from "@/assets/images/icons"
import Lucide from "@/components/Base/Lucide"
import Image from "@/components/Image"
import { faker } from "@faker-js/faker"
import { Divider } from "antd"
import moment from "moment"
import { HTMLAttributes } from "react"
import { MatchSchema } from "../../Matches/api/schema"
import Tippy from "@/components/Base/Tippy"
import { LoadingAnimation } from "@/components/LoadingAnimation"
interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  customProp?: string;
  match?: MatchSchema;
  playerUuid?: string;
}
export const PlayerMatchFull = ({ className, match, playerUuid, ...props }: ComponentProps) => {
  return (

    <div className={`box w-full inline-block mr-4 shadow-lg ${className}`} {...props}>
      <div className="px-4 pt-2 text-xs font-medium flex justify-between">
        {moment(match?.time).format('ddd, DD MMM YYYY HH:mm')}
        <span className="capitalize flex flex-row items-center text-emerald-800 gap-2">
          {match?.status === "ONGOING" &&
            <Tippy
              content="Ongoing"
            >
              <div className="text-xs h-4 flex items-center justify-center">
                <LoadingAnimation loop={true} autoplay={false} animationClassName="w-8 h-5" />
              </div>
            </Tippy>
          }
          {match?.tournament?.type === "tournament" && <Lucide icon="Network" className="h-4 w-4 mr-1" />}
          {(match?.tournament?.type === "FRIENDLY MATCH" || match?.category === "CHALLENGE") &&
            <Tippy
              content="Challenger"
            >
              <Lucide icon="Swords" className="h-4 w-4 mr-1" />
            </Tippy>
          }
          {match?.tournament?.name}
        </span>
      </div >
      <Divider className="mt-2 mb-0" />
      <div className="px-4 py-2 relative overflow-hidden">
        <div className="flex flex-col space-y-2 lg:flex-row items-center justify-between">
          <div className="mt-2 z-10 w-full flex space-y-1 flex-col">
            {match?.home_team?.players?.map((player, idx) => (
              <div className="flex flex-row items-center justify-start">
                <Image src={player?.player?.media_url} className="w-6 h-6 rounded-full mr-2" />
                {player?.player?.name}
              </div>
            ))}
          </div>
          <div className="relative w-24 h-fit flex items-center justify-center">
            <IconVS className="z-[1] w-20 h-10 text-emerald-800 " />
            <IconVS className="z-[0] w-20 h-10 text-warning absolute top-0.5 left-0.5" />
          </div>
          <div className="mt-2 z-10 w-full flex space-y-1 flex-col">
            {match?.away_team?.players?.map((player, idx) => (
              <div className="flex flex-row items-center justify-end">
                <span className={player?.player?.uuid === playerUuid ? "text-emerald-800 font-bold" : ""}>{player?.player?.name}</span>
                <Image src={player?.player?.media_url} className="w-6 h-6 rounded-full ml-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Divider className="my-0" />
      <div className="flex flex-row justify-between items-center px-2">
        <div className="flex flex-row items-center justify-center border border-emerald-800 text-emerald-800 rounded-lg text-xs py-1 px-2 w-fit h-fit">
          <Lucide icon="MapPin" className="h-4 w-4 mr-1" />
          {match?.court_field?.name}
        </div>
        <div className="flex flex-col items-center justify-center px-4 pb-2 text-ellipsis line-clamp-1">
          <span className="text-[8px] tracking-widest h-[8px] mb-2">SCORE</span>
          <div className="flex flex-row items-center justify-center">
            {match?.home_team_score} - {match?.away_team_score}
          </div>
        </div>
      </div>
    </div >
  )
}