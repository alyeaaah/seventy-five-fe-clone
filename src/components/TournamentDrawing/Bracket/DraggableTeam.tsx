// DraggableTeam.tsx
import { useDrag } from 'react-dnd';
import { ITeam } from '../interfaces';

export const DraggableTeam = ({ team, draggable = true, isAway, readOnly, className }: { team: ITeam, draggable: boolean, isAway?: boolean, readOnly?: boolean, className?: string }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TEAM',
    item: team,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [team]);

  return (
    <div
      ref={(el) => {
        if (el && team?.name !== "TBD" && draggable) {
          drag(el);
        }
      }}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
      className={`${readOnly ? 'cursor-pointer' : (team?.name != "TBD" && draggable ? 'cursor-grab' : 'cursor-not-allowed')} pl-1.5 pr-1.5 py-1 flex flex-row justify-between items-center h-[46px] ${className}`}
    >
      <div className='h-full w-auto flex relative'>
        {
          team?.score &&
          <div className={`${isAway ? 'flex-col-reverse' : ''} flex flex-col items-center justify-between text-xs mr-1`}>
            {team?.score?.game != undefined ? <div className='border border-emerald-800 rounded-md w-[24px] text-center text-emerald-800'>{team?.score?.game}</div> : <></>}
            {team?.score?.set != undefined ? <div className='border border-emerald-800 rounded-md bg-emerald-800 text-white w-[24px] text-center'>{team?.score?.set}</div> : <></>}
          </div>
        }
        <div className="h-full w-full flex flex-col items-start">
          {team?.players?.map((p, i) => {
            if ((team?.name == "TBD" || team.alias == "TBD") && i == 1) {
              return <div key={i}></div>;
            }
            return (
              <div key={i} className='h-full flex items-center'>
                <span className='text-[11px] text-ellipsis line-clamp-1' style={{ lineHeight: "11px" }}>{p.name}</span>
              </div>
            );
          })}
        </div>
      </div>
      <span className={`${team?.name?.length < 7 ? 'min-w-10' : 'min-w-[46px]'} text-nowrap text-center flex items-center justify-center text-[8px] font-medium ${team?.name != "BYE" ? 'bg-emerald-800' : 'bg-yellow-700'} text-white p-1 rounded-md`} style={{ lineHeight: "8px" }}>{team.name}</span>
    </div>
  );
};
