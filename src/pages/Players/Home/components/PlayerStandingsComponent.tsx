import { IconMedal, IconVS } from "@/assets/images/icons"
import Lucide from "@/components/Base/Lucide"
import { CustomChartProps, DonutChart } from "@/components/CustomCharts/DonutChart"
import Image from "@/components/Image"
import { PublicPlayerApiHooks } from "@/pages/Public/Player/api"
import { faker } from "@faker-js/faker"
import { Divider } from "antd"
import moment from "moment"
import { HTMLAttributes } from "react"
import { PlayerLeagueData } from "../api/schema"
import { sfColor } from "@/utils/faker"
interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  customProp?: string;
  title?: string;
  league?: PlayerLeagueData | null | undefined;
  player?: string | null;
}
export const PlayerStandingsComponent = ({ className, title = "Rank", player, league, ...props }: ComponentProps) => {
   const { data: playerStanding } = PublicPlayerApiHooks.useGetPlayerStandings({
      queries: {
        league: league?.name || ''
      }
    }, { enabled: !!league });
  
  return (
    <div className={`box rounded-2xl flex flex-col items-center justify-stretch overflow-hidden relative ${className}`} {...props}>
      <div className={`font-semibold uppercase text-xs w-full px-2 py-2 aspect-[9/1] text-white flex items-center`} style={{ backgroundColor: league?.color_scheme ? `#${league?.color_scheme}` : sfColor.primary }}>
        <div className="w-full text-center line-clamp-1 ">{new Date().getFullYear()} {league?.name} Standings</div>
      </div>
      <div className="flex flex-col w-full overflow-scroll">
        {playerStanding?.data?.map((pl, index) => (
          <div key={index} className={`flex flex-row items-center justify-between w-full py-2 px-3 ${index % 2 === 1 ? 'bg-gray-100' : ''} ${pl.uuid === player ? 'border border-emerald-800 rounded' : ''}`}>
            <div className="flex flex-row items-center">
              <div className="w-4 h-4 text-xs font-medium">
                {index + 1}
              </div>
              <Image src={pl.media_url} className="w-4 h-4 rounded-full" />
              <div className="ml-2">
                <div className={`text-xs line-clamp-1 text-ellipsis ${pl.uuid === player ? 'font-bold' : ''}`}>{pl.name}</div>
                {/* <div className="text-xs text-gray-500">{player.point} Match</div> */}
              </div>
            </div>
            <div className="text-xs font-medium">{pl.point}</div>
          </div>
        ))}
      </div>
    </div>
  )
}