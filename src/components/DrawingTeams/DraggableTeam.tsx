import { useDrag, useDrop } from "react-dnd";
import { Team } from "../Bracket/interfaces";
import Image from "@/components/Image";

export const DraggableTeam: React.FC<{
  team: Team;
  isAway?: boolean;
  onDrop: (draggedTeam: Team, targetTeam: Team,) => void;
  onClick?: () => void;
  draggable?: boolean;
}> = ({ team, onDrop, onClick, isAway, draggable }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TEAM',
    item: { team },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TEAM',
    drop: (item: { team: Team }) => {
      if (item.team.uuid !== team.uuid) {
        onDrop(item.team, team);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const ref = (node: HTMLDivElement | null) => {
    if (node) { 
      drag(drop(node));
    }
  };

  return (
    <div
      ref={draggable ? ref : undefined}
      onClick={onClick}
      className={`p-2 m-2 w-full sm:w-[40%] rounded-lg flex flex-col justify-center
        ${isDragging ? 'opacity-50' : 'opacity-100'} 
        ${isOver ? 'bg-blue-50' : 'hover:bg-gray-100'}
        ${isAway ? 'items-end' : 'items-start'} 
        ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className="flex flex-row-reverse sm:flex-row">
        {isAway && <div className="text-xs text-gray-500 mr-1 border rounded-md px-2 capitalize">{team.alias}</div>}
        <strong>{team.name}</strong>
        {!isAway && <div className="text-xs text-gray-500 ml-1 border rounded-md px-2 capitalize">{team.alias}</div>}
      </div>
      <div className="text-xs text-gray-500 space-y-1 mt-1">
        {team.players?.map(
          (player, index) => (
            <div key={index} className={`flex items-center ${isAway ? 'justify-end' : 'justify-start'}`}>
              {isAway && <div className="mr-1">{player.name}</div>}
              <div className="w-6 h-6 bg-emerald-800 rounded-full overflow-hidden ">
                <Image src={player.media_url} width={40} height={40} className="object-cover w-full h-full rounded-full"/>
              </div>
              {!isAway && <div className="ml-1">{player.name}</div>}
            </div>
          )
        )}
      </div>
    </div>
  );
};

