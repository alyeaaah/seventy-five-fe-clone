import Lucide from "@/components/Base/Lucide";
import { DraggableTeam } from "../Bracket/DraggableTeam";
import { IGroup, ITeam } from "../interfaces";
import { useDrop } from "react-dnd";

interface GroupBoxProps {
  group: IGroup;
  onDrop: (team: ITeam) => void;
  readOnly?: boolean;
  selected?: boolean;
  onClickGroup?: (group: IGroup) => void;
}

export const GroupBox = ({ group, onDrop, readOnly, selected, onClickGroup }: GroupBoxProps) => {
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "TEAM",
      drop: (item: ITeam) => onDrop(item),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [group]
  );

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`rounded-xl shadow-lg pb-2 border-2 w-full overflow-hidden cursor-pointer transition-all ${selected ? "border-primary ring-2 ring-primary ring-opacity-50" : ""
        } ${isOver ? "border-[#EBCE56] bg-emerald-50" : selected ? "border-[#EBCE56] border-2 shadow-lg" : "border-emerald-800"
        }`}
      onClick={() => onClickGroup?.(group)}
    >
      <h2 className={`text-lg font-semibold mb-2 text-center ${isOver ? "bg-[#EBCE56] text-emerald-800" : selected ? "bg-[#EBCE56]  text-emerald-800" : "bg-emerald-800 text-white"
        }`}>
        Group {group.name}
      </h2>
      <div className="flex flex-col gap-2">
        {group.teams.map((team) => (
          <DraggableTeam
            className="border rounded-md mx-2"
            key={team.uuid}
            team={team}
            draggable={!readOnly}
            readOnly={readOnly}
          />
        ))}
        {group.teams.length < 1 && (
          <div className="w-full rounded-md mx-2 h-[46px]">
            <div className="h-full w-full flex flex-row items-center justify-center gap-2 text-warning">
              <Lucide icon="AlertCircle" /> Need to add more teams
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
