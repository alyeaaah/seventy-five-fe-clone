import { IconLogo } from '@/assets/images/icons';
import { Illustration, TennisPlay } from '@/assets/images/illustrations/illustrations';
import LayoutWrapper from '@/components/LayoutWrapper';
import { Layout, Typography, Carousel } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState, lazy, Suspense } from 'react';
import { UpcomingMatch } from './components/MatchComponent';
import { LiveMatch } from './components/LiveMatchComponent';
import ReactVisibilitySensor from 'react-visibility-sensor';
import { PublicHeader } from './components/HeaderLandingPage';
import { PWAInstallButton } from '@/components/PWAInstallButton';
import { ScoreWebSocketListener } from '@/components/ScoreWebSocketListener';

// Lazy load below-the-fold components to improve LCP
const FeaturedPlayer = lazy(() => import('./components/FeaturedPlayerComponent'));
const LatestNews = lazy(() => import('./components/LatestNewsComponent'));
const TournamentHighlight = lazy(() => import('./components/TournamentHighlight'));
const Galleries = lazy(() => import('./components/GalleriesComponent'));
const StandingsComponent = lazy(() => import('./components/StandingsComponent'));
const MerchComponent = lazy(() => import('./components/MerchComponent'));
const PartnersComponent = lazy(() => import('./components/PartnersComponent'));

const { Content } = Layout;

export const LandingPage = () => {
  const navigate = useNavigate();
  const [slideIsVisible, setSlideIsVisible] = useState<boolean>();
  const [animateMenu, setAnimateMenu] = useState(false);

  return (
    <>
      {/* WebSocket listener for real-time score updates */}
      <ScoreWebSocketListener />

      {/* <PageHeader /> */}
      <PublicHeader />
      <PublicHeader className={`rounded-b-2xl shadow-xl fixed -translate-y-[100px] top-0 w-full z-20 ${slideIsVisible === true && animateMenu === true ? `animate-slide-out-top` : (slideIsVisible === false && animateMenu === true ? `fixed animate-slide-in-top ` : '')}`} />
      <div className='h-[50vh] w-full bg-[#EBCE56] mb-6 relative rounded-b-[48px] shadow-xl overflow-hidden' style={{ contain: 'layout' }}>
        <div className="absolute bottom-[-32vh] left-[-120px] rotate-[14deg] w-[130vw] h-[55vh] bg-emerald-800 z-0"></div>
        <LayoutWrapper className="h-full">
          <div className='z-10 h-full'>
            <Carousel arrows autoplay autoplaySpeed={8000} className='h-[calc(50vh-32px)]'>
              <div className=' w-full h-[calc(50vh-32px)]'>
                <div className='h-full grid grid-cols-12' style={{ minHeight: 'calc(50vh - 32px)' }}>
                  <div className='col-span-12 sm:col-span-6 flex justify-center items-center' style={{ aspectRatio: '16/9' }}>
                    <h3 className="text-white font-bold md:text-6xl text-5xl shadow text-center px-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Family comes first!</h3>
                  </div>
                  <div className='col-span-12 sm:col-span-6 flex justify-center items-center' style={{ aspectRatio: '1/1' }}>
                    <div className='w-[90%] h-[90%] aspect-square'>
                      <TennisPlay className='w-full h-full' />
                    </div>
                  </div>
                </div>
              </div>
              <div className=' w-full h-[calc(50vh-32px)]'>
                <div className='h-full grid grid-cols-12' style={{ minHeight: 'calc(50vh - 32px)' }}>
                  <div className='col-span-12 sm:col-span-6 flex flex-col justify-center items-start px-4' style={{ aspectRatio: '16/9' }}>
                    <h3 className="text-white font-bold md:text-6xl text-5xl drop-shadow-[0_2.2px_2.2px_rgba(6,85,70,1)]">You only live once,</h3>
                    <h3 className="text-white font-bold md:text-xl text-lg drop-shadow-[0_2.2px_2.2px_rgba(6,85,70,1)]">But you get to serve twice!</h3>
                  </div>
                  <div className='col-span-12 sm:col-span-6 flex justify-center items-center' style={{ aspectRatio: '1/1' }}>
                    <div className='w-[90%] h-[90%] aspect-square'>
                      <Illustration className='w-full h-full' />
                    </div>
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
          <div className='h-1 bg-red-600' style={{ contain: 'layout' }}></div>
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
            <Suspense fallback={
              <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3 p-0 rounded-3xl mb-6 bg-gray-100 animate-pulse h-64" />
            }>
              <FeaturedPlayer className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3 p-0" />
            </Suspense>
            {/* END: Player Profile */}
            {/* BEGIN: Latest News */}
            <Suspense fallback={
              <div className="rounded-3xl mb-6 col-span-12 sm:col-span-6 lg:col-span-8 2xl:col-span-9 p-0 bg-gray-100 animate-pulse h-64" />
            }>
              <LatestNews className="rounded-3xl mb-6 col-span-12 sm:col-span-6 lg:col-span-8 2xl:col-span-9 p-0" />
            </Suspense>
            {/* END: Latest News */}
          </div>
        </Content>
      </LayoutWrapper>
      {/* END: Second Section */}
      {/* BEGIN: Third Section */}
      <LayoutWrapper>
        <Content>
          <Suspense fallback={
            <div className='grid grid-cols-12 gap-8 w-full mb-16 mt-[-88px] rounded-3xl bg-gray-100 animate-pulse shadow-2xl py-4 px-6 relative z-10 h-64' />
          }>
            <TournamentHighlight className='grid grid-cols-12 gap-8 w-full mb-16 mt-[-88px] rounded-3xl bg-emerald-800 shadow-2xl py-4 px-6 relative z-10' />
          </Suspense>
        </Content>
      </LayoutWrapper>
      {/* END: Third Section */}
      {/* BEGIN: Fourth Section */}
      <LayoutWrapper>
        <Content>
          <div className="grid grid-cols-12 w-full gap-6">
            <Suspense fallback={
              <div className="col-span-12 sm:col-span-6 lg:col-span-8 2xl:col-span-9 bg-gray-100 animate-pulse h-64 rounded-3xl" />
            }>
              <Galleries className="col-span-12 sm:col-span-6 lg:col-span-8 2xl:col-span-9 " />
            </Suspense>
            <Suspense fallback={
              <div className="col-span-12 sm:col-span-6 lg:col-span-4 2xl:col-span-3 sm:aspect-[16/19] overflow relative flex flex-col bg-gray-100 animate-pulse rounded-3xl" />
            }>
              <StandingsComponent className="col-span-12 sm:col-span-6 lg:col-span-4 2xl:col-span-3 sm:aspect-[16/19] overflow relative flex flex-col" />
            </Suspense>
          </div>
        </Content>
      </LayoutWrapper>
      {/* END: Fourth Section */}
      {/* BEGIN: Fifth Section */}
      <LayoutWrapper>
        <Suspense fallback={
          <div className='grid grid-cols-12 gap-6 w-full my-6'>
            <div className="col-span-12 bg-gray-100 animate-pulse h-32 rounded-3xl" />
          </div>
        }>
          <MerchComponent className='grid grid-cols-12 gap-6 w-full my-6' />
        </Suspense>
      </LayoutWrapper>
      {/* END: Fifth Section */}
      {/* BEGIN: Sixth Section */}
      <LayoutWrapper className='mb-4'>
        <Suspense fallback={
          <div className='grid grid-cols-12 gap-6 w-full my-6'>
            <div className="col-span-12 bg-gray-100 animate-pulse h-32 rounded-3xl" />
          </div>
        }>
          <PartnersComponent className='grid grid-cols-12 gap-6 w-full my-6' />
        </Suspense>
      </LayoutWrapper>
      {/* END: Sixth Section */}
      <PWAInstallButton />
    </>
  );
}