import React, { useState } from "react";
import { Divider, Table } from "antd";
import { TournamentsApiHooks } from "../api";
import { draftPickStatusEnum, DraftPickStatusEnum, TournamentParticipant, TournamentsPayload } from "../api/schema";
import Button from "@/components/Base/Button";
import Image from "@/components/Image";
import { Menu } from "@/components/Base/Headless";
import Lucide from "@/components/Base/Lucide";
import moment from "moment";
import { Link } from "react-router-dom";
import { paths } from "@/router/paths";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { queryClient } from "@/utils/react-query";
import { ModalListParticipants } from "./ModalListParticipants";
import { ColumnType } from "antd/es/table";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";
import { ModalAddPlayer } from "./ModalAddPlayer";

interface TournamentDraftPickParticipantsProps {
  tournamentUuid: string;
  data?: TournamentsPayload;
}

interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
}

export const TournamentDraftPickParticipants: React.FC<TournamentDraftPickParticipantsProps> = ({
  tournamentUuid,
  data
}) => {
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const [showlistModal, setShowlistModal] = useState<"REJECTED" | "REQUESTED" | undefined>(undefined);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const screens = useBreakpoint();
  const [pagination, setPagination] = useState<PaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Helper function to format player name
  const formatPlayerName = (player: any) => {
    const name = player.name || 'Unknown Player';
    const nickname = player.nickname ? ` (${player.nickname})` : '';
    const level = player.level ? ` ${player.level}` : '';
    return `${name}${nickname}${level}`;
  };

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentTeamParticipants") })
    queryClient.invalidateQueries({ queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentParticipants") })
    queryClient.invalidateQueries({ queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentDraftParticipants") })
    queryClient.invalidateQueries({ queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentTeams") })
  }
  // Team approval mutation
  const { mutateAsync: updateParticipant, isPending: isUpdatingParticipant } = TournamentsApiHooks.useUpdateTournamentParticipant({
    params: {
      tournamentUuid: tournamentUuid || "",
    }
  }, {
    onSuccess(data, variables, context) {
      invalidateQueries();
    },
  });

  // Get requested Players
  const { data: requestedTeamsData } = TournamentsApiHooks.useGetTournamentDraftParticipants({
    params: {
      tournamentUuid: tournamentUuid || "",
    },
    queries: {
      status: ["REQUESTED"],
      page: pagination.current,
      limit: pagination.pageSize
    }
  }, {
    enabled: !!tournamentUuid
  });

  // Get confirmed teams
  const { data: confirmedTeamsData } = TournamentsApiHooks.useGetTournamentDraftParticipants({
    params: {
      tournamentUuid: tournamentUuid || ""
    },
    queries: {
      status: ["APPROVED", "CONFIRMED"],
      page: pagination.current,
      limit: pagination.pageSize
    }
  }, {
    enabled: !!tournamentUuid
  });

  // Get rejected teams
  const { data: rejectedTeamsData } = TournamentsApiHooks.useGetTournamentDraftParticipants({
    params: {
      tournamentUuid: tournamentUuid || ""
    },
    queries: {
      status: ["REJECTED"],
      page: pagination.current,
      limit: pagination.pageSize
    }
  }, {
    enabled: !!tournamentUuid
  });

  const requestedTeams = requestedTeamsData?.data?.participants || [];
  const registeredTeams = confirmedTeamsData?.data?.participants || [];
  const rejectedTeams = rejectedTeamsData?.data?.participants || [];

  const { data: matchesData } = TournamentsApiHooks.useGetTournamentMatches({
    queries: {
      tournament_uuid: tournamentUuid || ""
    }
  }, {
    enabled: !!tournamentUuid
  });
  const groupIsLocked = matchesData?.data?.some(match => match.group_uuid);

  // Update pagination when data changes
  const totalTeams = (requestedTeamsData?.data?.pagination?.total || 0)
  // Handle pagination change
  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination({
      current: page,
      pageSize,
      total: pagination.total
    });
  };

  const handleManuallyAddTeam = () => {
    setShowAddTeamModal(true);
  };

  const handleCloseAddTeamModal = () => {
    setShowAddTeamModal(false);
  };

  const actionUpdateTeamApproval = async (id: number, playerUuid: string, status: DraftPickStatusEnum) => {
    setModalAlert(undefined);
    const result = await updateParticipant({
      draft_pick_id: id,
      player_uuid: playerUuid,
      status: status
    }).catch((error) => {
      console.error("Error updating team approval:", error);
    });
    invalidateQueries();
    // Show success message
    setModalAlert({
      open: true,
      icon: "CheckCircle2",
      title: "Success",
      description: `Team participant ${status} successfully`,
      onClose: () => setModalAlert(undefined),
      buttons: [
        {
          label: "Got it",
          variant: "primary",
          onClick: () => setModalAlert(undefined)
        }
      ]
    });
  }

  // Handle team approval
  const handleTeamApproval = async (id: number, status: 'approved' | 'rejected' | 'requested') => {
    try {
      const team = requestedTeams.find(d => d.id === id)
      setModalAlert({
        open: true,
        icon: "Users",
        title: status === "approved" ? `Approve Team` : status == "rejected" ? "Reject Team?" : "Team Confirmed",
        description: status === "approved" ? `Are you sure you want to approve ${team?.player?.name} ${!!team?.partner?.name ? "& " + team?.partner?.name : ''}?` : status == "rejected" ? `Are you sure you want to reject ${team?.player?.name} ${!!team?.partner?.name ? "& " + team?.partner?.name : ''}?` : "Team confirmed",
        onClose: () => setModalAlert(undefined),
        size: "lg",
        content: team?.attachment ? <div className="p-2 rounded-lg overflow-hidden">
          <Image src={team.attachment} alt="" className="w-full max-h-32 hover:max-h-fit object-contain" />
        </div> : <>sss</>,
        buttons: status === "rejected" ? [
          {
            label: "Reject",
            variant: "danger",
            onClick: async () => {
              actionUpdateTeamApproval(id, team?.player?.uuid || "", status.toUpperCase() as DraftPickStatusEnum);
            }
          },
          {
            label: "Cancel",
            variant: "outline-primary",
            onClick: () => setModalAlert(undefined)
          }
        ] : [
          {
            label: "Approve",
            variant: "primary",
            onClick: async () => {
              actionUpdateTeamApproval(id, team?.player?.uuid || "", status.toUpperCase() as DraftPickStatusEnum);
            }
          },
          // {
          //   label: "Confirmed to Join",
          //   variant: "outline-primary",
          //   onClick: () => actionUpdateTeamApproval(id, team?.player?.uuid || "", status.toUpperCase() as DraftPickStatusEnum)
          // },
          {
            label: "Cancel",
            variant: "outline-danger",
            onClick: () => setModalAlert(undefined)
          }
        ]
      });

    } catch (error: any) {
      // Show error message
      setModalAlert({
        open: true,
        icon: "XCircle",
        title: "Error",
        description: error.message || "Failed to update team status",
        onClose: () => setModalAlert(undefined),
        buttons: [
          {
            label: "OK",
            variant: "primary",
            onClick: () => setModalAlert(undefined)
          }
        ]
      });
    }
  };

  const tableColumns: ColumnType<TournamentParticipant>[] = [
    {
      title: "Players",
      key: "player",
      responsive: ['lg'],

      render: (_, record: any) => (
        <div className="flex flex-col items-start justify-center gap-1">
          {record.player && (
            <Link key={record.player.uuid} to={`/admin/players/${record.player.uuid}`} className="flex items-center gap-1 hover:bg-gray-50 p-1 rounded">
              <Image
                src={record.player.media_url || '/path/to/default-avatar.jpg'}
                alt={record.player.name || 'Player'}
                className="w-5 h-5 rounded-full object-cover flex-shrink-0"
              />
              <span className="text-xs truncate max-w-[150px]" title={record.player.name}>{record.player.name}</span>
            </Link>
          )}{record.partner && (
            <Link key={record.partner.uuid} to={`/admin/players/${record.partner.uuid}`} className="flex items-center gap-1 hover:bg-gray-50 p-1 rounded">
              <Image
                src={record.partner.media_url || '/path/to/default-avatar.jpg'}
                alt={record.partner.name || 'Player'}
                className="w-5 h-5 rounded-full object-cover flex-shrink-0"
              />
              <span className="text-xs truncate max-w-[150px]" title={record.player.name}>{record.player.name}</span>
            </Link>
          )}
        </div>
      )
    },
    {
      title: "Registered",
      dataIndex: "registeredAt",
      key: "registeredAt",
      width: 140,
      responsive: ['lg'],
      render: (registeredAt: string) => (
        <div className="text-xs text-gray-600">
          <div>{moment(registeredAt).format('DD MMM YYYY')}</div>
          <div className="text-xs text-gray-400">{moment(registeredAt).format('HH:mm')}</div>
        </div>
      )
    },
    {
      title: "Status",
      key: "status",
      responsive: ['lg'],
      width: 120,
      render: (_, record) => (
        <div className="flex flex-col gap-2">
          <div key={record.id} className="flex flex-row justify-center gap-1">
            <span className={`inline-flex px-2 py-1 w-fit text-xs font-medium rounded-full ${record.status.toLowerCase() === 'confirmed'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
              }`}>
              {record.status}
            </span>
          </div>
        </div>
      )
    },
    {
      title: "Actions",
      key: "player",
      width: 100,
      align: "center",
      responsive: ['lg'],
      render: (_, record) => (
        <div className="flex flex-col gap-2">

          <div key={record.id} className="flex justify-center gap-1">
            <Button
              variant="outline-danger"
              size="sm"
              className="px-1.5 py-1.5 min-w-[32px] h-[32px]"
              disabled={groupIsLocked}
              onClick={() => handleTeamApproval(record.id || 0, "rejected")}
            >
              <Lucide icon="Trash" className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )
    }
  ]
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Requested Teams Section */}
      {requestedTeams.length > 0 && <div className="col-span-12 box p-4">
        <div className="flex sm:flex-row flex-col sm:items-center items-start justify-between mb-3">
          <div className="flex flex-row items-center gap-2">
            <h2 className="font-medium">Requested Players</h2>
            <Button size="sm" className="h-6 px-4 !text-xs" onClick={() => setShowlistModal("REQUESTED")}>See All</Button>
          </div>
          <span className="text-sm text-gray-500">{requestedTeams.length} pending</span>
        </div>
        {/* Horizontal scrollable list for mobile */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {requestedTeams.map((team) => (
              <div key={team.id} className="bg-white border border-gray-200 rounded-lg py-2 px-4 sm:min-w-[360px] min-w-[60vw] ">
                <div className="flex flex-row items-center justify-between mb-2">
                  <h3 className="font-medium text-xs text-gray-900 truncate">Request Code: {team.player_uuid?.substring(0, 2).toUpperCase()}{team.id}</h3>
                  <div className="text-xs text-gray-500 pl-4">
                    {moment(team.createdAt).format('DD MMM YYYY')} at {moment(team.createdAt).format('HH:mm')}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  {/* Team Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col items-start justify-center gap-2 mt-1">
                      {team.player &&
                        <Link key={team.player.uuid} to={paths.administrator.players.edit({ player: team.player.uuid || "" }).$} className="flex items-center gap-2">
                          <Image
                            src={team.player.media_url || '/path/to/default-avatar.jpg'}
                            alt={team.player.name || 'Player'}
                            className="h-8 max-h-8 rounded-full object-cover aspect-square"
                          />
                          <div className="flex-col flex">
                            <span className="text-sm text-gray-800 truncate">{team.player.name} {(team.player.nickname && team.player.nickname !== team.player.name) && <span className="text-xs italic text-gray-500">({team.player.nickname})</span>}</span>
                            <span className="text-xs text-gray-500">{team.player.level?.name}</span>
                          </div>
                        </Link>
                      }
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2 flex-shrink-0 justify-end h-full">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="px-3 py-1"
                      onClick={() => team.id && handleTeamApproval(team.id, 'rejected')}
                      disabled={isUpdatingParticipant}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="px-3 py-1"
                      onClick={() => team.id && handleTeamApproval(team.id, 'approved')}
                      disabled={isUpdatingParticipant || groupIsLocked}
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>}

      {/* Registered Teams Section */}
      <div className="col-span-12 box p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2 sm:gap-0">
          <div className="flex flex-row gap-2 items-center">
            <h2 className="font-medium">Registered Players</h2>
            <Button
              variant="outline-primary"
              size="sm"
              className="text-xs"
              onClick={handleManuallyAddTeam}
              disabled={groupIsLocked}
            >
              <Lucide icon="Plus" className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="flex flex-row items-center gap-2">
            <button
              onClick={() => setShowlistModal("REJECTED")}
              className="text-red-500 hover:text-red-700 border-red-600 border rounded px-2 text-xs py-1"
            >
              {rejectedTeams.length} Rejected
            </button>
            <span className="text-sm text-gray-500">{registeredTeams.length} Players</span>
          </div>
        </div>
        <Divider className="mb-4" />

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <Table
            dataSource={registeredTeams}
            rowKey="uuid"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: false,
              onChange: handlePaginationChange,
              className: "responsive-pagination"
            }}
            className="w-full responsive-table"

            columns={tableColumns}
            expandable={{
              expandedRowRender: (record) => (
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                </div>
              ),
              showExpandColumn: (screens.xs || screens.sm) && !screens.md,
              expandIcon: ({ expanded, onExpand, record }) => (
                <div className="flex flex-row">
                  {/* <button
                    onClick={(e) => onExpand(record, e)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Lucide icon={expanded ? "ChevronUp" : "ChevronDown"} className="w-4 h-4" />
                  </button> */}
                  <div className="flex flex-col items-start w-full">
                    <span className="font-semibold">
                      {record.player?.name}{record.partner?.name && `/${record.partner.name}`}
                    </span>
                    <span className="text-xs text-gray-500">{moment(record.createdAt).format('DD MMM YYYY HH:mm')}</span>
                    <div className="flex flex-row justify-between w-full items-end">
                      <span className="text-[10px] bg-yellow-100 h-fit font-medium px-2 py-1 rounded text-yellow-800">{record.status}</span>

                    </div>
                  </div>

                  <div className="flex flex-col justify-end items-end gap-1 mt-2">
                    {record.status === 'APPROVED' && (
                      <Menu>
                        <Menu.Button className="flex items-center justify-center rounded-md h-6 w-6 border border-emerald-800 p-1.5 shadow-none hover:bg-emerald-50" disabled={groupIsLocked}>
                          <Lucide icon="Settings2" className="w-3.5 h-3.5 !text-emerald-800" />
                        </Menu.Button>
                        <Menu.Items className="w-48 mt-px z-99">
                          <Menu.Item onClick={() => !groupIsLocked && actionUpdateTeamApproval(record.id, record.player_uuid, draftPickStatusEnum.Enum.AVAILABLE)}>
                            Mark as Confirmed
                          </Menu.Item>
                          <Divider className="m-0" />
                          <Menu.Item onClick={() => !groupIsLocked && actionUpdateTeamApproval(record.id || 0, record.player_uuid, draftPickStatusEnum.Enum.APPROVED)}>
                            Process Payment
                          </Menu.Item>
                        </Menu.Items>
                      </Menu>
                    )}
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="px-1 py-1 h-6 w-6"
                      onClick={() => handleTeamApproval(record.id || 0, 'rejected')}
                      disabled={groupIsLocked}
                    >
                      <Lucide icon="Trash" className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ),
              columnWidth: 40
            }}
          />
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
        content={modalAlert?.content}
      />

      <ModalListParticipants
        tournamentUuid={tournamentUuid || ""}
        open={!!showlistModal}
        onClose={() => setShowlistModal(undefined)}
        isDraftPick
        mode={showlistModal}
        action={handleTeamApproval}
      />

      <ModalAddPlayer
        tournamentUuid={tournamentUuid || ""}
        open={showAddTeamModal}
        onClose={handleCloseAddTeamModal}
      />
    </div>
  );
};