import { IconVS } from "@/assets/images/icons"
import Lucide from "@/components/Base/Lucide"
import Image from "@/components/Image"
import { faker } from "@faker-js/faker"
import { Divider } from "antd"
import moment from "moment"
import { HTMLAttributes } from "react"
interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  customProp?: string;
}
export const PlayerGallery = ({className, ...props}: ComponentProps) => {
  return (

    <div className={`box w-72 inline-block mr-4 shadow-lg ${className}`} {...props}>
      <div className="px-4 pt-2 font-medium">
        {moment().format('ddd, DD MMM YYYY hh:mm')}
      </div>
      <Divider className="mt-2 mb-0" />
      <div className="px-4 py-2 relative overflow-hidden">
        <div className="flex flex-row items-center justify-center border border-emerald-800 text-emerald-800 rounded-lg text-xs py-1 px-2 m-auto w-fit">
          <Lucide icon="MapPin" className="h-4 w-4 mr-1" />
          PDAM Ngagel - Court 2
        </div>
        <div className="flex flex-row items-center justify-end">
          {/* <span className="text-4xl font-extrabold italic tracking-tighter text-emerald-800 absolute -left-2 flex justify-center items-center [text-shadow:-4px_-2px_0_rgba(213,172,0,0.5),1px_1px_0_rgba(255,215,0,0.3)]">VS</span> */}
          <IconVS className="absolute -left-3 w-24 h-14 text-warning " />
          <IconVS className="absolute -left-2 w-24 h-14 text-emerald-800 "/>
          <div className="mt-2 z-10">
            <div className="flex flex-row items-center justify-end mb-1">
              {faker.person.fullName()}
              <Image src={faker.image.personPortrait()} className="w-6 h-6 rounded-full ml-2" />
            </div>
            <div className="flex flex-row items-center justify-end">
              {faker.person.fullName()}
              <Image src={faker.image.personPortrait()} className="w-6 h-6 rounded-full ml-2" />
            </div>
          </div>
        </div>
      </div>
      <Divider className="my-0" />
      <div className="flex flex-col items-center justify-center px-4 pb-2 text-ellipsis line-clamp-1">
        <span className="text-[8px] tracking-widest h-[8px] mb-2">PARTNER</span>
        <div className="flex flex-row items-center justify-center">
          <Image src={faker.image.personPortrait()} className="w-6 h-6 rounded-full mr-2" />
          {faker.person.fullName()}
        </div>
      </div>
    </div>
  )
}