import React, { useEffect, useState } from "react";
import { TournamentsApiHooks } from "../api";
import { TournamentsPayload, TournamentTeams } from "../api/schema";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import { Table } from "antd";
import { GroupStage } from "@/components/TournamentDrawing";
import { IGroup, ITeam } from "@/components/TournamentDrawing/interfaces";
import { alphabetToNumber, convertTournamentTeamToTeam } from "@/utils/drawing.util";
import { Menu } from "@/components/Base/Headless";
import { ColumnType } from "antd/es/table";
import { PublicTournamentApiHooks } from "@/pages/Public/Tournament/api";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";

interface TournamentDetailGroupsProps {
  tournamentUuid: string;
  data?: TournamentsPayload;
}

export const TournamentDetailGroups: React.FC<TournamentDetailGroupsProps> = ({
  tournamentUuid,
  data
}) => {
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50
  });
  const { showNotification } = useToast();
  const [assignmentHistory, setAssignmentHistory] = useState<Array<{
    teamUuid: string;
    groupId: number;
    groupName: string;
    type: 'manual' | 'auto';
    timestamp: number;
  }>>([]);

  const { mutateAsync: actionUpdateGroup, isLoading: isLoadingGroupUpdate } = TournamentsApiHooks.useUpdateTournamentGroupsTeams({
    params: {
      uuid: tournamentUuid || ""
    }
  }, {
    onSuccess: () => {
      console.log('Group updated successfully');
      showNotification({
        text: "Group updated successfully",
        duration: 3000,
        icon: "CheckCircle"
      });
      queryClient.invalidateQueries({
        queryKey: PublicTournamentApiHooks.getKeyByAlias("getGroupsByTournament")
      });
    },
    onError: (error) => {
      console.error('Failed to update group:', error);
      showNotification({
        text: `Failed to update group: ${error.message}`,
        duration: 3000,
        icon: "XCircle"
      });
    }
  });
  const { data: tournamentGroups, isLoading: isLoadingGroup } = PublicTournamentApiHooks.useGetGroupsByTournament({
    params: {
      tournament_uuid: tournamentUuid || ""
    }
  }, {
    enabled: !!tournamentUuid
  });

  // Get confirmed teams
  const { data: confirmedTeamsData, isLoading } = TournamentsApiHooks.useGetTournamentTeamParticipants({
    params: {
      tournamentUuid: tournamentUuid || ""
    },
    queries: {
      status: "confirmed",
      page: pagination.current.toString(),
      limit: pagination.pageSize.toString()
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

  const confirmedTeams = confirmedTeamsData?.data?.teams?.filter(team => team.players.length === 2) || [];
  console.log('confirmedTeams', confirmedTeams);
  const totalGroups = data?.total_group || 4;

  // // Calculate paginated data
  // const startIndex = (pagination.current - 1) * pagination.pageSize;
  // const endIndex = startIndex + pagination.pageSize;
  // const paginatedTeams = confirmedTeams.slice(startIndex, endIndex);

  // Handle pagination changes
  const handleTableChange = (paginationConfig: any, filters: any, sorter: any) => {
    setPagination({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    });
  };


  // Convert teams data to ITeam format
  const convertTeamsToITeams = (teams: TournamentTeams[]): ITeam[] => {

    return convertTournamentTeamToTeam(teams);
  };

  // Convert current groups structure to IGroup format for GroupStage
  const groupStageGroups: IGroup[] = groups.map(group => ({
    ...group,
    teams: Array.isArray(group.teams) ? group.teams.map((team: any) => convertTeamsToITeams([team])[0]) : []
  }));

  const handleGroupsChange = (newGroups: IGroup[]) => {
    // Update position for all teams based on their order in each group
    const groupsWithPositions = newGroups.map(group => ({
      ...group,
      teams: group.teams.map((team, index) => ({
        ...team,
        position: index + 1 // Set position based on array index + 1
      }))
    }));
    setGroups(groupsWithPositions);
  };
  const handleTeamRemove = (team: ITeam) => {
    const updatedGroups = groups.map(group => ({
      ...group,
      teams: group.teams.filter(t => t.uuid !== team.uuid)
    }));
    setGroups(updatedGroups);
  };

  const handleAutoAssign = () => {
    const availableTeams = convertTeamsToITeams(confirmedTeams);
    const shuffledTeams = availableTeams.sort(() => Math.random() - 0.5);
    const updatedGroups = groups.map(group => ({ ...group, teams: [] as ITeam[] }));
    console.log(availableTeams, confirmedTeams);

    shuffledTeams.forEach((team, index) => {
      const groupIndex = index % totalGroups;
      updatedGroups[groupIndex].teams.push(team);
    });

    // Update positions based on team order in each group
    const groupsWithPositions = updatedGroups.map(group => ({
      ...group,
      teams: group.teams.map((team, index) => ({
        ...team,
        position: index + 1
      }))
    }));

    setGroups(groupsWithPositions);
  };

  const handleAssignUnassignedOnly = () => {
    const newgroups = handleUndoLastAutoAssignment() || groups;
    // Get unassigned teams
    const unassignedTeams = confirmedTeams.filter(team =>
      !newgroups.some(group =>
        group.teams.some(t => t.uuid === team.uuid)
      )
    );

    if (unassignedTeams.length === 0) {
      return; // No unassigned teams to assign
    }

    const convertedTeams = convertTeamsToITeams(unassignedTeams);
    const shuffledTeams = convertedTeams.sort(() => Math.random() - 0.5);
    const updatedGroups = [...newgroups];

    // Track new assignments for undo functionality
    const newAssignments: Array<{
      teamUuid: string;
      groupId: number;
      groupName: string;
      type: 'auto';
      timestamp: number;
    }> = [];

    shuffledTeams.forEach((team, index) => {
      const groupIndex = index % totalGroups;
      updatedGroups[groupIndex].teams.push(team);

      // Track assignment
      newAssignments.push({
        teamUuid: team.uuid || '',
        groupId: Number(updatedGroups[groupIndex].id) || 0,
        groupName: updatedGroups[groupIndex].name || '',
        type: 'auto',
        timestamp: Date.now()
      });
    });

    // Update positions based on team order in each group
    const groupsWithPositions = updatedGroups.map(group => ({
      ...group,
      teams: group.teams.map((team, index) => ({
        ...team,
        position: index + 1
      }))
    }));

    // Add to assignment history
    setAssignmentHistory(prev => [...prev, ...newAssignments]);
    setGroups(groupsWithPositions);
  };

  const handleUndoLastAutoAssignment = () => {
    // Get the most recent auto assignments
    const autoAssignments = assignmentHistory.filter(a => a.type === 'auto');
    if (autoAssignments.length === 0) return;

    // Group assignments by timestamp to undo in batches
    const latestTimestamp = Math.max(...autoAssignments.map(a => a.timestamp));
    const latestAssignments = autoAssignments.filter(a => a.timestamp === latestTimestamp);

    // Remove the latest auto-assigned teams from groups
    const updatedGroups = groups.map(group => {
      const teamsToRemove = latestAssignments
        .filter(a => a.groupId === group.id)
        .map(a => a.teamUuid);

      return {
        ...group,
        teams: group.teams.filter(team => !teamsToRemove.includes(team.uuid))
      };
    });

    // Remove from history
    setAssignmentHistory(prev =>
      prev.filter(a => a.timestamp !== latestTimestamp)
    );

    setGroups(updatedGroups);
    return updatedGroups;
  };

  const updateAssignmentHistory = (teamUuid: string, groupId: number, groupName: string, type: 'manual' | 'auto') => {
    setAssignmentHistory(prev => [...prev, {
      teamUuid,
      groupId,
      groupName,
      type,
      timestamp: Date.now()
    }]);
  };

  const handleAddToGroup = (teamUuid: string, groupId: number | string) => {
    const teamToAdd = confirmedTeams.find(team => team.uuid === teamUuid);
    if (!teamToAdd) return;

    const targetGroupId = typeof groupId === 'number' ? groupId : parseInt(groupId.toString());
    const targetGroup = groups.find(g => g.id === targetGroupId);

    const updatedGroups = groups.map(group => {
      if (group.id === targetGroupId) {
        const newTeam = convertTeamsToITeams([teamToAdd])[0];
        const existingTeams = group.teams.filter(t => t.uuid !== teamUuid);
        const allTeams = [...existingTeams, newTeam];

        // Update positions based on team order
        return {
          ...group,
          teams: allTeams.map((team, index) => ({
            ...team,
            position: index + 1
          }))
        };
      }
      return group;
    });

    // Track manual assignment
    if (targetGroup) {
      updateAssignmentHistory(teamUuid, targetGroupId, targetGroup.name || '', 'manual');
    }

    setGroups(updatedGroups);
  };

  useEffect(() => {
    if (tournamentGroups?.data && tournamentGroups.data.length > 0) {
      // Convert tournamentGroups to IGroup format and populate with existing teams
      const convertedGroups: IGroup[] = tournamentGroups.data.map((group) => ({
        id: group.id,
        uuid: group.group_uuid,
        groupKey: alphabetToNumber(group.group_name?.split(' ')[1] || 'A'),
        name: group.group_name || `Group ${group.id}`,
        teams: group.teams ? convertTeamsToITeams(group.teams.map(t => ({
          alias: t.alias || "",
          name: t.name || "",
          uuid: t.uuid || "",
          players: t.players?.map((tp, tpi) => ({
            id: tpi,
            name: tp.name || "",
            uuid: tp.uuid || "",
            media_url: tp.media_url || "",
            city: tp.city || "",
            nickname: tp.nickname || ""
          })) || [],
        }))).map((team, index) => ({
          ...team,
          position: index + 1 // Set position based on array index + 1
        })) : []
      }));
      setGroups(convertedGroups);
    } else {
      // Initialize empty groups if no tournament groups exist
      const initialGroups: IGroup[] = [];
      for (let i = 1; i <= totalGroups; i++) {
        initialGroups.push({
          id: i,
          groupKey: i,
          name: `Group ${String.fromCharCode(64 + i)}`, // A, B, C, D...
          teams: []
        });
      }
      setGroups(initialGroups);
    }
  }, [tournamentGroups, totalGroups]);

  const handleClearAll = () => {
    const clearedGroups = groups.map(group => ({ ...group, teams: [] }));
    setGroups(clearedGroups);
  };
  const tableCol: ColumnType<TournamentTeams>[] = [
    {
      title: "Team Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record) => (
        <div className="font-medium text-sm">{name}</div>
      )
    },
    {
      title: "Players",
      key: "players",
      render: (_, record) => (
        <div className="text-sm text-gray-600">
          {record.players.map((pl) => pl.name).join("/")}
        </div>
      )
    },
    {
      title: "Status",
      key: "status",
      render: (_, record: any) => {
        const isAssigned = groups.some(group =>
          group.teams.some(t => t.uuid === record.uuid)
        );

        if (isAssigned) {
          const assignedGroup = groups.find(group =>
            group.teams.some(t => t.uuid === record.uuid)
          );
          return (
            <div className="py-1">
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                Assigned to {assignedGroup?.name || 'Unknown'}
              </span>
            </div>
          );
        } else {
          return (
            <Menu>
              <Menu.Button className="p-1 flex flex-row items-center bg-slate-100 rounded-lg gap-2">
                Add to Group
                <Lucide icon="ChevronDown" className="w-4 h-4" />
              </Menu.Button>
              <Menu.Items className="w-48 mt-px">
                {groups.map((group) => {
                  const groupId = typeof group.id === 'number' ? group.id : parseInt(group.id?.toString() || '0');
                  return (
                    <Menu.Item key={group.id?.toString() || `group-${group.name}`} onClick={() => handleAddToGroup(record.uuid, groupId)}>
                      Add to {group.name}
                    </Menu.Item>
                  );
                })}
              </Menu.Items>
            </Menu>
          );
        }
      }
    }
  ];

  const handleUpdateGroups = async () => {
    try {
      setLoading(true);
      // Convert groups to the format expected by the API
      const groupsData = groups.map(group => ({
        uuid: group.uuid,
        groupKey: group.groupKey || (group.name?.split(' ')[1] ? alphabetToNumber(group.name.split(' ')[1]) : (typeof group.id === 'number' ? group.id : parseInt(group.id?.toString() || '0'))),
        name: group.name || `Group ${group.groupKey || group.id}`,
        teams: group.teams.map((team, tIdx) => ({
          uuid: team.uuid,
          name: team.name,
          position: team.position || tIdx, // Include position in the API call
        })),
      }));

      await actionUpdateGroup({ groups: groupsData });

      setTimeout(() => {
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error updating groups:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Group Drawing</h2>
          <Button
            variant="primary"
            size="sm"
            onClick={handleUpdateGroups}
            disabled={isLoadingGroupUpdate || loading || groupIsLocked}
          >
            <Lucide icon="Save" className="w-4 h-4 mr-1" />
            {isLoadingGroupUpdate || loading ? 'Saving...' : 'Save Groups'}
          </Button>
        </div>
        {!groupIsLocked && <div className="flex gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleClearAll}
          >
            <Lucide icon="Trash2" className="w-4 h-4 mr-1" />
            Clear All
          </Button>
          {assignmentHistory.some(a => a.type === 'auto') && (
            <Button
              variant="outline-warning"
              size="sm"
              onClick={handleUndoLastAutoAssignment}
            >
              <Lucide icon="Undo2" className="w-4 h-4 mr-1" />
              Undo Auto
            </Button>
          )}
          <Menu>
            <Menu.Button className="flex items-center gap-2 px-3 py-2 border border-primary text-primary rounded-lg hover:bg-primary-600">
              <Lucide icon="Shuffle" className="w-4 h-4" />
              Auto Assign
              <Lucide icon="ChevronDown" className="w-4 h-4" />
            </Menu.Button>
            <Menu.Items className="w-56 mt-px">
              <Menu.Item onClick={handleAutoAssign}>
                <div className="flex items-center gap-2">
                  <Lucide icon="Shuffle" className="w-4 h-4" />
                  {groups.reduce((sum, group) => sum + group.teams.length, 0) > 0 ? "Re-assign All Teams" : "Assign All Teams"}
                </div>
              </Menu.Item>
              <Menu.Item onClick={handleAssignUnassignedOnly}>
                <div className="flex items-center gap-2">
                  <Lucide icon="UserPlus" className="w-4 h-4" />
                  Assign Unassigned Only
                </div>
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>}
      </div>

      {/* Confirmed Teams Summary */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Total Confirmed Teams: {(confirmedTeams.length !== confirmedTeamsData?.data?.totalTeams) ? confirmedTeams.length : confirmedTeamsData?.data?.totalTeams}
          </span>
          <span className="text-gray-600">
            Assigned: {groups.reduce((sum, group) => sum + group.teams.length, 0)}
          </span>
          <span className="text-gray-600">
            Unassigned: {(confirmedTeamsData?.data?.pagination?.total || 0) - groups.reduce((sum, group) => sum + group.teams.length, 0)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 flex-1 sm:gap-4 gap-2">
        {/* Confirmed Team List */}
        <div className="col-span-12 sm:col-span-6 p-4 box ">
          <Table
            dataSource={confirmedTeams}
            loading={isLoading}
            size="small"
            pagination={{
              current: confirmedTeamsData?.data?.pagination?.current || 1,
              pageSize: confirmedTeamsData?.data?.pagination?.pageSize || 10,
              total: confirmedTeamsData?.data?.pagination?.total || 0,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} teams`,
              pageSizeOptions: ['5', '10', '20', '50', '100']
            }}
            onChange={handleTableChange}
            columns={tableCol}
            rowKey="uuid"
            className="w-full"
          />
        </div>

        {/* Group Stage Component */}
        <div className="col-span-12 sm:col-span-6">
          {isLoading ? (
            <div className="text-center py-8">
              <Lucide icon="Loader2" className="w-8 h-8 mx-auto animate-spin text-gray-400" />
              <p className="text-gray-500 mt-2">Loading teams...</p>
            </div>
          ) : (
            <GroupStage
              groups={groupStageGroups}
              className="w-full"
              selectedGroupKey={selectedGroup}
              key={"groupStage" + JSON.stringify(groupStageGroups)}
              onChange={handleGroupsChange}
              readOnly={groupIsLocked}
              onTeamDelete={handleTeamRemove}
            />
          )}
        </div>
      </div>

    </div>
  );
};