import { IconVS } from "@/assets/images/icons"
import Lucide from "@/components/Base/Lucide"
import Image from "@/components/Image"
import { faker } from "@faker-js/faker"
import { Divider } from "antd"
import moment from "moment"
import { HTMLAttributes } from "react"
import { MatchSchema } from "../../Matches/api/schema"
import { Link } from "react-router-dom"
import { paths } from "@/router/paths"

interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  customProp?: string;
  match?: MatchSchema;
  playerUuid: string;
}
export const PlayerMatch = ({ className, match, playerUuid, ...props }: ComponentProps) => {
  const isHomeTeam = !!match?.home_team?.players.find((player) => player.player?.uuid === playerUuid);
  const versusTeam = isHomeTeam ? match?.away_team : match?.home_team;
  const ownTeam = isHomeTeam ? match?.home_team : match?.away_team;
  const partner = ownTeam?.players.find((player) => player.player?.uuid !== playerUuid);
  const isWin = match?.winner_team_uuid === ownTeam?.uuid;
  return (

    <div className={`box w-72 inline-block mr-4 shadow-lg ${className}`} {...props}>
      <Link to={paths.challenger.match({ matchUuid: match?.uuid || "" }).$} className="px-2 pt-2 text-xs font-medium justify-between flex items-center">
        <span>{moment(match?.time).format('ddd, DD MMM YYYY HH:mm')}</span>
        {!!match?.winner_team_uuid && <div className={`text-xs rounded-lg px-2 py-1 ${isWin ? "bg-emerald-800 text-white" : "bg-danger text-white"}`}>{isWin ? "Win" : "Lose"}</div>}
      </Link>
      <Divider className="mt-2 mb-0" />
      <div className="px-4 py-2 relative overflow-hidden">
        <Link to={paths.challenger.match({ matchUuid: match?.uuid || "" }).$} className="flex flex-row items-center justify-center border border-emerald-800 text-emerald-800 rounded-lg text-xs py-1 px-2 m-auto w-fit">
          <Lucide icon="MapPin" className="h-4 w-4 mr-1" />
          {match?.court_field?.name}
        </Link>
        <Link to={paths.challenger.match({ matchUuid: match?.uuid || "" }).$} className="flex flex-row items-center justify-end">
          {/* <span className="text-4xl font-extrabold italic tracking-tighter text-emerald-800 absolute -left-2 flex justify-center items-center [text-shadow:-4px_-2px_0_rgba(213,172,0,0.5),1px_1px_0_rgba(255,215,0,0.3)]">VS</span> */}
          <IconVS className="absolute -left-3 w-24 h-14 text-warning bg-white" />
          <IconVS className="absolute -left-2 w-24 h-14 text-emerald-800 " />
          <div className="mt-2 z-10 flex flex-col space-y-2">
            {versusTeam ? versusTeam?.players.map((player, idx) => (
              <div className="flex flex-row items-center justify-end" key={idx}>
                {player.player?.name || ''}
                <Image src={player.player?.media_url || ''} className="w-6 h-6 rounded-full ml-2" />
              </div>
            ))
              :
              <>
                <div className="flex flex-row items-center justify-end">
                  To Be Drawn
                  <Lucide icon="CircleUser" className="w-6 h-6 rounded-full ml-2" />
                </div>
                <div className="flex flex-row items-center justify-end">
                  To Be Drawn
                  <Lucide icon="CircleUser" className="w-6 h-6 rounded-full ml-2" />
                </div>
              </>
            }
          </div>
        </Link>
      </div>
      <Divider className="my-0" />
      <Link to={paths.players.info({ uuid: partner?.player?.uuid || "" }).$} className="flex flex-col items-center justify-center px-4 pb-2 text-ellipsis line-clamp-1">
        <span className="text-[8px] tracking-widest h-[8px] mb-2">PARTNER</span>
        <div className="flex flex-row items-center justify-center">
          <Image src={partner?.player?.media_url || faker.image.personPortrait()} className="w-6 h-6 rounded-full mr-2" />
          {partner?.player?.name || faker.person.fullName()}
        </div>
      </Link>
    </div>
  )
}