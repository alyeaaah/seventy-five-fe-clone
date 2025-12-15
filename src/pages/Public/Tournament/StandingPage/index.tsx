import LayoutWrapper from "@/components/LayoutWrapper";
import { Tabs } from "antd";
import { LandingPageApiHooks } from "../../LandingPage/api";
import { useState } from "react";
import { PublicPlayerApiHooks } from "../../Player/api";
import { imageResizerDimension, isDarkColor } from "@/utils/helper";
import { defaultAvatar, sfColor } from "@/utils/faker";
import { IconLogo, IconLogoAlt } from "@/assets/images/icons";
import { Link } from "react-router-dom";
import { paths } from "@/router/paths";
import { FadeAnimation } from "@/components/Animations";
import { PublicGalleryApiHooks } from "../../Galleries/api";
import { useNavigate } from "react-router-dom";
import Lucide from "@/components/Base/Lucide";
import moment from "moment";

export const PublicStandingPage = () => {
  const navigate = useNavigate();
  const { data: leagueList, isLoading, refetch } = LandingPageApiHooks.useGetLeagueList({});
    
  const [selectedLeague, setSelectedLeague] = useState<string>(leagueList?.data?.[0]?.name || '');
  const { data: standings } = PublicPlayerApiHooks.useGetPlayerStandings({
    queries: {
      league: selectedLeague || leagueList?.data?.[0]?.name || ''
    }
  }, { enabled: !!(selectedLeague || leagueList?.data?.[0]?.name) });

  const { data: galleryData } = PublicGalleryApiHooks.useGetFeaturedGallery(
    {
      queries: {
        limit: 7
      }
    }
  );
  const onChange = (key: string) => {
    setSelectedLeague(key);
  };

  return (
    <LayoutWrapper className="min-h-[80vh]">
      <div className="grid grid-cols-12 gap-4 ">
        <div className="col-span-12">
          <h1>PublicTournamentStandingPage</h1>
        </div>
        <div className="sm:col-span-8 col-span-12">
          <Tabs
            onChange={onChange}
            type="card"
            animated
            className="sf-tabs"
            items={leagueList?.data?.map((league, i) => {
              return {
                label: <div className={`bg-opacity-5 py-2 px-4 bordered`} style={{fillOpacity: 5, borderColor: league.color_scheme ? `#${league.color_scheme}` : sfColor.primary }}>{league.name}</div>,
                key: league.name,
                active: selectedLeague === league.name,
                animated: true,
                style: {
                  borderColor: league.color_scheme ? `#${league.color_scheme}` : sfColor.primary,
                },
                children: <>
                  <div className="grid grid-cols-12 gap-4 border-2 border-emerald-800 rounded-3xl p-4">
                    <div className="col-span-12 flex flex-row rounded-3xl p-4 gap-4" style={{ backgroundColor: league.color_scheme ? `#${league.color_scheme}` : sfColor.primary }}>
                      {league.media_url ? <img src={league.media_url} alt="" className="w-16 h-16"/> : <IconLogoAlt className={`w-16 h-16 ${isDarkColor(league.color_scheme || sfColor.primary) ? 'text-white' : 'text-emerald-800'}`} />}
                      <div className="flex flex-col justify-around items-start">  
                        <span className={`text-2xl font-bold ${isDarkColor(league.color_scheme || sfColor.primary) ? 'text-white' : 'text-emerald-800'}`}>{league.name}</span>
                        <span className={`text-sm sentence-case ${isDarkColor(league.color_scheme || sfColor.primary) ? 'text-white' : 'text-emerald-800'}`}>{league.description}</span>
                      </div>
                    </div>
                    <div className="col-span-12 flex flex-col gap-4">
                      {standings?.data?.map((standing, i) => {
                        return (
                          <Link key={i} to={paths.players.info({uuid: standing.uuid || ""}).$} className="col-span-12 flex flex-row items-center justify-between rounded-2xl pr-4 py-2 gap-4 border-2 hover:bg-[#EBCE56]" style={{ borderColor: league.color_scheme ? `#${league.color_scheme}` : sfColor.primary }}>
                            <div className="flex flex-row items-center justify-start text-xs font-semibold w-full">
                              <span className="w-6 text-end mr-2 pl-1"
                                style={{
                                  backgroundColor: league.color_scheme ? `#${league.color_scheme}` : sfColor.primary,
                                  color: isDarkColor(league.color_scheme || sfColor.primary) ? '#fff' : sfColor.primary
                                }}
                              >
                                {i + 1}.&nbsp;
                              </span>
                              <div className="flex flex-col justify-around items-start">  
                                <span className={`text-xl font-bold`} style={{ color: league.color_scheme ? `#${league.color_scheme}` : sfColor.primary }}>{standing.name}</span>
                                <span className={`text-xs text-gray-500`}>{standing.age} Years Old</span>
                              </div>
                            </div>
                            <div className="flex relative h-full w-16">
                              <img
                                src={standing.avatar_url || standing.gender === 'm' ? defaultAvatar.m : defaultAvatar.f}
                                alt=""
                                className="object-contain w-20 h-20 absolute left-0 -top-4"
                              />
                            </div>
                            <div className="text-lg h-fit font-bold text-right px-2 py-1 text-white rounded-md relative" style={{ backgroundColor: league.color_scheme ? `#${league.color_scheme}` : sfColor.primary }}>
                              <span className="absolute !font-marker opacity-30 scale-150 z-[0]">{standing.point}</span>
                              <span className="relative z-[1]" style={{ color: isDarkColor(league.color_scheme || sfColor.primary) ? '#fff' : sfColor.primary }}>{standing.point}</span>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </>,
              };
            })}
          />
        </div>

        <FadeAnimation className="col-span-4 hidden md:flex flex-col space-y-2" direction="up">
          <span className="text-emerald-800 font-semibold text-lg">FEATURED <span className="font-bold">GALLERY</span></span>
          {galleryData?.data?.map((gallery, index) => (
            <div
              key={index}
              className="flex flex-row overflow-hidden h-fit rounded-xl border-emerald-800 border p-2 slide-in-top hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                if (!!gallery.album_uuid && !!gallery.uuid) {
                  navigate(paths.galleries.detail({ id: gallery.album_uuid  || "", image: gallery.uuid || "" }).$)
                }
                if (!!gallery.product_uuid) {
                  navigate(paths.shop.detail({ uuid: gallery.product_uuid || "" }).$)
                }
                if (!!gallery.blog_uuid) {
                  navigate(paths.news.detail({ uuid: gallery.blog_uuid || "" }).$)
                }
                if (!!gallery.match_uuid) {
                  navigate(paths.tournament.match({ matchUuid: gallery.match_uuid || "" }).$)
                }
                if (!!gallery.tournament_uuid) {
                  navigate(paths.tournament.index({ uuid: gallery.tournament_uuid || "" }).$)
                }
              }}>
              <img
                src={imageResizerDimension(gallery.link, 220, "h")}
                className="h-full !w-16 min-w-16 rounded-md object-cover !aspect-square"
                onClick={() => navigate(paths.galleries.detail({ id: gallery.uuid || "" }).$)}
              />
              <div className="flex flex-col w-full justify-center ml-2">
                <h3 className="text-sm font-semibold text-emerald-800 text-ellipsis line-clamp-2">{gallery.name}</h3>
                <div className="flex flex-row items-center mt-1 max-w-full text-gray-500 text-[11px] font-light">
                  <Lucide icon="Calendar" className="h-4 flex" />
                  <span className="flex flex-row ml-1 items-center justify-center !line-clamp-1 !text-ellipsis">{moment(gallery.featured_at).format('DD MMM YYYY')}&nbsp;by {gallery.name}</span>
                </div>
              </div>
            </div>
          ))}
        </FadeAnimation>
      </div>
    </LayoutWrapper>
  );
};