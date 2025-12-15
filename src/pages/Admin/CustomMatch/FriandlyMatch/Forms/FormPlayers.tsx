import Button from "@/components/Base/Button";
import { FormHelp, FormSelect } from "@/components/Base/Form";
import { useState } from "react";
import { Controller, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TournamentParticipants, tournamentParticipantsSchema, TournamentRounds } from "@/pages/Admin/Tournaments/api/schema";
import { TournamentsApiHooks } from "@/pages/Admin/Tournaments/api";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import {
  Divider, AutoComplete
} from "antd";
import styles from "../../index.module.scss";
import { useNavigate } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import Lucide from "@/components/Base/Lucide";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { CustomTable } from "@/components/Table";
import Image from "@/components/Image";
import { faker } from '@faker-js/faker';
import 'react-quill/dist/quill.snow.css';
import TournamentSteps from "../Components/FriendlyMatchSteps";
import { PlayersApiHooks } from "@/pages/Admin/Players/api";
import { LevelsApiHooks } from "@/pages/Admin/MasterData/Levels/api";
import { imageResizer } from "@/utils/helper";


interface Props {
  tournament?: string;
}

export const FriendlyMatchFormPlayers = (props: Props) => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.administrator.customMatch.friendlyMatch.edit.players);
  const { friendlyMatchUuid } = queryParams;
  const { showNotification } = useToast();
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const [playerKeyword, setPlayerKeyword] = useState<string>("");
  const [playerLevel, setPlayerLevel] = useState<string>("");
  const [roundInfo, setRoundInfo] = useState<TournamentRounds>({ byes: 0, rounds: 0, teams: 0, nextPowerOf2: 0 });

  const initTeamNames = (players: TournamentParticipants['players']) => {
    const teams = players.map((player) => ({
      team_uuid: player.team_uuid || "",
      team_name: player.team_name || "",
      team_alias: player.team_alias || ""
    }))
    // remove duplicates
    const uniqueTeams = [...new Map(
      teams.map(team => [`${team.team_name}|${team.team_alias}`, team])
    ).values()];

    return uniqueTeams
  };

  const { data: levelData } = LevelsApiHooks.useGetLevelsList();
  const { data: tournamentData } = TournamentsApiHooks.useGetTournamentsDetail({
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
  const { data } = TournamentsApiHooks.useGetTournamentParticipants({
    params: {
      uuid: friendlyMatchUuid || 0
    },
  }, {
    onSuccess: (data) => {
      if (data) {
        setValue("players", data.data.players.map((player) => ({
          uuid: player.uuid,
          player_uuid: player.player_uuid,
          player_name: player.player_name,
          media_url: player.media_url,
          team_uuid: player.team_uuid,
          team_name: player.team_name,
          team_alias: player.team_alias,
          isDeleted: false
        })));
        
        setTeamNames(initTeamNames(data.data.players));
        calculateTournamentRounds(data?.data?.players?.length)
      }
    },
    enabled: !!friendlyMatchUuid
  });
  const [teamNames, setTeamNames] = useState<{ team_uuid: string, team_name: string, team_alias: string }[]>(data?.data?.players ? initTeamNames(data?.data?.players) : []);

  const { mutate: actionUpdateTournamentParticipants } = TournamentsApiHooks.useUpdateTournamentParticipants(
    {
      params: {
        uuid: friendlyMatchUuid || 0
      }
    },
    {
      retry: false
    }
  );
  
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      uuid: friendlyMatchUuid || "",
      players: data?.data?.players?.map((player) => ({
        uuid: player.uuid,
        player_uuid: player.player_uuid || undefined,
        player_name: player.player_name || undefined,
        media_url: player.media_url || undefined,
        team_uuid: player.team_uuid || undefined,
        team_name: player.team_name || undefined,
        team_alias: player.team_alias || undefined,
        isDeleted: player.isDeleted || false
      })) || [],
    },
    resolver: zodResolver(tournamentParticipantsSchema),
  });
  const { control, formState, handleSubmit, setValue, watch, getValues } = methods;

  const { data: playerData } = PlayersApiHooks.useGetPlayersList(
    {
      queries: {
        search: playerKeyword,
        level: tournamentData?.data.strict_level ? tournamentData?.data.level_uuid : (playerLevel || undefined),
        limit: 10,
        page: 1
      }
    }, {
    // enabled: !!playerKeyword
  }
  );

  const onSubmit: SubmitHandler<any> = (values: TournamentParticipants) => {
    values.players = values.players.map((player, idx) => ({
      uuid: player.uuid || "",
      player_uuid: player.player_uuid,
      player_name: player.player_name,
      media_url: player.media_url,
      team_uuid: teamNames[Math.floor(idx / 2)].team_uuid,
      team_name: teamNames[Math.floor(idx / 2)].team_name,
      team_alias: teamNames[Math.floor(idx / 2)].team_alias,
    }));
    
    const existingPlayers = data?.data?.players || [];
    const removedPlayers = existingPlayers.filter(player => !values.players.find(p => p.player_uuid === player.player_uuid)).map(player => ({
      ...player,
      isDeleted: true
    }));
    values.players = [...values.players, ...removedPlayers];
    actionUpdateTournamentParticipants(values, {
      onSuccess: () => {
        methods.reset();
        queryClient.invalidateQueries({
          queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentParticipants"),
        });
        queryClient.invalidateQueries({
          queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsDetail"),
        });
        showNotification({
          duration: 3000,
          text: "Tournament participants updated successfully",
          icon: "CheckSquare2",
          variant: "success",
        });
        navigate(paths.administrator.customMatch.friendlyMatch.edit.points({  friendlyMatchUuid }).$);
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
        <h2 className="mr-auto text-lg font-medium">{friendlyMatchUuid ? "Edit" : "Add New"} Friendly Match</h2>
      </div>
      <Divider />
      <TournamentSteps step={2} />
      <FormProvider {...methods} key={location.pathname + "_form"}>
        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          <div className="grid grid-cols-12 gap-4 ">
            <div className="sm:col-span-3 hidden sm:flex"></div>
            <div className="col-span-12 sm:col-span-6 box h-fit p-4 grid grid-cols-12 ">
              <div className="col-span-12">
                <h2 className=" font-medium">Participants</h2>
                <Divider className="mb-0 " />
              </div>
              <div className="col-span-12">
                <CustomTable
                  columns={
                    [
                      {
                        title: "Player",
                        key: "name",
                        dataIndex: "name",
                        className: "rounded-l-xl pl-4",
                        render: (text, record) => (
                          <div className="flex items-center flex-row pl-2">
                            <Image src={imageResizer(record.media_url || "", 50)} alt={record.player_name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2" />
                            <span className="flex flex-col">
                              <span className="mb-0">
                                {record.player_name}
                              </span>
                            </span>
                          </div>
                        )
                      },
                      {
                        title: (
                          <div className="flex items-center flex-row">
                            Team
                            <Button
                              size="sm"
                              className="ml-2"
                              type="button"
                              onClick={() => {
                                setTeamNames(teamNames.map((team) => {
                                  return {
                                    ...team,
                                    team_alias: faker.word.noun({ length: { min: 4, max: 12 } })
                                  }
                                }))
                              }}
                            >
                              <Lucide icon="RefreshCcw" className="w-4 h-4" />
                            </Button>
                          </div>
                        ),
                        key: "team_name",
                        dataIndex: "team_name",

                        render: (_text, record, index) => (
                          <div className="flex items-center">
                            <span className="ml-2 capitalize">
                              {teamNames[Math.floor(index / 2)]?.team_name}
                              {" "}{teamNames[Math.floor(index / 2)]?.team_alias}
                              {/* {record.team_name}
                              {" "}{record.team_alias} */}
                            </span>
                          </div>
                        ),
                      },
                      {
                        title: "",
                        key: "action",
                        dataIndex: "player_uuid",
                        className: "rounded-r-xl",
                        render: (text) => (
                          <Button
                            className="flex items-center"
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setValue('players', getValues('players').filter((item) => item.player_uuid !== text));
                            }}
                          >
                            <Lucide icon="Trash" className="w-4 h-4" />
                          </Button>
                        ),
                      },
                    ]
                  }
                  onRowReorder={(newData) => {
                    setValue('players', newData);
                  }}
                  locale={{
                    emptyText: <>No players found<br /> Search and Add new players below.</>,
                  }}
                  dataSource={watch('players') || []}
                  pagination={false}
                  rowClassName={`${styles.customTableRow} ${styles.teamsTableRow}`}
                  className={styles.customTableStyle}
                />
              </div>
              <div className="col-span-12 sm:col-span-8 mb-2 mt-2 flex flex-row items-center">
                <Controller
                  name="players"
                  key="players"
                  control={control}
                  render={({ fieldState }) =>
                    <>
                      <AutoComplete
                        className="shadow-sm w-full h-[38px]"
                        suffixIcon={<Lucide icon="Search" />}
                        value={playerKeyword}
                        options={playerData?.data?.map(player => {
                          const playerAdded = watch('players').filter(p => player.uuid === p.player_uuid).length > 0;
                          return {
                            value: player.uuid,
                            label: (
                              <div className={`flex flex-row justify-between ${playerAdded ? 'opacity-60' : ''}`}>
                                <div className="flex items-center flex-row">
                                  <Image src={imageResizer(player.media_url || "", 50)} alt={player.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2" />
                                  <span className="flex flex-col">
                                    <span className="mb-0">
                                      {player.name}
                                      <span className="text-gray-400 text-[12px] font-medium italic"> {player.nickname}</span>
                                    </span>
                                    <span className="text-gray-400 text-[11px] mt-0 sm:flex hidden">{player.city} | {player.level} </span>
                                  </span>
                                </div>
                                <div className=" hidden sm:flex items-center flex-row">
                                  {playerAdded ? (
                                    <div className="text-[10px] text-gray-500">Already Added</div>
                                  ) : (
                                    <Lucide icon="Plus" className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            ),
                            name: player.name,
                            media_url: player.media_url,
                          };
                        })}
                        onSelect={(value, option) => {
                          const currentPlayers = getValues("players");
                          if (currentPlayers.length > 0 && currentPlayers.map(player => player.player_uuid).includes(value)) {
                            return;
                          } else {
                            calculateTournamentRounds(currentPlayers.length + 1);
                            if (currentPlayers.length % 2 === 0) { 
                              // new team
                              // check teams length
                              if (teamNames.length <= currentPlayers.length / 2) {
                                const newTeamName = {
                                  team_uuid: "",
                                  team_name: `Team ${teamNames.length + 1}`,
                                  team_alias: faker.word.noun({
                                    length: { min: 4, max: 12 }
                                  })
                                }
                                setTeamNames([
                                  ...teamNames,
                                  newTeamName
                                ]);
                                setValue(
                                  "players",
                                  [
                                    ...currentPlayers,
                                    {
                                      uuid: "",
                                      player_uuid: value,
                                      player_name: option.name,
                                      media_url: option.media_url || "",
                                      team_uuid: newTeamName.team_uuid,
                                      team_name: newTeamName.team_name,
                                      team_alias: newTeamName.team_alias,
                                      isDeleted: false
                                    }
                                  ]
                                );
                              } else {
                                // use existing teamnames
                                const newTeamName = teamNames[Math.floor(currentPlayers.length / 2)];
                                setValue(
                                  "players",
                                  [
                                    ...currentPlayers,
                                    {
                                      uuid: "",
                                      player_uuid: value,
                                      player_name: option.name,
                                      media_url: option.media_url || "",
                                      team_uuid: newTeamName.team_uuid,
                                      team_name: newTeamName.team_name,
                                      team_alias: newTeamName.team_alias,
                                      isDeleted: false
                                    }
                                  ]
                                );
                              }
                            } else {
                              // use prev team
                              const newTeamName = teamNames[Math.floor(currentPlayers.length / 2)];
                              setValue(
                                "players",
                                [
                                  ...currentPlayers,
                                  {
                                    uuid: "",
                                    player_uuid: value,
                                    player_name: option.name,
                                    media_url: option.media_url || "",
                                    team_uuid: newTeamName.team_uuid,
                                    team_name: newTeamName.team_name,
                                    team_alias: newTeamName.team_alias,
                                    isDeleted: false
                                  }
                                ]
                              );
                            }
                            const teamIndex = Math.ceil(currentPlayers.length / 2);
                            if (teamIndex < teamNames.length) {
                            }
                            setPlayerKeyword("");
                          }
                        }}
                        onSearch={(text) => {
                          setPlayerKeyword(text);
                        }}
                        onChange={() => {
                          setPlayerKeyword("");
                        }}
                        placeholder="Search for player to add"
                      />
                      {!!fieldState.error && (
                        <FormHelp className={"text-danger"}>
                          {fieldState.error.message || "Form is not valid"}
                        </FormHelp>
                      )}
                    </>
                  }
                />
              </div>
              <div className="col-span-12 sm:col-span-4 mb-2 mt-2 flex flex-row items-center pl-4">
                <FormSelect
                  name="level_uuid"
                  disabled={tournamentData?.data?.strict_level}
                  onChange={(e) => {
                    setPlayerLevel(e.target.value);
                  }}
                  value={tournamentData?.data.strict_level ? tournamentData?.data.level_uuid : playerLevel}
                >
                  <option key={"chooseLevel"} value="">Filter by Level</option>
                  {levelData?.data?.map((item) => (
                    <option key={item.uuid} value={item.uuid}>
                      {item.name}
                    </option>
                  ))}
                </FormSelect>
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
                : {Math.ceil((watch("players").length || 0) / 4)}
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
                }}
                className="w-[46%] sm:w-auto sm:mr-2"
              >
                Cancel
              </Button>
              <div className="flex">
                {friendlyMatchUuid && !!data?.data?.players?.length && <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => {
                    navigate(paths.administrator.customMatch.friendlyMatch.edit.points({ friendlyMatchUuid }).$);
                    queryClient.invalidateQueries({
                      queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentParticipants"),
                    });
                    queryClient.invalidateQueries({
                      queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsDetail"),
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
                  disabled={formState.isSubmitting || !formState.isValid || ((watch("players").length || 0) % 4 != 0)}
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
