import Button from "@/components/Base/Button";
import { useEffect, useState } from "react";
import { TournamentMatchesPayload, TournamentMatchPayload } from "../api/schema";
import { TournamentsApiHooks } from "../api";
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
import { ITeam, IGroup, IMatch } from "@/components/TournamentDrawing/interfaces";
import { GroupStage, TournamentDrawingUtils } from "@/components/TournamentDrawing";
import { faker } from "@faker-js/faker";
import { GroupMatchesModal } from "../Components/GroupMatchesModal";
import { ModalMatch } from "./ModalMatch";
import { CourtsApiHooks } from "../../Courts/api";
import { assignSchedule } from "@/components/TournamentDrawing/scheduler";
import { IconVS } from "@/assets/images/icons";
import moment from "moment";

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

  const tempTeam: ITeam[] = (teamsData?.data.map(t => ({
    uuid: t.uuid,
    name: t.name,
    players: t.players.map(p => ({
      uuid: p.uuid,
      name: p.name,
      media_url: p.media_url,
      nickname: p.nickname,
      city: p.city
    }))
  })) || []) as ITeam[];

  // Fetch Tournament Matches 
  const { data: matchesData } = TournamentsApiHooks.useGetTournamentMatches({
    queries: {
      tournament_uuid: tournamentUuid || ""
    }
  }, {
    enabled: !!tournamentUuid && !!data?.data && !!teamsData?.data?.length,
  });

  // Handle Fetched Tournament Matches
  useEffect(() => {
    if (!matchesData?.data?.length && teamsData?.data?.length && data?.data?.type === "ROUND ROBIN") {
      // setting up group with teams
      const groups = generateGroups(tempTeam, data?.data.total_group || 0);
      setGroups(groups);
      // Generate matches from groups
      if (groups.length > 0 && courtOptions?.data?.fields) {
        const groupMatches = generateGroupMatches(groups, {
          startDate: data?.data?.start_date ? new Date(data?.data?.start_date) : new Date(),
          endDate: data?.data?.end_date ? new Date(data?.data?.end_date) : new Date(),
          courts: courtOptions.data.fields.map(c => ({
            name: c.name,
            uuid: c.uuid
          }))
        });
        setMatches(groupMatches);
        // Auto-select first group on large screens
        if (groups.length > 0) {
          setSelectedGroup(groups[0].groupKey);
        }
      }
    } else if (matchesData?.data?.length && teamsData?.data?.length) {
      // Load existing groups from matches
      const groupMatches = matchesData.data.filter(m => m.group !== undefined && m.group !== null);
      if (groupMatches.length > 0) {
        // Reconstruct groups from matches
        const groupKeys = [...new Set(groupMatches.map(m => m.group).filter(g => g !== null && g !== undefined))];
        const reconstructedGroups: IGroup[] = groupKeys.map((groupKey, idx) => {
          const groupMatchesForGroup = groupMatches.filter(m => m.group === groupKey);
          const teamsInGroup = new Set<string>();
          groupMatchesForGroup.forEach(m => {
            if (m.home_team_uuid && m.home_team_uuid !== "TBD" && m.home_team_uuid !== "BYE") {
              teamsInGroup.add(m.home_team_uuid);
            }
            if (m.away_team_uuid && m.away_team_uuid !== "TBD" && m.away_team_uuid !== "BYE") {
              teamsInGroup.add(m.away_team_uuid);
            }
          });
          const teams = tempTeam.filter(t => teamsInGroup.has(t.uuid));
          return {
            groupKey: groupKey || idx,
            teams: teams,
            name: `Group ${String.fromCodePoint(65 + idx)}`
          };
        });
        setGroups(reconstructedGroups);
        // Load matches
        const convertedMatches = matchesData.data.map(m => {
          const homeTeam = tempTeam.find(t => t.uuid === m.home_team_uuid);
          const awayTeam = tempTeam.find(t => t.uuid === m.away_team_uuid);
          return {
            id: m.id?.toString() || "",
            uuid: m.uuid || "",
            roundKey: m.round,
            groupKey: m.group,
            seed_index: m.seed_index,
            teams: [
              homeTeam ? { ...homeTeam, alias: m.home_team_uuid } : { uuid: m.home_team_uuid, name: m.home_team_uuid, players: [] },
              awayTeam ? { ...awayTeam, alias: m.away_team_uuid } : { uuid: m.away_team_uuid, name: m.away_team_uuid, players: [] }
            ],
            court: m.court || "",
            court_uuid: m.court_field_uuid || "",
            time: m.time || "",
            status: m.status || "SCHEDULED",
            home_team_score: m.home_team_score || 0,
            away_team_score: m.away_team_score || 0
          } as IMatch;
        });
        setMatches(convertedMatches);
        // Auto-select first group on large screens
        if (reconstructedGroups.length > 0) {
          setSelectedGroup(reconstructedGroups[0].groupKey);
        }
      }
    }
  }, [matchesData, data, teamsData, tempTeam, courtOptions]);

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
  const actionUpdateGroup = () => {
    if (!tournamentUuid || !groups || groups.length === 0) {
      showNotification({
        duration: 3000,
        text: "No groups to save",
        icon: "Info",
        variant: "info",
      });
      return;
    }

    // Generate matches from groups
    const groupMatches = generateGroupMatches(groups, {
      startDate: data?.data?.start_date ? new Date(data?.data?.start_date) : new Date(),
      endDate: data?.data?.end_date ? new Date(data?.data?.end_date) : new Date(),
      courts: courtOptions?.data?.fields?.map(c => ({
        name: c.name,
        uuid: c.uuid
      })) || []
    });

    const matchesSchedule = assignSchedule({
      matches: groupMatches, info: {
        startDate: data?.data?.start_date ? new Date(data?.data?.start_date) : new Date(),
        endDate: data?.data?.end_date ? new Date(data?.data?.end_date) : new Date(),
        courts: courtOptions?.data?.fields?.map(c => ({
          name: c.name,
          uuid: c.uuid
        })) || []
      }
    });

    const body: TournamentMatchesPayload = {
      tournament_uuid: tournamentUuid,
      matches: []
    };

    matchesSchedule.forEach((match, idx) => {
      const matchPayload: TournamentMatchPayload = {
        id: Number.isNaN(Number(match.id)) ? Number(`${data?.data?.id}${idx}`) : +match.id,
        uuid: match.uuid ?? faker.string.uuid(),
        round: match.roundKey,
        group: match.groupKey,
        seed_index: match.seed_index,
        home_team_uuid: ["TBD", 'BYE'].includes(match.teams?.[0]?.alias ?? "") ? match.teams?.[0]?.alias ?? "TBD" : match.teams?.[0]?.uuid ?? "TBD",
        away_team_uuid: ["TBD", 'BYE'].includes(match.teams?.[1]?.alias ?? "") ? match.teams?.[1]?.alias ?? "TBD" : match.teams?.[1]?.uuid ?? "TBD",
        home_group_index: match.teams?.[0]?.group_index ?? null,
        home_group_position: match.teams?.[0]?.group_position ?? null,
        away_group_index: match.teams?.[1]?.group_index ?? null,
        away_group_position: match.teams?.[1]?.group_position ?? null,
        court_field_uuid: match.court_field_uuid || "",
        status: match.status || "SCHEDULED",
        time: match.time,
        updatedAt: match.updatedAt,
        court: match.court,
        tournament_uuid: tournamentUuid,
        home_team_score: match.home_team_score || 0,
        away_team_score: match.away_team_score || 0
      };
      body.matches.push(matchPayload);
    });

    actionUpdateMatches({
      matches: body.matches,
      tournament_uuid: tournamentUuid,
    });
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
              key={"groupStage" + groups.length}
              onChange={(groups) => {
                setGroups(groups);
                // Generate matches when groups change
                if (groups.length > 0 && courtOptions?.data?.fields) {
                  const groupMatches = generateGroupMatches(groups, {
                    startDate: data?.data?.start_date ? new Date(data?.data?.start_date) : new Date(),
                    endDate: data?.data?.end_date ? new Date(data?.data?.end_date) : new Date(),
                    courts: courtOptions.data.fields.map(c => ({
                      name: c.name,
                      uuid: c.uuid
                    }))
                  });
                  setMatches(groupMatches);
                  // Auto-select first group if none selected
                  if (selectedGroup === undefined && groups.length > 0) {
                    setSelectedGroup(groups[0].groupKey);
                  }
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
            <div className="grid grid-cols-12 gap-3 mt-4">
              {selectedGroup !== undefined && matches.filter(m => m.groupKey === selectedGroup).map((match, index) => (
                <button
                  key={match.id || match.uuid || `match-${index}`}
                  type="button"
                  className="col-span-12 border border-emerald-800 rounded-full hover:bg-stone-200 cursor-pointer text-left"
                  onClick={() => {
                    setModalFormMatch(true);
                    setSelectedMatch(match);
                  }}
                >
                  <div className="flex flex-row items-center justify-between gap-2 px-4 py-2">
                    <div className="flex flex-row items-center justify-between gap-2 border flex-1 bg-[#EBce56] rounded-full px-4 py-2">
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
              {selectedGroup !== undefined && matches.filter(m => m.groupKey === selectedGroup).length === 0 && (
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
                  court: match.court,
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

