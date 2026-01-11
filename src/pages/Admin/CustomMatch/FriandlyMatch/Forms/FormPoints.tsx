import Button from "@/components/Base/Button";
import { FormHelp, FormInput, FormLabel, FormSelect } from "@/components/Base/Form";
import { useState } from "react";
import { Controller, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TournamentRounds, TournamentsPayload, tournamentsSchema } from "@/pages/Admin/Tournaments/api/schema";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import {
  Divider
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import Lucide from "@/components/Base/Lucide";
import Alert from "@/components/Base/Alert";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import 'react-quill/dist/quill.snow.css';
import TournamentSteps from "../Components/FriendlyMatchSteps";
import { PointConfigurationsApiHooks } from "@/pages/Admin/PointConfig/api";
import { TournamentsApiHooks } from "@/pages/Admin/Tournaments/api";
// import { IconBracket, IconPoint } from "@/assets/images/icons";


interface Props {
  tournament?: string;
}

export const FriendlyMatchFormPoints = (props: Props) => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.administrator.customMatch.friendlyMatch.edit.players);
  const { friendlyMatchUuid } = queryParams;
  const { showNotification } = useToast();
  const [selectedPointConfig, setSelectedPointConfig] = useState("");
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const location = useLocation();
  const [roundInfo, setRoundInfo] = useState<TournamentRounds>({ byes: 0, rounds: 0, teams: 0, nextPowerOf2: 0 });
  const { data } = TournamentsApiHooks.useGetTournamentsDetail({
    params: {
      uuid: friendlyMatchUuid || 0
    }
  }, {
    onSuccess: (data) => {
      if (data) {
        methods.reset({
          uuid: data.data.uuid || "",
          name: data.data.name,
          description: data.data.description,
          start_date: data.data.start_date,
          end_date: data.data.end_date,
          media_url: data.data.media_url,
          strict_level: data.data.strict_level,
          level: data.data.level || "",
          level_uuid: data.data.level_uuid,
          court_uuid: data.data.court_uuid,
          rules: data?.data?.rules?.map(rule => ({
            uuid: rule.uuid || "",
            description: rule.description,
          })) || [{
            uuid: "",
            description: "",
          }],
          // points: data.data.points,
        });
      }
    },
    enabled: !!friendlyMatchUuid
  });

  const { data: detailPointConfig } = PointConfigurationsApiHooks.useGetPointConfigurationsDetail(
    {
      params: {
        uuid: selectedPointConfig || data?.data?.point_config_uuid || 0
      }
    }, {
    enabled: (!!friendlyMatchUuid && !!data?.data?.point_config_uuid) || !!selectedPointConfig
  }
  );


  const { data: pointConfigOptions } = PointConfigurationsApiHooks.useGetPointConfigurationsList(
    {
      queries: {
        round: roundInfo.rounds
      }
    }, {
    enabled: !!friendlyMatchUuid && roundInfo.rounds > 0
  }
  );

  const { data: participants } = TournamentsApiHooks.useGetTournamentParticipants({
    params: {
      uuid: friendlyMatchUuid || 0
    },
  }, {
    onSuccess: (data) => {
      if (data) {
        calculateTournamentRounds(data?.data?.players?.length)
      }
    },
    enabled: !!friendlyMatchUuid
  });

  const { mutate: actionUpdateFriendlyMatch } = TournamentsApiHooks.useUpdateTournament(
    {
      params: {
        uuid: friendlyMatchUuid || 0
      }
    },
    {
      onSuccess: (result) => {
        showNotification({
          duration: 3000,
          text: "Tournament updated successfully",
          icon: "CheckSquare",
          variant: "success",
        });
        navigate(paths.administrator.customMatch.friendlyMatch.edit.schedule({ friendlyMatchUuid }).$);
      },
      onError: (e: any) => {
        showNotification({
          duration: 3000,
          text: e?.message || "Failed to update tournament",
          icon: "WashingMachine",
          variant: "danger",
        });
      },
    }
  );

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      uuid: friendlyMatchUuid || "",
      name: data?.data?.name || "",
      description: data?.data?.description || "",
      start_date: data?.data?.start_date || new Date(),
      end_date: data?.data?.end_date || new Date(),
      media_url: data?.data?.media_url || undefined,
      strict_level: data?.data?.strict_level || false,
      level: data?.data?.level || undefined,
      level_uuid: data?.data?.level_uuid || "",
      court_uuid: data?.data?.court_uuid || "",
      point_config_uuid: data?.data?.point_config_uuid || "",
      rules: data?.data?.rules?.map((rule) => ({
        uuid: rule.uuid || undefined,
        description: rule.description || "",
      })) || [],
    },
    resolver: zodResolver(tournamentsSchema),
  });
  const { control, formState, handleSubmit, setValue, watch, getValues } = methods;


  const onSubmit: SubmitHandler<any> = (values: TournamentsPayload) => {
    if (friendlyMatchUuid) {
      // const existingFields = data?.data?.fields || [];
      // const removedFields = existingFields.filter(field => !values.fields.find(f => f.uuid === field.uuid)).map(field => ({
      //   ...field,
      //   is_delete: 1
      // }));
      // values.fields = [...values.fields, ...removedFields];
      actionUpdateFriendlyMatch(values, {
        onSuccess: () => {
          methods.reset();
          queryClient.invalidateQueries({
            queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsList"),
          });
          queryClient.invalidateQueries({
            queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsDetail"),
          });
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to update tournament",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    }
  }

  const calculateTournamentRounds = (totalPlayers: number): TournamentRounds => {
    const teams = Math.ceil(totalPlayers / 2);
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(teams)));
    const byes = nextPowerOf2 - teams;
    const rounds = Math.log2(nextPowerOf2);
    setRoundInfo({
      teams,
      byes,
      rounds,
      nextPowerOf2
    });
    return {
      teams,
      byes,
      rounds,
      nextPowerOf2,
    };
  }

  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">{friendlyMatchUuid ? "Edit" : "Add New"} Tournament</h2>
      </div>
      <Divider />
      <TournamentSteps step={3} />
      <FormProvider {...methods} key={location.pathname + "_form"}>
        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          <div className="grid grid-cols-12 gap-4 ">
            <div className="sm:col-span-3 hidden sm:flex"></div>
            <div className="col-span-12 sm:col-span-6 box h-fit p-4 grid grid-cols-12 ">
              <div className="col-span-12">
                <h2 className=" font-medium">Point Configuration</h2>
                <Divider className="mb-0 " />
              </div>
              <div className="col-span-12">
                <Alert variant="secondary" className="mt-2">
                  <div className="flex items-center">
                    <div className="text-lg font-medium">
                      Choose Point Configuration
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-2 mt-2">
                    <div className="col-span-12 sm:col-span-12 flex items-center justify-start">
                      <Controller
                        name="point_config_uuid"
                        control={control}
                        render={({ field, fieldState }) =>
                          <>
                            <FormSelect
                              id="modal-form-2"
                              name="point_config_uuid"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                setSelectedPointConfig(e.target.value);
                              }}
                              value={field.value}
                            >
                              <option key={"choosePointConfig"} value="">Choose Point Configuration</option>
                              {pointConfigOptions?.data?.map((item) => (
                                <option key={item.uuid} value={item.uuid}>
                                  {item.totalRound} Rounds | {item.name}
                                </option>
                              ))}
                            </FormSelect>
                            {!!fieldState.error && (
                              <FormHelp className={"text-danger"}>
                                {fieldState.error.message || "Form is not valid"}
                              </FormHelp>
                            )}
                          </>
                        }
                      />
                    </div>
                    <div className="col-span-0 sm:col-span-2 flex items-center justify-start"></div>
                    <div className="col-span-12 sm:col-span-12">
                      Choose point configuration before setting up the brackets
                    </div>
                  </div>
                </Alert>
              </div>
              <Divider className="mb-2 mt-2 col-span-12" />
              <div className="col-span-12 grid grid-cols-12 gap-2">
                {
                  detailPointConfig?.data?.points?.map((round, index) => index == 0 ? (
                    <div className="col-span-12 grid grid-cols-12 gap-2" key={index}>
                      <div className="col-span-6 ">
                        <FormLabel htmlFor="modal-form-1">Win</FormLabel>
                        <FormInput
                          type="number"
                          placeholder={`Enter point for round ${round.round}`}
                          readOnly
                          value={round.win_point}
                        />
                      </div>
                      <div className="col-span-6">
                        <FormLabel htmlFor="modal-form-1">Lose</FormLabel>
                        <FormInput
                          type="number"
                          placeholder={`Enter point for round ${round.round}`}
                          readOnly
                          value={round.lose_point}
                        />
                      </div>
                    </div>
                  ) : "")
                }
              </div>
            </div>
            <div className="col-span-12 sm:col-span-3 box h-fit p-4 grid grid-cols-12  gap-2">
              <div className="col-span-12">
                <h2 className=" font-medium">Information</h2>
                <Divider className="mb-0 mt-1" />
              </div>
              <div className="col-span-4">
                Total Match
              </div>
              <div className="col-span-8">
                : {Math.ceil((participants?.data?.players?.length || 0) / 4)}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 col-span-12 mt-6">
            <div className="col-span-12 box p-4 flex justify-between" >
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => {
                  methods.reset();
                  navigate(-1);
                  // methods.trigger().then((isValid) => {
                  //   console.log(isValid);
                  // })
                }}
                className="w-[46%] sm:w-auto sm:mr-2"
              >
                Cancel
              </Button>
              <div className="flex">
                {friendlyMatchUuid && !!data?.data?.point_config_uuid && <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => {
                    navigate(paths.administrator.customMatch.friendlyMatch.edit.schedule({ friendlyMatchUuid }).$);
                    queryClient.invalidateQueries({
                      queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentParticipants"),
                    });
                    queryClient.invalidateQueries({
                      queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsDetail"),
                    });
                    queryClient.invalidateQueries({
                      queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentTeams"),
                    });
                  }}
                  className="w-[46%] sm:w-auto sm:mr-2"
                >
                  Next Step
                </Button>}
                <Button
                  variant="primary"
                  type="submit"
                  className="w-[46%] sm:w-auto"
                  disabled={formState.isSubmitting || !formState.isValid || !watch('point_config_uuid')}
                >
                  <Lucide icon="Save" className="w-4 h-4 mr-2" />
                  Save & Continue
                </Button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
      <Confirmation
        open={!!modalAlert?.open}
        onClose={() => setModalAlert(undefined)}
        icon={modalAlert?.icon || "Info"}
        title={modalAlert?.title || ""}
        description={modalAlert?.description || ""}
        refId={modalAlert?.refId}
        buttons={modalAlert?.buttons}
      />
    </>
  )
}
