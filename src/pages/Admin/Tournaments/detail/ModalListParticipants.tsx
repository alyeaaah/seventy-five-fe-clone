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
import { ColumnType } from "antd/es/table";
import { TournamentParticipant } from "../api/schema";

interface ModalListParticipantsProps {
  tournamentUuid: string;
  open: boolean;
  onClose: () => void;
  isDraftPick?: boolean;
  mode?: "REJECTED" | "REQUESTED"
  action?: (id: number, status: 'approved' | 'rejected' | 'requested') => void;
}

interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
}

export const ModalListParticipants: React.FC<ModalListParticipantsProps> = ({
  tournamentUuid,
  open,
  onClose,
  isDraftPick,
  mode,
  action
}) => {
  const [pagination, setPagination] = useState<PaginationConfig>({
    current: 1,
    pageSize: 20,
    total: 0
  });

  // Get listed teams
  const { data: listedTeamsData, isLoading } = TournamentsApiHooks.useGetTournamentDraftParticipants({
    params: {
      tournamentUuid: tournamentUuid || ""
    },
    queries: {
      status: mode ? [mode] : ["REJECTED"],
      page: pagination.current,
      limit: pagination.pageSize
    }
  }, {
    enabled: !!tournamentUuid && open
  });

  const listedTeams = listedTeamsData?.data?.participants || [];
  const totalTeams = listedTeamsData?.data?.pagination?.total || 0;

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

  // Team approval mutation
  const { mutateAsync: updateParticipant, isPending: isUpdatingParticipant } = TournamentsApiHooks.useUpdateTournamentParticipant({
    params: {
      tournamentUuid: tournamentUuid || "",
    }
  }, {
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentTeamParticipants") })
      queryClient.invalidateQueries({ queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentParticipants") })
      queryClient.invalidateQueries({ queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentDraftParticipants") })
      queryClient.invalidateQueries({ queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentTeams") })
    },
  });

  const handleUpdateStatus = (teamUuid: number, player_uuid: string, status: "APPROVED" | "REQUESTED" | "REJECTED") => {
    updateParticipant({
      draft_pick_id: teamUuid,
      player_uuid: player_uuid,
      status: status
    });
  };
  const tableCol: ColumnType<TournamentParticipant>[] = [
    {
      title: "Players",
      key: "players",
      render: (_, record) => (
        <div className="flex flex-col items-start justify-center gap-2">
          {record.player &&
            <Link to={`/admin/players/${record.player.uuid}`} className="flex items-center gap-1">
              <Image
                src={record.player.media_url || '/path/to/default-avatar.jpg'}
                alt={record.player.name || 'Player'}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-sm">{record.player.name}</span>
            </Link>
          }
        </div>
      )
    },
    {
      title: "Registered At",
      dataIndex: "createdAt",
      responsive: ["sm"],
      key: "createdAt",
      render: (createdAt: string) => (
        <div className="text-sm text-gray-600">
          {moment(createdAt).format('DD MMM YYYY')} at {moment(createdAt).format('HH:mm')}
        </div>
      )
    },
    {
      title: "Status",
      responsive: ["sm"],
      key: "status",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {
            record.status === "REJECTED" && (
              <span className="inline-flex px-2 py-1 w-fit text-xs font-medium rounded-full bg-red-100 text-red-800">
                {record.status}
              </span>
            )
          }
          {
            record.status === "REQUESTED" && (
              <span className="inline-flex px-2 py-1 w-fit text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                {record.status}
              </span>
            )
          }
        </div>
      )
    },
    {
      title: "Action",
      key: "status",
      render: (_, record) => (
        <div className="flex flex-row items-center gap-2">
          <Button
            key={"approved"}
            onClick={() => action && action(record.id, "approved")}
            size="sm"
            variant="primary"
          >
            <Lucide icon="Check" className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Mark as Approved</span>
          </Button>
          {mode === "REQUESTED" ?
            <Button
              key={"confirmed"}
              onClick={() => action && action(record.id, "rejected")}
              variant="outline-danger"
              size="sm"
            >
              <Lucide icon="X" className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Mark as Rejected</span>
            </Button> :
            <Button
              key={"requested"}
              onClick={() => handleUpdateStatus(record.id, record.player_uuid, 'REQUESTED')}
              size="sm"
            >
              <Lucide icon="History" className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Mark as Requested</span>
            </Button>
          }
        </div>
      )
    }
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width="90%"
      title={
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-900">
            {mode === "REQUESTED" ? "Requested" : "Rejected"} {isDraftPick ? "Players" : "Teams"} ({listedTeams.length})
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
          dataSource={listedTeams}
          key={mode || "REJECTED"}
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
          columns={tableCol}
          locale={{
            emptyText: listedTeams.length === 0 && !isLoading ? (
              <div className="text-center py-8">
                <Lucide icon="Users" className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No listed {isDraftPick ? 'players' : `teams`} found</p>
              </div>
            ) : null
          }}
        />
      </div>
    </Modal>
  );
};