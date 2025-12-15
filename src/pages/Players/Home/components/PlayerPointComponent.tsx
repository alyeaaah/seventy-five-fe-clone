import { IconLogoAlt, IconMedal, IconVS } from "@/assets/images/icons"
import Lucide from "@/components/Base/Lucide"
import Image from "@/components/Image"
import { faker } from "@faker-js/faker"
import { Divider } from "antd"
import moment from "moment"
import { HTMLAttributes } from "react"
interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  customProp?: string;
  point: string;
  expired: Date;
}
export const PlayerPointComponent = ({className, point, expired, ...props}: ComponentProps) => {
  return (
    <div className={`box rounded-2xl flex flex-col justify-center relative overflow-hidden ${className}`} {...props}>
      <IconLogoAlt className="absolute w-[120%] -bottom-[10%] -left-[10%] h-36 text-emerald-100 z-0 opacity-30" />

      <div className="font-semibold uppercase text-sm z-10 pt-4 bg-white">
        <div className="w-full text-center line-clamp-1">Current Point</div>
        <Divider className="mt-2 mb-0" />
      </div>
      <div className="flex flex-row items-end justify-center w-full py-4 z-10">
        <div className="tracking-wider text-2xl font-bold text-emerald-900">{point}</div>
        <div className="text-lg font-bold ml-1">Points</div>
      </div>
      <div className="text-center w-full text-[10px] text-gray-500 line-clamp-1 z-10 pb-4">
        Expired on {moment(expired).format('DD MMM YYYY')}
      </div>
    </div>
  )
}