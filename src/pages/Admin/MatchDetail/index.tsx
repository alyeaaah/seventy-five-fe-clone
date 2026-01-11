import Lucide from "@/components/Base/Lucide";
import Button, { Variant } from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import { Fragment, useRef, useState } from "react";

import moment from "moment";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { useToast } from "@/components/Toast/ToastContext";
import { useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
import Image from "@/components/Image";
import { MatchDetailApiHooks } from "./api";
import { useRouteParams } from "typesafe-routes/react-router";
import { TournamentsApiHooks } from "../Tournaments/api";
import { Divider, Progress, Skeleton } from "antd";
import { useAddScore, useAddScores, useMatchScore, useUpdateScore } from "./api/firestore";
import { MatchScoreFirestore, matchStatusEnum, MatchTeam, ScoreUpdatePayload } from "./api/schema";
import { gameScoreValue } from "@/utils/faker";
import YouTube from "react-youtube";
import { getCurrentMatch } from "@/utils/helper";
import { PointConfigurationsApiHooks } from "../PointConfig/api";
import { useDebounceFn } from "ahooks";
import { queryClient } from "@/utils/react-query";
import { IconVS } from "@/assets/images/icons";
import { CustomSkeleton } from "@/components/CustomSkeleton";

export const MatchDetail = () => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.administrator.tournaments.match);
  const { matchUuid } = queryParams;
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const [modalNotes, setModalNotes] = useState("");
  const { showNotification } = useToast();
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [youtubePreviewUrl, setYoutubePreviewUrl] = useState("")
  const { data } = MatchDetailApiHooks.useGetMatchDetail({
    params: {
      uuid: matchUuid
    },
  }, {
    onSuccess: () => {
    },
    retry: false
  });
  const { data: tournamentInfo } = TournamentsApiHooks.useGetTournamentsDetail({
    params: {
      uuid: data?.data?.tournament_uuid || ""
    },
  }, {
    enabled: !!data?.data?.tournament_uuid
  });

  const { data: detailPointConfig } = PointConfigurationsApiHooks.useGetPointConfigurationsDetail(
    {
      params: {
        uuid: tournamentInfo?.data?.point_config_uuid || 0
      }
    }, {
    enabled: (!!tournamentInfo?.data?.point_config_uuid)
  });

  const { mutate: updateScoreApi } = MatchDetailApiHooks.useUpdateMatchScoreApi({
    params: {
      uuid: matchUuid
    },
  }, {
    retry: false
  });
  const { mutate: updateVideoApi } = MatchDetailApiHooks.useUpdateMatchVideoApi({
    params: {
      uuid: matchUuid
    }
  });
  const { mutate: updateStatusApi } = MatchDetailApiHooks.useUpdateMatchStatusApi({
    params: {
      uuid: matchUuid
    }
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MatchDetailApiHooks.getKeyByAlias("getMatchDetail"),
      });
    }
  });
  const { run: updateScoreUseDebounce } = useDebounceFn(
    (payload: ScoreUpdatePayload) => {
      updateScoreApi(payload);
    },
    {
      wait: 1000
    }
  );

  const { data: scores, unsubscribe: unsubscribeFirestore, isLoading: isLoadingScore, fetchScores } = useMatchScore(
    matchUuid,
    () => { }
  );
  const handlePopState = useRef((event: PopStateEvent) => {
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
    event.preventDefault();
  });
  window.addEventListener("popstate", handlePopState.current);
  const currentScore = getCurrentMatch(scores || []);
  const { mutate: addScore } = useAddScore();
  const { mutate: addMultipleScores } = useAddScores();
  const { mutate: updateScoreFirebase } = useUpdateScore();
  const updateScore = (matchUuid: string, team: "home" | "away", score: "UP" | "DOWN") => {
    if (
      !data ||
      !!data?.data?.winner_team_uuid ||
      ["TBD", "BYE"].includes(data?.data?.home_team_uuid || "") ||
      ["TBD", "BYE"].includes(data?.data?.away_team_uuid || "")
    ) {
      return;
    }

    let baseData: MatchScoreFirestore = {
      match_uuid: matchUuid,
      tournament_uuid: data?.data?.tournament_uuid || "",
      set: 1,
      game_score_home: "0",
      game_score_away: "0",
      last_updated_at: new Date().toISOString(),
      with_ad: data?.data?.with_ad || false,
      prev: {
        set_score_home: "0",
        set_score_away: "0"
      }
    }
    const tieBreak = currentScore?.prev?.set_score_away == 5 && currentScore?.prev?.set_score_home == 5;

    if (!currentScore) {
      addScore({
        newMatchData: {
          ...baseData,
          game_score_home: team == "home" ? "15" : "0",
          game_score_away: team == "away" ? "15" : "0",
        }
      })
      return;
    }

    let updatedScore: MatchScoreFirestore = {
      ...currentScore,
      with_ad: data?.data?.with_ad || false,
    };
    const { game_score_home, game_score_away, with_ad } = currentScore;
    if ([game_score_home, game_score_away].includes("WIN")) {
      return;
    }

    if (tieBreak) {
      if (team == "home") {
        // update tie break home team
        if (score == "UP") {
          // check if the game score is above 6 and diff 2 point with the away team game score
          const nextHomeScore = Number(game_score_home) + 1;
          if (nextHomeScore > 6 && (nextHomeScore - Number(game_score_away)) > 1) {
            // update the game score
            updatedScore.game_score_home = "WIN";
          } else {
            updatedScore.game_score_home = nextHomeScore.toString();
          }
        } else {
          const nextHomeScore = Number(game_score_home) - 1;
          if (Number(game_score_away) > 6 && (Number(game_score_away) - nextHomeScore) > 1) {
            // check if the game score is above 6 and diff 2 point with the away team game score
            updatedScore.game_score_away = "WIN";
            updatedScore.game_score_home = nextHomeScore.toString();
          }
          else if (Number(game_score_home) > 0) {
            // check if the game score is 0
            updatedScore.game_score_home = (Number(game_score_home) - 1).toString();
          }
        }
      } else {
        // update tie break away team
        if (score == "UP") {
          // check if the game score is above 6 and diff 2 point with the home team game score      
          const nextAwayScore = Number(game_score_away) + 1;
          if (nextAwayScore > 6 && (nextAwayScore - Number(game_score_home)) > 1) {
            // update the game score
            updatedScore.game_score_away = "WIN";
          } else {
            updatedScore.game_score_away = (Number(game_score_away) + 1).toString();
          }
        } else {
          const nextAwayScore = Number(game_score_away) - 1;
          if (Number(game_score_home) > 6 && (Number(game_score_home) - nextAwayScore) > 1) {
            // check if the game score is above 6 and diff 2 point with the away team game score
            updatedScore.game_score_home = "WIN";
            updatedScore.game_score_away = nextAwayScore.toString();
          }
          else if (Number(game_score_away) > 0) {
            // check if the game score is 0
            updatedScore.game_score_away = (Number(game_score_away) - 1).toString();
          }
        }
      }
    }

    else {
      // non tie break
      if (team == "home") {
        // update home team score based on score up or down
        if (score == "UP") {
          // increase home score
          if (game_score_home == "40") {
            if (with_ad) {
              if (game_score_away == "40") {
                updatedScore.game_score_home = "AD";
              } else if (game_score_away == "AD") {
                updatedScore.game_score_home = "40";
                updatedScore.game_score_away = "40";
              } else {
                updatedScore.game_score_home = "WIN";
              }
            } else {
              updatedScore.game_score_home = "WIN";
            }
          } else {
            const gameScoreIndex = gameScoreValue.findIndex(gs => gs == game_score_home) + 1;
            updatedScore.game_score_home = gameScoreValue[gameScoreIndex];
          }
        } else {
          // decrease home score
          // check if the game score is 0
          if (!isNaN(Number(game_score_home)) && Number(game_score_home) > 0) {
            const gameScoreIndex = gameScoreValue.findIndex(gs => gs == game_score_home) - 1
            updatedScore.game_score_home = gameScoreValue[gameScoreIndex];
          } else if (game_score_home == "AD" || game_score_home == "WIN") {
            updatedScore.game_score_home = "40";
          }
        }
      } else {
        if (score == "UP") {
          // increase away score
          if (game_score_away == "40") {
            if (with_ad) {
              if (game_score_home == "40") {
                updatedScore.game_score_away = "AD";
              } else if (game_score_home == "AD") {
                updatedScore.game_score_away = "40";
                updatedScore.game_score_home = "40";
              } else {
                updatedScore.game_score_away = "WIN";
              }
            } else {
              updatedScore.game_score_away = "WIN";
            }
          } else {
            const gameScoreIndex = gameScoreValue.findIndex(gs => gs == game_score_away) + 1;
            updatedScore.game_score_away = gameScoreValue[gameScoreIndex];
          }
        } else {
          // decrease away score
          // check if the game score is 0
          if (!isNaN(Number(game_score_away)) && Number(game_score_away) > 0) {
            const gameScoreIndex = gameScoreValue.findIndex(gs => gs == game_score_away) - 1
            updatedScore.game_score_away = gameScoreValue[gameScoreIndex];
          } else if (game_score_away == "AD" || game_score_away == "WIN") {
            updatedScore.game_score_away = "40";
          }
        }
      }
    }

    if (currentScore.refId) {
      updateScoreFirebase({
        refId: currentScore.refId, newMatchData: {
          ...updatedScore,
          game_score_away:
            !tieBreak ?
              (updatedScore.game_score_away == "WIN" ?
                (updatedScore.game_score_home == "40" ? "AD" : "40") :
                updatedScore.game_score_away) :
              (updatedScore.game_score_away == "WIN" ?
                (Number(updatedScore.game_score_home) + 2).toString() :
                updatedScore.game_score_away),
          game_score_home:
            !tieBreak ?
              (updatedScore.game_score_home == "WIN" ?
                (updatedScore.game_score_away == "40" ? "AD" : "40") :
                updatedScore.game_score_home) :
              (updatedScore.game_score_home == "WIN" ?
                (Number(updatedScore.game_score_away) + 2).toString() :
                updatedScore.game_score_home),
          last_updated_at: new Date().toISOString(),
        }
      });

      if (updatedScore.game_score_home != "WIN" && updatedScore.game_score_away != "WIN") {

        setTimeout(() => {

          updateScoreUseDebounce({
            home_team_score: updatedScore.prev.set_score_home,
            away_team_score: updatedScore.prev.set_score_away,
            game_scores: scores?.map(score => (score.set == updatedScore.set ? {
              set: updatedScore.set,
              game_score_home: updatedScore.game_score_home,
              game_score_away: updatedScore.game_score_away
            } :
              {
                set: score.set,
                game_score_home: score.game_score_home,
                game_score_away: score.game_score_away
              }))
          })
        }, 300);
      }
      if ((updatedScore.game_score_home == "WIN" && Number(updatedScore.prev?.set_score_home || "0") < 5) || (updatedScore.game_score_away == "WIN" && Number(updatedScore.prev?.set_score_away || "0") < 5)) {
        const matchScore = {
          ...baseData,
          set: currentScore?.set + 1,
          last_updated_at: new Date().toISOString(),
          prev: {
            set_score_home: updatedScore.game_score_home == "WIN" ? Number(updatedScore.prev?.set_score_home || "") + 1 : updatedScore.prev?.set_score_home,
            set_score_away: updatedScore.game_score_away == "WIN" ? Number(updatedScore.prev?.set_score_away || "") + 1 : updatedScore.prev?.set_score_away
          }
        }
        addScore({
          newMatchData: matchScore
        });
        // updateScoreApi
        setTimeout(() => {
          updateScoreUseDebounce({
            home_team_score: matchScore.prev.set_score_home,
            away_team_score: matchScore.prev.set_score_away,
            game_scores: scores?.map(score => ({
              set: score.set,
              game_score_home: score.game_score_home,
              game_score_away: score.game_score_away
            }))
          })
        }, 300);
        queryClient.invalidateQueries({
          queryKey: MatchDetailApiHooks.getKeyByAlias("getMatchDetail"),
        });

        queryClient.invalidateQueries({
          queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentMatches"),
        });
      } else if ((updatedScore.game_score_home == "WIN" && Number(updatedScore.prev?.set_score_home || "0") >= 5) || (updatedScore.game_score_away == "WIN" && Number(updatedScore.prev?.set_score_away || "0") >= 5)) {
        const matchScore = {
          ...updatedScore,
          game_score_away: updatedScore.game_score_away == "WIN" ? updatedScore.game_score_away : "LOSE",
          game_score_home: updatedScore.game_score_home == "WIN" ? updatedScore.game_score_home : "LOSE",
          set: currentScore?.set + 1,
          last_updated_at: new Date().toISOString(),
          prev: {
            set_score_home: updatedScore.game_score_home == "WIN" ? Number(updatedScore.prev?.set_score_home || "") + 1 : updatedScore.prev?.set_score_home,
            set_score_away: updatedScore.game_score_away == "WIN" ? Number(updatedScore.prev?.set_score_away || "") + 1 : updatedScore.prev?.set_score_away
          }
        }
        addScore({
          newMatchData: matchScore
        });
        setTimeout(() => {
          updateScoreUseDebounce({
            home_team_score: matchScore.prev.set_score_home,
            away_team_score: matchScore.prev.set_score_away,
            game_scores: scores?.map(score => ({
              set: score.set,
              game_score_home: score.game_score_home,
              game_score_away: score.game_score_away
            }))
          })

          unsubscribeFirestore();
        }, 300);
        queryClient.invalidateQueries({
          queryKey: MatchDetailApiHooks.getKeyByAlias("getMatchDetail"),
        });
        queryClient.invalidateQueries({
          queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentMatches"),
        });
      }
    }
  }
  const generateAbandonedScore = (
    { matchUuid, team }:
      { matchUuid: string, team: "home" | "away", }): MatchScoreFirestore[] => {
    const currentMatchScore = {
      ...currentScore,
      game_score_away: team === "home" ? (currentScore?.game_score_home == "40" ? "AD" : "40") : currentScore?.game_score_away,
      game_score_home: team === "away" ? (currentScore?.game_score_away == "40" ? "AD" : "40") : currentScore?.game_score_home,
      set: (currentScore?.set || 0)
    };
    const currentSetScore = {
      home: team === "away" ? +(currentMatchScore?.prev?.set_score_home || 0) + 1 : +(currentScore?.prev.set_score_home || 0),
      away: team === "home" ? +(currentMatchScore?.prev?.set_score_away || 0) + 1 : +(currentScore?.prev.set_score_away || 0)
    }
    let usingTieBreak = false;
    if ((team === "away" && currentSetScore.away === 5) || (team === "home" && currentSetScore.home === 5)) {
      usingTieBreak = true;
    }
    const restSetScore: MatchScoreFirestore[] = [currentMatchScore as MatchScoreFirestore];
    let tempSetScore = 0;
    if (team === "away") {
      // loop from current set score to 5
      tempSetScore = currentSetScore.home;
      let setCounter = currentMatchScore?.set || 0;
      for (let i = currentSetScore.home; i < (!usingTieBreak ? 6 : 5); i++) {
        restSetScore.push(
          {
            ...currentMatchScore as MatchScoreFirestore,
            game_score_home: "40",
            game_score_away: "0",
            set: setCounter + 1,
            last_updated_at: new Date().toISOString(),
            with_ad: false,
            prev: {
              set_score_home: tempSetScore,
              set_score_away: currentSetScore.away
            }
          }
        );
        setCounter++;
        tempSetScore++;
      }
    }
    else if (team === "home") {
      // loop from current set score to 5
      tempSetScore = currentSetScore.away;
      let setCounter = currentScore?.set || 0;
      for (let i = currentSetScore.away; i < (!usingTieBreak ? 6 : 5); i++) {
        setCounter++;
        restSetScore.push(
          {
            ...currentMatchScore as MatchScoreFirestore,
            game_score_home: "0",
            game_score_away: "40",
            set: setCounter,
            last_updated_at: new Date().toISOString(),
            with_ad: false,
            prev: {
              set_score_home: currentSetScore.home,
              set_score_away: tempSetScore
            }
          }
        );
        tempSetScore++;
      }
    }
    // console.log("RESTSETSCORE BEFORE TIEBREAK", JSON.parse(JSON.stringify(restSetScore)));

    // if using tie break, add the last game score
    if (usingTieBreak) {
      const lastGame = restSetScore[restSetScore.length - 1];
      restSetScore.push(
        {
          ...lastGame,
          game_score_home: team === "away" ? "7" : "0",
          game_score_away: team === "home" ? "7" : "0",
          set: lastGame.set + 1,
          last_updated_at: new Date().toISOString(),
          prev: {
            set_score_home: team === "away" ? currentSetScore.home : currentSetScore.home,
            set_score_away: team === "home" ? currentSetScore.away : currentSetScore.away,
          }
        }
      );
      tempSetScore++;
    }
    // console.log("RESTSETSCORE BEFORE FINALIZE", JSON.parse(JSON.stringify(restSetScore)));

    // finalize score to determine winner
    const lastGame = restSetScore[restSetScore.length - 1];
    restSetScore.push(
      {
        ...lastGame,
        game_score_home: team === "away" ? "WIN" : "LOSE",
        game_score_away: team === "home" ? "WIN" : "LOSE",
        set: lastGame.set + 1,
        last_updated_at: new Date().toISOString(),
        prev: {
          set_score_home: team === "away" ? +lastGame.prev.set_score_home + 1 : lastGame.prev.set_score_home,
          set_score_away: team === "home" ? +lastGame.prev.set_score_away + 1 : lastGame.prev.set_score_away,
        }
      }
    );
    // console.log("RESTSETSCORE", JSON.parse(JSON.stringify(restSetScore)));

    return restSetScore;
  }
  const setRetirement = (
    { matchUuid, team, player_uuid, notes, retirement }:
      { matchUuid: string, team: "home" | "away", player_uuid?: string, notes?: string, retirement?: "INJURY" | "NO_SHOW" }) => {
    const restScores = generateAbandonedScore({ matchUuid, team });
    // return;
    if (restScores.length === 0) {
      showNotification({
        text: "No scores to add",
        duration: 3000,
      });
      return;
    }
    const firstScore = restScores[0];
    updateScoreFirebase({
      refId: currentScore?.refId || "",
      newMatchData: firstScore
    }, {
      onError: (error) => {
        console.log("ERROR", error);
        showNotification({
          text: "Failed to update score",
          duration: 3000,
        });
      }
    })
    // remove firstScore from restScores
    restScores.shift();
    // add score to firestore from restScores synchronously, use await if needed
    addMultipleScores({
      newMatchDataArray: restScores,
    }, {
      onSuccess: () => {
        const lastSetScore = restScores[restScores.length - 1].prev;
        fetchScores().then(fetchedScores => {
          fetchedScores = fetchedScores.sort((a, b) => a.set - b.set);
          updateScoreUseDebounce({
            home_team_score: lastSetScore.set_score_home,
            away_team_score: lastSetScore.set_score_away,
            // remove last index of scores
            game_scores: fetchedScores?.slice(0, -1).map(score =>
            ({
              set: score.set,
              game_score_home: score.game_score_home,
              game_score_away: score.game_score_away
            })) || [],
            notes,
            status: retirement || (player_uuid ? "OTHERS" : undefined),
            player_uuid
          });
        });
      }
    });

  }
  const openModalNoShow = (team: MatchTeam, matchUuid: string, pos: "home" | "away") => {
    setModalAlert({
      title: "Are you sure?",
      description: `${team.name} (${team.alias}) players is not showing up. The match will be declared as a win for the other team and can't be undone.`,
      icon: "Drama",
      open: true,
      onClose: () => {
        setModalAlert(undefined);
      },
      buttons: [
        ...(team.players.map((player, index) => ({
          label: player?.name || "",
          onClick: () => {
            setRetirement({
              matchUuid,
              team: pos,
              player_uuid: player.uuid,
              retirement: "NO_SHOW"
            });
            setModalAlert(undefined);
          },
          variant: "danger" as Variant,
          autoFocus: false
        }))),
        {
          label: "Both are No Show",
          onClick: () => {
            setRetirement({
              matchUuid,
              team: pos,
              player_uuid: `BOTH_${pos.toUpperCase()}`,
              retirement: "NO_SHOW"
            });
            setModalAlert(undefined);
          },
          variant: "pending"
        },
        {
          label: "Cancel",
          autoFocus: true,
          onClick: () => setModalAlert(undefined),
          variant: "secondary"
        },
      ]
    });
  }
  const openModalRetirement = (team: MatchTeam, matchUuid: string, pos: "home" | "away") => {
    setModalAlert({
      title: "Retire",
      description: `Are you sure you want to retire ${team.name} ${team.alias}?\n This action will end the match and can't be undone`,
      buttons: [
        {
          label: "Retire",
          onClick: (notes) => {
            setRetirement({
              matchUuid,
              team: pos,
              notes,
              player_uuid: `BOTH_${pos.toUpperCase()}`
            });
            setModalAlert(undefined);
          },
          variant: "danger",
          autoFocus: false
        },
        {
          label: "Retire with Injury",
          onClick: (notes) => {
            setModalAlert((prev) => ({
              ...(prev as AlertProps),
              open: false,
            }));
            setTimeout(() => {
              openModalRetirePlayer(team, matchUuid, pos, notes);
            }, 200);
          },
          variant: "danger",
          autoFocus: false
        },
        {
          label: "Cancel",
          onClick: () => setModalAlert(undefined),
          variant: "secondary"
        }
      ],
      icon: "Ghost",
      open: true,
      onClose: () => {
        setModalAlert(undefined);
      },
      notes: {
        placeholder: "Enter reason",
        label: "Reason",
        value: ""
      },
    });
  }
  const openModalRetirePlayer = (team: MatchTeam, matchUuid: string, pos: "home" | "away", notes?: string) => {
    setModalAlert({
      title: "Retire with Injury",
      description: `Choose player to retire`,
      buttons: [
        ...team.players.map((player) => ({
          label: player.name,
          onClick: () => {
            setRetirement({
              matchUuid,
              team: pos,
              player_uuid: player.uuid,
              notes,
              retirement: "INJURY"
            });
            setModalAlert(undefined);
          },
          variant: "danger" as Variant,
          autoFocus: false
        })),
        {
          label: "Both Players",
          onClick: () => {
            setRetirement({
              matchUuid,
              team: pos,
              player_uuid: `BOTH_${pos.toUpperCase()}`,
              notes,
              retirement: "INJURY"
            });
            setModalAlert(undefined);
          },
          variant: "warning"
        },
        {
          label: "Cancel",
          autoFocus: true,
          onClick: () => setModalAlert(undefined),
          variant: "secondary",
        },
      ],
      icon: "Ghost",
      open: true,
      onClose: () => {
        setModalAlert(undefined);
      },
    });
  }
  return (
    <>
      <div className="hidden sm:flex flex-row items-center mt-8 intro-y justify-between">
        <div>
          <h2 className="mr-auto text-lg font-bold capitalize flex items-center">
            {data?.data?.home_team?.name} {data?.data?.home_team?.alias}
            <span className="border rounded-md border-emerald-800 text-emerald-800 font-medium text-xs px-1 py-0.5 mx-1">VS</span>
            {data?.data?.away_team?.name} {data?.data?.away_team?.alias}
          </h2>
          <h2 className="mr-auto text-xs mt-1">
            <span className="text-xs font-normal mr-1 bg-emerald-800 text-white rounded-lg px-2 py-0.5">{!data?.data?.tournament_uuid && "Custom "}Match {data?.data?.tournament_uuid && data?.data?.seed_index}</span>
            {tournamentInfo?.data?.name}{tournamentInfo?.data?.type == "KNOCKOUT" && ` - Round ${data?.data?.round}`}
          </h2>
        </div>
        <div className="flex">
        </div>
      </div>
      {/* BEGIN: HTML Table Data */}
      <div className="grid grid-cols-12 gap-4">
        <div className="p-1 sm:p-5 mt-5 intro-y box col-span-12 sm:col-span-8">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 flex flex-col justify-center items-center">
              <div className="text-xl font-bold capitalize">
                {!data?.data?.tournament_uuid && "Custom "}Match {data?.data?.tournament_uuid && data?.data?.seed_index}
              </div>
              <div className="hidden sm:flex text-sm text-center text-emerald-800">
                {tournamentInfo?.data?.name}{tournamentInfo?.data?.type == "KNOCKOUT" && ` - Round ${data?.data?.round}`}
              </div>
              <div className="sm:hidden flex flex-col text-sm text-center text-emerald-800">
                {tournamentInfo?.data?.name}{tournamentInfo?.data?.type == "KNOCKOUT" && <span className="">Round {data?.data?.round}</span>}
              </div>
              <div className="text-xs text-center text-gray-600 flex flex-col sm:flex-row items-center justify-center mt-2">
                <div className="flex flex-row items-center sm:mr-2 border rounded-md px-2 py-1 border-gray-400 mb-1">
                  <Lucide icon="MapPin" className="mr-1" />
                  {`${data?.data?.court_field?.court?.name} - ${data?.data?.court_field?.name}`}
                </div>
                <div className="flex flex-row items-center border rounded-md px-2 py-1  border-gray-400 mb-1">
                  <Lucide icon="Calendar" className="mr-1" />
                  {moment(data?.data?.date).format('dddd, DD MMM YYYY')}
                </div>
              </div>
              <div className="flex">
                {
                  data?.data?.status == "PAUSED" && (<Button
                    className="px-2 py-1 my-2 w-full rounded-md text-xs"
                    variant="outline-primary"
                    onClick={() => {
                      updateStatusApi({
                        status: matchStatusEnum.Values.ONGOING
                      });
                    }}
                  >
                    <Lucide icon="Play" /> Resume
                  </Button>
                  )
                }
                {
                  data?.data?.status == "ONGOING" && (<Button
                    className="px-2 py-1 my-2 w-full rounded-md text-xs"
                    variant="outline-warning"
                    onClick={() => {
                      updateStatusApi({
                        status: matchStatusEnum.Values.PAUSED
                      });
                    }}
                  >
                    <Lucide icon="Pause" /> Pause
                  </Button>
                  )
                }
                {
                  data?.data?.status == "UPCOMING" && (<Button
                    className="px-2 py-1 my-2 w-full rounded-md text-xs"
                    variant="primary"
                    onClick={() => {
                      if (data?.data?.status == "UPCOMING") {
                        addScore({
                          newMatchData: {
                            match_uuid: matchUuid,
                            tournament_uuid: tournamentInfo?.data?.uuid || "",
                            set: 1,
                            game_score_home: "0",
                            game_score_away: "0",
                            last_updated_at: new Date().toISOString(),
                            with_ad: data?.data?.with_ad,
                            prev: {
                              set_score_home: "0",
                              set_score_away: "0"
                            }
                          }
                        })
                      }
                      updateStatusApi({
                        status: matchStatusEnum.Values.ONGOING
                      });
                    }}
                  >
                    <Lucide icon="Play" /> Start Match
                  </Button>
                  )
                }
              </div>
            </div>
            {/* BEGIN: Score */}
            <div className="sm:col-span-5 col-span-6 grid grid-cols-12">
              {/* START: Score Left Side */}
              <div className="col-span-12 flex flex-row justify-end items-center">
                <div className="flex flex-col">
                  <Button
                    className="px-1 py-0 w-full rounded-xl mb-1"
                    variant="outline-primary"
                    disabled={data?.data?.status != "ONGOING"}
                    onClick={() => {
                      updateScore(matchUuid, "home", "UP");
                    }}
                  >
                    <Lucide icon="ChevronUp" />
                  </Button>
                  <div className={`border font-bold text-emerald-800 bg-white border-emerald-800 w-14 h-14 flex items-center justify-center rounded-xl ${["WIN", "LOSE"].includes(currentScore?.game_score_home + "") ? "text-lg" : "text-3xl"}`}>
                    {currentScore?.game_score_home || 0}
                  </div>
                  <Button
                    className="px-1 py-0 w-full rounded-xl mt-1"
                    variant="outline-danger"
                    disabled={data?.data?.status != "ONGOING"}
                    onClick={() => {
                      updateScore(matchUuid, "home", "DOWN");
                    }}
                  >
                    <Lucide icon="ChevronDown" />
                  </Button>
                </div>
                <div className="flex flex-col ml-2 ">
                  <CustomSkeleton
                    active={true}
                    loading={isLoadingScore}
                    className="mb-1 sm:flex hidden" // Optional extra classes
                    height={"22px"}
                    width={"100%"}
                  >
                    <Button
                      className="px-1 py-0 w-full rounded-xl mb-1 h-[22px] text-[10px] text-center sm:flex hidden"
                      variant="outline-pending"
                      disabled={data?.data?.status != "ONGOING" && data?.data?.status != "PAUSED"}
                      onClick={() => {
                        if (data?.data?.home_team) {
                          openModalNoShow(data?.data?.home_team, matchUuid, "home");
                        }
                      }}
                    >
                      No Show
                    </Button>
                  </CustomSkeleton>
                  <div className="border text-3xl font-bold text-white bg-emerald-800 border-emerald-800 w-14 h-14 flex items-center justify-center rounded-xl">
                    {currentScore?.prev?.set_score_home || 0}
                  </div>
                  <CustomSkeleton
                    active={true}
                    loading={isLoadingScore}
                    className="mt-1 sm:flex hidden" // Optional extra classes
                    height={"22px"}
                    width={"100%"}
                  >
                    <Button
                      className="px-1 py-0 w-full rounded-xl mt-1  h-[22px] text-xs text-center sm:flex hidden"
                      variant="outline-warning"
                      disabled={data?.data?.status != "ONGOING" && data?.data?.status != "PAUSED"}
                      onClick={() => {
                        if (data?.data?.home_team) {
                          openModalRetirement(data?.data?.home_team, matchUuid, "home");
                        }
                      }}
                    >
                      Retire
                    </Button>
                  </CustomSkeleton>
                </div>
              </div>
              {/* END: Score Left Side */}
              <Divider className="col-span-12" />
              <div className="col-span-12 flex flex-col items-end">
                <h2 className="text-lg font-bold capitalize">{data?.data?.home_team?.name} </h2>
                <h3 className="text-base font-normal capitalize">{data?.data?.home_team?.alias}</h3>
              </div>
            </div>
            <div className="col-span-0 hidden sm:col-span-2 sm:flex flex-col justify-center items-center">
              <div className="h-16 w-24 relative">
                <IconVS className="h-16 w-full text-warning absolute top-0 -left-0.5" />
                <IconVS className="h-16 w-full text-emerald-800 absolute top-0 left-0.5" />
              </div>
              {![currentScore?.game_score_away, currentScore?.game_score_home].includes("WIN") ?
                <h1 className="text-xs font-bold">Set {currentScore?.set || 1}</h1>
                :
                <h1 className="text-xs font-bold">Match Ended</h1>
              }
            </div>
            <div className="sm:col-span-5 col-span-6 grid grid-cols-12">
              {/* START: Score Right Side */}
              <div className="col-span-12 flex flex-row justify-start items-center">
                <div className="flex flex-col mr-2">
                  <Button
                    className="px-1 py-0 w-full rounded-xl mb-1 h-[22px] text-[10px] text-center sm:flex hidden"
                    variant="outline-pending"
                    disabled={data?.data?.status != "ONGOING" && data?.data?.status != "PAUSED"}
                    onClick={() => {
                      if (data?.data?.away_team) {
                        openModalNoShow(data?.data?.away_team, matchUuid, "away");
                      }
                    }}
                  >
                    No Show
                  </Button>
                  <div className="border text-3xl font-bold text-white bg-emerald-800 border-emerald-800 w-14 h-14 flex items-center justify-center rounded-xl">
                    {currentScore?.prev?.set_score_away || 0}
                  </div>
                  <Button
                    className="px-1 py-0 w-full rounded-xl mt-1  h-[22px] text-xs text-center sm:flex hidden"
                    variant="outline-warning"
                    disabled={data?.data?.status != "ONGOING" && data?.data?.status != "PAUSED"}
                    onClick={() => {
                      if (data?.data?.away_team) {
                        openModalRetirement(data?.data?.away_team, matchUuid, "away");
                      }
                    }}
                  >
                    Retire
                  </Button>
                </div>
                <div className="flex flex-col">
                  <Button
                    className="px-1 py-0 w-full rounded-xl mb-1"
                    variant="outline-primary"
                    disabled={data?.data?.status != "ONGOING"}
                    onClick={() => {
                      updateScore(matchUuid, "away", "UP");
                    }}
                  >
                    <Lucide icon="ChevronUp" />
                  </Button>
                  <div className={`border font-bold text-emerald-800 bg-white border-emerald-800 w-14 h-14 flex items-center justify-center rounded-xl ${["WIN", "LOSE"].includes(currentScore?.game_score_away + "") ? "text-lg" : "text-3xl"}`}>
                    {currentScore?.game_score_away || 0}
                  </div>
                  <Button
                    className="px-1 py-0 w-full rounded-xl mt-1"
                    variant="outline-danger"
                    disabled={data?.data?.status != "ONGOING"}
                    onClick={() => {
                      updateScore(matchUuid, "away", "DOWN");
                    }}
                  >
                    <Lucide icon="ChevronDown" />
                  </Button>
                </div>
              </div>
              {/* END: Score Right Side*/}
              <Divider className="col-span-12" />
              <div className="col-span-12 flex flex-col items-start">
                <h2 className="text-lg font-bold capitalize">{data?.data?.away_team?.name} </h2>
                <h3 className="text-base font-normal capitalize">{data?.data?.away_team?.alias}</h3>
              </div>
            </div>
            {/* END: Score */}
            {/* BEGIN: Player SM */}
            <div className="col-span-5 hidden sm:flex flex-col justify-center">
              <div className="grid grid-cols-12 gap-2">
                {data?.data?.home_team?.players?.map((player, index) => (
                  <div key={index} className="col-span-6 grid grid-cols-12 gap-2">
                    <div
                      className="col-span-12 border rounded-lg p-2 hover:scale-105 transition-all cursor-pointer"
                      onClick={() => {
                        navigate(paths.administrator.players.edit({ player: player?.uuid || "" }).$);
                      }}
                    >
                      <div className="flex flex-row items-center">
                        <div className="mr-2">
                          <h2 className="text-sm text-right font-bold capitalize">{player?.name}</h2>
                          <h3 className="text-xs text-right font-normal capitalize">{player?.nickname}</h3>
                        </div>
                        <div className="border rounded-lg p-0.5">
                          <Image src={player?.media_url || ''} alt={player?.name} className="w-12 h-12 rounded-lg object-cover" />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-12 px-2 flex flex-col items-end">
                      <div className="text-xs text-right font-normal capitalize">Height</div>
                      <div className="text-xs text-right font-medium capitalize">{player?.height}cm</div>
                    </div>
                    <div className="col-span-12 px-2 flex flex-col items-end">
                      <div className="text-xs text-right font-normal capitalize">Forehand Style</div>
                      <div className="text-xs text-right font-medium capitalize">{player?.playstyleForehand}</div>
                    </div>
                    <div className="col-span-12 px-2 flex flex-col items-end">
                      <div className="text-xs text-right font-normal capitalize">Backhand Style</div>
                      <div className="text-xs text-right font-medium capitalize">{player?.playstyleBackhand}</div>
                    </div>
                    <div className="col-span-12 px-2 flex flex-col items-end">
                      <div className="text-xs text-right font-normal capitalize">Forehand</div>
                      <Progress percent={player?.skills?.forehand || 0} style={{ direction: "rtl", color: "#000" }} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                    </div>
                    <div className="col-span-12 px-2 flex flex-col items-end">
                      <div className="text-xs text-right font-normal capitalize">Backhand</div>
                      <Progress percent={player?.skills?.backhand || 0} style={{ direction: "rtl", color: "#000" }} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                    </div>
                    <div className="col-span-12 px-2 flex flex-col items-end">
                      <div className="text-xs text-right font-normal capitalize">Serve</div>
                      <Progress percent={player?.skills?.serve || 0} style={{ direction: "rtl", color: "#000" }} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                    </div>
                    <div className="col-span-12 px-2 flex flex-col items-end">
                      <div className="text-xs text-right font-normal capitalize">Volley</div>
                      <Progress percent={player?.skills?.volley || 0} style={{ direction: "rtl", color: "#000" }} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                    </div>
                    <div className="col-span-12 px-2 flex flex-col items-end">
                      <div className="text-xs text-right font-normal capitalize">Overhead</div>
                      <Progress percent={player?.skills?.overhead || 0} style={{ direction: "rtl", color: "#000" }} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                    </div>
                  </div>
                ))}
                <div className="col-span-6">
                </div>
              </div>
            </div>
            <div className="col-span-2 hidden sm:flex flex-col justify-center items-center">
            </div>
            <div className="col-span-5 hidden sm:flex flex-col justify-center">
              <div className="grid grid-cols-12 gap-2">
                {data?.data?.away_team?.players?.map((player, index) => (
                  <div key={index} className="col-span-6 grid grid-cols-12 gap-2">
                    <div
                      className="col-span-12 border rounded-lg p-2 hover:scale-105 transition-all cursor-pointer"
                      onClick={() => {
                        navigate(paths.administrator.players.edit({ player: player?.uuid || "" }).$);
                      }}
                    >
                      <div className="flex flex-row items-center">
                        <div className="border rounded-lg p-0.5">
                          <Image src={player?.media_url || ''} alt={player?.name} className="w-12 h-12 rounded-lg object-cover" />
                        </div>
                        <div className="ml-2">
                          <h2 className="text-sm text-left font-bold capitalize">{player?.name}</h2>
                          <h3 className="text-xs text-left font-normal capitalize">{player?.nickname}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-12 px-2 flex flex-col items-start">
                      <div className="text-xs font-normal capitalize">Height</div>
                      <div className="text-xs font-medium capitalize">{player?.height}cm</div>
                    </div>
                    <div className="col-span-12 px-2 flex flex-col items-start">
                      <div className="text-xs font-normal capitalize">Forehand Style</div>
                      <div className="text-xs font-medium capitalize">{player?.playstyleForehand}</div>
                    </div>
                    <div className="col-span-12 px-2 flex flex-col items-start">
                      <div className="text-xs font-normal capitalize">Backhand Style</div>
                      <div className="text-xs font-medium capitalize">{player?.playstyleBackhand}</div>
                    </div>
                    <div className="col-span-12 px-2 flex flex-col items-start">
                      <div className="text-xs font-normal capitalize">Forehand</div>
                      <Progress percent={player?.skills?.forehand || 0} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                    </div>
                    <div className="col-span-12 px-2 flex flex-col items-start">
                      <div className="text-xs font-normal capitalize">Backhand</div>
                      <Progress percent={player?.skills?.backhand || 0} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                    </div>
                    <div className="col-span-12 px-2 flex flex-col items-start">
                      <div className="text-xs font-normal capitalize">Serve</div>
                      <Progress percent={player?.skills?.serve || 0} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                    </div>
                    <div className="col-span-12 px-2 flex flex-col items-start">
                      <div className="text-xs font-normal capitalize">Volley</div>
                      <Progress percent={player?.skills?.volley || 0} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                    </div>
                    <div className="col-span-12 px-2 flex flex-col items-start">
                      <div className="text-xs font-normal capitalize">Overhead</div>
                      <Progress percent={player?.skills?.overhead || 0} strokeColor="#065740" className="text-xs" percentPosition={{ align: "start" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* END: Player SM */}
            {/* BEGIN: Player XS*/}
            <div className="sm:hidden col-span-6 grid grid-cols-12">
              {data?.data?.home_team?.players?.map((player, index) => (
                <div key={index} className="col-span-12 flex flex-row items-center">
                  <div className="mr-2 w-full">
                    <h2 className="text-[10px] text-right font-normal capitalize text-ellipsis line-clamp-1 w-full">{player?.name}</h2>
                    <h3 className="text-[10px] text-right font-light capitalize text-ellipsis line-clamp-1">{player?.nickname}</h3>
                  </div>
                  <div className="min-w-8">
                    <Image src={player?.media_url || ''} alt={player?.name} className="w-8 h-8 rounded-lg object-cover" />
                  </div>
                </div>
              ))}
              <div className="col-span-12 pl-2 pb-2 flex flex-col space-y-2">
                <Button
                  className="px-1 py-0 w-full rounded-md mt-1 h-6 text-xs text-center flex sm:hidden"
                  variant="outline-pending"
                  disabled={data?.data?.status != "ONGOING" && data?.data?.status != "PAUSED"}
                  onClick={() => {
                    if (!!data?.data?.home_team?.players?.length) {
                      openModalNoShow(data?.data?.home_team, matchUuid, "home");
                    }
                  }}
                >
                  No Show
                </Button>
                <Button
                  className="px-1 py-0 w-full rounded-md h-6 text-xs text-center flex sm:hidden"
                  variant="outline-warning"
                  disabled={data?.data?.status != "ONGOING" && data?.data?.status != "PAUSED"}
                  onClick={() => {

                    if (data?.data?.home_team) {
                      openModalRetirement(data?.data?.home_team, matchUuid, "home");
                    }
                  }}
                >
                  Retire
                </Button>
              </div>
            </div>
            <div className="sm:hidden col-span-6 grid grid-cols-12">
              {data?.data?.away_team?.players?.map((player, index) => (
                <div key={index} className="col-span-12 flex flex-row items-center">
                  <div className="min-w-8">
                    <Image src={player?.media_url || ''} alt={player?.name} className="w-8 h-8 rounded-lg object-cover" />
                  </div>
                  <div className="ml-2 w-full">
                    <h2 className="text-[10px] text-left font-normal capitalize text-ellipsis line-clamp-1 w-full">{player?.name}</h2>
                    <h3 className="text-[10px] text-left font-light capitalize text-ellipsis line-clamp-1">{player?.nickname}</h3>
                  </div>
                </div>
              ))}
              <div className="col-span-12 pl-2 pb-2 flex flex-col space-y-2">
                <Button
                  className="px-1 py-0 w-full rounded-md mt-1 h-6 text-xs text-center flex sm:hidden"
                  variant="outline-pending"
                  disabled={data?.data?.status != "ONGOING" && data?.data?.status != "PAUSED"}
                  onClick={() => {
                    if (!!data?.data?.away_team?.players?.length) {
                      openModalNoShow(data?.data?.away_team, matchUuid, "away");
                    }
                  }}
                >
                  No Show
                </Button>
                <Button
                  className="px-1 py-0 w-full rounded-md h-6 text-xs text-center flex sm:hidden"
                  variant="outline-warning"
                  disabled={data?.data?.status != "ONGOING" && data?.data?.status != "PAUSED"}
                  onClick={() => {
                    if (data?.data?.away_team) {
                      openModalRetirement(data?.data?.away_team, matchUuid, "away");
                    }
                  }}
                >
                  Retire
                </Button>
              </div>
            </div>
            {/* END: Player XS*/}
          </div>
        </div>
        <div className="mt-5 intro-y col-span-12 sm:col-span-4 grid grid-cols-12 gap-4 h-fit">
          <div className="p-5 box col-span-12 ">
            <div className="grid grid-cols-12">
              <div className="col-span-12 font-medium">
                Point History
                <Divider className="mb-1 mt-1" />
              </div>
              <div className="col-span-4 sm:col-span-2 bg-slate-200 rounded-tl-lg"></div>
              <div className="py-2 col-span-4 sm:col-span-5 flex justify-center bg-slate-200">
                <span className="text-sm font-medium capitalize">{data?.data?.home_team?.name}</span>
              </div>
              <div className="py-2 col-span-4 sm:col-span-5 flex justify-center bg-slate-200 rounded-tr-lg">
                <span className="text-sm font-medium capitalize">{data?.data?.away_team?.name}</span>
              </div>
              {(scores || []).sort((a, b) => a.set - b.set).slice(0, -1).map((setScore, i) => (
                <Fragment key={setScore.refId}>
                  <div className={`py-1 col-span-4 sm:col-span-2 flex justify-end items-center px-2 ${i % 2 === 0 ? "bg-slate-100" : "bg-slate-50"}`}>
                    <span className="text-end font-medium capitalize text-slate-500 text-xs">Set {setScore.set}</span>
                  </div>
                  <div className={`col-span-4 sm:col-span-5 flex justify-center items-center ${i % 2 === 0 ? "bg-slate-100" : "bg-slate-50"}`}>
                    <span className={`text-sm font-medium capitalize ${setScore.game_score_home > setScore.game_score_away || setScore.game_score_home == "AD" ? "text-success" : "text-danger"}`}>
                      {setScore.game_score_home == "WIN" ? (setScore.game_score_away == "40" ? "AD" : "40") : setScore.game_score_home}
                    </span>
                  </div>
                  <div className={`col-span-4 sm:col-span-5 flex justify-center items-center ${i % 2 === 0 ? "bg-slate-100" : "bg-slate-50"}`}>
                    <span className={`text-sm font-medium capitalize ${setScore.game_score_away > setScore.game_score_home || setScore.game_score_away == "AD" ? "text-success" : "text-danger"}`}>
                      {setScore.game_score_away == "WIN" ? (setScore.game_score_home == "40" ? "AD" : "40") : setScore.game_score_away}
                    </span>
                  </div>
                </Fragment>
              ))}
              {(scores || []).sort((a, b) => a.set - b.set).slice(0, -1).length == 0 && <div className="col-span-12 bg-gray-100 p-4 text-center text-xs">
                The set is live, but this point determines the match winner.<br />Currently, Set not concluded.
              </div>}
            </div>
          </div>
          <div className="p-5 box col-span-12 ">
            <div className="grid grid-cols-10 gap-2">
              <div className="col-span-12 font-medium">
                Potential Point
                <Divider className="mb-0 mt-1" />
              </div>
              <div className="sm:col-span-4 col-span-5">
                <span className="text-sm font-medium capitalize">Win: <span className="text-success">+{tournamentInfo ? detailPointConfig?.data?.points?.find(r => r.round === data?.data?.round)?.win_point : data?.data?.point_config?.points?.find(r => r.round === 1)?.win_point} Point</span></span>
              </div>
              <div className="sm:col-span-4 col-span-5">
                <span className="text-sm font-medium capitalize">Lose: <span className="text-danger">+{tournamentInfo ? detailPointConfig?.data?.points?.find(r => r.round === data?.data?.round)?.lose_point : data?.data?.point_config?.points?.find(r => r.round === 1)?.lose_point} Point</span></span>
              </div>
            </div>
          </div>
          <div className="p-5 box col-span-12 h-fit">
            <div className="grid grid-cols-10 gap-2">
              <div className="col-span-12" key={youtubePreviewUrl || data?.data?.youtube_url}>
                {youtubePreviewUrl || data?.data?.youtube_url ?
                  <YouTube videoId={(youtubePreviewUrl || data?.data?.youtube_url)?.split("?v=").pop()} iframeClassName={"w-full min-h-56 aspect-video"} />
                  :
                  <div className="w-full min-h-56 rounded-lg bg-slate-50 flex flex-col items-center justify-center border-slate-300 border-dotted border text-slate-700">
                    <Lucide icon="MonitorPlay" className="w-12 h-12 mb-1" />
                    Your video will be displayed here
                  </div>
                }
              </div>
              <div className="col-span-10">
                <FormInput
                  value={youtubeUrl}
                  placeholder="Enter Youtube URL"
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Button
                  onClick={() => {
                    updateVideoApi({
                      video_url: youtubeUrl
                    }, {
                      onSuccess: () => {
                        setYoutubePreviewUrl(youtubeUrl);
                        setYoutubeUrl("");
                        showNotification({
                          duration: 3000,
                          text: "Video updated successfully",
                          icon: "CheckSquare",
                          variant: "success",
                        });
                        queryClient.invalidateQueries({
                          queryKey: MatchDetailApiHooks.getKeyByAlias("getMatchDetail"),
                        });
                      }
                    });
                  }}
                  className="w-full"
                  type="button"
                  variant="primary"
                  disabled={!youtubeUrl}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Confirmation
        open={!!modalAlert?.open}
        onClose={() => setModalAlert(undefined)}
        notes={modalAlert?.notes}
        icon={modalAlert?.icon || "Info"}
        title={modalAlert?.title || ""}
        description={modalAlert?.description || ""}
        refId={modalAlert?.refId}
        buttons={modalAlert?.buttons}
      />
    </>
  );
}
