import { IconLogoAlt, IconMedal, IconVS } from "@/assets/images/icons"
import Lucide from "@/components/Base/Lucide"
import { CustomChartProps, DonutChart } from "@/components/CustomCharts/DonutChart"
import Image from "@/components/Image"
import { faker } from "@faker-js/faker"
import { Carousel, Divider } from "antd"
import moment from "moment"
import { HTMLAttributes } from "react"
interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  customProp?: string;
  players: {
    name: string;
    media_url: string;
    point: number;
  }[];
}
export const PlayerPartnersComponent = ({ className, players = [], ...props }: ComponentProps) => {
  return (
    <div className={`box rounded-2xl flex flex-col items-center justify-stretch overflow-hidden relative ${className}`} {...props}>
      <IconLogoAlt className="h-6 w-16 mt-4 mb-2 text-emerald-800" />
      <div className="flex flex-row font-semibold uppercase text-xsw-full px-2 py-2">
        <div className="text-center -mr-4 text-white italic -rotate-12 overflow-visible [text-shadow:-1px_-1px_0_rgba(6,95,70,1),1px_1px_0_rgba(235,206,86,1)]">Recent</div>
        <div className="text-center mt-2 -ml-2 text-white italic overflow-visible -rotate-12 [text-shadow:-1px_-1px_0_rgba(6,95,70,1),1px_1px_0_rgba(235,206,86,1)]">Partners</div>
      </div>
      <div className="flex flex-col w-full overflow-hidden h-min">
        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 px-3 min-h-[140px]">
            <Lucide icon="Users" className="h-10 w-10 text-emerald-800/50 mb-2" />
            <div className="text-xs font-medium text-emerald-800/80 uppercase">No recent partners</div>
          </div>
        ) : (
          <Carousel arrows autoplay autoplaySpeed={3000}>
            {players.map((player, index) => (
              <div key={index} className={`!flex flex-col items-center justify-between w-full py-2 px-3`}>
                <div className="p-0.5 w-[60%] aspect-square border rounded-full">
                  <Image src={player.media_url} className=" rounded-full" />
                </div>
                <div className="flex flex-row items-center pt-2 pb-1">
                  <div className="text-xs font-medium line-clamp-1 text-ellipsis">{player.name}</div>
                </div>
                <div className="text-xs font-medium border border-emerald-800 px-2 rounded-md text-emerald-800">WIN</div>
              </div>
            ))}
          </Carousel>
        )}
      </div>
    </div>
  )
}