import React, { useEffect, useState } from "react";
import { Divider } from "antd";
import Button from "@/components/Base/Button";
import { DraggableBracket, TournamentDrawingUtils } from "@/components/TournamentDrawing";
import { TournamentsApiHooks } from "../api";
import { convertTournamentMatchToMatch, sortMatchesDefault } from "@/utils/drawing.util";
import { IMatch, IRound, ITournamentInfo } from "@/components/TournamentDrawing/interfaces";
import { TournamentMatchesPayload, TournamentsPayload } from "../api/schema";
import { useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
import Lucide from "@/components/Base/Lucide";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import Tippy from "@/components/Base/Tippy";
import { assignSchedule } from "@/components/TournamentDrawing/scheduler";
import { CourtsApiHooks } from "../../Courts/api";
import { ModalMatch } from "../Forms/ModalMatch";
import { useToast } from "@/components/Toast/ToastContext";
import { queryClient } from "@/utils/react-query";
import { PublicTournamentApiHooks } from "@/pages/Public/Tournament/api";

interface TournamentDetailBracketProps {
  tournamentUuid: string;
  data?: TournamentsPayload;
}

export const TournamentDetailBracket: React.FC<TournamentDetailBracketProps> = ({
  tournamentUuid,
  data
}) => {
  const { convertMatchToRound, convertRoundToMatches } = TournamentDrawingUtils;
  const navigate = useNavigate();
  const { showNotification } = useToast();
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  // const [allRounds, setAllRounds] = useState<IRound[]>([]);

  const [selectedMatch, setSelectedMatch] = useState<IMatch | undefined>();
  const [matches, setMatches] = useState<IMatch[]>([]);

  const [modalFormMatch, setModalFormMatch] = useState(false);
  // Get confirmed teams
  const { data: confirmedTeamsData } = TournamentsApiHooks.useGetTournamentTeamParticipants({
    params: {
      tournamentUuid: tournamentUuid || ""
    },
    queries: {
      status: "confirmed",
      limit: "99999"
    }
  }, {
    enabled: !!tournamentUuid
  });

  const { data: courtOptions } = CourtsApiHooks.useGetCourtsDetail({
    params: {
      uuid: data?.court_uuid || ""
    }
  }, {
    enabled: !!data?.court_uuid
  });

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
  const knockoutMatchesData = matchesData?.data.filter((match) => (match.round || 0) >= 0 || (match.seed_index || 0) >= 0) || [];
  const bracketIsLocked = !!knockoutMatchesData.length;


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
        mode: "knockout"
      }
    },
    {
      retry: false,
      onSuccess: (result) => {
        showNotification({
          duration: 3000,
          text: "Tournament bracket updated successfully",
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
  // Helper function to shuffle teams with priorities
  const shuffleTeamsWithPriorities = (teams: any[]) => {
    const shuffled = [...teams];

    // Fisher-Yates shuffle with priorities
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Try to find a team that doesn't conflict with previous selections
      let j = Math.floor(Math.random() * (i + 1));
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts && i < shuffled.length - 1) {
        const currentTeam = shuffled[j];
        const nextTeam = shuffled[i];

        // Check if teams are from same group (avoid in early rounds)
        if (currentTeam.groupIndex === nextTeam?.groupIndex && i < shuffled.length / 2) {
          j = Math.floor(Math.random() * (i + 1));
          attempts++;
        } else {
          break;
        }
      }

      // Swap
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  };
  const assignScheduleKnockout = (matchParam: IMatch[]): IMatch[] => {
    const groupMatches = matchesData?.data?.filter(m => m.round === -1 && m.seed_index === -1)?.sort((a, b) => new Date(a.time!).getTime() - new Date(b.time!).getTime())
    const latestMatch = groupMatches?.length ? groupMatches[groupMatches.length - 1]?.time : undefined;
    const tournamentInfo: ITournamentInfo = {
      courts: courtOptions?.data?.fields?.map((field) => ({
        uuid: field.uuid,
        name: (courtOptions?.data?.name + " - " + field.name).length <= 24 ? courtOptions?.data?.name + " - " + field.name : field.name
      })) || [],
      startDate: data?.start_date ? new Date(data.start_date) : new Date(),
      endDate: data?.end_date ? new Date(data.end_date) : new Date(),
    }

    const scheduledMatches = assignSchedule({
      matches: matchParam,
      info: tournamentInfo,
      after: latestMatch ? new Date(new Date(latestMatch).getTime() + (30 * 60 * 1000)) : undefined,
    })
    return scheduledMatches;
  }
  const generateBracket = (): IRound[] => {
    let result: IRound[];
    if (data?.type === "ROUND ROBIN") {
      if (!knockoutMatchesData?.length) {
        // For round robin: calculate teams as total_group * group_qualifier
        const totalTeams = (data.total_group || 0) * (data.group_qualifier || 0);
        if (totalTeams <= 0) return [];

        // Create teams based on group positions (Group A 1st, Group B 1st, etc.)
        const groupLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const positions = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

        const mockTeams = [];
        let teamIndex = 0;

        // Generate all teams first
        const allTeams = [];
        for (let groupIndex = 0; groupIndex < (data.total_group || 0); groupIndex++) {
          const groupLetter = groupLetters[groupIndex] || String.fromCharCode(65 + groupIndex);
          const currentGroup = tournamentGroups?.data?.find(group => group.group_name === `Group ${groupLetter}`);
          const groupUuid = currentGroup?.group_uuid || '';

          for (let positionIndex = 0; positionIndex < (data.group_qualifier || 0); positionIndex++) {
            const position = positions[positionIndex] || `${positionIndex + 1}th`;
            const teamName = `Group ${groupLetter} ${position}`;

            allTeams.push({
              ...TournamentDrawingUtils.createTBDTeam(),
              name: teamName,
              alias: `G${groupLetter}${positionIndex + 1}`,
              id: teamIndex + 1,
              groupIndex: groupIndex,
              positionIndex: positionIndex,
              team_group_uuid: groupUuid,
              team_group_position: positionIndex + 1,
              team_group_index: groupIndex,
            });
            teamIndex++;
          }

        }

        // Shuffle teams with priorities to avoid same group and same position in early rounds
        const shuffledTeams = shuffleTeamsWithPriorities(allTeams);

        // Use the utility functions to generate rounds
        const tournamentInfo = {
          startDate: new Date(data.start_date),
          endDate: new Date(data.end_date),
          courts: data.court ? [{ uuid: data.court_uuid || '', name: data.court }] : []
        };

        const firstRoundArray = TournamentDrawingUtils.generateFirstRound(shuffledTeams, tournamentInfo);

        const firstRound = firstRoundArray[0]; // Get the first round
        if (!firstRound) return [];
        const currentRounds = TournamentDrawingUtils.generateAllRounds(firstRound, tournamentInfo);
        const currentMatches = assignScheduleKnockout(convertRoundToMatches(currentRounds));

        setMatches(currentMatches);
        return convertMatchToRound(currentMatches);
      }
    }
    result = convertMatchToRound(convertTournamentMatchToMatch(knockoutMatchesData || []))

    // If matches exist, convert them to rounds
    return result;
  }

  const groupLabeling = (groupIndex: number, groupPosition: number) => {
    // Convert group index to letter (0 -> A, 1 -> B, etc.)
    const groupLetter = String.fromCharCode(65 + groupIndex); // 65 = 'A' in ASCII

    // Convert position to ordinal number (1 -> 1st, 2 -> 2nd, 3 -> 3rd, etc.)
    const getPositionOrdinal = (position: number) => {
      if (position === 1) return "1st";
      if (position === 2) return "2nd";
      if (position === 3) return "3rd";
      if (position === 4) return "4th";
      return `${position}th`; // fallback for other positions
    };

    return `Group ${groupLetter} ${getPositionOrdinal(groupPosition)}`;
  }


  useEffect(() => {
    if (!matchesData?.data?.length || !courtOptions?.data) return;

    if (!knockoutMatchesData?.length) {
      generateBracket()
    } else {
      const tempMatches = convertTournamentMatchToMatch(knockoutMatchesData || []);
      tempMatches.map((match) => {
        if (match.home_group_uuid) {
          match.teams[0].name = groupLabeling(match.home_group_index, match.home_group_position)
        }
        if (match.away_group_uuid) {
          match.teams[1].name = groupLabeling(match.away_group_index, match.away_group_position)
        }
        return match;
      })

      setMatches(sortMatchesDefault(tempMatches));
    }
  }, [matchesData, courtOptions]);

  const handleLockBracket = () => {

    if (isLoadingSubmit) {
      return;
    }

    const body: TournamentMatchesPayload = {
      tournament_uuid: tournamentUuid || "",
      matches: matches.map((match, i) => ({
        id: i,
        home_team_uuid: match.teams?.[0]?.uuid?.includes("seed-") ? (match.teams?.[0]?.uuid?.includes("seed-bye") ? "BYE" : "TBD") : match.teams?.[0]?.uuid || "TBD",
        away_team_uuid: match.teams?.[1]?.uuid?.includes("seed-") ? (match.teams?.[1]?.uuid?.includes("seed-bye") ? "BYE" : "TBD") : match.teams?.[1]?.uuid || "TBD",
        court_field_uuid: match.court_field_uuid || match.court_uuid,
        status: match.status || null,
        uuid: match.uuid?.includes("seed-") ? null : match.uuid,
        court: match.court_uuid || null,
        date: match.date ? match.date.toString() : null,
        time: match.time ? match.time.toString() : null,
        round: match.roundKey,
        tournament_group_index: match.groupKey, // groupkey index
        home_group_index: match.teams?.[0]?.team_group_index,
        home_group_position: match.teams?.[0]?.team_group_position,
        home_group_uuid: match.teams?.[0]?.team_group_uuid,
        away_group_index: match.teams?.[1]?.team_group_index,
        away_group_position: match.teams?.[1]?.team_group_position,
        away_group_uuid: match.teams?.[1]?.team_group_uuid,
        group_uuid: null,
        seed_index: match.seed_index,
        tournament_uuid: tournamentUuid,
      })),
    };
    console.log(body);

    actionUpdateMatches(body);

  }
  return (
    <div className="grid grid-cols-12 col-span-12 sm:col-span-12 gap-2">
      {/* Header */}
      <div className="col-span-12 flex items-start justify-between flex-col sm:flex-row sm:mb-2 gap-2 mb-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Bracket Drawing</h2>
          <p className="text-sm text-gray-500 mt-1">
            View and manage matches in knockout mode
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex flex-row w-full sm:justify-end gap-2">
            {!bracketIsLocked && <Tippy content="Regenerate Matches" className="h-full"><Button
              type="button"
              variant={"outline-primary"}
              size="lg"
              disabled={bracketIsLocked}
              className="w-fit h-10"
              aria-label="Regenerate Matches"
              onClick={() => {
                const newRounds = generateBracket();
                if (newRounds.length > 0) {
                  setMatches(convertRoundToMatches(newRounds))
                }
              }}
            >
              <Lucide icon={"RefreshCcw"} className="" />
            </Button></Tippy>}

            <Button
              type="button"
              variant={bracketIsLocked ? "primary" : "outline-primary"}
              size="lg"
              disabled={bracketIsLocked}
              className="sm:w-fit w-full h-10"
              onClick={() => {
                setModalAlert({
                  title: "Lock Bracket",
                  content: <>
                    <div className="mx-4 mb-4 px-5 py-2 flex flex-col border bg-gray-200 rounded-lg">
                      <ul className="list-disc">
                        <li>Group Winner position cannot be changed</li>
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
                  description: "Things to know before locking the bracket, the following rules will apply:",
                  buttons: [
                    {
                      label: "I Understand",
                      variant: "outline-primary",
                      onClick: handleLockBracket,
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
              <Lucide icon={bracketIsLocked ? "LockKeyhole" : "UnlockKeyhole"} className="mr-2" />
              Lock Bracket
            </Button>
          </div>
          <span className="text-sm text-gray-500 text-center sm:text-left">Once bracket is locked, you only allowed to edit match information.</span>
        </div>
      </div>
      <div className="col-span-12 sm:col-span-12 mt-6 box p-4 grid grid-cols-12 gap-2">
        <div className="col-span-12 h-fit overflow-x-scroll">
          <DraggableBracket
            rounds={convertMatchToRound(matches)}
            readOnly={bracketIsLocked}
            setRounds={(r) => {
              const convertedMatches = convertRoundToMatches(r)
              setMatches(convertedMatches)
            }}
            onSeedClick={(seed) => {
              setSelectedMatch(seed);
              setModalFormMatch(true);
              if (!seed.uuid.includes("seed-")) {
                navigate(paths.administrator.tournaments.match({ matchUuid: seed.uuid }).$)
              }
            }}
            key={`draggable-bracket-${data?.uuid || 'tournament'}`}
          />
        </div>
      </div>
      {(data?.rules && data?.rules?.length > 0) && <div className="col-span-12 sm:col-span-4 box p-4 ">
        <div className="grid grid-cols-12 ">
          <div className="col-span-12 h-fit">
            <h2 className=" font-medium">Rules</h2>
            <Divider className="mb-2" />
          </div>
          <div className="col-span-12 grid grid-cols-12 h-fit">
            {data?.rules?.map((rule, index) => (
              <div className="col-span-12 grid grid-cols-12 gap-2" key={index + "_rule"} >
                <div className="col-span-2 sm:col-span-1 text-right pr-2 ">
                  <Button type="button" size="sm" variant="outline-success" >
                    {index + 1}
                  </Button>
                </div>
                <div className="col-span-10 sm:col-span-11 flex items-center">
                  <div className="html-render" dangerouslySetInnerHTML={{ __html: decodeURIComponent(rule.description) }}></div>
                </div>
                <Divider className="col-span-12 mt-0 mb-2" />
              </div>
            ))}
          </div>
        </div>
      </div>}
      <Confirmation
        open={!!modalAlert?.open}
        onClose={() => setModalAlert(undefined)}
        icon={modalAlert?.icon || "Info"}
        content={modalAlert?.content}
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
          if (!match.groupKey && match.seed_index != undefined && match.seed_index >= 0 && match.uuid?.includes("seed-")) {

            const tempMatches = matches.map(m => {
              if (m.id === match.id && m.groupKey === match.groupKey) {
                m = {
                  ...m,
                  court: (courtOptions?.data?.name + " - " + match.court).length <= 24 ? courtOptions?.data?.name + " - " + match.court : match.court,
                  court_uuid: match.court_uuid,
                  court_field_uuid: match.court_field_uuid,
                  time: match.time,
                  data: match.date
                };
              }
              return m
            })
            setMatches(sortMatchesDefault(tempMatches));
          }
          if (!match.uuid?.includes('seed-') && match.seed_index != undefined && match.seed_index >= 0) {
            await actionUpdateSingleMatch({
              uuid: match.uuid,
              home_team_uuid: match.teams?.[0]?.uuid,
              away_team_uuid: match.teams?.[1]?.uuid,
              court_field_uuid: match.court_uuid,
              status: match.status,
              time: match.time?.toString(),
            })
          }

          setModalFormMatch(false)
          setTimeout(() => {
            setSelectedMatch(undefined);
          }, 1000);
        }}
      />
    </div>
  );
};