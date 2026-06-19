
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import Image from "@/components/Image";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { IPlayerDraft } from "@/components/TournamentDraftPick";
import { imageResizer } from "@/utils/helper";
import { Divider, Modal } from "antd";
import { useState } from "react";

export interface IModalPickPlayerProps {
  open: boolean;
  onClose: () => void;
  availablePlayers: IPlayerDraft[];
  player?: IPlayerDraft
  onPick: (player: IPlayerDraft) => void;
}
export const ModalPickPlayer = ({ open, onClose, player, availablePlayers, onPick }: IModalPickPlayerProps) => {
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={false}
      title={"Pick Player"}
      width={800}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="aspect-square relative w-24 flex overflow-hidden items-center justify-center border-gray-950 border-4 rounded-full">
          {player?.media_url ? <Image
            src={imageResizer(player?.media_url || "", 200)}
            className="object-cover rounded-full absolute z-0"
            alt={player?.name}
          /> : null}
          <span className="relative">
            <Lucide icon="UserSearch" className="h-12 w-12 z-[1] text-eme absolute top-[1.5px] left-[1.5px] " />
            <Lucide icon="UserSearch" className="h-12 w-12 z-[1] text-[#ccfe00]" />

          </span>
        </div>
        <h2 className="text-lg font-semibold">Draft Pick Player</h2>
        <p className="text-sm text-gray-800">Help {player?.name} to pick his/her partner in the tournament?</p>
        <Divider className="my-0" />
        <div className="grid grid-cols-4 gap-2">
          {availablePlayers.map((aplayer, index) => (
            <Button key={index} onClick={() => {
              setModalAlert({
                open: true,
                onClose: () => setModalAlert(undefined),
                title: "Draft Pick Partner",
                content: <div className="flex flex-col items-center gap-2">
                  <div className="flex flex-row">
                    <div className="aspect-square relative w-24 flex overflow-hidden items-center justify-center border-gray-950 border-4 rounded-full">
                      {player?.media_url ? <Image
                        src={imageResizer(player?.media_url || "", 200)}
                        className="object-cover rounded-full absolute z-0"
                        alt={player?.name}
                      /> : <div className="bg-white h-full w-full flex items-center justify-center"><Lucide icon="ImageOff" /></div>}
                      <span className="absolute bottom-0 left-0 right-0 text-center bg-gray-950 text-white text-sm font-medium">{player?.name?.split(" ")[0]}</span>
                    </div>
                    <div className="aspect-square -ml-6 relative w-24 flex overflow-hidden items-center justify-center border-gray-950 border-4 rounded-full">
                      {aplayer.media_url ? <Image
                        src={imageResizer(aplayer?.media_url || "", 200)}
                        className="object-cover rounded-full absolute z-0"
                        alt={aplayer?.name}
                      /> : <div className="bg-white h-full w-full flex items-center justify-center"><Lucide icon="ImageOff" /></div>}
                      <span className="absolute bottom-0 left-0 right-0 text-center bg-gray-950 text-white text-sm font-medium">{aplayer?.name?.split(" ")[0]}</span>

                    </div>
                  </div>
                  <span className="text-sm font-medium px-4 text-center mb-2">Are you sure to continue?</span>
                </div>,
                description: `This action will pick ${aplayer.name} as ${player?.name}'s partner in the tournament.`,
                icon: "Info",
                buttons: [
                  {
                    label: "Cancel",
                    variant: "outline-danger",
                    onClick: () => setModalAlert(undefined),
                  },
                  {
                    label: "Continue",
                    variant: "outline-primary",
                    onClick: () => {
                      onPick(aplayer)
                      setModalAlert(undefined);
                    },
                  },
                ],
              });
            }} className="col-span-4 p-0 sm:col-span-1 aspect-video w-full relative overflow-hidden flex hover:opacity-50 transition-opacity">
              {aplayer.media_url ? <div className="absolute z-0">
                <Image
                  src={imageResizer(aplayer.media_url || "", 200)}
                  className="object-cover"
                  alt={aplayer.name}
                />
              </div> : <></>}
              <div className="flex flex-col text-w relative w-full flex-1 items-center  z-[1] [text-shadow:0px_0px_2px_#CCFE00]">
                <span className="relative w-full">
                  <span className="font-bold bg-[#ccfe00]/10 backdrop-blur-sm w-full rounded-md px-2 z-[1] relative [text-shadow:0px_0px_2px_#CCFE00]">{aplayer.name}</span>
                </span>
                <span className="text-xs text-gray-800">{aplayer.nickname || aplayer.username || aplayer.email?.split('@')[0]}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <Confirmation
        open={!!modalAlert?.open}
        onClose={() => setModalAlert(undefined)}
        icon={modalAlert?.icon || "Info"}
        title={modalAlert?.title || ""}
        content={modalAlert?.content}
        description={modalAlert?.description || ""}
        refId={modalAlert?.refId}
        buttons={modalAlert?.buttons}
      />
    </Modal>
  );
};