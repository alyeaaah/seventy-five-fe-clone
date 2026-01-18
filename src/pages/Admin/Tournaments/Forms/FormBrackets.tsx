import Button from "@/components/Base/Button";
import { useEffect, useState } from "react";
import { TournamentMatchesPayload, TournamentMatchPayload, TournamentTeams } from "../api/schema";
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
import { IRound, IMatch, ITeam, IGroup, TournamentRounds } from "@/components/TournamentDrawing/interfaces";
import { GroupStage, DraggableBracket, TournamentDrawingUtils } from "@/components/TournamentDrawing";
import { ModalMatch } from "./ModalMatch";
import { CourtsApiHooks } from "../../Courts/api";
import { faker } from "@faker-js/faker";
import { CheckCircle, ShieldAlert } from "lucide-react";
import { convertTournamentMatchToMatch, convertTournamentTeamToTeam } from "@/utils/drawing.util";
import { assignSchedule } from "@/components/TournamentDrawing/scheduler";
import { GroupMatchesModal } from "../Components/GroupMatchesModal";
const {
  calculateTournamentRounds,
  convertMatchToRound,
  generateGroups,
  generateAllRounds,
  generateFirstRound,
  validateNoDuplicateTeamsInRounds,
  setupGroupKnockoutMatch,
  generateGroupMatches,
  getAllKnockoutMatches,
} = TournamentDrawingUtils;


interface Props {
  tournament?: string;
}

export const TournamentFormBrackets = (props: Props) => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.administrator.tournaments.new.players);
  const { id: tournamentUuid } = queryParams;
  const { showNotification } = useToast();
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const [modalGroupMatches, setModalGroupMatches] = useState<number | undefined>();
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [matches, setMatches] = useState<IMatch[]>([]);

  const [selectedMatch, setSelectedMatch] = useState<IMatch | undefined>();
  const [modalFormMatch, setModalFormMatch] = useState(false);
  const [roundValidation, setRoundValidation] = useState({ valid: false, message: "" });
  const [roundInfo, setRoundInfo] = useState<TournamentRounds>({ byes: 0, rounds: 0, teams: 0, nextPowerOf2: 0 });
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
  })

  // Fetch Tournament Teams
  const { data: teamsData } = TournamentsApiHooks.useGetTournamentTeams({
    params: {
      uuid: tournamentUuid || 0
    },
    refetchOnMount: true,
  }, {
    enabled: !!tournamentUuid && !!data?.data && !!courtOptions,
    onSuccess: (data) => {
      // setupRound(data.data);
    },
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
  const { data: matchesData, isFetched: isFetchedMatches } = TournamentsApiHooks.useGetTournamentMatches({
    queries: {
      tournament_uuid: tournamentUuid || ""
    }
  }, {
    enabled: !!tournamentUuid && !!data?.data && !!teamsData?.data?.length,
  });

  // Handle Fetched Tournament Matches
  useEffect(() => {
    if (!matchesData?.data?.length && teamsData?.data?.length) {
      setupRound(teamsData?.data);
    } else if (matchesData?.data?.length && teamsData?.data?.length) {
      const mm = convertTournamentMatchToMatch(matchesData.data.map(m => ({
        ...m,
        roundKey: m.round ? m.round - 1 : undefined,
        round: m.round ? m.round - 1 : undefined,
      })))
      console.log(mm, "MATCHES");

      const allRounds = convertMatchToRound(mm);
      console.log(allRounds, "ALL ROUNDS");

      setMatches(mm);
    }
  }, [matchesData, data, teamsData]);

  useEffect(() => {
    console.log(matches, "MATCHES UPDATE");
  }, [matches]);
  const setupTeamToRound = (teams: ITeam[]): IRound[] => {
    const calculateRound = calculateTournamentRounds(teams?.length * 2)
    setRoundInfo(calculateRound);

    const firstRound = generateFirstRound(teams, {
      startDate: data?.data?.start_date ? new Date(data?.data?.start_date) : new Date(),
      endDate: data?.data?.end_date ? new Date(data?.data?.end_date) : new Date(),
      courts: courtOptions?.data?.fields?.map(c => ({
        name: c.name,
        uuid: c.uuid
      })) || []
    });

    const allRounds = generateAllRounds(firstRound[0], {
      startDate: data?.data?.start_date ? new Date(data?.data?.start_date) : new Date(),
      endDate: data?.data?.end_date ? new Date(data?.data?.end_date) : new Date(),
      courts: courtOptions?.data?.fields?.map(c => ({
        name: c.name,
        uuid: c.uuid
      })) || []
    });
    const validation = validateNoDuplicateTeamsInRounds(allRounds);
    setRoundValidation(validation);
    return allRounds;
  }

  const setupRound = (teams: TournamentTeams[]) => {
    // if type is ROUND ROBIN, then generate groups first
    if (data?.data?.type === "ROUND ROBIN") {
      // setting up group with teams
      const groups = generateGroups(tempTeam, data?.data.total_group || 0);
      // generating matches for group stage
      setGroups(groups);

      // generate round-robin matches
      generateRoundRobinMatches(groups);
    } else {
      // if type is KNOCKOUT, then insert teams directly
      const allRounds = setupTeamToRound(convertTournamentTeamToTeam(teams));
      const allKnockoutMatches: IMatch[] = allRounds.map(r => r.seeds.map(m => ({
        ...m,
        roundKey: r.key,
      }))).flat();
      const matchesSchedule = assignSchedule({
        matches: allKnockoutMatches, info: {
          startDate: data?.data?.start_date ? new Date(data?.data?.start_date) : new Date(),
          endDate: data?.data?.end_date ? new Date(data?.data?.end_date) : new Date(),
          courts: courtOptions?.data?.fields?.map(c => ({
            name: c.name,
            uuid: c.uuid
          })) || []
        }
      })
      setMatches(matchesSchedule);
    }
  };

  const generateRoundRobinMatches = (groups: IGroup[]) => {
    // This function will be implemented to generate round-robin matches
    // based on the current groups and tournament settings
    const generatedMatches = generateGroupMatches(groups, {
      startDate: data?.data?.start_date ? new Date(data?.data?.start_date) : new Date(),
      endDate: data?.data?.end_date ? new Date(data?.data?.end_date) : new Date(),
      courts: courtOptions?.data?.fields?.map(c => ({
        name: c.name,
        uuid: c.uuid
      })) || []
    });

    // setup knockout teams here based on group stage
    const teamsKnockout = setupGroupKnockoutMatch(groups.length || 0);
    // generating matches bracket each round
    const allRounds = setupTeamToRound(teamsKnockout);
    // generating all  matches for knockout stage
    const allKnockoutMatches: IMatch[] = allRounds.map(r => r.seeds.map(m => ({
      ...m,
      roundKey: r.key,
    }))).flat();
    // assign schedule for all matches
    const matchesSchedule = assignSchedule({
      matches: generatedMatches.concat(allKnockoutMatches), info: {
        startDate: data?.data?.start_date ? new Date(data?.data?.start_date) : new Date(),
        endDate: data?.data?.end_date ? new Date(data?.data?.end_date) : new Date(),
        courts: courtOptions?.data?.fields?.map(c => ({
          name: c.name,
          uuid: c.uuid
        })) || []
      }
    })
    // setting up matches
    setMatches(matchesSchedule);
  }

  const { mutate: actionUpdateMatches } = TournamentsApiHooks.useCreateTournamentMatches(
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
        navigate(paths.administrator.tournaments.new.done({ id: tournamentUuid }).$);
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
    const body: TournamentMatchesPayload = {
      tournament_uuid: tournamentUuid,
      matches: []
    };

    groupMatches.forEach((match, idx) => {
      const matchPayload: TournamentMatchPayload = {
        id: !isNaN(Number(match.id)) ? +match.id : Number(`${data?.data?.id}${idx}`),
        uuid: match.uuid ? match.uuid : faker.string.uuid(),
        round: match.roundKey,
        group: match.groupKey,
        seed_index: match.seed_index,
        home_team_uuid: !["TBD", 'BYE'].includes(match.teams?.[0]?.alias || "") ? match.teams?.[0]?.uuid || "TBD" : match.teams?.[0]?.alias || "TBD",
        away_team_uuid: !["TBD", 'BYE'].includes(match.teams?.[1]?.alias || "") ? match.teams?.[1]?.uuid || "TBD" : match.teams?.[1]?.alias || "TBD",
        home_group_index: match.teams?.[0]?.group_index !== undefined ? match.teams?.[0]?.group_index : null,
        home_group_position: match.teams?.[0]?.group_position !== undefined ? match.teams?.[0]?.group_position : null,
        away_group_index: match.teams?.[1]?.group_index !== undefined ? match.teams?.[1]?.group_index : null,
        away_group_position: match.teams?.[1]?.group_position !== undefined ? match.teams?.[1]?.group_position : null,
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
    }, {
      onSuccess: () => {
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
      },
      onError: (e: any) => {
        showNotification({
          duration: 3000,
          text: e?.message || "Failed to save group stage",
          icon: "WashingMachine",
          variant: "danger",
        });
      },
    });
  };

  const onSubmit = () => {
    const body: TournamentMatchesPayload = {
      tournament_uuid: tournamentUuid,
      matches: []
    };
    matches.map((match, idx) => {
      console.log(match, "SUBMITMATCH");

      const matchPayload: TournamentMatchPayload = {
        id: !isNaN(Number(match.id)) ? +match.id : Number(`${data?.data?.id}${idx}`),
        uuid: match.uuid ? match.uuid : faker.string.uuid(),
        round: match.roundKey,
        group: match.groupKey,
        seed_index: match.seed_index,
        home_team_uuid: !["TBD", 'BYE'].includes(match.teams?.[0]?.alias || "") ? match.teams?.[0]?.uuid : match.teams?.[0]?.alias || "",
        away_team_uuid: !["TBD", 'BYE'].includes(match.teams?.[1]?.alias || "") ? match.teams?.[1]?.uuid : match.teams?.[1]?.alias || "",
        home_group_index: match.teams?.[0]?.group_index !== undefined ? match.teams?.[0]?.group_index : null,
        home_group_position: match.teams?.[0]?.group_position !== undefined ? match.teams?.[0]?.group_position : null,
        away_group_index: match.teams?.[1]?.group_index !== undefined ? match.teams?.[1]?.group_index : null,
        away_group_position: match.teams?.[1]?.group_position !== undefined ? match.teams?.[1]?.group_position : null,
        court_field_uuid: match.court_field_uuid || "",
        status: match.status,
        time: match.time,
        updatedAt: match.updatedAt,
        court: match.court,
        tournament_uuid: tournamentUuid,
        home_team_score: match.home_team_score,
        away_team_score: match.away_team_score
      }
      console.log(matchPayload, "SUBMITMATCH matchPayload");

      body.matches.push(matchPayload)
    })

    console.log(body.matches.filter(m => m.round !== undefined).map(m => ({ ...m, time: new Date(m.time || "") })), "BODY ROUND");
    console.log(body.matches.filter(m => m.group !== undefined).map(m => ({ ...m, time: new Date(m.time || "") })), "BODY GROUP");
    actionUpdateMatches({
      matches: body.matches,
      tournament_uuid: tournamentUuid,
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsList"),
        });
        queryClient.invalidateQueries({
          queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsDetail"),
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
      <TournamentSteps step={data?.data?.type === "ROUND ROBIN" ? 5 : 4} tournamentUuid={tournamentUuid} showGroup={data?.data?.type === "ROUND ROBIN"} tournamentType={data?.data?.type ?? undefined} />
      <div className="grid grid-cols-12 gap-4 ">
        {data?.data?.type === "ROUND ROBIN" && (
          <div className="col-span-12 lg:col-span-4 box h-fit p-4 grid grid-cols-12 gap-2">
            <div className="col-span-12">
              <div className="flex flex-row items-center justify-between mb-2">
                <h2 className="font-medium">Group Stage</h2>
              </div>
              <Divider className="mb-0 " />
              <GroupStage
                groups={groups || []}
                className="w-full"
                readOnly={true}
                key={"groupStage" + groups.length}
                onClickGroup={(group) => {
                  setModalGroupMatches(group.groupKey)
                }}
              />
            </div>
          </div>
        )}
        <div className={`col-span-12 ${data?.data?.type !== "ROUND ROBIN" ? "lg:col-span-9" : "lg:col-span-8"} box h-fit p-4 grid grid-cols-12 gap-2`}>
          <div className="col-span-12">
            <h2 className=" font-medium">Brackets</h2>
            <Divider className="mb-0 " />
          </div>
          <div className="col-span-12">
            <DraggableBracket
              rounds={convertMatchToRound(matches.filter(m => m.groupKey === undefined))}
              setRounds={(r) => {
                const validation = validateNoDuplicateTeamsInRounds(r);
                console.log(r, "seedindex");

                if (!!validation.valid) {
                  const roundMatches = getAllKnockoutMatches(r).sort((a, b) => (a.roundKey || 0) - (b.roundKey || 0));
                  setMatches(matches.filter(m => m.groupKey !== undefined).concat(roundMatches));
                }
                setRoundValidation(validation);

              }}
              onSeedClick={(seed, index, round) => {
                setSelectedMatch(seed);
                setModalFormMatch(true);
              }}
              key={JSON.stringify(convertMatchToRound(matches.filter(m => m.groupKey === undefined)))}
            />
          </div>
          <Divider className="mb-2 mt-2 col-span-12" />
          <div className="col-span-12 flex items-center gap-2">
            {roundValidation.valid ? (
              <CheckCircle className="text-green-500" />
            ) : (
              <ShieldAlert className="text-red-500" />
            )}
            <div className={roundValidation.valid ? "text-green-500" : "text-red-500"}>{roundValidation.message}</div>
          </div>
        </div>
        {data?.data?.type !== "ROUND ROBIN" && (
          <div className="col-span-12 sm:col-span-3 box h-fit p-4 grid grid-cols-12  gap-2">
            <div className="col-span-12">
              <h2 className=" font-medium">Information</h2>
              <Divider className="mb-0 mt-1" />
            </div>
            <div className="col-span-4">
              Total Round
            </div>
            <div className="col-span-8">
              : {roundInfo?.rounds}
            </div>
            <div className="col-span-4">
              Byes
            </div>
            <div className="col-span-8">
              : {roundInfo?.byes}
            </div>
            <div className="col-span-4">
              Total Team
            </div>
            <div className="col-span-8">
              : {roundInfo?.teams}
            </div>
          </div>
        )}
      </div >
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
              disabled={!roundValidation.valid}
              onClick={onSubmit}
            >
              <Lucide icon="Save" className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>
      <Confirmation
        open={!!modalAlert?.open}
        onClose={() => setModalAlert(undefined)}
        icon={modalAlert?.icon || "Info"}
        title={modalAlert?.title || ""}
        description={modalAlert?.description || ""}
        refId={modalAlert?.refId}
        buttons={modalAlert?.buttons}
      />
      <GroupMatchesModal
        isOpen={modalGroupMatches !== undefined}
        key={JSON.stringify(modalGroupMatches !== undefined ? matches.filter(m => m.groupKey === modalGroupMatches) : [])}
        onClose={() => setModalGroupMatches(undefined)}
        matches={modalGroupMatches !== undefined ? matches.filter(m => m.groupKey === modalGroupMatches) : []}
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
          } else if (match.roundKey !== undefined && match.roundKey >= 0) {
            setMatches((prev) => {
              return prev.map(m => {
                if (m.id === match.id && m.roundKey === match.roundKey) {
                  m = {
                    ...m,
                    court: match.court,
                    court_uuid: match.court_uuid,
                    time: match.time
                  };
                }
                return m
              })
            })
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
