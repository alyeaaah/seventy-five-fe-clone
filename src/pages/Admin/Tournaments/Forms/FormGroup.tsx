import Button from "@/components/Base/Button";
import { useEffect, useState } from "react";
import { TournamentsApiHooks } from "../api";
import { PublicTournamentApiHooks } from "../../../../pages/Public/Tournament/api";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import {
  Divider,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import Lucide from "@/components/Base/Lucide";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import 'react-quill/dist/quill.snow.css';
import TournamentSteps from "../Components/TournamentSteps";
import { IGroup, IMatch, ITournamentInfo } from "@/components/TournamentDrawing/interfaces";
import { GroupStage, TournamentDrawingUtils } from "@/components/TournamentDrawing";
import { GroupMatchesModal } from "../Components/GroupMatchesModal";
import { ModalMatch } from "./ModalMatch";
import { CourtsApiHooks } from "../../Courts/api";
import { assignSchedule } from "@/components/TournamentDrawing/scheduler";
import { IconVS } from "@/assets/images/icons";
import moment from "moment";
import { convertTournamentMatchToMatch, convertTournamentTeamToTeam } from "@/utils/drawing.util";
import { TournamentUpdateGroupPayload } from "../api/schema";
import { matchStatusEnum } from "../../MatchDetail/api/schema";

const {
  generateGroups,
  generateGroupMatches,
} = TournamentDrawingUtils;

interface Props {
  tournament?: string;
}

export const TournamentFormGroup = (_props: Props) => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.administrator.tournaments.new.group);
  const { id: tournamentUuid } = queryParams;
  const { showNotification } = useToast();
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const [modalGroupMatches, setModalGroupMatches] = useState<number | undefined>();
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<IMatch | undefined>();
  const [modalFormMatch, setModalFormMatch] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<number | undefined>();

  // Fetch Tournament Info
  const { data } = TournamentsApiHooks.useGetTournamentsDetail({
    params: {
      uuid: tournamentUuid || 0
    }
  }, {
    onSuccess: (data) => {
    },
    enabled: !!tournamentUuid
  });

  // Fetch Court Field Options
  const { data: courtOptions } = CourtsApiHooks.useGetCourtsDetail({
    params: {
      uuid: data?.data?.court_uuid || ""
    }
  }, {
    enabled: !!data && !!data.data.court_uuid
  });

  // Fetch Tournament Teams
  const { data: teamsData } = TournamentsApiHooks.useGetTournamentTeams({
    params: {
      uuid: tournamentUuid || 0
    },
    refetchOnMount: true,
  }, {
    enabled: !!tournamentUuid && !!data?.data && !!courtOptions,
  });

  // Fetch Groups by Tournament
  const { data: groupsData } = PublicTournamentApiHooks.useGetGroupsByTournament({
    params: {
      tournament_uuid: tournamentUuid || ""
    }
  }, {
    enabled: !!tournamentUuid,
  });

  // Fetch Tournament Matches 
  const { data: matchesData } = TournamentsApiHooks.useGetTournamentMatches({
    queries: {
      tournament_uuid: tournamentUuid || ""
    }
  }, {
    enabled: !!tournamentUuid && !!data?.data && !!teamsData?.data?.length,
  });

  useEffect(() => {
    const tournamentInfo: ITournamentInfo = {
      courts: courtOptions?.data?.fields?.map(court => ({
        uuid: court.uuid,
        name: courtOptions?.data?.name + ' - ' + court.name
      })) || [],
      startDate: data?.data?.start_date ? new Date(data?.data?.start_date) : new Date(),
      endDate: data?.data?.end_date ? new Date(data?.data?.end_date) : new Date(),
    }
    // generate group based on teams data while groups data not fetched yet
    if (!groupsData?.data.length && !!teamsData?.data && courtOptions && !matchesData?.data.length) {
      const teams = convertTournamentTeamToTeam(teamsData?.data || [])
      const groupedTeams = generateGroups(teams, data?.data?.total_group || 2)
      setGroups(groupedTeams);
      const groupMatches = generateGroupMatches(groupedTeams, tournamentInfo);
      setMatches(assignSchedule({ info: tournamentInfo, matches: groupMatches }));
    }
    // set group based on groups data
    else if (!!groupsData?.data?.length && courtOptions && !!teamsData?.data) {
      // Transform fetched groups data to local format
      const transformedGroups: IGroup[] = groupsData.data.map((group, i) => ({
        id: group.id,
        uuid: group.group_uuid,
        groupKey: i, // Using id as groupKey for now
        name: group.group_name,
        teams: (group.teams || []).map((team) => ({
          uuid: team.uuid || "",
          name: team.name || "",
          alias: team.alias || "",
          players: team.players?.map(tp => ({
            uuid: tp.uuid || "",
            name: tp.name || "",
            media_url: tp.media_url || "",
          })) || [],
        })),
      }));
      setGroups(transformedGroups);
      // Generate matches from the transformed groups
      if (matchesData?.data?.length) {
        const matchWithGroupKey = matchesData.data.map(m => ({ ...m, groupKey: groupsData.data.findIndex(g => g.group_uuid === m.group_uuid) }))
        const matchesConverted: IMatch[] = convertTournamentMatchToMatch(matchWithGroupKey || [])
        setMatches(matchesConverted)
      } else {
        const groupMatches = generateGroupMatches(transformedGroups, tournamentInfo);
        setMatches(assignSchedule({ info: tournamentInfo, matches: groupMatches }));
      }
    }
  }, [teamsData, groupsData, courtOptions, matchesData])


  const { mutateAsync: updateTournamentGroup } = TournamentsApiHooks.useUpdateTournamentGroups({
    params: {
      uuid: tournamentUuid || ""
    }
  }, {
    onError: (error) => {
      console.error("Error updating groups:", error);
      showNotification({
        duration: 3000,
        text: "Failed to update groups",
        icon: "X",
        variant: "danger",
      });
    }
  });

  const { mutate: actionUpdateMatches } = TournamentsApiHooks.useCreateTournamentMatches(
    {},
    {
      retry: false,
      onSuccess: (result) => {
        showNotification({
          duration: 3000,
          text: "Group stage saved successfully",
          icon: "CheckSquare",
          variant: "success",
        });
        queryClient.invalidateQueries({
          queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsList"),
        });
        queryClient.invalidateQueries({
          queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsDetail"),
        });
        // Navigate to brackets after saving
        navigate(paths.administrator.tournaments.new.brackets({ id: tournamentUuid || "" }).$);
      },
      onError: (e: any) => {
        showNotification({
          duration: 3000,
          text: e?.message || "Failed to save group stage",
          icon: "WashingMachine",
          variant: "danger",
        });
      },
    }
  );

  // Handler untuk save group
  const actionUpdateGroup = async () => {
    if (!tournamentUuid || !groups || groups.length === 0) {
      showNotification({
        duration: 3000,
        text: "No groups to save",
        icon: "Info",
        variant: "info",
      });
      return;
    }

    try {
      // Transform groups data to match the schema
      const payload: TournamentUpdateGroupPayload = {
        groups: groups.map((group) => ({
          uuid: group.uuid || null,
          groupKey: group.groupKey || 0,
          name: String.fromCharCode(65 + (group.groupKey || 0)),
          teams: group.teams.map((team) => ({
            uuid: team.uuid || null,
            name: team.name,
          })),
        })),
        matches: matches.map((match) => ({
          uuid: match.uuid || null,
          away_team_uuid: match.teams[1]?.uuid || "",
          home_team_uuid: match.teams[0]?.uuid || "",
          court_field_uuid: match.court_uuid || "",
          time: match.time ? new Date(match.time).toISOString() : new Date().toISOString(),
          group_uuid: match.group_uuid || null,
          status: match.status || matchStatusEnum.Values.UPCOMING,
          groupKey: match.groupKey || 0,
        })),
      };

      const updated = await updateTournamentGroup(payload).catch((error) => {
      }).then((data) => {
        if (data) {
          showNotification({
            duration: 3000,
            text: "Groups updated successfully",
            icon: "Check",
            variant: "success",
          });
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({
            queryKey: ["tournaments", "getTournamentDetail", tournamentUuid],
          });
        }
      });
    } catch (error) {
      console.error("Error updating groups:", error);
      showNotification({
        duration: 3000,
        text: "Failed to update groups",
        icon: "X",
        variant: "danger",
      });
    }
  };

  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">{tournamentUuid ? "Edit" : "Add New"} Tournament</h2>
      </div>
      <Divider />
      <TournamentSteps step={4} tournamentUuid={tournamentUuid} showGroup={data?.data?.type === "ROUND ROBIN"} tournamentType={data?.data?.type ?? undefined} />
      <div className="grid grid-cols-12 gap-4 ">
        {/* Left Panel - Group List */}
        <div className="col-span-12 lg:col-span-4 box h-fit p-4 grid grid-cols-12 gap-2">
          <div className="col-span-12">
            <div className="flex flex-row items-center justify-between mb-2">
              <h2 className="font-medium">Group Stage</h2>
            </div>
            <Divider className="mb-0 " />
            <GroupStage
              groups={groups || []}
              className="w-full"
              selectedGroupKey={selectedGroup}
              key={"groupStage" + JSON.stringify(groups)}
              onChange={(newGroups) => {
                const oldGroups = JSON.parse(JSON.stringify(groups)) as IGroup[];
                // Check if groups actually changed
                const groupsChanged = JSON.stringify(oldGroups) !== JSON.stringify(newGroups);


                if (groupsChanged) {
                  // Update groups immediately to maintain UI sync
                  // Show confirmation dialog for match regeneration
                  setModalAlert({
                    title: "Update Groups",
                    size: "lg",
                    description: "Groups changes and will be applied and will be regenerate the matches schedule. Do you want to regenerate matches? This will overwrite existing match data.",
                    type: "warning",
                    open: true,
                    onClose: () => {
                      setModalAlert(undefined);
                      setGroups(oldGroups);
                      return false;
                    },
                    icon: "ShieldQuestion",
                    buttons: [
                      {
                        type: "button",
                        label: "Cancel",
                        variant: "primary",
                        onClick: () => {
                          setGroups(oldGroups);
                          setModalAlert(undefined);
                          return false;
                        }
                      },
                      {
                        type: "button",
                        label: "Yes, Continue",
                        variant: "outline-primary",
                        onClick: () => {
                          setGroups(newGroups);
                          // Generate matches when groups change
                          if (newGroups.length > 0 && courtOptions?.data?.fields) {
                            const groupMatches = generateGroupMatches(newGroups, {
                              startDate: data?.data?.start_date ? new Date(data?.data?.start_date) : new Date(),
                              endDate: data?.data?.end_date ? new Date(data?.data?.end_date) : new Date(),
                              courts: courtOptions.data.fields.map(c => ({
                                name: c.name,
                                uuid: c.uuid
                              }))
                            });
                            const tourneyInfo: ITournamentInfo = {
                              courts: courtOptions?.data?.fields?.map(court => ({
                                uuid: court.uuid,
                                name: courtOptions?.data?.name + ' - ' + court.name
                              })) || [],
                              startDate: data?.data?.start_date ? new Date(data?.data?.start_date) : new Date(),
                              endDate: data?.data?.end_date ? new Date(data?.data?.end_date) : new Date(),
                            }
                            setMatches(assignSchedule({ matches: groupMatches, info: tourneyInfo }));
                            // Auto-select first group if none selected
                            if (selectedGroup === undefined && newGroups.length > 0) {
                              setSelectedGroup(newGroups[0].groupKey);
                            }
                            setModalAlert(undefined);
                          }
                        }
                      }
                    ],
                    onCancel: () => {
                      setGroups(oldGroups);
                      setModalAlert(undefined);

                      return false;

                    }
                  });
                }
              }}
              onClickGroup={(group) => {
                // On small screens, show modal; on large screens, select group
                if (window.innerWidth < 1024) {
                  setModalGroupMatches(group.groupKey);
                } else {
                  setSelectedGroup(group.groupKey);
                }
              }}
            />
          </div>
        </div>

        {/* Right Panel - Match List (Large screens only) */}
        <div className="hidden lg:block col-span-12 lg:col-span-8 box h-fit p-4">
          <div className="col-span-12">
            <h2 className="font-medium mb-2">
              {selectedGroup === undefined ? "Select a group to view matches" : `Group ${String.fromCodePoint(65 + selectedGroup)} Matches`}
            </h2>
            <Divider className="mb-0" />
            <div className="grid grid-cols-12 gap-3 mt-4" key={selectedGroup}>
              {/* {JSON.stringify({ selectedGroup, matchesByGroup: matches.filter(m => m.groupKey === selectedGroup) })} */}
              {selectedGroup !== undefined && matches.filter(m => m.groupKey === selectedGroup).map((match, index) => (
                <button
                  key={match.id || match.uuid || `match-${index}`}
                  type="button"
                  className="col-span-12 border border-emerald-800 rounded-full hover:bg-stone-200  dark:border-darkmode-100 dark:hover:bg-darkmode-200 cursor-pointer text-left"
                  onClick={() => {
                    setModalFormMatch(true);
                    setSelectedMatch(match);
                  }}
                >
                  <div className="flex flex-row items-center justify-between gap-2 px-2 py-2">
                    <div className="flex flex-row items-center justify-between gap-2 border flex-1 bg-[#EBce56] dark:bg-darkmode-300 rounded-full px-4 py-2">
                      <div className="flex flex-row items-center gap-2 flex-1">
                        <span className="font-medium bg-emerald-800 px-2 py-1 text-xs rounded-full text-white line-clamp-1 min-w-fit">{match.teams[0]?.name ?? "TBD"}</span>
                        <div className="flex flex-col gap-1">
                          {match.teams[0]?.players?.map((player) => (
                            <span key={player.uuid || player.name} className="text-xs font-medium line-clamp-1">{player.name}</span>
                          ))}
                        </div>
                      </div>
                      <IconVS className="w-12 h-6 text-emerald-800" />
                      <div className="flex flex-row justify-end items-center gap-2 flex-1">
                        <div className="flex flex-col text-right gap-1">
                          {match.teams[1]?.players?.map((player) => (
                            <span key={player.uuid || player.name} className="text-xs font-medium line-clamp-1">{player.name}</span>
                          ))}
                        </div>
                        <span className="font-medium bg-emerald-800 px-2 py-1 text-xs rounded-full text-white line-clamp-1 min-w-fit">{match.teams[1]?.name ?? "TBD"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs font-medium">
                        {match.court}
                      </span>
                      <span className="text-xs font-medium">{moment(match.time).format('ddd, DD MMM YYYY HH:mm')}</span>
                    </div>
                    <div className="bg-emerald-800 text-white h-[54px] w-[54px] aspect-square rounded-full flex items-center justify-end overflow-hidden">
                      <span className="text-5xl font-semibold font-marker uppercase text-end">{`${String.fromCodePoint(65 + selectedGroup)}${index + 1}`}</span>
                    </div>
                  </div>
                </button>
              ))}
              {(selectedGroup !== undefined && matches.filter(m => m.groupKey === selectedGroup).length === 0) && (
                <div className="col-span-12 text-center py-8 text-gray-500">
                  No matches found for this group
                </div>
              )}
              {selectedGroup === undefined && (
                <div className="col-span-12 text-center py-8 text-gray-500">
                  Select a group from the left to view matches
                </div>
              )}
            </div>
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
            {tournamentUuid && groups && groups.length > 0 && <Button
              type="button"
              variant="outline-secondary"
              onClick={() => {
                navigate(paths.administrator.tournaments.new.brackets({ id: tournamentUuid }).$);
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
              onClick={actionUpdateGroup}
            >
              <Lucide icon="Save" className="w-4 h-4 mr-2" />
              Save & Continue
            </Button>
          </div>
        </div>
      </div>
      <Confirmation
        open={Boolean(modalAlert?.open)}
        onClose={() => setModalAlert(undefined)}
        icon={modalAlert?.icon ?? "Info"}
        title={modalAlert?.title ?? ""}
        description={modalAlert?.description ?? ""}
        refId={modalAlert?.refId}
        buttons={modalAlert?.buttons}
      />
      <GroupMatchesModal
        isOpen={modalGroupMatches !== undefined}
        key={JSON.stringify(modalGroupMatches === undefined ? [] : matches.filter(m => m.groupKey === modalGroupMatches))}
        onClose={() => setModalGroupMatches(undefined)}
        matches={modalGroupMatches === undefined ? [] : matches.filter(m => m.groupKey === modalGroupMatches)}
        onMatchesClick={(match) => {
          setModalFormMatch(true);
          setSelectedMatch(match);
        }}
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
          if (match.groupKey !== undefined && match.groupKey >= 0) {
            const tempMatches = matches.map(m => {
              if (m.id === match.id && m.groupKey === match.groupKey) {
                m = {
                  ...m,
                  court: courtOptions?.data?.name + " - " + match.court,
                  court_uuid: match.court_uuid,
                  time: match.time
                };
              }
              return m
            })
            setMatches(tempMatches);
          }

          setModalFormMatch(false)
          setTimeout(() => {
            setSelectedMatch(undefined);
          }, 300);
        }}
      />
    </>
  )
}

