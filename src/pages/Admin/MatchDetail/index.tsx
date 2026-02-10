import Lucide from "@/components/Base/Lucide";
import Button, { Variant } from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import { Fragment, useEffect, useState } from "react";

import moment from "moment";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { useToast } from "@/components/Toast/ToastContext";
import { useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
import { MatchDetailApiHooks } from "./api";
import { useRouteParams } from "typesafe-routes/react-router";
import { TournamentsApiHooks } from "../Tournaments/api";
import { Divider, Image, Progress, QRCode } from "antd";
import { useAtom } from "jotai";
import { matchScoresAtom } from "@/utils/store/atoms";
import { useScore } from "@/utils/score.util";
import { matchStatusEnum, MatchTeam, ScoreUpdatePayload } from "./api/schema";
import YouTube from "react-youtube";
import { encodeBase64 } from "@/utils/helper";
import { PointConfigurationsApiHooks } from "../PointConfig/api";
import { useDebounceFn } from "ahooks";
import { queryClient } from "@/utils/react-query";
import { IconVS } from "@/assets/images/icons";
import { CustomSkeleton } from "@/components/CustomSkeleton";
import { clientEnv } from "@/env";

export const MatchDetail = () => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.administrator.tournaments.match);
  const { matchUuid } = queryParams;
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const { showNotification } = useToast();
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [youtubePreviewUrl, setYoutubePreviewUrl] = useState("");
  const [hostUrl, setHostUrl] = useState("");
  const { data } = MatchDetailApiHooks.useGetMatchDetail({
    params: {
      uuid: matchUuid
    },
  }, {
    onSuccess: () => {
    },
    retry: false
  });
  useEffect(() => {
    setHostUrl(window.location.origin);
  }, [data]);
  const { data: tournamentInfo } = TournamentsApiHooks.useGetTournamentsDetail({
    params: {
      uuid: data?.data?.tournament_uuid || ""
    },
  }, {
    enabled: !!data?.data?.tournament_uuid
  });
  const current = {
    round: data?.data?.round != undefined && data?.data?.round != null ? data?.data?.round + 1 : 0,
    match: data?.data?.seed_index != undefined && data?.data?.seed_index != null ? data?.data?.seed_index + 1 : 0
  }

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
    retry: false,
    onSuccess: (ds, e, s) => {
      if (ds.data.winner_team_uuid || ds.message == "reload") {
        queryClient.invalidateQueries({
          queryKey: MatchDetailApiHooks.getKeyByAlias("getMatchDetail"),
        });
      }
    }
  });
  const { mutate: updateNextRoundApi } = MatchDetailApiHooks.useUpdateMatchNextRoundApi({
    params: {
      uuid: matchUuid
    }
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MatchDetailApiHooks.getKeyByAlias("getMatchDetail"),
      });
      queryClient.invalidateQueries({
        queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsDetail"),
      });
      setModalAlert({
        icon: "CheckCircle",
        onClose: () => {
          navigate(paths.administrator.tournaments.detail({
            id: tournamentInfo?.data?.uuid || ""
          }).$)
          setModalAlert(undefined)
        },
        open: true,
        title: "Update Success!",
        description: "Tournament has been updated successfully",
        dismissable: false,
        buttons: [
          {
            label: "Continue",
            onClick: () => {
              navigate(paths.administrator.tournaments.detail({
                id: tournamentInfo?.data?.uuid || ""
              }).$)
              setModalAlert(undefined)
            },
            variant: "primary"
          },
          {
            label: "Stay in this page",
            onClick: () => {
              setModalAlert(undefined)
            },
            variant: "secondary"
          },
        ]
      })
    }
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

  const [matchScores, setMatchScores] = useAtom(matchScoresAtom);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const {
    updateGameScore,
    deleteScore,
    resetMatchScores,
    getCurrentGameScore,
    getCurrentMatchScores
  } = useScore();

  const currentMatchScore = getCurrentMatchScores(matchUuid);
  const currentGameScores = currentMatchScore?.game_scores || [];
  const currentScore = getCurrentGameScore(currentGameScores);

  useEffect(() => {
    // Calculate set scores from game scores
    const homeSetScore = currentGameScores.filter(score => score.game_score_home === "WIN").length;
    const awaySetScore = currentGameScores.filter(score => score.game_score_away === "WIN").length;

    if (homeSetScore >= 6 || awaySetScore >= 6) {
      queryClient.invalidateQueries({
        queryKey: MatchDetailApiHooks.getKeyByAlias("getMatchDetail"),
      });

      queryClient.invalidateQueries({
        queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentMatches"),
      });
      if (!data?.data?.winner_team_uuid) {
        updateScoreApi({
          match_uuid: matchUuid,
          home_team_score: homeSetScore,
          away_team_score: awaySetScore,
          game_scores: currentGameScores?.map(score => ({
            set: score.set,
            game: score.game,
            game_score_home: score.game_score_home,
            game_score_away: score.game_score_away,
            status: score.status
          }))
        })
      }
    }

  }, [currentScore])
  const updateScore = (matchUuid: string, team: "home" | "away", direction: "UP" | "DOWN") => {
    if (
      !data ||
      !!data?.data?.winner_team_uuid ||
      ["TBD", "BYE"].includes(data?.data?.home_team_uuid || "") ||
      ["TBD", "BYE"].includes(data?.data?.away_team_uuid || "")
    ) {
      return;
    }

    updateGameScore({
      matchUuid,
      team,
      direction,
      withAd: data?.data?.with_ad || false,
      raceTo: 6 // Default to 6 since race_to property doesn't exist yet
    });
  };

  const deleteScoreHandler = (setNumber: number, gameNumber?: number) => {
    deleteScore(matchUuid, setNumber, gameNumber);
  };

  const resetMatchHandler = () => {
    resetMatchScores(matchUuid);
  };

  const handleResetMatch = () => {
    resetMatchHandler();
    updateScoreApi({
      match_uuid: matchUuid,
      home_team_score: "0",
      away_team_score: "0",
      status: "RESET",
      game_scores: []
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: MatchDetailApiHooks.getKeyByAlias("getMatchDetail"),
        });
      }
    });
  };

  const setRetirement = (
    { matchUuid, team, player_uuid, notes, retirement }:
      { matchUuid: string, team: "home" | "away", player_uuid?: string, notes?: string, retirement?: "INJURY" | "NO_SHOW" }) => {
    // TODO: Implement retirement logic with score utility
    showNotification({
      text: "Retirement feature needs to be implemented",
      variant: "info",
      duration: 3000
    });
  };

  const openModalNoShow = (team: MatchTeam, matchUuid: string, pos: "home" | "away") => {
    setModalAlert({
      title: "Are you sure?",
      description: `${team.name} players is not showing up. The match will be declared as a win for the other team and can't be undone.`,
      icon: "Drama",
      open: true,
      onClose: () => {
        setModalAlert(undefined);
      },
      buttons: [
        ...(team.players.map((player: any) => ({
          label: player?.name || "",
          onClick: () => {
            setRetirement({
              matchUuid,
              team: pos,
              player_uuid: player.uuid || "",
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
          variant: "pending" as Variant
        },
        {
          label: "Cancel",
          autoFocus: true,
          onClick: () => setModalAlert(undefined),
          variant: "secondary" as Variant
        }
      ]
    });
  };

  const openModalRetirement = (team: MatchTeam, matchUuid: string, pos: "home" | "away") => {
    setModalAlert({
      title: "Retire",
      description: `Are you sure you want to retire ${team.name}?\n This action will end the match and can't be undone`,
      buttons: [
        {
          label: "Retire",
          onClick: (notes: string) => {
            setRetirement({
              matchUuid,
              team: pos,
              notes,
              player_uuid: `BOTH_${pos.toUpperCase()}`
            });
            setModalAlert(undefined);
          },
          variant: "danger" as Variant,
          autoFocus: false
        },
        {
          label: "Retire with Injury",
          onClick: (notes: string) => {
            setModalAlert((prev) => ({
              ...(prev as AlertProps),
              open: false,
            }));
            setTimeout(() => {
              openModalRetirePlayer(team, matchUuid, pos, notes);
            }, 200);
          },
          variant: "danger" as Variant,
          autoFocus: false
        },
        {
          label: "Cancel",
          onClick: () => setModalAlert(undefined),
          variant: "secondary" as Variant
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
      }
    });
  };
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
              player_uuid: player.uuid || "",
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
  const getQRValue = () => {
    const codes = encodeBase64({
      mUU: data?.data?.uuid,
      d: new Date().toISOString()
    });
    const url = `${hostUrl}${paths.player.referee.index({ codes }).$}`;
    return url;
  }
  return (
    <>
      <div className="hidden sm:flex flex-row items-center mt-8 intro-y justify-between">
        <div>
          <h2 className="mr-auto text-lg font-bold capitalize flex items-center min-w-0">
            <span className="truncate max-w-[45%]">{data?.data?.home_team?.name}</span>
            <span className="border rounded-md border-emerald-800 text-emerald-800 font-medium text-xs px-1 py-0.5 mx-1">VS</span>
            <span className="truncate max-w-[45%]">{data?.data?.away_team?.name}</span>
          </h2>
          <h2 className="mr-auto text-xs mt-1">
            <span className="text-xs font-normal mr-1 bg-emerald-800 text-white rounded-lg px-2 py-0.5">{!data?.data?.tournament_uuid && "Challenger "}Match {current.match}</span>
            <span className="inline-block align-bottom max-w-full truncate">
              {tournamentInfo?.data?.name}{tournamentInfo?.data?.type == "KNOCKOUT" && ` - Round ${current.round}`}
            </span>
          </h2>
        </div>
        <div className="flex">
        </div>
      </div>
      {/* BEGIN: HTML Table Data */}
      <div className="grid grid-cols-12 gap-4">
        <div className="p-1 sm:p-5 mt-5 intro-y box col-span-12 sm:col-span-8">
          <div className="grid grid-cols-12 gap-4 relative">
            <div className="absolute top-0 right-0 w-fit h-fit text-xs z-10"
              onClick={() => {
                setModalAlert({
                  icon: "Activity",
                  title: `Version ${clientEnv.VERSION}`,
                  description: "",
                  open: true,
                  onClose: () => {
                    setModalAlert(undefined);
                  },
                  buttons: [{
                    label: "Reset Match",
                    onClick: () => {
                      handleResetMatch();
                      setModalAlert(undefined);
                    },
                    variant: "outline-danger"
                  },
                  {
                    label: "Close",
                    onClick: () => {
                      setModalAlert(undefined);
                    },
                    variant: "primary"
                  }]
                })
              }}>
              v{clientEnv.VERSION}
            </div>
            <div className="col-span-12 flex flex-col justify-center items-center">
              <div
                className="text-xl font-bold capitalize"
                onClick={() => navigate(paths.administrator.tournaments.detail({ id: data?.data?.tournament_uuid || "" }).$)}>
                {!data?.data?.tournament_uuid && "Challenger "}
                Match&nbsp;
                {current.match}
              </div>
              <div className="hidden sm:flex text-sm text-center text-emerald-800 dark:text-[#EBCE56]" onClick={() => navigate(paths.administrator.tournaments.detail({ id: data?.data?.tournament_uuid || "" }).$)}>
                {tournamentInfo?.data?.name}{tournamentInfo?.data?.type == "KNOCKOUT" && ` - Round ${current.round}`}
              </div>
              <div className="sm:hidden flex flex-col text-sm text-center text-emerald-800 dark:text-[#EBCE56]">
                {tournamentInfo?.data?.name}{tournamentInfo?.data?.type == "KNOCKOUT" && <span className="">Round {current.round}</span>}
              </div>
              <div className="text-xs text-center text-gray-600 flex flex-col sm:flex-row items-center justify-center mt-2">
                <div className="flex flex-row items-center sm:mr-2 border rounded-md px-2 py-1 border-gray-400 mb-1 dark:border-white dark:text-white">
                  <Lucide icon="MapPin" className="mr-1" />
                  {`${data?.data?.court_field?.court?.name} - ${data?.data?.court_field?.name}`}
                </div>
                <div className="flex flex-row items-center border rounded-md px-2 py-1  border-gray-400 mb-1 dark:border-white dark:text-white">
                  <Lucide icon="Calendar" className="mr-1" />
                  {moment(data?.data?.date).format('dddd, DD MMM YYYY HH:mm')}
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
                  data?.data?.status == "ENDED" && (<Button
                    className="px-2 py-1 my-2 w-full rounded-md text-xs"
                    variant="primary"
                    onClick={() => {
                      updateNextRoundApi(undefined);
                    }}
                  >
                    <Lucide icon="BetweenHorizontalStart" />&nbsp;Update Next Round
                  </Button>
                  )
                }
                {
                  data?.data?.status == "UPCOMING" && (<Button
                    className="px-2 py-1 my-2 w-full rounded-md text-xs"
                    variant="primary"
                    onClick={() => {
                      if (data?.data?.status == "UPCOMING") {
                        updateGameScore({
                          matchUuid,
                          team: "home",
                          direction: "UP",
                          withAd: data?.data?.with_ad || false
                        });
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
                    {currentMatchScore?.home_team_score || "0"}
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
              <div className="col-span-12 flex flex-col items-end w-full min-w-0">
                <h2 className="text-lg font-bold capitalize text-end w-full truncate">{data?.data?.home_team?.name} </h2>
                {/* <h3 className="text-base font-normal capitalize text-end w-full truncate">{data?.data?.home_team?.alias}</h3> */}
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
                    {currentMatchScore?.away_team_score || "0"}
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
              <div className="col-span-12 flex flex-col items-start w-full min-w-0">
                <h2 className="text-lg font-bold capitalize w-full truncate">{data?.data?.away_team?.name} </h2>
                {/* <h3 className="text-base font-normal capitalize w-full truncate">{data?.data?.away_team?.alias}</h3> */}
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
                        <div className="mr-2 min-w-0 flex-1">
                          <h2 className="text-sm text-right font-bold capitalize truncate">{player?.name}</h2>
                          <h3 className="text-xs text-right font-normal capitalize truncate">{player?.nickname}</h3>
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
                        <div className="ml-2 min-w-0 flex-1">
                          <h2 className="text-sm text-left font-bold capitalize truncate">{player?.name}</h2>
                          <h3 className="text-xs text-left font-normal capitalize truncate">{player?.nickname}</h3>
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
              <div className="col-span-4 sm:col-span-2 bg-slate-200 rounded-tl-lg dark:bg-slate-800"></div>
              <div className="py-2 col-span-4 sm:col-span-5 flex justify-center bg-slate-200 dark:bg-slate-800">
                <span className="text-sm font-medium capitalize w-full truncate text-center">{data?.data?.home_team?.name}</span>
              </div>
              <div className="py-2 col-span-4 sm:col-span-5 flex justify-center bg-slate-200 rounded-tr-lg dark:bg-slate-800">
                <span className="text-sm font-medium capitalize w-full truncate text-center">{data?.data?.away_team?.name}</span>
              </div>
              {(currentGameScores || []).sort((a: any, b: any) => a.set - b.set).slice(0, -1).map((setScore: any, i: any) => (
                <Fragment key={setScore.refId}>
                  <div className={`py-1 col-span-4 sm:col-span-2 flex justify-end items-center px-2 ${i % 2 === 0 ? "bg-slate-100 dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800"}`}>
                    <span className="text-end font-medium capitalize text-slate-500 text-xs">Game {setScore.set}</span>
                  </div>
                  <div className={`col-span-4 sm:col-span-5 flex justify-center items-center ${i % 2 === 0 ? "bg-slate-100 dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800"}`}>
                    <span className={`text-sm font-medium capitalize ${setScore.game_score_home > setScore.game_score_away || setScore.game_score_home == "AD" ? "text-success" : "text-danger"}`}>
                      {setScore.game_score_home == "WIN" ? (setScore.game_score_away == "40" ? "AD" : "40") : setScore.game_score_home}
                    </span>
                  </div>
                  <div className={`col-span-4 sm:col-span-5 flex justify-center items-center ${i % 2 === 0 ? "bg-slate-100 dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800"}`}>
                    <span className={`text-sm font-medium capitalize ${setScore.game_score_away > setScore.game_score_home || setScore.game_score_away == "AD" ? "text-success" : "text-danger"}`}>
                      {setScore.game_score_away == "WIN" ? (setScore.game_score_home == "40" ? "AD" : "40") : setScore.game_score_away}
                    </span>
                  </div>
                </Fragment>
              ))}
              {(currentGameScores || []).sort((a: any, b: any) => a.set - b.set).slice(0, -1).length == 0 && <div className="col-span-12 bg-gray-100 p-4 text-center text-xs dark:bg-slate-800">
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
                <span className="text-sm font-medium capitalize">Win: <span className="text-success">+{tournamentInfo ? detailPointConfig?.data?.points?.find(r => r.round === current.round)?.win_point : data?.data?.point_config?.points?.find(r => r.round === 1)?.win_point} Point</span></span>
              </div>
              <div className="sm:col-span-4 col-span-5">
                <span className="text-sm font-medium capitalize">Lose: <span className="text-danger">+{tournamentInfo ? detailPointConfig?.data?.points?.find(r => r.round === current.round)?.lose_point : data?.data?.point_config?.points?.find(r => r.round === 1)?.lose_point} Point</span></span>
              </div>
            </div>
          </div>
          <div className="p-5 box col-span-12 h-fit">
            <div className="grid grid-cols-10 gap-2">
              <div className="col-span-12" key={youtubePreviewUrl || data?.data?.youtube_url}>
                {youtubePreviewUrl || data?.data?.youtube_url ?
                  <YouTube videoId={(youtubePreviewUrl || data?.data?.youtube_url)?.split("?v=").pop()} iframeClassName={"w-full min-h-56 aspect-video"} />
                  :
                  <div className="w-full min-h-56 rounded-lg bg-slate-50 dark:bg-slate-800 dark:text-slate-200 flex flex-col items-center justify-center border-slate-300 border-dotted border text-slate-700">
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
          <div className="p-5 box col-span-12 h-fit">
            <div className="grid grid-cols-10 gap-2">
              <div className="col-span-12 aspect-square lg:aspect-auto flex justify-center" key={JSON.stringify(data?.data)}>
                {/* display qrcode here */}
                <QRCode
                  value={getQRValue()}
                  className="aspect-square min-w-full min-h-full lg:min-w-[50%] lg:min-h-fit"
                  color="#084930"
                />
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
