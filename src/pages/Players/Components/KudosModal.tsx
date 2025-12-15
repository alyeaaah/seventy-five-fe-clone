import { IconLogo } from "@/assets/images/icons";
import Button from "@/components/Base/Button";
import { FormLabel, FormTextarea } from "@/components/Base/Form";
import { useToast } from "@/components/Toast/ToastContext";
import { PublicMatchApiHooks } from "@/pages/Public/Match/api";
import { queryClient } from "@/utils/react-query";
import Modal from "antd/es/modal/Modal";
import { useState } from "react";

export const KudosModal = ({ matchUuid, playerUuid, onClose }: { matchUuid: string, playerUuid: string, onClose: () => void }) => {
  const { showNotification } = useToast();
  const { data: kudosList } = PublicMatchApiHooks.useGetKudosList({
    queries: {
      page: 1,
      limit: 20,
      search: ""
    }
  });
  const { mutateAsync: giveKudos, isLoading } = PublicMatchApiHooks.useGiveKudos({}, {
    onSuccess: () => {
      showNotification({
        duration: 3000,
        text: "Kudos given successfully",
        icon: "WashingMachine",
        variant: "success",
      });
      onClose();
      queryClient.invalidateQueries({
        queryKey: PublicMatchApiHooks.getKeyByAlias("getMatchDetail"),
      });
    },
    retry: false
  });
  const [selectedKudos, setSelectedKudos] = useState<{ name: string, uuid: string } | undefined>(undefined);
  const [comment, setComment] = useState<string>("");
  return <>
    <div className="w-full grid grid-cols-12 gap-4">
      <div className="col-span-12 flex flex-row gap-2 flex-wrap">
      {kudosList?.data?.map((item, index) => (
        <div className={`flex items-center w-fit border px-3 py-1 rounded-full cursor-pointer hover:bg-[#EBCE56] hover:border-emerald-800 hover:text-emerald-800 ${selectedKudos?.uuid === item.uuid ? "bg-primary text-white" : ""}`} key={index}>
          <span className="whitespace-nowrap" onClick={() => setSelectedKudos({name: item.name, uuid: item.uuid})}>{item.name}</span>
        </div>
      ))}
      </div>
      <div className="col-span-12">
        <FormLabel className="font-semibold text-gray-700">Add your comment <span className="text-xs text-gray-500 font-normal">(optional)</span></FormLabel>
        <FormTextarea
          name="comment"
          placeholder="Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <div className="col-span-12 flex justify-end">
        <Button
          variant="primary"
          disabled={!selectedKudos || isLoading}
          onClick={() => {
            if (!selectedKudos) return;
            giveKudos({
              match_uuid: matchUuid,
              player_uuid: playerUuid,
              kudos_uuid: selectedKudos.uuid,
              kudos_text: comment
            });
          }}
        >
          Submit
        </Button>
      </div>
    </div>
  </>;
};