import React, { useEffect, useState } from "react";
import { TournamentMatchesPayload, TournamentsPayload, TournamentTeams } from "../api/schema";
import { PublicTournamentApiHooks } from "@/pages/Public/Tournament/api";
import { TournamentsApiHooks } from "../api";
import { CourtsApiHooks } from "../../Courts/api";
import { IGroup, ITeam, IMatch, ITournamentInfo } from "@/components/TournamentDrawing/interfaces";
import { convertTournamentTeamToTeam, convertTournamentMatchToMatch, sortMatchesDefault } from "@/utils/drawing.util";
import { assignSchedule } from "@/components/TournamentDrawing/scheduler";
import { TournamentDrawingUtils } from "@/components/TournamentDrawing";
import { MatchCard } from "@/components/MatchCard";
import Lucide from "@/components/Base/Lucide";
import { ModalMatch } from "../Forms/ModalMatch";
import Button from "@/components/Base/Button";
import Tippy from "@/components/Base/Tippy";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { useToast } from "@/components/Toast/ToastContext";
import { useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
import { queryClient } from "@/utils/react-query";

interface GroupMatchesProps {
  data?: TournamentsPayload;
  tournamentUuid: string;
}

export const GroupMatches: React.FC<GroupMatchesProps> = ({
  data,
  tournamentUuid
}) => {
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>();
  const { showNotification } = useToast();
  const navigate = useNavigate()
  const [selectedMatch, setSelectedMatch] = useState<IMatch | undefined>();
  const [modalFormMatch, setModalFormMatch] = useState(false);

  const { generateGroups, generateGroupMatches } = TournamentDrawingUtils;

  const { data: tournamentGroups, isLoading: isLoadingGroup } = PublicTournamentApiHooks.useGetGroupsByTournament({
    params: {
      tournament_uuid: tournamentUuid || ""
    }
  }, {
    enabled: !!tournamentUuid
  });

  const { data: matchesData } = TournamentsApiHooks.useGetTournamentMatches({
    queries: {
      tournament_uuid: tournamentUuid || ""
    }
  }, {
    enabled: !!tournamentUuid
  });

  const groupIsLocked = matchesData?.data?.some(match => match.group_uuid);

  const { data: courtOptions } = CourtsApiHooks.useGetCourtsDetail({
    params: {
      uuid: data?.court_uuid || ""
    }
  }, {
    enabled: !!data?.court_uuid
  });

  const totalGroups = data?.total_group || 4;

  // Convert teams data to ITeam format
  const convertTeamsToITeams = (teams: TournamentTeams[]): ITeam[] => {
    return convertTournamentTeamToTeam(teams);
  };

  // Convert current groups structure to IGroup format for GroupStage
  const groupStageGroups: IGroup[] = groups.map(group => ({
    ...group,
    teams: Array.isArray(group.teams) ? group.teams.map((team: any) => convertTeamsToITeams([team])[0]) : []
  }));


  useEffect(() => {
    if (tournamentGroups?.data && tournamentGroups.data.length > 0) {
      // Convert tournamentGroups to IGroup format and populate with existing teams
      const convertedGroups: IGroup[] = tournamentGroups.data.map((group: any) => ({
        id: group.id,
        groupKey: group.id,
        name: group.group_name || `Group ${group.id}`,
        uuid: group.uuid,
        teams: group.teams ? convertTeamsToITeams(group.teams) : []
      }));
      setGroups(convertedGroups);
    } else {
      // Initialize empty groups if no data exists
      const initialGroups: IGroup[] = Array.from({ length: totalGroups }, (_, index) => ({
        id: index + 1,
        groupKey: index + 1,
        name: `Group ${String.fromCharCode(65 + index)}`,
        teams: []
      }));
      setGroups(initialGroups);
    }
  }, [tournamentGroups, totalGroups]);

  // fetch matches for each group
  useEffect(() => {
    if (tournamentGroups?.data && courtOptions?.data) {
      const tournamentInfo: ITournamentInfo = {
        courts: courtOptions?.data?.fields?.map((field) => ({
          uuid: field.uuid,
          name: courtOptions?.data?.name + " - " + field.name
        })) || [],
        startDate: data?.start_date ? new Date(data.start_date) : new Date(),
        endDate: data?.end_date ? new Date(data.end_date) : new Date(),
      }

      // Transform fetched groups data to local format
      const transformedGroups: IGroup[] = tournamentGroups.data.map((group, i) => ({
        id: group.id,
        uuid: group.group_uuid,
        groupKey: i,
        name: group.group_name || `Group ${group.id}`,
        teams: (group.teams || []).map((team) => ({
          uuid: team.uuid || "",
          name: team.name || "",
          alias: team.alias || "",
          players: team.players?.map(tp => ({
            uuid: tp.uuid || "",
            name: tp.name || "",
            nickname: tp.nickname || "",
            media_url: tp.media_url || "",
          })) || [],
        })),
      }));
      setGroups(transformedGroups);
      handleRegenerateMatches(transformedGroups, tournamentInfo)
    } else {
      // Initialize empty groups if no data exists
      const initialGroups: IGroup[] = Array.from({ length: totalGroups }, (_, index) => ({
        id: index + 1,
        groupKey: index + 1,
        name: `Group ${String.fromCharCode(65 + index)}`,
        teams: []
      }));
      setGroups(initialGroups);
    }
  }, [tournamentGroups, courtOptions, matchesData, data, totalGroups]);

  const { mutateAsync: actionUpdateSingleMatch, isLoading: isLoadingSubmitSingle } = TournamentsApiHooks.useUpdateMatch(
    {
      params: {
        uuid: selectedMatch?.uuid || ""
      }
    },
    {
      retry: false,
      onSuccess: (result) => {
        showNotification({
          duration: 3000,
          text: "Match updated successfully",
          icon: "CheckSquare",
          variant: "success",
        });
        queryClient.invalidateQueries({ queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentMatches") });
      },
      onError: (e: any) => {
        showNotification({
          duration: 3000,
          text: e?.response?.data?.message || "Failed to update match",
          icon: "AlertCircle",
          variant: "danger",
        });
      },
    }
  );


  const { mutate: actionUpdateMatches, isLoading: isLoadingSubmit } = TournamentsApiHooks.useCreateTournamentMatches(
    {
      queries: {
        mode: "group"
      }
    },
    {
      retry: false,
      onSuccess: (result) => {
        showNotification({
          duration: 3000,
          text: "Tournament updated successfully",
          icon: "CheckSquare",
          variant: "success",
        });
        setModalAlert(undefined);
        queryClient.invalidateQueries({ queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentMatches") });
      },
      onError: (e: any) => {
        showNotification({
          duration: 3000,
          text: `Failed to update tournament: ${e?.message}`,
          icon: "WashingMachine",
          variant: "danger",
        });
      },
    }
  );

  const handleLockGroup = async () => {
    if (isLoadingSubmit) {
      return;
    }
    const body: TournamentMatchesPayload = {
      tournament_uuid: tournamentUuid || "",
      matches: matches.map((match, i) => ({
        id: i,
        home_team_uuid: match.teams?.[0]?.uuid,
        away_team_uuid: match.teams?.[1]?.uuid,
        court_field_uuid: match.court_field_uuid || match.court_uuid,
        status: match.status || null,
        uuid: match.uuid,
        court: match.court_uuid || null,
        date: match.date ? match.date.toString() : null,
        time: match.time ? match.time.toString() : null,
        round: -1,
        tournament_group_index: match.groupKey, // groupkey index
        home_group_index: match.groupKey, // groupkey index
        away_group_index: match.groupKey, // groupkey index
        group_uuid: tournamentGroups?.data?.sort((a, b) => (a.group_name || '').localeCompare(b.group_name || '')).find((_group, i) => i === match.groupKey)?.group_uuid || "",
        seed_index: -1,
        tournament_uuid: tournamentUuid,
      })),
    };
    console.log(body);

    // actionUpdateMatches(body);
  };

  const handleRegenerateMatches = (transformedGroups?: IGroup[], tournamentInfo?: ITournamentInfo) => {
    if (!tournamentGroups?.data?.length) return;
    // Handle matches - fetch existing or generate new ones
    if (!transformedGroups) {
      transformedGroups = tournamentGroups.data.map((group, i) => ({
        id: group.id,
        uuid: group.group_uuid,
        groupKey: i,
        name: group.group_name || `Group ${group.id}`,
        teams: (group.teams || []).map((team) => ({
          uuid: team.uuid || "",
          name: team.name || "",
          alias: team.alias || "",
          players: team.players?.map(tp => ({
            uuid: tp.uuid || "",
            name: tp.name || "",
            nickname: tp.nickname || "",
            media_url: tp.media_url || "",
          })) || [],
        })),
      }));
    }
    if (!tournamentInfo) {
      tournamentInfo = {
        courts: courtOptions?.data?.fields?.map((field) => ({
          uuid: field.uuid,
          name: courtOptions?.data?.name + " - " + field.name
        })) || [],
        startDate: data?.start_date ? new Date(data.start_date) : new Date(),
        endDate: data?.end_date ? new Date(data.end_date) : new Date(),
      }
    }
    if (matchesData?.data?.length) {
      const matchWithGroupKey = matchesData.data.map(m => ({
        ...m,
        groupKey: tournamentGroups.data.findIndex(g => g.group_uuid === m.group_uuid)
      }));
      const matchesConverted: IMatch[] = convertTournamentMatchToMatch(matchWithGroupKey || []);

      setMatches(sortMatchesDefault(matchesConverted));
    } else {
      // Generate new matches if none exist
      const groupMatches = generateGroupMatches(transformedGroups, tournamentInfo);
      const scheduledMatches = assignSchedule({ info: tournamentInfo, matches: groupMatches });

      setMatches(sortMatchesDefault(scheduledMatches));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between flex-col sm:flex-row sm:mb-2 gap-2 mb-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Group Matches</h2>
          <p className="text-sm text-gray-500 mt-1">
            View and manage group stage matches
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex flex-row w-full sm:justify-end gap-2">
            {!groupIsLocked && <Tippy content="Regenerate Matches" className="h-full"><Button
              type="button"
              variant={"outline-primary"}
              size="lg"
              disabled={groupIsLocked}
              className="w-fit h-10"
              aria-label="Regenerate Matches"
              onClick={() => handleRegenerateMatches()}
            >
              <Lucide icon={"RefreshCcw"} className="" />
            </Button></Tippy>}

            <Button
              type="button"
              variant={groupIsLocked ? "primary" : "outline-primary"}
              size="lg"
              disabled={groupIsLocked}
              className="sm:w-fit w-full h-10"
              onClick={() => {
                setModalAlert({
                  title: "Lock Group",
                  content: <>
                    <div className="mx-4 mb-4 px-5 py-2 flex flex-col border bg-gray-200 rounded-lg">
                      <ul className="list-disc">
                        <li>Team Member cannot be changed</li>
                        <li>Group Stage cannot be changed</li>
                        <li>You only allowed to edit match information.</li>
                      </ul>
                    </div>
                  </>,
                  open: true,
                  size: "lg",
                  onClose: () => setModalAlert(undefined),
                  icon: "LockKeyhole",
                  description: "Things to know before locking the group,  the following rules will apply:",
                  buttons: [
                    {
                      label: "I Understand",
                      variant: "outline-primary",
                      onClick: handleLockGroup,
                    },
                    {
                      label: "Cancel",
                      variant: "primary",
                      onClick: () => setModalAlert(undefined),
                    },
                  ],
                })

              }}
            >
              <Lucide icon={groupIsLocked ? "LockKeyhole" : "UnlockKeyhole"} className="mr-2" />
              Lock Group
            </Button>
          </div>
          <span className="text-sm text-gray-500 text-center sm:text-left">Once group is locked, you only allowed to edit match information.</span>
        </div>
      </div>

      {/* Group Stage Component */}
      <div className="flex-1 grid grid-cols-12">
        <div className="col-span-12 flex gap-2">
          {isLoadingGroup ? (
            <div className="text-center py-8">
              <Lucide icon="Loader2" className="w-8 h-8 mx-auto animate-spin text-gray-400" />
              <p className="text-gray-500 mt-2">Loading group matches...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:p-2 w-full">
              {groupStageGroups.map((group) => (
                <div
                  key={group.id?.toString() || `group-${group.name}`}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                >
                  <div className="bg-emerald-800 text-white px-2 py-1">
                    <h3 className="text-lg font-semibold text-center">
                      {group.name?.toLowerCase().includes("group") ? group.name : `Group ${group.name}`}
                    </h3>
                  </div>
                  <div className="grid grid-cols-12 p-0">
                    {group.teams.length > 0 ? (<>
                      <div className="col-span-12 sm:col-span-3 sm:p-3 p-2 bg-gray-100 gap-2 flex flex-row sm:flex-col overflow-scroll">
                        {group.teams.map((team) => (
                          <div
                            key={team.uuid}
                            className="flex sm:flex-row flex-col-reverse sm:items-center justify-between px-2 py-2 bg-gray-50 rounded-lg border border-gray-200 min-w-40 sm:min-w-full gap-1"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                <span className="text-emerald-800 text-sm font-medium">
                                  {team.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                {team.players?.map((player) => (
                                  <div key={player.uuid}>
                                    <p className="w-full line-clamp-1 flex flex-row gap-1 items-center">
                                      {player?.nickname && player.nickname !== player.name && <span className="font-medium text-gray-900">{`${player.nickname}`}</span>}
                                      <span className={`line-clamp-1 w-fit ${player?.nickname && player.nickname !== player.name ? 'text-gray-500 font-normal text-xs' : 'font-medium text-gray-900'}`}>{player.name}</span>
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="text-right w-fit">
                              <span className="text-xs px-2 py-1 text-white bg-primary rounded-md whitespace-nowrap">{team.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="col-span-12 sm:col-span-9 p-3">
                        {/* render match here */}
                        <div className="grid grid-cols-3 gap-2">
                          {matches
                            .filter(match => match.groupKey === group.groupKey)
                            .length > 0 ? (
                            matches
                              .filter(match => match.groupKey === group.groupKey)
                              .map((match, midx) => (
                                <div className="col-span-3 sm:col-span-1" key={midx}>
                                  <MatchCard
                                    key={match.uuid || `match-${midx}`}
                                    match={match}
                                    matchIndex={midx}
                                    groupIndex={group.groupKey || 0}
                                    variant="thumbnail"
                                    onClick={(m) => {
                                      setSelectedMatch({
                                        ...m,
                                        court_uuid: m.court_field_uuid
                                      });
                                      setModalFormMatch(true);
                                    }}
                                  />
                                </div>
                              ))
                          ) : (
                            <div className="text-center py-4 col-span-12">
                              <p className="text-sm text-gray-500">No matches scheduled</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                    ) : (
                      <div className="text-center py-6 px-2 col-span-12">
                        <p className="text-gray-500 text-sm">No teams assigned</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Confirmation
        open={!!modalAlert?.open}
        onClose={() => setModalAlert(undefined)}
        content={modalAlert?.content}
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
        court={data?.court_uuid || "-"}
        courtOptions={courtOptions?.data}
        onDismiss={() => {
          setModalFormMatch(false)
          setTimeout(() => {
            setSelectedMatch(undefined);
          }, 300);
        }}
        onSave={async (match) => {
          if (match.groupKey !== undefined && match.groupKey >= 0) {
            const tempMatches = matches.map(m => {
              if (m.id === match.id && m.groupKey === match.groupKey) {
                m = {
                  ...m,
                  court: courtOptions?.data?.name + " - " + match.court,
                  court_uuid: match.court_uuid,
                  court_field_uuid: match.court_field_uuid,
                  time: match.time
                };
              }
              return m
            })
            setMatches(sortMatchesDefault(tempMatches));
          }
          if (!!match.uuid) {
            await actionUpdateSingleMatch({
              uuid: match.uuid,
              home_team_uuid: match.teams?.[0]?.uuid,
              away_team_uuid: match.teams?.[1]?.uuid,
              court_field_uuid: match.court_uuid,
              status: match.status,
              time: match.time?.toString(),
              seed_index: -1,
            })
          }

          setModalFormMatch(false)
          setTimeout(() => {
            setSelectedMatch(undefined);
          }, 1000);
        }}
      />
    </div >
  )
}