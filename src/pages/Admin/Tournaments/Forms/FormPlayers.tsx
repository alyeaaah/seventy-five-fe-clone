import Button from "@/components/Base/Button";
import { FormHelp, FormSelect } from "@/components/Base/Form";
import { useState } from "react";
import { Controller, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TournamentParticipants, tournamentParticipantsSchema, TournamentRounds } from "../api/schema";
import { TournamentDrawingUtils } from "@/components/TournamentDrawing";
import { TournamentsApiHooks } from "../api";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import {
  Divider, AutoComplete
} from "antd";
import { Dialog } from "@/components/Base/Headless";
import styles from "../index.module.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import Lucide from "@/components/Base/Lucide";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { LevelsApiHooks } from "../../MasterData/Levels/api";
import { PlayersApiHooks } from "../../Players/api";
import { CustomTable } from "@/components/Table";
import Image from "@/components/Image";
import { faker } from '@faker-js/faker';
import 'react-quill/dist/quill.snow.css';
import TournamentSteps from "../Components/TournamentSteps";


interface Props {
  tournament?: string;
}

export const TournamentFormPlayers = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = useRouteParams(paths.administrator.tournaments.new.players);
  const { id: tournamentUuid } = queryParams;
  const { showNotification } = useToast();
  const [teamNames, setTeamNames] = useState<{ team_uuid: string, team_name: string, team_alias: string }[]>([]);
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const [playerKeyword, setPlayerKeyword] = useState<string>("");
  const [playerLevel, setPlayerLevel] = useState<string>("");
  const [roundInfo, setRoundInfo] = useState<TournamentRounds>({ byes: 0, rounds: 0, teams: 0, nextPowerOf2: 0 });
  const [availablePlayersPage, setAvailablePlayersPage] = useState<number>(1);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const { data: levelData } = LevelsApiHooks.useGetLevelsList();
  const { data: tournamentData } = TournamentsApiHooks.useGetTournamentsDetail({
    params: {
      uuid: tournamentUuid || 0
    }
  }, {
    enabled: !!tournamentUuid
  });
  const { data } = TournamentsApiHooks.useGetTournamentParticipants({
    params: {
      uuid: tournamentUuid || 0
    },
  }, {
    onSuccess: (data) => {
      if (data) {
        setValue("players", data.data.players.map((player) => ({
          uuid: player.uuid,
          player_uuid: player.player_uuid,
          player_name: player.player_name ?? undefined,
          media_url: player.media_url ?? undefined,
          team_uuid: player.team_uuid ?? undefined,
          team_name: player.team_name ?? undefined,
          team_alias: player.team_alias ?? undefined,
          isDeleted: false
        })));
        // get team names from data.data.players, and group by team.name
        const teams = data.data.players.map((player) => ({
          team_uuid: player.team_uuid || "",
          team_name: player.team_name || "",
          team_alias: player.team_alias || ""
        }))
        // remove duplicates
        const uniqueTeams = [...new Map(
          teams.map(team => [`${team.team_name}|${team.team_alias}`, team])
        ).values()];

        setTeamNames(uniqueTeams);
        const rounds = TournamentDrawingUtils.calculateTournamentRounds(data?.data?.players?.length || 0);
        setRoundInfo(rounds);
      }
    },
    refetchOnMount: "always",
    enabled: !!tournamentUuid
  });
  const { mutate: actionUpdateTournamentParticipants } = TournamentsApiHooks.useUpdateTournamentParticipants(
    {
      params: {
        uuid: tournamentUuid || 0
      }
    },
    {
      retry: false
    }
  );
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      uuid: tournamentUuid || "",
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

  // Available players list for left sidebar
  const { data: availablePlayersData } = PlayersApiHooks.useGetPlayersList(
    {
      queries: {
        level: tournamentData?.data.strict_level ? tournamentData?.data.level_uuid : (playerLevel || undefined),
        limit: 20,
        page: availablePlayersPage
      }
    }
  );

  // Handler untuk menambahkan player dari sidebar
  const handleAddPlayer = (player: { uuid?: string | null; name?: string | null; media_url?: string | null }, currentPlayersOverride?: any[], currentTeamNamesOverride?: any[]) => {
    if (!player.uuid) return { players: currentPlayersOverride || getValues("players"), teamNames: currentTeamNamesOverride || teamNames };
    const currentPlayers = currentPlayersOverride || getValues("players");
    const currentTeamNames = currentTeamNamesOverride || teamNames;

    if (currentPlayers.some(p => p.player_uuid === player.uuid)) {
      return { players: currentPlayers, teamNames: currentTeamNames };
    }

    const rounds = TournamentDrawingUtils.calculateTournamentRounds(currentPlayers.length + 1);
    if (!currentPlayersOverride) {
      setRoundInfo(rounds);
    }

    let updatedPlayers: any[];
    let updatedTeamNames = [...currentTeamNames];

    if (currentPlayers.length % 2 === 0) {
      // new team
      if (currentTeamNames.length <= currentPlayers.length / 2) {
        const newTeamName = {
          team_uuid: "",
          team_name: `Team ${currentTeamNames.length + 1}`,
          team_alias: faker.word.noun({
            length: { min: 4, max: 12 }
          })
        };
        updatedTeamNames.push(newTeamName);
        updatedPlayers = [
          ...currentPlayers,
          {
            uuid: "",
            player_uuid: player.uuid,
            player_name: player.name || undefined,
            media_url: player.media_url || "",
            team_uuid: newTeamName.team_uuid,
            team_name: newTeamName.team_name,
            team_alias: newTeamName.team_alias,
            isDeleted: false
          }
        ];
      } else {
        const newTeamName = currentTeamNames[Math.floor(currentPlayers.length / 2)];
        updatedPlayers = [
          ...currentPlayers,
          {
            uuid: "",
            player_uuid: player.uuid,
            player_name: player.name || undefined,
            media_url: player.media_url || "",
            team_uuid: newTeamName.team_uuid,
            team_name: newTeamName.team_name,
            team_alias: newTeamName.team_alias,
            isDeleted: false
          }
        ];
      }
    } else {
      const newTeamName = currentTeamNames[Math.floor(currentPlayers.length / 2)];
      updatedPlayers = [
        ...currentPlayers,
        {
          uuid: "",
          player_uuid: player.uuid,
          player_name: player.name || undefined,
          media_url: player.media_url || "",
          team_uuid: newTeamName.team_uuid,
          team_name: newTeamName.team_name,
          team_alias: newTeamName.team_alias,
          isDeleted: false
        }
      ];
    }

    // Update state only if not using override (single player add)
    if (!currentPlayersOverride) {
      if (updatedTeamNames.length > teamNames.length) {
        setTeamNames(updatedTeamNames);
      }
      setValue("players", updatedPlayers);
    }

    return { players: updatedPlayers, teamNames: updatedTeamNames };
  };

  // Handler untuk menambahkan semua available players
  const handleAddAllPlayers = () => {
    const currentPlayers = getValues("players");
    const availablePlayers = availablePlayersData?.data || [];
    const playersToAdd = availablePlayers.filter(
      player => player.uuid && !currentPlayers.some(p => p.player_uuid === player.uuid)
    );

    if (playersToAdd.length === 0) {
      showNotification({
        duration: 3000,
        text: "All available participants have been added",
        icon: "Info",
        variant: "info",
      });
      return;
    }
    console.log(playersToAdd);

    // Build players array synchronously by passing current state to each call
    let updatedPlayers = [...currentPlayers];
    let updatedTeamNames = [...teamNames];

    for (const player of playersToAdd) {
      // Use handleAddPlayer with current state override to work synchronously
      const result = handleAddPlayer(player, updatedPlayers, updatedTeamNames);
      if (result && result.players.length > updatedPlayers.length) {
        updatedPlayers = result.players;
        updatedTeamNames = result.teamNames;
      }
    }

    // Update state once after all players are processed
    if (updatedTeamNames.length > teamNames.length) {
      setTeamNames(updatedTeamNames);
    }
    const finalRounds = TournamentDrawingUtils.calculateTournamentRounds(updatedPlayers.length);
    setRoundInfo(finalRounds);
    setValue("players", updatedPlayers);

    showNotification({
      duration: 3000,
      text: `${playersToAdd.length} participant(s) added successfully`,
      icon: "CheckSquare2",
      variant: "success",
    });
  };

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
    const removedPlayers = existingPlayers.filter(player => !values.players.some(p => p.player_uuid === player.player_uuid)).map(player => ({
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
        navigate(paths.administrator.tournaments.new.points({ id: tournamentUuid }).$);
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
  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">{tournamentUuid ? "Edit" : "Add New"} Tournament</h2>
      </div>
      <Divider />
      <TournamentSteps step={2} tournamentUuid={tournamentUuid} showGroup={tournamentData?.data?.type === "ROUND ROBIN"} tournamentType={tournamentData?.data?.type} />
      <FormProvider {...methods} key={location.pathname + "_form"}>
        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          <div className="grid grid-cols-12 gap-4 ">
            {/* Available Players Sidebar */}
            <div className="col-span-12 lg:col-span-6 box h-fit p-4">
              <div className="col-span-12">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-medium">Available Participants</h2>
                  <Button
                    type="button"
                    variant="outline-primary"
                    size="sm"
                    onClick={handleAddAllPlayers}
                    className="flex items-center"
                  >
                    <Lucide icon="Plus" className="w-4 h-4 mr-1" />
                    Add All
                  </Button>
                </div>
                <Divider className="mb-3" />
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {availablePlayersData?.data?.map((player) => {
                  const playerAdded = watch('players').some(p => p.player_uuid === player.uuid);
                  return (
                    <div
                      key={player.uuid}
                      className={`w-full flex items-center p-2 mb-2 rounded-lg transition-colors ${playerAdded
                        ? 'bg-slate-100 dark:bg-darkmode-400 opacity-60'
                        : 'bg-slate-50 dark:bg-darkmode-500'
                        }`}
                    >
                      <Image
                        src={player.media_url || ""}
                        alt={player.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <span className="font-medium text-sm truncate">{player.name}</span>
                          {playerAdded && (
                            <Lucide icon="Check" className="w-4 h-4 ml-2 text-success flex-shrink-0" />
                          )}
                        </div>
                        {player.nickname && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 italic truncate block">
                            {player.nickname}
                          </span>
                        )}
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate block">
                          {player.city} | {player.level}
                        </span>
                      </div>
                      {playerAdded ? (
                        <div className="ml-2 flex-shrink-0 text-xs text-slate-500 dark:text-slate-400">
                          Added
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline-primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!player.uuid) return;
                            handleAddPlayer(player);
                          }}
                          className="flex items-center ml-2 flex-shrink-0"
                        >
                          <Lucide icon="Plus" className="w-3 h-3 mr-1" />
                          Add Player
                        </Button>
                      )}
                    </div>
                  );
                })}
                {availablePlayersData?.data?.length === 0 && (
                  <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                    No players available
                  </div>
                )}
              </div>
              {availablePlayersData && availablePlayersData.totalRecords > 20 && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-darkmode-300">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    size="sm"
                    disabled={availablePlayersPage === 1}
                    onClick={() => setAvailablePlayersPage(prev => Math.max(1, prev - 1))}
                  >
                    <Lucide icon="ChevronLeft" className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    Page {availablePlayersPage} of {Math.ceil((availablePlayersData.totalRecords || 0) / 20)}
                  </span>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    size="sm"
                    disabled={availablePlayersPage >= Math.ceil((availablePlayersData.totalRecords || 0) / 20)}
                    onClick={() => setAvailablePlayersPage(prev => prev + 1)}
                  >
                    <Lucide icon="ChevronRight" className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="col-span-12 lg:col-span-6 box h-fit p-4 grid grid-cols-12 ">
              <div className="col-span-12">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium">Participants</h2>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowInfoModal(true)}
                    className="flex items-center"
                  >
                    <Lucide icon="Info" className="w-4 h-4" />
                  </Button>
                </div>
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
                            <Image src={record.media_url} alt={record.player_name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2" />
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
              <div className="col-span-12 sm:col-span-8 mb-2 mt-2 flex flex-row items-center lg:hidden">
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
                          const playerAdded = watch('players').some(p => player.uuid === p.player_uuid);
                          return {
                            value: player.uuid,
                            label: (
                              <div className={`flex flex-row justify-between ${playerAdded ? 'opacity-60' : ''}`}>
                                <div className="flex items-center flex-row">
                                  <Image src={player.media_url || ""} alt={player.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2" />
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
                            const rounds = TournamentDrawingUtils.calculateTournamentRounds(currentPlayers.length + 1);
                            setRoundInfo(rounds);
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
              <div className="col-span-12 sm:col-span-4 mb-2 mt-2 flex flex-row items-center pl-4 lg:hidden">
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
                {tournamentUuid && !!data?.data?.players?.length && <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => {
                    navigate(paths.administrator.tournaments.new.points({ id: tournamentUuid }).$);
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
                  disabled={formState.isSubmitting || !formState.isValid}
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
      {/* Information Modal */}
      <Dialog
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        size="sm"
      >
        <Dialog.Panel>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Tournament Information</h3>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Lucide icon="X" className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-12 gap-4 py-4">
              <div className="col-span-5 font-medium text-slate-600 dark:text-slate-300">
                Total Round
              </div>
              <div className="col-span-7 text-slate-800 dark:text-slate-200">
                : {roundInfo?.rounds || 0}
              </div>
              <div className="col-span-5 font-medium text-slate-600 dark:text-slate-300">
                Byes
              </div>
              <div className="col-span-7 text-slate-800 dark:text-slate-200">
                : {roundInfo?.byes || 0}
              </div>
              <div className="col-span-5 font-medium text-slate-600 dark:text-slate-300">
                Total Team
              </div>
              <div className="col-span-7 text-slate-800 dark:text-slate-200">
                : {roundInfo?.teams || 0}
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t dark:border-darkmode-300">
              <Button
                type="button"
                variant="primary"
                onClick={() => setShowInfoModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  )
}
