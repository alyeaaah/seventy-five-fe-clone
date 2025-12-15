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
import { useState } from "react";
import Confirmation from "@/components/Modal/Confirmation"
interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  customProp?: string;
  tournament: TournamentsSchema;
}
export const PlayerTournaments = ({ className, tournament, ...props }: ComponentProps) => {
  const [modalJoin, setModalJoin] = useState(false);
  return (
    <div className={`box w-full inline-block mr-4 shadow-lg rounded-xl  overflow-hidden ${className}`} {...props}>
      <Link to={paths.tournament.index({ uuid: tournament.uuid || "" }).$} className="flex flex-row overflow-hidden">
        <div className="w-32 h-fit border overflow-hidden relative">
        <img src={tournament.media_url} className="w-full h-[80px] mr-1 object-cover" />
        </div>
        <div className="flex flex-col w-full">
          <div className="px-4 pt-2 text-xs font-medium flex justify-between">
            {moment(tournament.start_date).format('ddd, DD MMM YYYY')}
            <div
              className="text-emerald-800"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setModalJoin(true)
              }}
            >ASK TO JOIN</div>
          </div>
          <Divider className="mt-2 mb-0" />
          <div className="px-4 py-2 relative overflow-hidden">
            <span className="capitalize flex flex-row text-lg font-semibold items-center text-emerald-800">
              {tournament.name}
            </span>
          </div>
        </div>
      </Link>
      <Confirmation
        key={tournament.uuid}
        visible={modalJoin}
        onCancel={() => setModalJoin(false)}
        onConfirm={() => setModalJoin(false)}
        title={`Join ${tournament.name}?`}
        description="Are you sure you want to ask to join tournament?"
        open={modalJoin}
        onClose={() => setModalJoin(false)}
        buttons={[
          {
            label: "Cancel",
            onClick: () => setModalJoin(false),
            variant: "secondary",
          },
          {
            label: "Ask to Join",
            onClick: () => setModalJoin(false),
            variant: "primary",
          },
        ]}
        icon="AsteriskSquare"
      />
    </div>
  )
}