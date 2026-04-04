import React, { useState } from "react";
import { Modal, Table } from "antd";
import { TournamentsApiHooks } from "../api";
import Button from "@/components/Base/Button";
import Image from "@/components/Image";
import Lucide from "@/components/Base/Lucide";
import moment from "moment";
import { Link } from "react-router-dom";
import { Menu } from "@/components/Base/Headless";
import { queryClient } from "@/utils/react-query";

interface ModalRejectedParticipantsProps {
  tournamentUuid: string;
  open: boolean;
  onClose: () => void;
  isDraftPick?: boolean
}

interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
}

export const ModalRejectedParticipants: React.FC<ModalRejectedParticipantsProps> = ({
  tournamentUuid,
  open,
  onClose,
  isDraftPick
}) => {
  const [pagination, setPagination] = useState<PaginationConfig>({
    current: 1,
    pageSize: 20,
    total: 0
  });

  // Get rejected teams
  const { data: rejectedTeamsData, isLoading } = TournamentsApiHooks.useGetTournamentTeamParticipants({
    params: {
      tournamentUuid: tournamentUuid || ""
    },
    queries: {
      status: "rejected",
      page: pagination.current.toString(),
      limit: pagination.pageSize.toString()
    }
  }, {
    enabled: !!tournamentUuid && open
  });

  const rejectedTeams = rejectedTeamsData?.data?.teams || [];
  const totalTeams = rejectedTeamsData?.data?.totalTeams || 0;

  // Update pagination total when data changes
  React.useEffect(() => {
    if (totalTeams !== pagination.total) {
      setPagination(prev => ({ ...prev, total: totalTeams }));
    }
  }, [totalTeams, pagination.total]);

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination({
      current: page,
      pageSize: pageSize,
      total: pagination.total
    });
  };

  const { mutate: updateStatus } = TournamentsApiHooks.useUpdateTournamentTeamApproval({
    params: {
      tournamentUuid: tournamentUuid || ""
    }
  }, {
    onSuccess: () => {
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentTeamParticipants") })
      queryClient.invalidateQueries({ queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentParticipants") })
      queryClient.invalidateQueries({ queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentTeams") })
    }
  });

  const handleUpdateStatus = (teamUuid: string, status: "approved" | "requested" | "confirmed") => {
    updateStatus({
      teamUuid,
      status: status
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width="90%"
      title={
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-900">
            Rejected {isDraftPick ? "Players" : "Teams"} ({rejectedTeams.length})
          </span>
        </div>
      }
      footer={[
        <Button
          key="close-button"
          variant="primary"
          onClick={onClose}
        >
          Close
        </Button>
      ]}
    >
      <div className="mt-4">
        <Table
          dataSource={rejectedTeams}
          rowKey="uuid"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: handlePaginationChange,
            onShowSizeChange: handlePaginationChange,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} teams`
          }}
          loading={isLoading}
          className="w-full"
          columns={[
            ...(!isDraftPick ? [{
              title: "Team",
              dataIndex: "uuid",
              key: "team_name",
              render: (team_name: string) => (
                <div className="font-medium">{team_name}</div>
              )
            }] : []),
            {
              title: "Players",
              key: "players",
              render: (_, record: any) => (
                <div className="flex flex-col items-start justify-center gap-2">
                  {record.players.map((player: any, index: number) => (
                    <Link key={index} to={`/admin/players/${player.uuid}`} className="flex items-center gap-1">
                      <Image
                        key={index}
                        src={player.media_url || '/path/to/default-avatar.jpg'}
                        alt={player.name || 'Player'}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-sm">{player.name}</span>
                    </Link>
                  ))}
                </div>
              )
            },
            {
              title: "Registered At",
              dataIndex: "registeredAt",
              key: "registeredAt",
              render: (registeredAt: string) => (
                <div className="text-sm text-gray-600">
                  {moment(registeredAt).format('DD MMM YYYY')} at {moment(registeredAt).format('HH:mm')}
                </div>
              )
            },
            {
              title: "Status",
              key: "status",
              render: (_, record: any) => (
                <div className="flex items-center gap-2">
                  <span className="inline-flex px-2 py-1 w-fit text-xs font-medium rounded-full bg-red-100 text-red-800">
                    {record.status}
                  </span>

                  <Menu>
                    <Menu.Button className="p-1">
                      <Lucide icon="MoreVertical" className="w-4 h-4 text-gray-500" />
                    </Menu.Button>
                    <Menu.Items className="w-48 mt-px">
                      <Menu.Item key={"approved"} onClick={() => handleUpdateStatus(record.uuid, 'approved')}>
                        Mark as Approved
                      </Menu.Item>
                      <Menu.Item key={"confirmed"} onClick={() => handleUpdateStatus(record.uuid, 'confirmed')}>
                        Mark as Confirmed
                      </Menu.Item>
                      <Menu.Item key={"requested"} onClick={() => handleUpdateStatus(record.uuid, 'requested')}>
                        Mark as Requested
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </div>
              )
            }
          ]}
          locale={{
            emptyText: rejectedTeams.length === 0 && !isLoading ? (
              <div className="text-center py-8">
                <Lucide icon="Users" className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No rejected {isDraftPick ? 'players' : `teams`} found</p>
              </div>
            ) : null
          }}
        />
      </div>
    </Modal>
  );
};