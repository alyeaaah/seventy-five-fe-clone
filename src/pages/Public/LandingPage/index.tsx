import { IconLogo } from '@/assets/images/icons';
import { Illustration, TennisPlay } from '@/assets/images/illustrations/illustrations';
import LayoutWrapper from '@/components/LayoutWrapper';
import { Layout, Typography, Carousel } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { UpcomingMatch } from './components/MatchComponent';
import { LiveMatch } from './components/LiveMatchComponent';
import { FeaturedPlayer } from './components/FeaturedPlayerComponent';
import { LatestNews } from './components/LatestNewsComponent';
import { TournamentHighlight } from './components/TournamentHighlight';
import { Galleries } from './components/GalleriesComponent';
import { StandingsComponent } from './components/StandingsComponent';
import { MerchComponent } from './components/MerchComponent';
import { PartnersComponent } from './components/PartnersComponent';
import ReactVisibilitySensor from 'react-visibility-sensor';
import { PublicHeader } from './components/HeaderLandingPage';

const { Content } = Layout;

export const LandingPage = () => {
  const navigate = useNavigate();
  const [slideIsVisible, setSlideIsVisible] = useState<boolean>();
  const [animateMenu, setAnimateMenu] = useState(false);

  return (
    <>
      {/* <PageHeader /> */}
      <PublicHeader />
      <PublicHeader className={`rounded-b-2xl shadow-xl fixed -translate-y-[100px] top-0 w-full z-20 ${slideIsVisible === true && animateMenu === true ? `animate-slide-out-top` : (slideIsVisible === false && animateMenu === true ? `fixed animate-slide-in-top ` : '')}`} />
      <div className='h-[50vh] w-full bg-[#EBCE56] mb-6 relative rounded-b-[48px] shadow-xl overflow-hidden'>
        <div className="absolute bottom-[-32vh] left-[-120px] rotate-[14deg] w-[130vw] h-[55vh] bg-emerald-800 z-0"></div>
        <LayoutWrapper className="h-full">
          <div className='z-10 h-full'>
            <Carousel arrows autoplay autoplaySpeed={8000} className='h-[calc(50vh-32px)]'>
              <div className=' w-full h-[calc(50vh-32px)]'>
                <div className='h-full grid grid-cols-12'>
                  <div className='col-span-12 sm:col-span-6 flex justify-center items-center aspect-video md:aspect-auto'>
                    <h3 className="text-white font-bold md:text-6xl text-5xl drop-shadow-[0_2.2px_2.2px_rgba(6,85,70,1)]">Family comes first!</h3>
                  </div>
                  <div className='col-span-12 sm:col-span-6 flex flex-col overflow-auto justify-center items-center max-h-max object-contain'>
                    <TennisPlay className='w-[90%] h-[90%] aspect-square' />
                  </div>
                </div>
              </div>
              <div className=' w-full h-[calc(50vh-32px)]'>
                <div className='h-full grid grid-cols-12'>
                  <div className='col-span-12 sm:col-span-6 flex flex-col justify-center items-start px-4 aspect-video md:aspect-auto'>
                    <h3 className="text-white font-bold md:text-6xl text-5xl drop-shadow-[0_2.2px_2.2px_rgba(6,85,70,1)]">You only live once,</h3>
                    <h3 className="text-white font-bold md:text-xl text-lg drop-shadow-[0_2.2px_2.2px_rgba(6,85,70,1)]">But you get to serve twice!</h3>
                  </div>
                  <div className='col-span-12 sm:col-span-6 flex flex-col overflow-auto justify-center items-center max-h-max object-contain'>
                    <Illustration className='w-[90%] h-[90%] aspect-square' />
                  </div>
                </div>
              </div>
            </Carousel>
          </div>
        </LayoutWrapper>
        <ReactVisibilitySensor onChange={(isVisible: any) => {
          if (!animateMenu) {
            setAnimateMenu(true);
          }
          else {
            setSlideIsVisible(isVisible);
          }
        }}>
          <div className='h-1 bg-red-600'></div>
        </ReactVisibilitySensor>
      </div>
      {/* BEGIN: First Section */}
      <LayoutWrapper className='w-full max-w-full grid grid-cols-12 gap-2 sm:gap-8 overflow-hidden'>
        <LiveMatch className="bg-gradient-to-br from-[#17a46a] to-[#12a567] rounded-3xl mb-6 col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3 p-0 overflow-visible shadow-lg" />
        <UpcomingMatch className="rounded-3xl mb-6 col-span-12 sm:col-span-6 lg:col-span-8 2xl:col-span-9 -mx-2 lg:mx-0" />
      </LayoutWrapper>
      {/* END: First Section */}
      {/* BEGIN: Second Section */}
      <LayoutWrapper className='bg-[#fff6f4] rounded-[48px] shadow-2xl relative'>
        <div className='h-3/4 absolute left-0 top-0 w-1/12 z-0 overflow-hidden flex items-center'>
          <IconLogo className="w-64 h-48 -rotate-90" />
        </div>
        <div className='h-3/4 absolute right-0 top-0 w-1/12 z-0 overflow-hidden flex items-center'>
          <IconLogo className="w-64 h-48 rotate-90" />
        </div>
        <Content className='!z-10'>
          <div className='grid grid-cols-12 gap-2 lg:gap-8 w-full mb-24 my-4'>
            {/* BEGIN: Player Profile */}
            <FeaturedPlayer className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3 p-0" />
            {/* END: Player Profile */}
            {/* BEGIN: Latest News */}
            <LatestNews className="rounded-3xl mb-6 col-span-12 sm:col-span-6 lg:col-span-8 2xl:col-span-9 p-0" />
            {/* END: Latest News */}
          </div>
        </Content>
      </LayoutWrapper>
      {/* END: Second Section */}
      {/* BEGIN: Third Section */}
      <LayoutWrapper>
        <Content>
          <TournamentHighlight className='grid grid-cols-12 gap-8 w-full mb-16 mt-[-88px] rounded-3xl bg-emerald-800 shadow-2xl py-4 px-6 relative z-10' />
        </Content>
      </LayoutWrapper>
      {/* END: Third Section */}
      {/* BEGIN: Fourth Section */}
      <LayoutWrapper>
        <Content>
          <div className="grid grid-cols-12 w-full gap-6">
            <Galleries className="col-span-12 sm:col-span-6 lg:col-span-8 2xl:col-span-9 " />
            <StandingsComponent className="col-span-12 sm:col-span-6 lg:col-span-4 2xl:col-span-3 sm:aspect-[16/19] overflow relative flex flex-col" />
          </div>
        </Content>
      </LayoutWrapper>
      {/* END: Fourth Section */}
      {/* BEGIN: Fifth Section */}
      <LayoutWrapper>
        <MerchComponent className='grid grid-cols-12 gap-6 w-full my-6' />
      </LayoutWrapper>
      {/* END: Fifth Section */}
      {/* BEGIN: Sixth Section */}
      <LayoutWrapper className='mb-4'>
        <PartnersComponent className='grid grid-cols-12 gap-6 w-full my-6' />
      </LayoutWrapper>
      {/* END: Sixth Section */}
    </>
  );
}