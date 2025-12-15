import { IconLogoAlt, IconMedal, IconVS } from "@/assets/images/icons"
import Lucide from "@/components/Base/Lucide"
import { CustomChartProps, DonutChart } from "@/components/CustomCharts/DonutChart"
import Image from "@/components/Image"
import { faker } from "@faker-js/faker"
import { Carousel, Divider } from "antd"
import moment from "moment"
import { HTMLAttributes } from "react"
import { Link } from "react-router-dom"
import { paths } from "@/router/paths"
interface ComponentProps extends HTMLAttributes<HTMLElement> {
  customProp?: string;
  news: {
    title: string;
    image_cover: string;
    created_at: number;
    uuid: string;
  };
}
export const PlayerNewsComponent = ({className, news, ...props}: ComponentProps) => {
  return (
    <Link to={paths.news.detail({uuid: news.uuid}).$} className={`flex flex-row items-center justify-stretch overflow-hidden relative ${className}`} {...props}>
      <div className="flex">
        <Image src={news.image_cover} className="rounded-lg min-w-16 max-w-16 h-14 object-cover" />
      </div>
      <div className="flex-col ml-2">
        <div className="text-sm font-medium line-clamp-2 text-ellipsis">{news.title}</div>
        <div className="text-xs text-gray-500">{moment(news.created_at).fromNow()}</div>
      </div>
    </Link>
  )
}