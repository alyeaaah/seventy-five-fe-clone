import { IconLogo, IconTiktok, IconXTwitter } from "@/assets/images/icons";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import LayoutWrapper from "@/components/LayoutWrapper";
import { paths } from "@/router/paths";
import { Footer } from "antd/es/layout/layout";
import Link from "antd/es/typography/Link";
import { HTMLProps } from "react";
import { useNavigate } from "react-router-dom";

export const FooterComponent = ({ className }: HTMLProps<HTMLDivElement>) => {
  const navigate = useNavigate();

  return (

    <Footer className={`${className} mt-8`}>
      <LayoutWrapper className="grid grid-cols-12 gap-6 w-full ">
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <div className="flex flex-row items-center justify-start">
            <IconLogo className='h-16 w-24 ' />
          </div>
          <div className="flex flex-row items-center justify-start text-xl font-semibold">
            Seventy Five
          </div>
          <div className='flex flex-col items-start justify-start my-2'>
            <div className='text-sm font-light pr-4'>Whether you're a competitive player, a weekend enthusiast, or just getting started, <span className='font-semibold'>Seventy Five</span> is your place to play, improve, and connect. Enjoy expert coaching, friendly matches, and a vibrant community</div>
            <div className='flex flex-row items-center justify-start'>
              <Button
                className="text-white my-3 hover:text-[#EBCE56] hover:border-[#EBCE56]"
                onClick={() => navigate(paths.register)}
              >
                Become a Member
              </Button>
            </div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 relative">
          <div className="flex flex-row items-center justify-start text-[#EBCE56] font-medium pb-1">
            Sitemaps
          </div>
          <div className='w-4 h-0.5 bg-[#EBCE56]'></div>
          <div className="flex flex-col items-start justify-start text-white font-medium pt-3">
            <ul>
              <li className='py-1'>
                <a href="#">Players</a>
              </li>
              <li className='py-1'>
                <a href="#">Tournaments</a>
              </li>
              <li className='py-1'>
                <a href="#">Gallery</a>
              </li>
              <li className='py-1'>
                <a href="#">Blog</a>
              </li>
              <li className='py-1'>
                <a href="#">Contact Us</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <div className="flex flex-row items-center justify-start text-[#EBCE56] font-medium pb-1">
            Social Media
          </div>
          <div className='w-4 h-0.5 bg-[#EBCE56]'></div>
          <div className="flex flex-col items-start justify-start !text-white font-medium pt-3">
            <ul>
              <li className='py-1 '>
                <Link href="https://www.instagram.com/75TennisClub/" className="flex flex-row !text-white hover:!text-[#EBCE56] items-center"><Lucide icon='Instagram' className='w-5' />&nbsp;Instagram</Link>
              </li>
              <li className='py-1 '>
                <Link href="https://www.youtube.com/@75TennisClub" className="flex flex-row !text-white hover:!text-[#EBCE56] items-center"><Lucide icon='Youtube' className='w-5' />&nbsp;Youtube</Link>
              </li>
              <li className='py-1 '>
                <Link href="https://www.tiktok.com/@75tennisclub" className="flex flex-row !text-white hover:!text-[#EBCE56] items-center"><IconTiktok className='w-5' />&nbsp;Tiktok</Link>
              </li>
              <li className='py-1 '>
                <Link href="https://www.instagram.com/75tennisclub/" className="flex flex-row !text-white hover:!text-[#EBCE56] items-center"><IconXTwitter className='w-5' />&nbsp;Twitter / X</Link>
              </li>
            </ul>
          </div>
        </div>
      </LayoutWrapper>
    </Footer>
  );
};