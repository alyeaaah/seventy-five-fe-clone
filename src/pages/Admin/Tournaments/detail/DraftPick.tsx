import Button from "@/components/Base/Button";
import { TournamentsApiHooks } from "../api";
import { TournamentParticipant, TournamentsPayload, TournamentTeams } from "../api/schema";
import Lucide from "@/components/Base/Lucide";
import Image from "@/components/Image";
import { useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
import { useEffect, useState } from "react";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { queryClient } from "@/utils/react-query";
import { PublicTournamentApiHooks } from "@/pages/Public/Tournament/api";
import { useToast } from "@/components/Toast/ToastContext";
import { IPlayerDraft, PlayerDraftStatus, TournamentDraftPickComponent } from "@/components/TournamentDraftPick";
import { DraftPick } from "@/pages/Public/Tournament/api/schema";
import Tippy from "@/components/Base/Tippy";
import { imageResizer } from "@/utils/helper";
import { IModalPickPlayerProps, ModalPickPlayer } from "./ModalPickPlayer";

interface TournamentDraftPickProps {
  tournamentUuid: string;
  data?: TournamentsPayload;

}
export const TournamentDraftPick = ({ tournamentUuid, data }: TournamentDraftPickProps) => {
  const navigate = useNavigate();
  const [selectedTeams, setSelectedTeams] = useState<TournamentTeams[]>([]);
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const { showNotification } = useToast();
  const [draftPickPlayers, setDraftPickPlayers] = useState<IPlayerDraft[]>([]);
  const [draftPickSession, setDraftPickSession] = useState<boolean>(false);
  const [toggleBlur, setToggleBlur] = useState<boolean>(false);
  const [multipleToggle, setMultipleToggle] = useState<{ enable: boolean, players: string[] }>({
    enable: false,
    players: []
  })
  const [modalPickPlayer, setModalPickPlayer] = useState<IModalPickPlayerProps | undefined>(undefined);


  // Get confirmed teams
  const { data: approvedDraftPickData } = TournamentsApiHooks.useGetTournamentDraftParticipants({
    params: {
      tournamentUuid: tournamentUuid || ""
    },
    queries: {
      status: ["APPROVED"],
      limit: 9999,
    }
  }, {
    enabled: !!tournamentUuid
  });
  // Get confirmed teams
  const { data: draftPickData } = TournamentsApiHooks.useGetTournamentDraftParticipants({
    params: {
      tournamentUuid: tournamentUuid || ""
    },
    queries: {
      status: ["PICKING", "PICKED", "AVAILABLE"],
      limit: 9999,
    }
  }, {
    enabled: !!tournamentUuid
  });
  const draftPickParticipants = draftPickData?.data?.participants || [];
  const { data: confirmedTeamsData } = TournamentsApiHooks.useGetTournamentTeamParticipants({
    params: {
      tournamentUuid: tournamentUuid || ""
    },
    queries: {
      limit: "9999",
    }
  });
  const { mutateAsync: actionAddDraftPick, isPending: isAddingDraftPick } = TournamentsApiHooks.useAddTournamentDraftPick({
    params: {
      uuid: tournamentUuid || ""
    }
  }, {
    onSuccess: () => {
      // TODO: Refresh draft pick data
      showNotification({
        duration: 3000,
        text: "Player(s) added successfully",
        icon: "UserPlus"
      })
      setSelectedTeams([])

      queryClient.invalidateQueries({
        queryKey: PublicTournamentApiHooks.getKeyByAlias("getTournamentDraftPicks")
      });
      queryClient.invalidateQueries({
        queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentDraftParticipants")
      });
    },
    onError: (e) => {
      showNotification({
        duration: 3000,
        text: `Failed to add player(s) to draft pick: ${e.message}`,
        icon: "X"
      })
    }
  });

  const { mutateAsync: actionStartDraftPick } = TournamentsApiHooks.useStartTournamentDraftPick({
    params: {
      uuid: tournamentUuid || ""
    }
  }, {
    onSuccess: () => {
      // TODO: Refresh draft pick data
      showNotification({
        duration: 3000,
        text: "Draft Pick started successfully",
        icon: "UserPlus"
      })
      setModalAlert(undefined);

      queryClient.invalidateQueries({
        queryKey: PublicTournamentApiHooks.getKeyByAlias("getTournamentDraftPicks")
      });
      queryClient.invalidateQueries({
        queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentDraftParticipants")
      });
    },
    onError: (e) => {
      showNotification({
        duration: 3000,
        text: `Failed to add player(s) to draft pick: ${e.message}`,
        icon: "X"
      })
    }
  });
  const { mutateAsync: actionAssignDraftPick } = PublicTournamentApiHooks.useAssignTournamentDraftPick({
    params: {
      uuid: tournamentUuid || ""
    }
  }, {
    onSuccess: () => {
      // TODO: Refresh draft pick data
      showNotification({
        duration: 3000,
        text: "Draft Pick assigned successfully",
        icon: "UserPlus"
      })
      setModalAlert(undefined);
      queryClient.invalidateQueries({
        queryKey: PublicTournamentApiHooks.getKeyByAlias("getTournamentDraftPicks")
      });
      queryClient.invalidateQueries({
        queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentDraftParticipants")
      });
    },
    onError: (e) => {
      showNotification({
        duration: 3000,
        text: `Failed to add player(s) to draft pick: ${e.message}`,
        icon: "X"
      })
    }
  });
  const { mutateAsync: actionUpdateDraftPickPosition } = TournamentsApiHooks.useUpdateTournamentDraftPickPosition({
    params: {
      uuid: tournamentUuid || ""
    }
  }, {
    onSuccess: () => {
      // TODO: Refresh draft pick data
      showNotification({
        duration: 3000,
        text: "Draft Pick position updated successfully",
        icon: "UserPlus"
      })
      queryClient.invalidateQueries({
        queryKey: PublicTournamentApiHooks.getKeyByAlias("getTournamentDraftPicks")
      });
      queryClient.invalidateQueries({
        queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentDraftParticipants")
      });
    },
    onError: (e) => {
      showNotification({
        duration: 3000,
        text: `Failed to add player(s) to draft pick: ${e.message}`,
        icon: "X"
      })
    }
  });
  const convertPlayerDraft = (dpData: TournamentParticipant[]): IPlayerDraft[] => {
    return dpData.map(dd => ({
      id: dd.id,
      name: dd.player?.name || "",
      position: dd.position,
      status: dd.status as PlayerDraftStatus,
      uuid: dd.player_uuid || "",
      media_url: dd.player?.media_url || undefined,
      seeded: dd.seeded,
      email: dd.player?.email || "",
      nickname: dd.player?.nickname || ""
    }));
  };
  const isSaved = JSON.stringify(draftPickPlayers?.sort((a, b) => a.position - b.position || a.id - b.id)) === JSON.stringify(convertPlayerDraft(draftPickParticipants || []).sort((a, b) => a.position - b.position || a.id - b.id));
  const isStarted = draftPickParticipants?.find(d => d.status == "PICKING" || d.status == "PICKED");
  useEffect(() => {
    if (draftPickData) {
      setDraftPickPlayers(draftPickParticipants.map(dd => ({
        id: dd.id,
        name: dd.player?.name || "",
        position: dd.position,
        status: dd.status as PlayerDraftStatus,
        uuid: dd.player_uuid || "",
        media_url: dd.player?.media_url || undefined,
        seeded: dd.seeded,
        email: dd.player?.email || "",
        nickname: dd.player?.nickname || ""
      })) || []);
    }
  }, [draftPickData]);


  const actionAddToDraftPick = (dp: TournamentParticipant, seeded?: boolean) => {
    actionAddDraftPick({
      id: dp.id,
      player_uuid: dp.player_uuid || "",
      status: "AVAILABLE" as const,
      position: 0,
      seeded: seeded ?? false,

    })
    setModalAlert(undefined)
  }

  const actionAddMultipleToDraftPick = async (seeded?: boolean) => {
    await actionAddDraftPick({
      status: "AVAILABLE" as const,
      players: multipleToggle.players,
      position: 0,
      seeded: seeded ?? false,
    })
    setMultipleToggle({ players: [], enable: false });
    setModalAlert(undefined)
  }

  const handleUpdatePosition = () => {
    actionUpdateDraftPickPosition({
      players: draftPickPlayers.map(dp => ({
        status: dp.status,
        player_uuid: dp.uuid || "",
        position: dp.position,
        id: dp.id,
        team_uuid: dp.team_uuid,
        seeded: dp.seeded
      }))
    })
  }
  const handleStartDraftPick = () => {
    setModalAlert({
      open: true,
      icon: "Info",
      onClose: () => setModalAlert(undefined),
      title: "Start Draft Pick",
      description: "Are you sure you want to start the draft pick session?",
      content: <>
        <div className="mx-4 font-medium">
          Things to know before starting the draft pick session:

        </div>
        <div className="mx-4 mb-4 px-5 py-2 flex flex-col border bg-yellow-50-200 rounded-lg">

          <ul className="list-disc text-yellow-800">
            <li>Player participants cannot be changed</li>
            <li>Draft Pick started from the lowest rank of the players</li>
          </ul>
        </div>
      </>,
      buttons: [
        {
          label: "Yes, Start Draft Pick",
          variant: "outline-primary",
          onClick: () => {
            // TODO: Implement start draft pick logic
            actionStartDraftPick(undefined);
          },
        },
        {
          label: "Cancel",
          variant: "primary",
          onClick: () => {
            setModalAlert(undefined)
          },
        },
      ],
    })

  }
  const handlePickPlayer = (player: IPlayerDraft) => {
    setModalPickPlayer({
      open: true,
      onClose: () => setModalPickPlayer(undefined),
      onPick: (partner) => {
        actionAssignDraftPick({
          player_uuid: player.uuid,
          partner_uuid: partner.uuid,
        });
      },
      player,
      availablePlayers: draftPickPlayers.filter(d => !d.seeded && d.status != "PICKED"),
    })
    // setModalAlert({
    //   open: true,
    //   icon: "Users",
    //   onClose: () => setModalAlert(undefined),
    //   title: "Draft Pick Player",
    //   description: `Help ${player.name} to pick his/her partner in the tournament?`,
    //   size: "lg",
    //   buttons: [
    //     ...draftPickPlayers.filter(d => !d.seeded && d.status != "PICKED").sort(() => Math.random() - 0.5).map(d => ({
    //       label: d.name,
    //       variant: "outline-primary" as const,
    //       onClick: () => {
    //         // TODO: Implement pick player logic
    //         actionAssignDraftPick({
    //           player_uuid: player.uuid,
    //           partner_uuid: d.uuid,
    //         });
    //       },
    //     })),
    //     {
    //       label: "Cancel",
    //       variant: "primary",
    //       onClick: () => {
    //         setModalAlert(undefined)
    //       },
    //     },
    //   ],
    // })
  }
  // const handleAddPlayers = (teams: TournamentParticipant) => {
  //   // TODO: Implement add players logic
  //   setModalAlert({
  //     open: true,
  //     icon: "Info",
  //     onClose: () => setModalAlert(undefined),
  //     title: "Add Players",
  //     description: `Are you sure you want to ${teams.length > 1 ? 'add these' : 'add '} ${teams.length > 1 ? `${teams.length} players` : teams[0]?.player?.name} to the tournament draft-pick?`,
  //     buttons: [
  //       {
  //         label: "Add Player(s)",
  //         variant: "outline-primary",
  //         onClick: () => {
  //           // TODO: Implement add players logic
  //           actionAddToDraftPick(teams);
  //         },
  //       },
  //       {
  //         label: "Add (Seeded)",
  //         variant: "outline-secondary",
  //         onClick: () => {
  //           // TODO: Implement add players logic
  //           actionAddToDraftPick(teams, true);
  //         },
  //       },
  //       {
  //         label: "Cancel",
  //         variant: "primary",
  //         onClick: () => setModalAlert(undefined),
  //       },
  //     ],
  //   })
  // };
  return (
    <div className="flex flex-col h-full gap-2">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Team Draft Pick</h2>
        </div>
      </div>
      {(!draftPickSession && !!approvedDraftPickData?.data?.participants?.filter(dt => !dt.drafted_by).length) && <div className="flex-1 overflow-auto box rounded-lg p-4">
        <div className="mb-4 flex flex-row justify-between items-center">
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-2">Confirmed Players</h3>
            <p className="text-sm text-gray-500">Players who have been confirmed for the tournament draft</p>
          </div>
          {multipleToggle.enable == false ?
            <div>
              <Button className="h-fit" variant="outline-primary" onClick={() => setMultipleToggle({ ...multipleToggle, enable: true })}>Add Multiple</Button>
            </div> :
            <div className="flex flex-row items-center justify-end gap-2">
              <Button className="h-fit" variant="outline-danger" onClick={() => setMultipleToggle({ players: [], enable: false })}>Cancel</Button>
              <Button className="h-fit" variant="primary" disabled={!multipleToggle.players.length} onClick={() => actionAddMultipleToDraftPick(true)}><Lucide icon="ChevronLeft" /> Add as Seeded</Button>
              <Button className="h-fit" variant="outline-primary" disabled={!multipleToggle.players.length} onClick={() => actionAddMultipleToDraftPick(false)}>Add as Reguler <Lucide icon="ChevronRight" /></Button>

            </div>}
        </div>

        {/* Players Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="grid sm:grid-rows-2 sm:grid-flow-col gap-2 sm:h-36 max-h-fit w-fit pb-2">
            {/* Group teams into pairs for columns */}
            {approvedDraftPickData?.data?.participants?.filter(dp => !dp.drafted_by).map((participant, pIndex) => (
              <div
                key={pIndex}
                className={`sm:w-72 w-full sm:max-h-auto max-h-18 row-span-1 flex flex-row items-centr justify-start border rounded-lg overflow-hidden
                  ${multipleToggle.enable && multipleToggle.players.includes(participant.player_uuid) ? "border-primary bg-emerald-50" : "border-gray-200 bg-white"}
                  `}
                onClick={() => {
                  if (!!multipleToggle.enable) {
                    if (multipleToggle.players.includes(participant.player_uuid)) {
                      setMultipleToggle({
                        ...multipleToggle,
                        players: multipleToggle.players.filter(p => p !== participant.player_uuid)
                      })

                    } else {
                      setMultipleToggle({
                        ...multipleToggle,
                        players: [...multipleToggle.players, participant.player_uuid]
                      })
                    }
                  }
                }}
              >
                <div className="aspect-square max-h-16">
                  <Image
                    src={imageResizer(participant?.player?.media_url || '', 200)}
                    alt={participant?.player?.name || ""}
                    className="w-full h-full bg-gray-200 object-cover flex items-center justify-center"
                  />
                </div>
                <div className="flex w-full flex-col items-start justify-around m-0 px-2 py-1">
                  <div className="text-sm font-medium text-gray-900 line-clamp-1 text-ellipsis">{participant?.player?.name}</div>
                  <div>
                    {participant.player?.nickname}
                  </div>
                </div>

                {!multipleToggle.enable ? <div className="flex flex-col items-center justify-between p-1 gap-1">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="p-1"
                    disabled={isAddingDraftPick}
                    onClick={(e) => {
                      e.stopPropagation();
                      actionAddToDraftPick(participant, true)
                    }}
                  >
                    <Lucide icon="ChevronLeft" className="h-4 w-4" />
                    <Lucide icon="UserPlus" className="h-4 w-4 " />
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="p-1"
                    disabled={isAddingDraftPick}
                    onClick={(e) => {
                      e.stopPropagation();
                      actionAddToDraftPick(participant)
                    }}
                  >
                    <Lucide icon="UserPlus" className="h-4 w-4 scale-x-[-1]" />
                    <Lucide icon="ChevronRight" className="h-4 w-4 text-danger" />
                  </Button>
                </div> : <div className="flex flex-col items-center justify-between p-1 gap-1 text-emerald-800">
                  {multipleToggle.players.includes(participant.player_uuid) ? <>
                    <Lucide icon="CheckCircle2" />
                  </> : <>
                    <Lucide icon="Circle" />
                  </>}

                </div>}

              </div>
            ))}

            {approvedDraftPickData?.data?.participants?.filter(dp => !dp.drafted_by).length % 2 === 1 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 border-dashed text-center text-gray-400 text-sm  flex flex-row items-center justify-center gap-2"
                onClick={(() => {
                  navigate(paths.administrator.tournaments.detail({ id: tournamentUuid || "", tab: "participants" }).$)
                })}>
                <Lucide icon="UserPlus" />
                Add Player
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {
          (!approvedDraftPickData?.data?.participants || approvedDraftPickData.data.participants.filter(p => !p.drafted_by).length === 0) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lucide icon="Users" className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">No confirmed players yet</h3>
              <p className="text-sm text-gray-500">
                Players will appear here once they are confirmed for the tournament.
              </p>
            </div>
          )
        }
      </div >}
      <div className={` box rounded-lg p-2 sm:p-4 ${!!draftPickSession || isStarted ? "hidden" : "flex-1"}`}>

        <div className="mb-4 flex flex-col sm:flex-row justify-between">
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-2">Draft Pick Position</h3>
            <p className="text-sm text-gray-500">Arrange the order in which players will be drafted</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-1">
            {isSaved && <Button
              variant="outline-primary"
              className="h-fit gap-1"
              onClick={() => setDraftPickSession(true)}
            >
              <Lucide icon="Play" />
              Continue to Draft Pick Session
            </Button>}
            <Button
              variant="primary"
              className="h-fit gap-1"
              onClick={() => handleUpdatePosition()}
              disabled={isSaved}
            >
              <Lucide icon={isSaved ? "Check" : "UserCheck"} />
              {isSaved ? "Saved" : "Save Position"}
            </Button>
          </div>
        </div>

        <TournamentDraftPickComponent
          tournamentUuid={tournamentUuid || ""}
          players={{
            reguler: draftPickPlayers.filter(dp => !dp.seeded),
            seeded: draftPickPlayers.filter(dp => !!dp.seeded)
          }}
          onChange={async (dp) => {
            const updatedPlayers = [...dp.reguler, ...dp.seeded];
            const updatedPlayerIds = updatedPlayers.map(dp => dp.uuid);
            const deletedPlayers = draftPickPlayers.find(dp => !updatedPlayerIds.includes(dp.uuid));
            if (deletedPlayers) {

              await actionAddDraftPick({
                position: 0,
                seeded: false,
                player_uuid: deletedPlayers.uuid,
                id: deletedPlayers.id,
                status: "APPROVED"
              })
            }

            setDraftPickPlayers(updatedPlayers)
          }}
        />
      </div>
      {
        (!!draftPickSession || isStarted) && <div className="flex-1 p-2 sm:p-4 box rounded-lg">

          <div className="mb-4 flex flex-col sm:flex-row justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Draft Pick Session</h3>
              <p className="text-sm text-gray-500">Arrange the order in which players will be drafted</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-1">
              {/* {isSaved && <Button
              variant="outline-primary"
              className="h-fit gap-1"
              onClick={() => setDraftPickSession(true)}
            >
              <Lucide icon="Play" />
              Continue to Draft Pick Session
            </Button>} */}

              {!isStarted && <Button
                variant="primary"
                className="h-fit gap-1"
                onClick={() => handleStartDraftPick()}
                disabled={!isSaved}
              >
                <Lucide icon={"Play"} />
                Start Draft Pick
              </Button>}
            </div>
          </div>
          <div className="grid grid-cols-12 gap-2 sm:gap-4">
            <div className="col-span-12 box sm:col-span-6 p-2 sm:p-4 rounded-lg">
              <div className="flex flex-col items-center border-b pb-2 relative">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Seeded Players</h3>
                <p className="text-sm text-gray-500">Seeded players will select their team</p>
              </div>
              <div className="flex flex-col mt-2 gap-2">
                {draftPickPlayers?.filter(d => !!d.seeded)?.sort((a, b) => a.position - b.position).map((dPlayer, i) => (
                  <div
                    key={dPlayer.uuid || i}
                    className={`cursor-pointer border rounded-lg p-2 flex flex-row justify-between items-center ${dPlayer.status === "PICKING" ? 'bg-yellow-100' : 'bg-white'}`}
                    onClick={() => {
                      if (dPlayer.status === "PICKING") {
                        handlePickPlayer(dPlayer);
                      }
                    }}
                  >
                    <div className={`flex flex-row items-center gap-2`}>
                      <div className={`border rounded-full w-8 h-8 ${dPlayer.status === "PICKING" ? 'bg-yellow-500 text-white' : 'bg-gray-300'} text-lg items-center font-semibold justify-center flex`}>{dPlayer.position}</div>
                      <div className="flex flex-col">
                        <span className="font-medium">{dPlayer.name}</span>
                        <span className="text-gray-500 text-xs">{dPlayer.nickname !== dPlayer.name && dPlayer.nickname ? dPlayer.nickname : dPlayer.email}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      {dPlayer.status === "PICKING" && <div className="text-xs bg-yellow-500 text-white font-semibold px-2 py-1 rounded-full animate-pulse">Selecting Partner</div>}
                      {dPlayer.status === "AVAILABLE" && <div className="text-xs bg-gray-500 text-white font-semibold px-2 py-1 rounded-full">On Queue</div>}
                      {dPlayer.status === "PICKED" ? <>
                        {(() => {
                          const selectedPartner = draftPickParticipants.find(d => d.drafted_by === dPlayer.uuid)?.player;
                          return selectedPartner ? <div className="flex flex-row items-center bg-emerald-50 px-2 py-1 border border-emerald-800 -my-1 rounded-lg gap-2">
                            <div className="flex flex-col justify-center items-end">
                              <span className="text-xs font-medium">{selectedPartner.name}</span>
                              <span className="text-xs text-gray-500">{selectedPartner.email}</span>
                            </div>
                            <div className="h-7 w-7 overflow-hidden rounded-full">
                              {selectedPartner.media_url ?
                                <Image src={imageResizer(selectedPartner.media_url, 200)} className="w-full h-full object-contain" /> :
                                <div className="h-7 aspect-square bg-gray-300 rounded-full overflow-hidden flex items-center justify-center">
                                  <Lucide icon="UserRound" className="h-full w-full" />
                                </div>
                              }
                            </div>
                          </div> : "";
                        })()}
                      </> : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-12 box sm:col-span-6 p-2 sm:p-4 rounded-lg">
              <div className="flex flex-col items-center border-b pb-2">
                <Button className="absolute top-2 right-2" variant="outline-primary" onClick={() => setToggleBlur(!toggleBlur)}>
                  <Lucide icon={!toggleBlur ? "EyeOff" : "Eye"} />
                </Button>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Regular Players</h3>
                <p className="text-sm text-gray-500">Players available for team selection</p>
              </div>
              <div className="flex flex-col mt-2 gap-2">
                {draftPickPlayers?.filter(d => !d.seeded && d.status == "AVAILABLE")?.sort(() => Math.random() - 0.5).map((dPlayer, i) => (
                  <div key={dPlayer.uuid || i} className={`border rounded-lg p-2 flex flex-row `}>
                    <div className={`flex flex-row items-center gap-2 ${toggleBlur ? 'blur-sm' : ''}`}>
                      <Lucide icon="UserRound" className="border rounded-full w-8 h-8 bg-gray-300" />

                      <div className="flex flex-col">
                        <span className="font-medium">{!toggleBlur ? dPlayer.name : dPlayer.name.substring(3, 10)}</span>
                        <span className="text-gray-500 text-xs">{dPlayer.nickname !== dPlayer.name && dPlayer.nickname ? dPlayer.nickname : dPlayer.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {(!draftPickSession && !!confirmedTeamsData?.data?.teams?.filter(dt => !!dt.id && !draftPickParticipants?.some(dp => dp.player_uuid === dt.players[0]?.player_uuid)).length) && <div className="flex-1 overflow-auto box rounded-lg p-4 mt-4">
            <div className="mb-4 flex flex-row justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Confirmed Teams</h3>
                <p className="text-sm text-gray-500">Teams who have been confirmed for the tournament</p>
              </div>
            </div>

            {/* Players Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max">
                {/* Group teams into pairs for columns */}
                {confirmedTeamsData?.data?.teams?.filter(dt => !!dt.id && !draftPickParticipants?.some(dp => dp.player_uuid === dt.players[0]?.player_uuid))?.reduce((acc, team, index) => {
                  const columnIndex = Math.floor(index / 2);
                  if (!acc[columnIndex]) {
                    acc[columnIndex] = [];
                  }
                  acc[columnIndex].push(team);
                  return acc;
                }, [] as TournamentTeams[][]).map((columnTeams, columnIndex) => (
                  <div key={columnIndex} className="w-80 flex-shrink-0 space-y-2" >
                    {columnTeams.map((team) => (
                      <div
                        key={team.uuid}
                        className={`bg-white border border-gray-200 rounded-lg p-1 hover:shadow-md transition-shadow flex flex-row justify-between items-center ${selectedTeams.some(t => t.uuid === team.uuid) ? 'border-primary !bg-emerald-50' : ''}`}
                      >
                        <div className="space-y-1">
                          {team.players.map((player, index) => (
                            <div key={player.uuid} className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {player.media_url ? <Image
                                  src={imageResizer(player.media_url || '', 200)}
                                  alt={player.name}
                                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                                /> :
                                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-600">
                                      {player.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {player.name}
                                </p>
                                {player.name !== player.nickname &&
                                  <p className="text-xs text-gray-500 truncate">
                                    {player.nickname}
                                  </p>
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="gap-2 flex flex-row items-center">
                          {team.players.some(p => p.status === "APPROVED") ?
                            <Tippy content="One or both team need to confirm">
                              <span className={`text-xs font-medium px-2 py-1 rounded ${team.status !== 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {team.name}
                              </span>
                            </Tippy> :
                            <span className={`text-xs font-medium px-2 py-1 rounded ${team.status !== 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {team.name}
                            </span>}
                        </div>
                      </div>
                    ))}
                    {/* Add empty card if column has only 1 team */}
                  </div>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {
              // (!confirmedTeamsData?.data?.teams || confirmedTeamsData.data.teams.length === 0) && (
              //   <div className="text-center py-12">
              //     <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              //       <Lucide icon="Users" className="w-8 h-8 text-gray-400" />
              //     </div>
              //     <h3 className="text-base font-medium text-gray-900 mb-2">No confirmed players yet</h3>
              //     <p className="text-sm text-gray-500">
              //       Players will appear here once they are confirmed for the tournament.
              //     </p>
              //   </div>
              // )
            }
          </div >
          }
        </div>
      }

      <Confirmation
        open={!!modalAlert?.open}
        onClose={() => setModalAlert(undefined)}
        icon={modalAlert?.icon || "Info"}
        title={modalAlert?.title || ""}
        content={modalAlert?.content}
        description={modalAlert?.description || ""}
        refId={modalAlert?.refId}
        buttons={modalAlert?.buttons}
      />
      <ModalPickPlayer
        open={!!modalPickPlayer?.open}
        onClose={() => setModalPickPlayer(undefined)}
        onPick={(partner) => {
          actionAssignDraftPick({
            player_uuid: modalPickPlayer?.player?.uuid || "",
            partner_uuid: partner.uuid,
          });
          setModalPickPlayer(undefined)
        }}
        key={modalPickPlayer?.player?.uuid || ''}
        player={modalPickPlayer?.player}
        availablePlayers={modalPickPlayer?.availablePlayers?.sort(() => Math.random() - 0.5) || []}
      />
    </div >
  )
}