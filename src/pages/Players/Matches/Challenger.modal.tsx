import { Modal, Select, DatePicker, Switch } from "antd";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import Button from "@/components/Base/Button";
import { CourtsApiHooks } from "@/pages/Admin/Courts/api";
import { PlayerProfileApiHooks } from "@/pages/Players/Profile/api";
import { PlayerMatchApiHooks } from "./api";
import { queryClient } from "@/utils/react-query";
import { PublicMatchApiHooks } from "@/pages/Public/Match/api";
import { OpenChallengerPayload, openChallengerPayloadSchema } from "./api/schema";
import { IconVS } from "@/assets/images/icons";
import { useToast } from "@/components/Toast/ToastContext";

interface ChallengerModalProps {
  open: boolean;
  onClose: () => void;
  userUuid: string;
}

export const ChallengerModal = ({ open, onClose, userUuid }: ChallengerModalProps) => {
  const toast = useToast();
  const methods = useForm<OpenChallengerPayload & { court_uuid?: string }>({
    mode: "onChange",
    defaultValues: {
      court_uuid: undefined,
      court_field_uuid: undefined,
      time: dayjs().add(1, "hour").toISOString(),
      with_ad: true,
      challengerA_uuid: userUuid,
      challengerB_uuid: "",
      opponentA_uuid: undefined,
      opponentB_uuid: undefined,
    },
    resolver: zodResolver(
      openChallengerPayloadSchema.omit({
        point_config_uuid: true,
      }).extend({
        court_uuid: z.string().optional(),
        time: openChallengerPayloadSchema.shape.time.refine(
          (v: string) => dayjs(v).isValid(),
          { message: "Invalid date/time" }
        ),
      })
    ),
  });
  const { control, formState, handleSubmit, setValue, watch, getValues } = methods;
  const [courtSearch, setCourtSearch] = useState<string>("");
  const [playerSearch, setPlayerSearch] = useState<string>("");
  const [pickOpponent, setPickOpponent] = useState<boolean>(false);

  // Temporarily store selected court UUID for field filtering
  const [selectedCourtUuid, setSelectedCourtUuid] = useState<string | undefined>();

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
      getValues("challengerB_uuid"),
      getValues("opponentA_uuid"),
      getValues("opponentB_uuid"),
    ];
    return (
      playersList?.data
        ?.filter((p) => !!p.uuid && p.uuid !== userUuid)
        ?.map((p) => ({
          label: (
            <div className="flex flex-row justify-between">
              <span className="font-medium capitalize">{p.name} <span className="text-gray-500 font-normal">{p.nickname}</span></span>
              <span>{p.level}</span>
            </div>
          ),
          disabled: selectedPlayers.includes(p.uuid),
          value: p.uuid as string,
        })) || []
    );
  }, [playersList?.data, getValues("challengerB_uuid"), getValues("opponentA_uuid"), getValues("opponentB_uuid")]);

  const { mutateAsync: openChallenger, isPending } = PlayerMatchApiHooks.useOpenChallenger();

  const onSubmit = async (data: OpenChallengerPayload) => {
    const payload: OpenChallengerPayload = {
      court_field_uuid: data.court_field_uuid,
      time: data.time,
      with_ad: false,
      challengerA_uuid: userUuid,
      challengerB_uuid: data.challengerB_uuid,
      opponentA_uuid: pickOpponent ? (data.opponentA_uuid || undefined) : undefined,
      opponentB_uuid: pickOpponent ? (data.opponentB_uuid || undefined) : undefined,
      point_config_uuid: undefined,
    };

    await openChallenger(payload).catch((error) => {
      toast.showNotification({
        text: "Failed to open challenger",
        variant: "danger",
        duration: 5000,
        icon: "XCircle",
      });
      console.error("Error opening challenger:", error);
    }).then(() => {
      toast.showNotification({
        text: "Your request has been sent",
        variant: "success",
        icon: "CheckCircle",
        duration: 5000,
      });
    });

    queryClient.invalidateQueries({
      queryKey: PublicMatchApiHooks.getKeyByAlias("getPublicChallengerList"),
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
      title="Ask for Challenger"
      footer={null}
      destroyOnClose
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full grid grid-cols-12 gap-4">
          <div className="col-span-12">
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
          <div className="col-span-12">
            <label className="block text-sm font-medium mb-1">Choose partner</label>
            <Controller
              name="challengerB_uuid"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  className="w-full"
                  value={field.value || undefined}
                  onChange={(value) => {
                    // Check if player is already selected elsewhere
                    const awayPlayer1 = watch("opponentA_uuid");
                    const awayPlayer2 = watch("opponentB_uuid");
                    if (value && (awayPlayer1 === value || awayPlayer2 === value)) {
                      field.onChange(field.value);
                      return;
                    }
                    field.onChange(value ? value : field.value);
                    setPlayerSearch("");
                  }}
                  showSearch
                  allowClear
                  loading={isPlayersLoading}
                  placeholder="Select partner"
                  filterOption={false}
                  onSearch={setPlayerSearch}
                  options={partnerOptions}
                />
              )}
            />
          </div>
          <div className="col-span-12 flex items-center justify-between">
            <div className="flex flex-row items-center justify-between flex-1">
              <div className="flex items-center gap-2">
                <div className="w-12 h-8">
                  <IconVS className="w-full h-full text-emerald-800" />
                </div>
                <span>Let me pick my own opponent</span>
              </div>
              <Switch checked={pickOpponent} onChange={setPickOpponent} />
            </div>
          </div>
        </div>
        {pickOpponent && (
          <div className="grid grid-cols-12 col-span-12 gap-2 mt-3 border rounded-lg p-2">
            <div className="col-span-12">
              <label className="block text-sm font-medium mb-1">Opponent Player 1</label>
              <Controller
                name="opponentA_uuid"
                key={watch("opponentA_uuid")}
                control={control}
                render={({ field }) => (
                  <Select

                    className="w-full"
                    value={field.value || undefined}
                    onChange={(value, row) => {
                      // Check if player is already selected elsewhere
                      const homePartner = getValues("challengerB_uuid");
                      const awayPlayer2 = getValues("opponentB_uuid");
                      if (value && (homePartner === value || awayPlayer2 === value)) {
                        field.onChange(field.value || "");
                        return;
                      }
                      field.onChange(value ? value : field.value);
                      setPlayerSearch("");
                    }}
                    showSearch
                    loading={isPlayersLoading}
                    placeholder="Choose Player (optional)"
                    filterOption={false}
                    onSearch={setPlayerSearch}
                    options={partnerOptions}
                  />
                )}
              />
            </div>
            <div className="col-span-12 mt-2">
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
                      const homePartner = getValues("challengerB_uuid");
                      const awayPlayer1 = getValues("opponentA_uuid");
                      if (value && (homePartner === value || awayPlayer1 === value)) {
                        field.onChange(field.value || "");
                        return;
                      }
                      field.onChange(value ? value : field.value);
                      setPlayerSearch("");
                    }}
                    showSearch
                    loading={isPlayersLoading}
                    placeholder="Choose Player (optional)"
                    filterOption={false}
                    onSearch={setPlayerSearch}
                    options={partnerOptions}
                  />
                )}
              />
            </div>
          </div>
        )}

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
          {/* <Button
            onClick={() => {
              console.log(
                openChallengerPayloadSchema.parse(getValues()))
            }}
          >
            tes
          </Button> */}
          <Button
            type="submit"
            variant="primary"
            className="bg-emerald-800"
            disabled={formState.isSubmitting || !formState.isValid}
          >
            {formState.isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
