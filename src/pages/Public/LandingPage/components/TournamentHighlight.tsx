import { IconLogoAlt } from "@/assets/images/icons";
import Image from "@/components/Image";
import { HTMLProps } from "react";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import { Carousel } from "antd";
import Lucide from "@/components/Base/Lucide";
import { PublicTournamentApiHooks } from "../../Tournament/api";
import { paths } from "@/router/paths";

export const TournamentHighlight = ({className}: HTMLProps<HTMLDivElement>) => {
  const navigate = useNavigate();

  const { data } = PublicTournamentApiHooks.useGetFeaturedTournament({
    queries: {
      limit: 10
    }
  });
  return (
    <div className={className}>
      <div className="col-span-6 sm:col-span-6 z-10">
        <span className="flex flex-row items-center">
          <IconLogoAlt className="w-28 h-20 text-white mr-2" />
          <div className="flex flex-col">
            <span className="text-white text-3xl font-bold uppercase">Tournament</span>
            <span className="text-white text-xl font-bold uppercase">{moment().get('year')}</span>
          </div>
        </span>
        <Carousel autoplay dots={false} autoplaySpeed={3000}>
          {data?.data?.map((tournament) => (
            <Link className="flex flex-col text-white mt-6 !hover:text-shadow-[0_2px_0px_#EBCE56] hover:text-[#EBCE56]" key={tournament.uuid} to={paths.tournament.index({ uuid: tournament.uuid || "" }).$}>
              <div className="text-sm font-bold">{tournament.name}</div>
              <div className="text-xl font-bold">{moment(tournament.start_date).format('DD MMM')} - {moment(tournament.end_date).format('DD MMM ')}</div>
              <div className="text-2xl font-bold">{moment().get('year')}</div>
              <div className="text-sm flex flex-row items-center mt-1"><Lucide icon="MapPin" className="w-4 h-4" /> &nbsp;{tournament.court}</div>
            </Link>
          ))}
        </Carousel>
      </div>
      <div className='col-span-6 absolute overflow-hidden w-full h-full'>
        <div className="absolute rotate-[150deg] top-36 sm:top-28 right-32 flex flex-row z-0">
          <div className='w-72 h-72 z-0 shadow-lg bg-emerald-900 flex flex-row border-4 border-[#EBCE56]'>
            <div className='w-full border-l-4 border-r-4 border-[#EBCE56] mx-8 flex flex-col justify-stretch'>
              <div className="border-b-4 border-[#EBCE56] h-1/2 flex flex-row">
                <div className="border-r-4 border-[#EBCE56] w-1/2"></div>
              </div>
            </div>
          </div>
          <div className='ml-8 top-16 right-32 w-72 h-72 z-0 shadow-lg bg-emerald-900 flex flex-row border-4 border-[#EBCE56]'>
            <div className='w-full border-l-4 border-r-4 border-[#EBCE56] mx-8 flex flex-col justify-stretch'>
              <div className="border-b-4 border-[#EBCE56] h-1/2 flex flex-row">
                <div className="border-r-4 border-[#EBCE56] w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='absolute right-32 top-[-20%] h-[140%] hidden sm:block'>
        <Image
          src='https://res.cloudinary.com/doqyrkqgw/image/upload/v1745060014/court-champ_vrlv75.png'
          className='h-full w-full object-contain'
        />
      </div>
    </div>
  );
};