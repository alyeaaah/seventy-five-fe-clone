import { IconVS } from "@/assets/images/icons";
import { Dialog } from "@/components/Base/Headless"
import { IMatch } from "@/components/TournamentDrawing/interfaces"
import Modal from "antd/es/modal/Modal";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";
import moment from "moment";


export const GroupMatchesModal = ({ isOpen, onClose, matches, onMatchesClick }: { isOpen: boolean, onClose: () => void, matches: IMatch[], onMatchesClick: (match: IMatch) => void }) => {
  const groupKey = matches?.[0]?.groupKey !== undefined && matches?.[0]?.groupKey >= 0 ? matches?.[0]?.groupKey : 0;
  const screens = useBreakpoint();
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={`Group ${String.fromCharCode(65 + groupKey)} Matches`}
      width={screens.md ? "60vw" : "90%"}
      footer={<></>}
    >
      <div className="grid grid-cols-12 gap-3 md:p-2 p-0">
        {matches.map((match, index) => (
          <div
            key={index}
            className="col-span-12 border border-emerald-800 rounded-3xl hover:bg-stone-200 cursor-pointer md:rounded-full"
            onClick={() => onMatchesClick(match)}
          >
            <div className="flex flex-col items-center justify-between gap-2 px-2 py-2 md:flex-row">
              <div className="flex flex-row items-center justify-between gap-2 border flex-auto md:flex-1 bg-[#EBce56] rounded-2xl md:rounded-full px-2 md:px-4 py-2 md:w-auto w-full">
                <div className="flex flex-col md:flex-row items-start md:justify-start md:items-center gap-2 flex-1">
                  <span className="font-medium bg-emerald-800 px-2 py-1 text-xs rounded-full text-white line-clamp-1 min-w-fit">{match.teams[0].name}</span>
                  <div className="flex flex-col gap-1">
                    {match.teams[0]?.players?.map((player, index) => (
                      <span key={index} className="text-xs font-medium line-clamp-1">{player.name}</span>
                    ))}
                  </div>
                </div>
                <IconVS className="w-12 h-6 text-emerald-800" />
                <div className="flex flex-col-reverse md:flex-row md:justify-end items-end md:items-center gap-2 flex-1">
                  <div className="flex flex-col text-right gap-1">
                    {match.teams[1]?.players?.map((player, index) => (
                      <span key={index} className="text-xs font-medium line-clamp-1">{player.name}</span>
                    ))}
                  </div>
                  <span className="font-medium bg-emerald-800 px-2 py-1 text-xs rounded-full text-white line-clamp-1 min-w-fit">{match.teams[1].name}</span>
                </div>
              </div>
              <div className="flex md:flex-col flex-row items-center gap-2">
                <span className="text-xs font-medium">
                  {match.court}
                  <span className="md:hidden visible">,</span>
                </span>
                <span className="text-xs font-medium">{moment(match.time).format('ddd, DD MMM YYYY HH:mm')}</span>

                <div className="bg-emerald-800 text-white h-6 w-6 aspect-square rounded-full md:hidden flex items-center justify-end overflow-hidden">
                  <span className="text-xl font-semibold font-marker uppercase text-end">{`${String.fromCharCode(65 + groupKey)}${index + 1}`}</span>
                </div>
              </div>
              <div className="bg-emerald-800 text-white h-[54px] w-[54px] aspect-square rounded-full md:flex hidden items-center justify-end overflow-hidden">
                <span className="text-5xl font-semibold font-marker uppercase text-end">{`${String.fromCharCode(65 + groupKey)}${index + 1}`}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}