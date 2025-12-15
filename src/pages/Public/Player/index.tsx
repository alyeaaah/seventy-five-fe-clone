import LayoutWrapper from "@/components/LayoutWrapper";
import { FooterComponent } from "../LandingPage/components/FooterComponent";
import { PublicPlayerApiHooks } from "./api";
import { Link, useNavigate } from "react-router-dom";
import { FadeAnimation } from "@/components/Animations";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import { PartnersComponent } from "../LandingPage/components/PartnersComponent";
import { defaultAvatar, defaultBio, staticImages } from "@/utils/faker";
import { IconBackhand, IconDouble, IconForehandAlt, IconHeight, IconLogoAlt, IconMan, IconNet, IconPlayerLoseAlt, IconPlayerWin, IconTournament, IconTrophy, IconWoman, IconXTwitter } from "@/assets/images/icons";
import { DonutChartFull } from "@/components/CustomCharts/DonutChartFull";
import moment from "moment";
import Lucide from "@/components/Base/Lucide";
import { LandingPageApiHooks } from "../LandingPage/api";
import { PlayerMatch } from "@/pages/Players/Home/components/PlayerMatch";
import { PlayerStandingsComponent } from "@/pages/Players/Home/components/PlayerStandingsComponent";
import { faker } from "@faker-js/faker";
import { useAtomValue } from "jotai";
import { userAtom } from "@/utils/store";
import { HeaderProfile } from "./components/HeaderProfile";

interface Props {
  isPreview?: boolean;
  onEdit?: () => void;
  subHeaderContent?: React.ReactNode;
}

export const PublicPlayer = ({isPreview = false, onEdit, subHeaderContent}: Props) => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.players.info);
  const { uuid } = queryParams;
  const userData = useAtomValue(userAtom);

  const { data } = PublicPlayerApiHooks.useGetPlayerDetail({
    params: {
      uuid: (isPreview ? userData?.uuid : uuid ) || ""
    },
  }, {
    onSuccess: () => {
    },
    retry: false
  });
  const { data: matches } = PublicPlayerApiHooks.useGetPlayerMatches({
    params: {
      player_uuid: (isPreview ? userData?.uuid : uuid ) || ""
    },
  }, {
    onSuccess: () => {
    },
    retry: false
  });
  const { data: featuredPlayer } = LandingPageApiHooks.useGetFeaturedPlayer();
  return (
    <>
      <LayoutWrapper isPreview={isPreview} className={`grid grid-cols-12 gap-4 sm:gap-8 mt-4 sm:mt-8 min-h-[calc(100vh-300px)] ${isPreview ? "p-4" : ""}`}>
        <FadeAnimation className="col-span-12 md:col-span-12 grid grid-cols-12 gap-0 h-max" direction="up">
          <HeaderProfile data={data?.data || undefined} isPreview={isPreview} />
          {subHeaderContent ? <div className="col-span-12 mt-2">{subHeaderContent}</div> : null}
        </FadeAnimation>
        <FadeAnimation className="md:col-span-4 col-span-12 mt-2 text-emerald-800" direction="down">
          <div className="border-4 border-white shadow-xl rounded-2xl overflow-hidden aspect-square">
            <img src={data?.data?.media_url || (data?.data?.gender === 'm' ? defaultAvatar.m : defaultAvatar.f)} alt="" className="w-full object-cover aspect-square" />
          </div>

          <div className="md:hidden flex flex-row items-start justify-between w-full mt-6">
            <div className="flex flex-col items-start w-full">
              <p className="text-2xl font-bold item-end">{data?.data?.name}</p>
              <p className="text-lg font-semibold text-gray-500">{data?.data?.nickname}</p>
            </div>
            <div className="bg-emerald-800 flex flex-row items-center text-white rounded-lg px-3 py-1 italic font-semibold">
              <Lucide icon="Indent" className="mr-1" />
              <span>{data?.data?.level}</span>
            </div>
          </div>
          <div className="flex flex-col h-fit space-y-4 mt-4 md:mt-4">
            <div className="flex flex-row space-x-4 items-stretch">
              <div className="flex flex-col items-center w-24 rounded-xl shadow-lg border-4 py-2 border-[#EBCE56] relative overflow-hidden h-full bg-transparentl justify-center [box-shadow:2px_2px_0px_#135F46]">
                <IconLogoAlt className="absolute w-[200%] top-0 -left-[50%] h-[120%] text-emerald-800 z-0 opacity-5 bg-transparent" />
                <p className="text-2xl font-bold item-end [text-shadow:0px_0px_4px_#EBCE56] z-[1] flex items-center justify-end leading-6">{data?.data?.point}</p>
                <p className="font-semibold text-gray-500 z-[1] flex items-center justify-end leading-4">Points</p>
              </div>
              <div className="flex flex-row items-center w-full rounded-xl shadow-lg border-4 border-[#EBCE56] relative overflow-hidden bg-transparent justify-center [box-shadow:2px_2px_0px_#135F46]">
                <p className="font-semibold text-gray-500 z-[1] flex items-center justify-end leading-4">Global Rank:</p>
                <p className="text-2xl font-bold item-end [text-shadow:0px_0px_4px_#EBCE56] z-[1] flex items-center justify-end leading-6">&nbsp;{data?.data?.point}</p>
              </div>
            </div>
            <Link to={`https://www.instagram.com/${data?.data?.socialMediaIg}`} target="_blank" className="flex flex-row items-center w-full bg-[#EBCE56] rounded-xl p-4">
              <Lucide icon="Instagram" className="h-6 w-6 " />
              <div className="flex flex-col ml-2">
                <span className="text-sm font-semibold text-emerald-800">
                  @{data?.data?.socialMediaIg}
                </span>
              </div>
            </Link>
            <Link to={`https://twitter.com/${data?.data?.socialMediaX}`} target="_blank" className="flex flex-row items-center w-full bg-[#EBCE56] rounded-xl p-4">
              <IconXTwitter className="h-6 w-6 text-emerald-800" />
              <div className="flex flex-col ml-2">
                <span className="text-sm font-semibold text-emerald-800">
                  @{data?.data?.socialMediaX}
                </span>
              </div>
            </Link>
          </div>
          <div className="flex flex-col h-fit space-y-2 mt-4 md:mt-8">
            <PlayerStandingsComponent
              className="w-full h-full"
              title="Intermediate Rank"
              player={data?.data?.uuid}
              league={data?.data?.league}
            />
          </div>
        </FadeAnimation>
        <div className="col-span-12 md:col-span-8 grid grid-cols-12 gap-4 sm:gap-6 mt-2 text-emerald-800">
          <FadeAnimation className="col-span-12 grid grid-cols-12 gap-4 sm:gap-4 mt-2" direction="down">
            <div className="col-span-12 text-emerald-800 flex flex-col space-y-4 items-start ">
              <div className="hidden md:flex flex-row items-start justify-between w-full">
                <div className="flex flex-col items-start w-full">
                  <p className="text-2xl font-bold item-end">{data?.data?.name}</p>
                  <p className="text-lg font-semibold text-gray-500">{data?.data?.nickname}</p>
                </div>
                <div className="bg-emerald-800 flex flex-row items-center text-white rounded-lg px-3 py-1 italic font-semibold">
                  <Lucide icon="Indent" className="mr-1" />
                  <span className="whitespace-nowrap">{data?.data?.level}</span>
                </div>
              </div>
              <div className="flex flex-col items-start justify-center">
                <p className="text-sm font-bold item-end capitalize">{data?.data?.nickname?.toLowerCase()}'<span className="lowercase">s</span> Bio</p>
                <p className="text-xs text-gray-500 leading-5">{defaultBio[moment(data?.data?.dateOfBirth).get('day') % 5]} </p>
              </div>
              <div className="grid grid-cols-12 w-full gap-4 items-end justify-around text-sm bg-slate-100 rounded-xl px-4 py-4">
                <div className="md:col-span-4 col-span-6 flex flex-row items-center w-full">
                  {data?.data?.gender === 'm' ? <IconMan className="h-10 w-8 fill-emerald-800" /> : <IconWoman className="h-10 w-8 fill-emerald-800" />}
                  <div className="flex flex-col ml-2">
                    <span className="text-sm font-semibold">Age </span>
                    <span className="text-xs text-gray-500">{data?.data?.dateOfBirth && (
                      moment().diff(moment(data?.data?.dateOfBirth), 'years')
                    )} Years old</span>
                  </div>
                </div>
                <div className="md:col-span-4 col-span-6 flex flex-row items-center w-full">
                  <IconHeight className="h-10 w-8 fill-emerald-800" />
                  <div className="flex flex-col ml-2">
                    <span className="text-sm font-semibold">Height</span>
                    <span className="text-xs text-gray-500">{data?.data?.height}cm</span>
                  </div>
                </div>
                <div className="md:col-span-4 col-span-6 flex flex-row items-center w-full">
                  <Lucide icon="Home" className="h-10 w-8" />
                  <div className="flex flex-col ml-2">
                    <span className="text-sm font-semibold">City</span>
                    <span className="text-xs text-gray-500">{data?.data?.city}</span>
                  </div>
                </div>

                <div className="md:col-span-4 col-span-6 flex flex-row items-center w-full">
                  <IconNet className="h-10 w-8" />
                  <div className="flex flex-col ml-2">
                    <span className="text-sm font-semibold">Turned to Tennis</span>
                    <span className="text-xs text-gray-500">
                      {moment().diff(moment(data?.data?.turnDate), 'years') > 0 ? moment().diff(moment(data?.data?.turnDate), 'years') + ' Years' : ''}&nbsp;
                      {moment().diff(moment(data?.data?.turnDate), 'years') > 0 ? moment().diff(moment(data?.data?.turnDate).add(moment().diff(moment(data?.data?.turnDate), 'years')), 'years') + ' Months' : moment().diff(moment(data?.data?.turnDate), 'months') + " Months"}
                      &nbsp;ago
                    </span>
                  </div>
                </div>
                <div className="md:col-span-4 col-span-6 flex flex-row items-center w-full">
                  <IconForehandAlt className="h-10 w-8 text-emerald-800" />
                  <div className="flex flex-col ml-2">
                    <span className="text-sm font-semibold">Forehand Style</span>
                    <span className="text-xs text-gray-500">
                      {data?.data?.playstyleForehand}
                    </span>
                  </div>
                </div>
                <div className="md:col-span-4 col-span-6 flex flex-row items-center w-full">
                  <IconBackhand className="h-10 w-8 text-emerald-800" />
                  <div className="flex flex-col ml-2">
                    <span className="text-sm font-semibold">Backhand Style</span>
                    <span className="text-xs text-gray-500">
                      {data?.data?.playstyleBackhand}
                    </span>
                  </div>
                </div>
              </div>
            </div>


          </FadeAnimation>
          <FadeAnimation className="col-span-12 grid grid-cols-12 gap-2 mt-2" direction="up">
            <div className="col-span-12 text-emerald-800 grid md:grid-cols-10 grid-cols-12 gap-4 mt-4 h-fit">
              <div className="md:col-span-10 col-span-12 text-emerald-800 flex flex-row h-fit mb-2">
                <IconLogoAlt className="h-10 w-20" />
                <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
                  <div className="h-10 absolute -right-12 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
                  SKILLS
                </div>
              </div>
              {Object.keys(data?.data?.skills || {}).map((key, keyIdx) => (
                keyIdx != Object.keys(data?.data?.skills || {}).length - 312311 ? (
                  <div className="col-span-6 md:col-span-2 rounded-xl aspect-square flex flex-col justify-center items-center relative overflow-hidden [text-shadow:2px_2px_1px_#EBCE56]" key={keyIdx}>
                    <DonutChartFull
                      className="w-full h-full"
                      showLegend={false}
                      progress={true}
                      title={key}
                      options={
                        [
                          {
                            label: key,
                            value: data?.data?.skills?.[key as keyof typeof data.data.skills] || 0,
                            color: 'emerald.800'
                          },
                          {
                            label: 'Other',
                            value: 100 - (data?.data?.skills?.[key as keyof typeof data.data.skills] || 0),
                            color: 'yellow.500'
                          }
                        ]
                      } />
                  </div>) : (<div className="col-span-6 col-start-4 md:col-start-0 md:col-span-2 rounded-xl aspect-square flex flex-col justify-center items-center relative overflow-hidden [text-shadow:2px_2px_1px_#EBCE56]">
                    <DonutChartFull
                      className="w-full h-full"
                      showLegend={false}
                      progress={true}
                      title={key}
                      options={
                        [
                          {
                            label: key,
                            value: data?.data?.skills?.[key as keyof typeof data.data.skills] || 0,
                            color: 'emerald.800'
                          },
                          {
                            label: 'Other',
                            value: 100 - (data?.data?.skills?.[key as keyof typeof data.data.skills] || 0),
                            color: 'yellow.500'
                          }
                        ]
                      } />
                  </div>)
              ))}
              <div className="md:col-span-2 col-span-6 border-4 rounded-xl border-emerald-800 p-0 aspect-square flex flex-col justify-center items-center relative overflow-hidden [text-shadow:2px_2px_1px_#EBCE56] [box-shadow:2px_2px_1px_#EBCE56]">
                <IconDouble className="w-2/3 h-4/5 text-emerald-800 fill-emerald-800 absolute opacity-20 right-0 bottom-0 z-0" />
                <p className="text-5xl font-bold z-[1]">{542}</p>
                <p className="text-sm font-semibold z-[1]">Match Played</p>
              </div>
              <div className="md:col-span-2 col-span-6 border-4 rounded-xl border-emerald-800 p-0 aspect-square flex flex-col justify-center items-center relative overflow-hidden [text-shadow:2px_2px_1px_#EBCE56] [box-shadow:2px_2px_1px_#EBCE56]">
                <IconPlayerWin className="w-2/3 h-4/5 text-emerald-800 fill-emerald-800 absolute opacity-20 right-0 bottom-0 z-0" />
                <p className="text-5xl font-bold z-[1]">{30}</p>
                <p className="text-sm font-semibold z-[1]">Wins</p>
              </div>
              <div className="md:col-span-2 col-span-6 border-4 rounded-xl border-emerald-800 p-0 aspect-square flex flex-col justify-center items-center relative overflow-hidden [text-shadow:2px_2px_1px_#EBCE56] [box-shadow:2px_2px_1px_#EBCE56]">
                <IconPlayerLoseAlt className="w-2/3 h-4/5 text-emerald-800 fill-emerald-800 absolute opacity-20 right-0 bottom-0 z-0" />
                <p className="text-5xl font-bold z-[1]">{8}</p>
                <p className="text-sm font-semibold z-[1]">Losses</p>
              </div>
              <div className="md:col-span-2 col-span-6 border-4 rounded-xl border-emerald-800 p-0 aspect-square flex flex-col justify-center items-center relative overflow-hidden [text-shadow:2px_2px_1px_#EBCE56] [box-shadow:2px_2px_1px_#EBCE56]">
                <IconTournament className="w-2/3 h-4/5 text-emerald-800 fill-emerald-800 absolute opacity-20 right-0 bottom-0 z-0" />
                <p className="text-5xl font-bold z-[1]">{12}</p>
                <p className="text-sm font-semibold z-[1]">Tournament</p>
              </div>
              <div className="md:col-span-2 col-span-6 border-4 rounded-xl border-emerald-800 p-0 aspect-square flex flex-col justify-center items-center relative overflow-hidden [text-shadow:2px_2px_1px_#EBCE56] [box-shadow:2px_2px_1px_#EBCE56]">
                <IconTrophy className="w-2/3 h-4/5 text-emerald-800 fill-emerald-800 absolute opacity-20 right-0 bottom-0 z-0" />
                <p className="text-5xl font-bold z-[1]">{8}</p>
                <p className="text-sm font-semibold z-[1]">Title</p>
              </div>
            </div>

            <div className="col-span-12 text-emerald-800 grid grid-cols-12 gap-x-4 mt-4 h-fit">
              <div className="col-span-12 text-emerald-800 flex flex-row h-fit mb-2">
                <IconLogoAlt className="h-10 w-20" />
                <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
                  <div className="h-10 absolute -right-12 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
                  RECENT MATCHES
                </div>
              </div>
              <div className="col-span-12 mt-4 block whitespace-nowrap overflow-x-scroll space-x-4 rounded-lg">
                {matches?.data?.map((item, idx) => (
                  <PlayerMatch key={idx} playerUuid={uuid} match={item} />
                ))}
              </div>
            </div>
            <div className="col-span-12 text-emerald-800 grid grid-cols-12 gap-x-4 mt-8 h-fit">
              <div className="col-span-12 text-emerald-800 flex flex-row h-fit mb-2">
                <IconLogoAlt className="h-10 w-20" />
                <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
                  <div className="h-10 absolute -right-12 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
                  RELATED PLAYERS
                </div>
              </div>
              <div className="col-span-12 flex flex-row overflow-x-scroll space-x-4 rounded-2xl">
                {featuredPlayer?.data?.map((item, idx) => (
                  <div key={idx} className="flex flex-row justify-center items-center uppercase text-emerald-800  font-semibold py-2 mb-4 relative">
                    <img src={item.media_url || (item.gender === 'm' ? defaultAvatar.m : defaultAvatar.f)} alt="" className="w-24 h-24 rounded-full mr-1 border-4 z-[1]" />
                    <div className="font-bold text-white bg-emerald-800 rounded-r-full -ml-4 pl-4 z-0 line-clamp-1 w-64 leading-6 text-ellipsis py-1.5">
                      {item.name}
                      <span className="text-sm font-semibold absolute bottom-4 left-24 text-emerald-800 flex flex-row items-center">
                        {item.nickname} &nbsp;
                        <span className="text-[10px] text-emerald-800 px-1.5 border border-emerald-800 leading-4 rounded italic flex flex-row items-center">{item.level}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeAnimation>
        </div>
        <FadeAnimation className="col-span-12 ">
          <div className="col-span-12 grid grid-cols-12 gap-4 sm:gap-6 mt-2 rounded-xl">
            <PartnersComponent className="col-span-12 mb-8" />
          </div>
        </FadeAnimation>
      </LayoutWrapper>

    </>
  )
}