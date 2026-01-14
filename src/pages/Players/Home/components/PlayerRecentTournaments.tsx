import { IconVS } from "@/assets/images/icons"
import Lucide from "@/components/Base/Lucide"
import Image from "@/components/Image"
import { faker } from "@faker-js/faker"
import { Divider } from "antd"
import moment from "moment"
import { HTMLAttributes } from "react"
import { TournamentsSchema } from "../../Matches/api/schema"
import { Link } from "react-router-dom"
import { paths } from "@/router/paths"
interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  customProp?: string;
  tournament: TournamentsSchema;
  playerUuid: string;
}
export const PlayerRecentTournaments = ({ className, tournament, playerUuid, ...props }: ComponentProps) => {
  const currentPlayer = tournament.playerTeams?.find((playerTeam) => playerTeam.player_uuid === playerUuid);
  const partner = tournament.playerTeams?.find((playerTeam) => playerTeam.team_uuid === currentPlayer?.team_uuid && playerTeam.player_uuid !== playerUuid);
  return (
    <div className={`box w-full inline-block mr-4 shadow-lg min-h-32 rounded-xl  overflow-hidden ${className}`} {...props}>
      <Link to={paths.tournament.index({ uuid: tournament.uuid || "" }).$} className="flex flex-row  overflow-hidden">
        <div className="w-32">
          <Image src={tournament.media_url} className="h-full w-full mr-1 object-cover" />
        </div>
        <div className="flex flex-col w-full">
          <div className="px-4 pt-2 text-xs font-medium flex justify-between">
            {moment(tournament.start_date).format('ddd, DD MMM YYYY')}
            <span className="text-emerald-800">Semifinalist</span>
          </div>
          <Divider className="mt-2 mb-0" />
          <div className="px-4 py-2 relative overflow-hidden">
            <span className="capitalize flex flex-row text-lg font-semibold items-center text-emerald-800">
              {tournament.name}
            </span>
          </div>
          <Divider className="my-0" />
          <div className="flex flex-col items-center justify-center px-4 pb-2 text-ellipsis line-clamp-1">
            <span className="text-[8px] tracking-widest h-[8px] mb-2">PARTNER</span>
            <Link to={paths.players.info({ uuid: partner?.player?.uuid || "" }).$} className="flex flex-row items-center justify-center">
              <Image src={partner?.player?.media_url || ''} className="w-6 h-6 rounded-full mr-2" />
              {partner?.player?.name || ''}
            </Link>
          </div>
        </div>
      </Link>
    </div>
  )
}