import { IconMedal, IconVS } from "@/assets/images/icons"
import Lucide from "@/components/Base/Lucide"
import { CustomChartProps, DonutChart } from "@/components/CustomCharts/DonutChart"
import Image from "@/components/Image"
import { faker } from "@faker-js/faker"
import { Divider } from "antd"
import moment from "moment"
import { HTMLAttributes } from "react"
interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  customProp?: string;
  options: CustomChartProps[];
  title: string;
}
export const PlayerMatchPlayedComponent = ({className, options = [], title, ...props}: ComponentProps) => {
  return (
    <div className={`box rounded-2xl flex flex-col items-center justify-center relative ${className}`} {...props}>
      <div className="relative w-full">
        <div className="z-10 w-full">
          <DonutChart key={options.reduce((acc, option) => acc + option.value, 0)}
            className="h-full"
            height={"auto"}
            width={"auto"}
            options={options?.find((option) => option.value > 0) ? options : [
              {
                label: "Matches Win",
                value: 1,
                color: "primary"
              },
              {
                label: "Matches Lost",
                value: 1,
                color: "pending"
              },
            ]}
          />
        </div>
        <div className="absolute top-0 left-0 flex flex-col items-center justify-start w-full h-full z-0 px-8">
          <div className="aspect-square w-full flex flex-col items-center justify-center">
            <div className="text-xl font-semibold">{options.reduce((acc, option) => acc + option.value, 0)}</div>
            <div className="text-slate-500 mt-0.5 text-xs">
              {title}
            </div>
          </div>
        </div>
      </div>
      <div></div>
    </div>
  )
}