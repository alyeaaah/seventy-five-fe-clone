import { CustomChartProps, DonutChart } from "@/components/CustomCharts/DonutChart"
import { HTMLAttributes } from "react"
interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  customProp?: string;
  options: CustomChartProps[];
  title: string;
  showLegend?: boolean;
  progress?: boolean;
}
export const DonutChartFull = ({ className, options = [], title, showLegend = true, progress = false, ...props }: ComponentProps) => {
  return (
    <div className={`relative w-full ${className}`} {...props}>
      <div className=" z-10 w-full p-4">
        <DonutChart key={options.reduce((acc, option) => acc + option.value, 0)}
          className="h-full"
          height={"auto"}
          width={"auto"}
          showLegend={showLegend}
          options={options}

        />
      </div>
      {!progress && (
        <div className="absolute top-0 left-0 flex flex-col items-center justify-start w-full h-full z-0 px-8">
          <div className="aspect-square w-full flex flex-col items-center justify-center">
            <div className="text-xl font-semibold">{options.reduce((acc, option) => acc + option.value, 0)}</div>
            <div className="text-slate-500 mt-0.5 text-xs">
              {title}
            </div>
          </div>
        </div>
      )}
      {progress && (
        <div className="absolute top-0 left-0 bottom-0 flex flex-col items-center justify-center w-full h-fullz-10">
            <div className="text-xl font-semibold">{options[0].value}</div>
            <div className="text-slate-500 mt-0.5 text-xs uppercase">
              {title}
            </div>
        </div>
      )}
    </div>
  )
}