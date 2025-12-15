import { IconMedal, IconVS } from "@/assets/images/icons"
import Lucide from "@/components/Base/Lucide"
import Image from "@/components/Image"
import { faker } from "@faker-js/faker"
import { Divider } from "antd"
import moment from "moment"
import { HTMLAttributes } from "react"
interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  customProp?: string;
  overallRating: string;
}
export const OverallRating = ({className, overallRating, ...props}: ComponentProps) => {
  return (
    <div className={`box rounded-2xl bg-gold-gradient overflow-hidden ${className}`} {...props}>
      <div className="font-semibold uppercase text-base bg-white bg-opacity-10 px-2 py-2">
        <div className="w-full tracking-wider text-gray-700 text-center text-shadow-embossed-gold text-ellipsis line-clamp-1">Overall</div>
      </div>
      <div className="flex flex-row items-end justify-center w-full py-4">
        <IconMedal className="h-10 w-10" />
        <div className="tracking-wider text-4xl font-bold text-emerald-900 [text-shadow:-1px_-2px_0_rgba(0,0,0,0.5),1px_1px_0_rgba(255,215,0,0.3)]">{overallRating}</div>
      </div>
    </div>
  )
}