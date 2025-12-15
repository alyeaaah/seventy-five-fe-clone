import Button from "@/components/Base/Button";
import { useState } from "react";
import { TournamentMatchesPayload, TournamentMatchPayload, tournamentMatchPayloadSchema, TournamentRounds } from "@/pages/Admin/Tournaments/api/schema";
import { TournamentsApiHooks } from "@/pages/Admin/Tournaments/api";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import {
  Divider
} from "antd";
import { useNavigate } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import Lucide from "@/components/Base/Lucide";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import 'react-quill/dist/quill.snow.css';
import TournamentSteps from "../Components/FriendlyMatchSteps";
import { CustomIRoundProps } from "@/components/Bracket/interfaces";
import { ModalMatch } from "./ModalMatch";
import { faker } from "@faker-js/faker";
import { CourtsApiHooks } from "@/pages/Admin/Courts/api";
import { DrawingTeams } from "@/components/DrawingTeams";
import { generateInitialMatches } from "@/components/DrawingTeams/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Match } from "@/components/DrawingTeams/interface";


interface Props {
  tournament?: string;
}

export const FriendlyMatchFormSchedule = (props: Props) => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.administrator.customMatch.friendlyMatch.edit.players);
  const { friendlyMatchUuid } = queryParams;
  const { showNotification } = useToast();
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const [selectedMatch, setSelectedMatch] = useState<Match | undefined>();
  const [modalFormMatch, setModalFormMatch] = useState(false);
  
  const { data } = TournamentsApiHooks.useGetTournamentsDetail({
    params: {
      uuid: friendlyMatchUuid || 0
    }
  }, {
    onSuccess: (data) => {
      if (data) {
      }
    },
    enabled: !!friendlyMatchUuid
  });
  const { data: courtOptions } = CourtsApiHooks.useGetCourtsDetail({
    params: {
      uuid: data?.data?.court_uuid || ""
    }
  }, {
    enabled: !!data && !!data.data.court_uuid
  })

  const { data: matches } = TournamentsApiHooks.useGetTournamentMatches({
    queries: {
      tournament_uuid: friendlyMatchUuid || ""
    }
  }, {
    enabled: !!courtOptions,
    onSuccess: (dataMatches) => {
      if (dataMatches && methods) {
        methods.reset({
          tournament_uuid: friendlyMatchUuid || "",
          matches: dataMatches.data || []
        });
      }
    }

  });
  const { data: teams } = TournamentsApiHooks.useGetTournamentTeams({
    params: {
      uuid: friendlyMatchUuid || 0
    },
  }, {
    enabled: !!friendlyMatchUuid && !!data?.data && !!courtOptions && !!matches,
    onSuccess: (dataTeams) => {
      if (dataTeams && methods && matches) {
        if (matches.data.length > 0) {
          // check if there is a team that is not in a match
          const teamsNotInMatch = dataTeams.data.filter(team => !matches.data.some(match => match.home_team_uuid === team.uuid || match.away_team_uuid === team.uuid));
          if (teamsNotInMatch.length > 0) {
            const newMatches = generateInitialMatches(
              teamsNotInMatch,
              friendlyMatchUuid,
              new Date(data?.data?.start_date || ""),
              new Date(data?.data?.end_date || ""),
              courtOptions?.data?.fields || []
            ) || [];

            methods.reset({
              tournament_uuid: friendlyMatchUuid || "",
              matches: [...matches.data, ...newMatches] as Match[]
            });
            showNotification({
              duration: 3000,
              text: "Some teams are not in a match",
              icon: "AlertCircle",
              variant: "warning",
            });
          } else {
            methods.reset({
              tournament_uuid: friendlyMatchUuid || "",
              matches: matches.data as Match[]
            });
          }
        } else {
          methods.reset({
            tournament_uuid: friendlyMatchUuid || "",
            matches: generateInitialMatches(
              dataTeams.data,
              friendlyMatchUuid,
              new Date(data?.data?.start_date || ""),
              new Date(data?.data?.end_date || ""),
              courtOptions?.data?.fields || []
            ) || []
          });
        }
      }
    },
  });

  const { mutate: actionCreateMatches } = TournamentsApiHooks.useCreateTournamentMatches(
    {},
    {
      retry: false,
      onSuccess: (result) => {
        showNotification({
          duration: 3000,
          text: "Tournament updated successfully",
          icon: "CheckSquare",
          variant: "success",
        });
        navigate(paths.administrator.customMatch.index);
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
  const { mutate: actionUpdateMatches } = TournamentsApiHooks.useUpdateTournamentMatches(
    {},
    {
      retry: false,
      onSuccess: (result) => {
        showNotification({
          duration: 3000,
          text: "Tournament updated successfully",
          icon: "CheckSquare",
          variant: "success",
        });
        navigate(paths.administrator.customMatch.index);
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
  const editInitialMatches = (): Match[] => {
    let result: Match[] = [];
    if (matches?.data && teams?.data) {
      if (matches.data.length > 0) {
        const teamsNotInMatch = teams.data.filter(team => !matches.data.some(match => match.home_team_uuid === team.uuid || match.away_team_uuid === team.uuid));
        if (teamsNotInMatch.length > 0) {
          const newMatches = generateInitialMatches(
            teamsNotInMatch,
            friendlyMatchUuid,
            new Date(data?.data?.start_date || ""),
            new Date(data?.data?.end_date || ""),
            courtOptions?.data?.fields || []
          ) || [];
          result = [...matches.data, ...newMatches] as Match[];
        } else {
          result = matches.data as Match[];
        }
      } else {
        result = generateInitialMatches(
          teams.data,
          friendlyMatchUuid,
          new Date(data?.data?.start_date || ""),
          new Date(data?.data?.end_date || ""),
          courtOptions?.data?.fields || []
        ) || [];
      }
    }
    return result;
  }

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      tournament_uuid: friendlyMatchUuid || "",
      matches: editInitialMatches() || []
    },
    resolver: zodResolver(tournamentMatchPayloadSchema),
  });
  const { control, formState, handleSubmit, setValue, watch, getValues } = methods;

  const onSubmit: SubmitHandler<any> = (data: TournamentMatchesPayload) => {
    if (matches?.data) {
      actionUpdateMatches({
        matches: data.matches,
        tournament_uuid: friendlyMatchUuid,
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsList"),
          });
          queryClient.invalidateQueries({
            queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentMatches"),
          });
          queryClient.invalidateQueries({
            queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsDetail"),
          });
        },
      });
    } else {
      actionCreateMatches({
        matches: data.matches,
        tournament_uuid: friendlyMatchUuid,
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsList"),
          });
          queryClient.invalidateQueries({
            queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentMatches"),
          });
          queryClient.invalidateQueries({
            queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsDetail"),
          });
        },
      });
    }
  }

  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">{friendlyMatchUuid ? "Edit" : "Add New"} Tournament</h2>
      </div>
      <Divider />
      <TournamentSteps step={4} />

      <FormProvider {...methods} key={location.pathname + "_form"}>
        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          <div className="grid grid-cols-12 gap-4 ">
            <div className="col-span-12 sm:col-span-9 box h-fit p-4 grid grid-cols-12 ">
              <div className="col-span-12">
                <h2 className=" font-medium">Brackets</h2>
                <Divider className="mb-0 " />
              </div>
              <div className="col-span-12">
                <DrawingTeams
                  key={watch("matches").length}
                  data={watch("matches") as Match[]}
                  onMatchClicked={(data) => { 
                    setSelectedMatch(data);
                    setModalFormMatch(true);
                  }}
                  draggable={true}
                  onTeamsChanged={(data) => {
                    setValue("matches", data);
                  }}
                />
              </div>
              <Divider className="mb-2 mt-2 col-span-12" />
              <div className="col-span-12">
                {/* {roundValidation.message} */}
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
                : {Math.ceil((teams?.data?.length || 0) / 2)}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 col-span-12 mt-6">
            <div className="col-span-12 box p-4 flex justify-between" >
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => {
                  navigate(-1);
                }}
                className="w-[46%] sm:w-auto sm:mr-2"
              >
                Cancel
              </Button>
              <div className="flex">
                <Button
                  variant="primary"
                  type="submit"
                  className="w-[46%] sm:w-auto"
                  disabled={!formState.isValid}
                >
                  <Lucide icon="Save" className="w-4 h-4 mr-2" />
                  Save 
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
      <ModalMatch
        key={selectedMatch?.id || ""}
        isModalOpen={modalFormMatch}
        selectedMatch={selectedMatch}
        court={data?.data?.court_uuid || "-"}
        courtOptions={courtOptions?.data}
        onDismiss={() => {
          setModalFormMatch(false)
          setTimeout(() => {
            setSelectedMatch(undefined);
          }, 300);
        }}
        onSave={(match) => {
          const matches = getValues("matches");
          const matchIndex = matches.findIndex(m => m.home_team_uuid == match.home_team_uuid && m.away_team_uuid == match.away_team_uuid);
          setValue(`matches.${matchIndex}`, match as Match);
          setModalFormMatch(false)
          setTimeout(() => {
            setSelectedMatch(undefined);
          }, 300);
        }}
      />
    </>
  )
}
