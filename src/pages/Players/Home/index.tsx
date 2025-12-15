import { PlayerHomeApiHooks } from "./api";
import { useAtomValue } from "jotai";
import { userAtom } from "@/utils/store";
import { Divider, Progress } from "antd";
import Lucide from "@/components/Base/Lucide";
import { IconLogo, IconLogoAlt, IconMedal, IconPlayer, IconRacket, IconVS, IconXTwitter } from "@/assets/images/icons";
import moment from "moment";
import Button from "@/components/Base/Button";
import { calculateAverage } from "@/utils/helper";
import { faker } from "@faker-js/faker";
import Image from "@/components/Image";
import { PlayerMatch } from "./components/PlayerMatch";
import { PlayerGallery } from "./components/PlayerGallery";
import { OverallRating } from "./components/OverallRating";
import { PlayerPointComponent } from "./components/PlayerPointComponent";
import { PlayerMatchPlayedComponent } from "./components/PlayerMatchPlayedComponent";
import { PlayerStandingsComponent } from "./components/PlayerStandingsComponent";
import { PlayerPartnersComponent } from "./components/PlayerPartnersComponent";
import { PlayerNewsComponent } from "./components/PlayerNewsComponent";
import { PartnersComponent } from "@/pages/Public/LandingPage/components/PartnersComponent";
import { defaultAvatar } from "@/utils/faker";
import { ModalCompleteProfile } from "../Components/ModalCompleteProfile";
import { PlayerMatchApiHooks } from "../Matches/api";
import { matchStatusEnum } from "@/pages/Admin/MatchDetail/api/schema";
import { PublicBlogApiHooks } from "@/pages/Public/Blog/api";
import { LandingPageApiHooks } from "@/pages/Public/LandingPage/api";

export const PlayerHome = () => {
  const userData = useAtomValue(userAtom);
  const { data } = PlayerHomeApiHooks.useGetPlayersDetail({
    params: {
      uuid: userData?.uuid as string
    }
  });
  const { data: recentMatches } = PlayerMatchApiHooks.useGetPlayerMatches({
    queries: {
      status: matchStatusEnum.Values.ENDED,
    }
  });
  const { data: upcomingMatches } = PlayerMatchApiHooks.useGetPlayerMatches({
    queries: {
      status: matchStatusEnum.Values.UPCOMING,
    }
  });
  const { data: featuredNews } = PublicBlogApiHooks.useGetBlogFeatured({
    queries: {
      limit: 6,
    }
  }); 
    
  const getAge = (birthdate: string) => {
    const birth = moment(birthdate);
    const now = moment();
    const years = now.diff(birth, 'year');
    const months = now.diff(birth.add(years, 'years'), 'months');
    return { years, months };
  }
  return (
    <div className="w-full py-5 grid grid-cols-12 gap-4">
      <div className="col-span-12 rounded-2xl grid grid-cols-12 gap-4 p-4">
        <div className="sm:col-span-8 col-span-12 flex flex-row">
          <div className="rounded-full mr-4 w-20 h-20 p-1 border overflow-hidden">
            <img src={data?.data.media_url || data?.data.avatar_url || defaultAvatar[data?.data?.gender as "m" | "f"]} className="rounded-full" />
          </div>
          <div className="flex flex-col justify-center hover:animate-pulse">
            <div className="font-bold text-2xl text-primary">Welcome, {data?.data?.name}!</div>
          </div>
        </div>
        <div className="sm:col-span-4 col-span-12 flex flex-col justify-center items-end">
          <div className="flex flex-row my-3">
            <div className="w-6">
              <Lucide icon="Mail" />
            </div>
            <div className="w-max">{data?.data?.email}</div>
          </div>
          {
            data?.data?.socialMediaIg && <div className="flex flex-row mb-3">
            <div className="w-6">
              <Lucide icon="Instagram" />
            </div>
            <div className="w-max">{data?.data?.socialMediaIg ? "@"+data?.data?.socialMediaIg : "-"}</div>
          </div>}
        </div>
      </div>
      <div className="col-span-12 sm:col-span-4 lg:col-span-3 xl:col-span-3 2xl:col-span-2 grid grid-cols-12 h-fit max-w-full gap-y-4">
        <OverallRating
          className="col-span-12"
          overallRating={Intl.NumberFormat("id-ID").format(data?.data?.skills ? Math.ceil(calculateAverage(data?.data?.skills || {})) : 0)}
        />
        <PlayerPointComponent
          className="col-span-12"
          point={Intl.NumberFormat("id-ID").format(data?.data?.point || 0)}
          expired={moment().endOf('year').toDate()}
        />
      </div>
      <div className="col-span-12 sm:col-span-4 lg:col-span-3 xl:col-span-3 2xl:col-span-2">
        <PlayerMatchPlayedComponent
          title="Match Played"
          className="w-full h-full"
          options={[
            {
              label: "Matches Win",
              value: recentMatches?.data?.filter((match) => {
                const playerTeamUuid = match?.home_team?.players.find((player) => player.player?.uuid === userData?.uuid) ? match.home_team.uuid : match?.away_team?.uuid;
                return match?.winner_team_uuid === playerTeamUuid;
              }).length || 0,
              color: "primary"
            },
            {
              label: "Matches Lost",
              value: recentMatches?.data?.filter((match) => {
                const playerTeamUuid = match?.home_team?.players.find((player) => player.player?.uuid === userData?.uuid) ? match.home_team.uuid : match?.away_team?.uuid;
                return match?.winner_team_uuid !== playerTeamUuid;
              }).length || 0,
              color: "pending"
            }
          ]}
        />
      </div>

      <div className="col-span-12 xs:hidden sm:hidden box rounded-2xl md:hidden lg:flex xl:flex 2xl:hidden md:col-span-3 xl:col-span-3 2xl:col-span-2">
        <PlayerPartnersComponent
          className="w-full h-full"
          players={[9, 8, 7, 6, 5, 4, 3, 2, 1].map((item) => ({
            name: faker.person.fullName(),
            media_url: faker.image.personPortrait(),
            point: 30 * item
          }))}
        />
      </div>

      <div className="col-span-12 sm:col-span-4 lg:col-span-3 xl:col-span-3 2xl:col-span-2">
        <PlayerStandingsComponent
          className="w-full h-72"
          title={`${new Date().getFullYear()} ${data?.data?.league?.name} Standings`}
          league={data?.data?.league}
          player={userData?.uuid as string}
        />
      </div>
      <div className="col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-6 grid grid-cols-12 gap-4 box h-72">
        <div className="col-span-12 font-medium text-primary uppercase text-base px-4 pt-4">
          <div className="w-full flex justify-between items-center">
            <span>Upcoming <span className="font-bold">Matches</span></span>
          </div>
          <Divider className="mt-2 my-0" />
        </div>
        <div className="col-span-12 overflow-x-scroll block whitespace-nowrap pt-0 pb-4">
          {upcomingMatches?.data?.map((match, idx) => (
            <PlayerMatch key={idx} className="ml-4" match={match} playerUuid={userData?.uuid as string} />
          ))}
          {upcomingMatches?.data?.length === 0 && <div className="col-span-12 flex flex-col items-center justify-center">
            <Lucide icon="RefreshCw" className="w-4 h-4 mr-2" /> No Upcoming Matches
          </div>}
        </div>
      </div>
      <div className="col-span-12 sm:col-span-12 lg:col-span-12 xl:col-span-8 2xl:col-span-6 grid grid-cols-12 gap-4 box h-fit p-4">
        <div className="col-span-12 font-medium text-primary uppercase text-base">
          <div className="w-full flex justify-between items-center">
            <span>Recent <span className="font-bold">Match</span></span>
          </div>
          <Divider className="mt-2 my-0" />
        </div>
        <div className="col-span-12 overflow-x-scroll block whitespace-nowrap pt-0 pb-4">
          {recentMatches?.data?.map((match, idx) => (
            <PlayerMatch key={idx} className="ml-4" match={match} playerUuid={userData?.uuid as string} />
          ))}
          {recentMatches?.data?.length === 0 && <div className="col-span-12 flex flex-col items-center justify-center h-44">
            <Lucide icon="RefreshCw" className="w-4 h-4 mr-2" /> No Recent Matches
          </div>}
        </div>
      </div>
      <div className="col-span-12 sm:col-span-12 lg:col-span-12 xl:col-span-4 2xl:col-span-6 grid grid-cols-12 gap-4 box h-fit p-4">
        <div className="col-span-12 font-medium text-primary uppercase text-base">
          <div className="w-full flex justify-between items-center">
            <span>Latest <span className="font-bold">Update</span></span>
          </div>
          <Divider className="mt-2 my-0" />
        </div>
        <div className="col-span-12 overflow-x-scroll grid grid-cols-2 gap-4">
          {featuredNews?.data?.map((news, index) => (
            <PlayerNewsComponent
              key={index}
              className="w-full col-span-2 2xl:col-span-1 lg:col-span-1 xl:col-span-2 sm:col-span-1 xs:col-span-2"
              news={{
                title: news.title,
                image_cover: news.image_cover,
                created_at: new Date(news.createdAt || "").getTime(),
                uuid: news.uuid
              }}
            />
          ))}
        </div>
      </div>
      {/* <div className="col-span-12 p-4"> */}
        <PartnersComponent className='col-span-12 grid grid-cols-12 gap-6 w-full my-6'/>
      {/* </div> */}
      <ModalCompleteProfile />
      
    </div>
  );
}

