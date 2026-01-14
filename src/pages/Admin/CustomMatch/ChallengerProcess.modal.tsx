import { Modal, Select, DatePicker, Image } from "antd";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import Button from "@/components/Base/Button";
import { CourtsApiHooks } from "@/pages/Admin/Courts/api";
import { PlayerProfileApiHooks } from "@/pages/Players/Profile/api";
import { queryClient } from "@/utils/react-query";
import { PublicMatchApiHooks } from "@/pages/Public/Match/api";
import { CustomMatchApiHooks } from "./api";
import { IconVS } from "@/assets/images/icons";
import { useToast } from "@/components/Toast/ToastContext";
import { PublicChallenger } from "@/pages/Public/Match/api/schema";
import { AcceptChallengerPayload, acceptChallengerPayloadSchema } from "./api/schema";
import Lucide from "@/components/Base/Lucide";
import { imageResizer } from "@/utils/helper";

interface ChallengerProcessModalProps {
  open: boolean;
  onClose: () => void;
  challengerData: PublicChallenger | null;
}
export const ChallengerProcessModal = ({ open, onClose, challengerData }: ChallengerProcessModalProps) => {
  const toast = useToast();

  // Return early if no challenger data
  if (!challengerData) {
    return null;
  }

  const methods = useForm<AcceptChallengerPayload & { court_uuid?: string; court_field_uuid?: string; time?: string }>({
    mode: "onChange",
    defaultValues: {
      challenger_id: challengerData.id,
      court_uuid: challengerData.court.uuid,
      court_field_uuid: challengerData.court?.court_field_uuid || undefined,
      time: challengerData.time,
      challengerA_uuid: challengerData.challengerA?.uuid || "",
      challengerB_uuid: challengerData.challengerB?.uuid || "",
      opponentA_uuid: challengerData.opponentA?.uuid || undefined,
      opponentB_uuid: challengerData.opponentB?.uuid || undefined,
    },
    resolver: zodResolver(
      acceptChallengerPayloadSchema
    ),
  });
  const { control, formState, handleSubmit, setValue, watch, getValues } = methods;
  const [courtSearch, setCourtSearch] = useState<string>("");
  const [playerSearch, setPlayerSearch] = useState<string>("");

  // Temporarily store selected court UUID for field filtering
  const [selectedCourtUuid, setSelectedCourtUuid] = useState<string | undefined>(challengerData?.court?.uuid);

  const { data: courtsList, isLoading: isCourtsLoading } = CourtsApiHooks.useGetCourtsList(
    {
      queries: {
        search: courtSearch || undefined,
        limit: 100,
      },
    },
    {
      enabled: open,
    }
  );

  const selectedCourt = useMemo(() => {
    return courtsList?.data?.find((court) => court.uuid === selectedCourtUuid);
  }, [courtsList?.data, selectedCourtUuid]);

  const courtFieldOptions = useMemo(() => {
    const fields = selectedCourt?.fields || [];
    return fields.map((field) => ({
      label: field.name,
      value: field.uuid,
    }));
  }, [selectedCourt?.fields]);

  const { data: playersList, isLoading: isPlayersLoading } = PlayerProfileApiHooks.useGetPlayersList(
    {
      queries: {
        search: playerSearch || undefined,
        limit: 50,
      },
    },
    {
      enabled: open,
    }
  );

  const partnerOptions = useMemo(() => {
    const selectedPlayers = [
      getValues("opponentA_uuid"),
      getValues("opponentB_uuid"),
      challengerData.challengerA?.uuid,
      challengerData.challengerB?.uuid,
    ];
    // Filter out challenger players from options
    const homePlayerUuids = [challengerData.challengerA?.uuid, challengerData.challengerB?.uuid].filter(
      (v): v is string => !!v
    );
    return (
      playersList?.data
        ?.filter((p: any) => !!p.uuid && !homePlayerUuids.includes(p.uuid))
        ?.map((p: any) => ({
          label: (
            <div className="flex flex-row justify-between">
              <span className="font-medium capitalize">{p.name} <span className="text-gray-500 font-normal">{p.nickname}</span></span>
              <span>{p.level}</span>
            </div>
          ),
          disabled: selectedPlayers.includes(p.uuid || ""),
          value: p.uuid as string,
        })) || []
    );
  }, [playersList?.data, getValues("opponentA_uuid"), getValues("opponentB_uuid"), challengerData?.challengerA, challengerData?.challengerB]);

  const { mutateAsync: acceptChallenger, isPending } = CustomMatchApiHooks.useAcceptChallenger();

  const onSubmit = async (data: AcceptChallengerPayload) => {
    const payload: AcceptChallengerPayload = {
      challenger_id: data.challenger_id,
      time: data.time,
      court_field_uuid: data?.court_field_uuid || challengerData?.court?.court_field_uuid || undefined,
      with_ad: false,

      challengerA_uuid: data.challengerA_uuid,
      challengerB_uuid: data.challengerB_uuid,
      opponentA_uuid: data.opponentA_uuid || undefined,
      opponentB_uuid: data.opponentB_uuid || undefined,
    };

    await acceptChallenger(payload).catch((error) => {
      toast.showNotification({
        text: "Failed to accept challenger",
        variant: "danger",
        duration: 5000,
        icon: "XCircle",
      });
      console.error("Error accepting challenger:", error);
    }).then(() => {
      toast.showNotification({
        text: "Challenger accepted successfully",
        variant: "success",
        icon: "CheckCircle",
        duration: 5000,
      });
    });

    queryClient.invalidateQueries({
      queryKey: PublicMatchApiHooks.getKeyByAlias("getPublicChallengerList"),
    });
    queryClient.invalidateQueries({
      queryKey: CustomMatchApiHooks.getKeyByAlias("getCustomMatchList"),
    });
    methods.reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        methods.reset();
        onClose();
      }}
      title="Process Challenger Request"
      footer={null}
      destroyOnClose
      width={600}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full grid grid-cols-12 gap-4">
          {/* Display challenger info (read-only) */}
          <div className="col-span-12">
            <div className="bg-slate-100 dark:bg-darkmode-700 rounded-lg p-3 mb-4 relative">
              <h4 className="font-medium text-sm mb-2">Challenged by:</h4>
              <div className="space-y-1 ">
                {[challengerData?.challengerA, challengerData?.challengerB]
                  .filter((p): p is NonNullable<typeof challengerData.challengerA> => !!p)
                  .map((player) => (
                    <div className="text-xs flex flex-row gap-1 items-center  w-fit px-2 py-1 font-medium  rounded text-emerald-800">
                      <div className="w-6 h-6 flex items-center justify-center">
                        {player.image_url ? <Image src={imageResizer(player.image_url || "", 100) || ""} className="rounded" /> : <Lucide icon="UsersRound" />}
                      </div>
                      {player.name}
                      {player.uuid === challengerData.createdBy ? <Lucide icon="Star" className="text-[#EBCE56] h-4 w-5" /> : ""}
                    </div>
                  ))}
              </div>
              <div className="text-xs absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs border ${challengerData?.status === "OPEN" ? "text-warning bg-warning/20 border-warning" : ""
                  }`}>
                  {challengerData?.status}
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-12">
            <div className="font-medium text-sm mb-2">Venue</div>
            <Controller
              name="court_uuid"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Select
                    {...field}
                    showSearch
                    loading={isCourtsLoading}
                    placeholder="Choose venue"
                    className="w-full"
                    filterOption={false}
                    onSearch={setCourtSearch}
                    onChange={(value) => {
                      field.onChange(value);
                      setSelectedCourtUuid(value);
                      setValue("court_field_uuid", "");
                    }}
                    status={fieldState.error ? "error" : undefined}
                    options={
                      courtsList?.data?.map((court) => ({
                        label: `${court.name} - ${court.city}`,
                        value: court.uuid,
                      })) || []
                    }
                  />
                  {fieldState.error && (
                    <div className="text-red-500 text-xs mt-1">{fieldState.error.message}</div>
                  )}
                </>
              )}
            />
          </div>

          <div className="col-span-12">
            <label className="block text-sm font-medium mb-1">Choose Court</label>
            <Controller
              name="court_field_uuid"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Select
                    {...field}
                    className="w-full"
                    value={field.value !== "" && field.value !== undefined ? field.value : undefined}
                    placeholder={selectedCourtUuid ? "Select Court" : "Select Venue First"}
                    disabled={!selectedCourtUuid}
                    status={fieldState.error ? "error" : undefined}
                    options={courtFieldOptions}
                  />
                  {fieldState.error && (
                    <div className="text-red-500 text-xs mt-1">{fieldState.error.message}</div>
                  )}
                </>
              )}
            />
          </div>

          <div className="col-span-12">
            <label className="block text-sm font-medium mb-1">Date & time</label>
            <Controller
              name="time"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <DatePicker
                    {...field}
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(value) => field.onChange(value?.toISOString() || "")}
                    showTime
                    className="w-full"
                    format="YYYY-MM-DD HH:mm"
                    disabledDate={(current) => {
                      if (!current) return false;
                      return current.isBefore(dayjs().startOf("day"));
                    }}
                    status={fieldState.error ? "error" : undefined}
                  />
                  {fieldState.error && (
                    <div className="text-red-500 text-xs mt-1">{fieldState.error.message}</div>
                  )}
                </>
              )}
            />
          </div>

          {/* Opponent Players Selection */}
          <div className="col-span-12">
            <div className="flex items-center gap-2 mb-2">
              <IconVS className="w-8 h-6 text-emerald-800" />
              <span className="font-medium text-sm">Opponent Players</span>
            </div>
          </div>

          <div className="col-span-12">
            <label className="block text-sm font-medium mb-1">Opponent Player 1</label>
            <Controller
              name="opponentA_uuid"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  className="w-full"
                  value={field.value || undefined}
                  onChange={(value) => {
                    // Check if player is already selected elsewhere
                    const awayPlayer2 = getValues("opponentB_uuid");
                    if (value && awayPlayer2 === value) {
                      field.onChange(field.value);
                      return;
                    }
                    field.onChange(value ? value : field.value);
                    setPlayerSearch("");
                  }}
                  showSearch
                  allowClear
                  loading={isPlayersLoading}
                  placeholder="Select away player 1 (optional)"
                  filterOption={false}
                  onSearch={setPlayerSearch}
                  options={partnerOptions}
                />
              )}
            />
          </div>

          <div className="col-span-12">
            <label className="block text-sm font-medium mb-1">Opponent Player 2</label>
            <Controller
              name="opponentB_uuid"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  className="w-full"
                  value={field.value || undefined}
                  onChange={(value) => {
                    // Check if player is already selected elsewhere
                    const awayPlayer1 = getValues("opponentA_uuid");
                    if (value && awayPlayer1 === value) {
                      field.onChange(field.value);
                      return;
                    }
                    field.onChange(value ? value : field.value);
                    setPlayerSearch("");
                  }}
                  showSearch
                  allowClear
                  loading={isPlayersLoading}
                  placeholder="Select away player 2 (optional)"
                  filterOption={false}
                  onSearch={setPlayerSearch}
                  options={partnerOptions}
                />
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            type="button"
            variant="outline-primary"
            className="border-emerald-800 text-emerald-800"
            onClick={() => {
              methods.reset();
              onClose();
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={() => {
              console.log(
                acceptChallengerPayloadSchema.parse(getValues()))
            }}
          >
            tes
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="bg-emerald-800"
            disabled={formState.isSubmitting || isPending}
          >
            {formState.isSubmitting || isPending ? "Processing..." : "Accept Challenger"}
          </Button>
        </div>
      </form>
    </Modal >
  );
};