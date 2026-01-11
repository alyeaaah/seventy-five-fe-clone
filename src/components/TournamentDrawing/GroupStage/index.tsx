// GroupStage.tsx
import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrop } from "react-dnd";
import { GroupBox } from "./groupBox";
import { IGroup, ITeam } from "../interfaces";

interface GroupStageProps {
  groups: IGroup[];
  readOnly?: boolean;
  className?: string;
  selectedGroupKey?: number;
  onChange?: (param: IGroup[]) => void;
  onClickGroup?: (group: IGroup) => void;
}

export const GroupStage = ({ groups: initialGroups, readOnly, className, selectedGroupKey, onChange, onClickGroup }: GroupStageProps) => {
  // Split teams evenly across groups
  const [groups, setGroups] = useState(initialGroups);

  const handleTeamDrop = (targetGroupIndex: number, team: ITeam) => {
    if (readOnly) return;

    // find where the team came from
    const sourceGroupIndex = groups.findIndex((g) =>
      g.teams.some((t) => t.uuid === team.uuid)
    );
    if (sourceGroupIndex === -1) return;

    const updatedGroups = [...groups];

    // remove from source
    updatedGroups[sourceGroupIndex].teams = updatedGroups[
      sourceGroupIndex
    ].teams.filter((t) => t.uuid !== team.uuid);

    // add to target
    updatedGroups[targetGroupIndex].teams.push(team);

    setGroups(updatedGroups);
    onChange?.(updatedGroups);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`flex flex-wrap gap-4 justify-center ${className}`}>
        {groups.map((group, groupIndex) => (
          <GroupBox
            key={groupIndex}
            group={group}
            onDrop={(team) => handleTeamDrop(groupIndex, team)}
            readOnly={readOnly}
            selected={selectedGroupKey === group.groupKey}
            onClickGroup={onClickGroup}
          />
        ))}
      </div>
    </DndProvider>
  );
};


