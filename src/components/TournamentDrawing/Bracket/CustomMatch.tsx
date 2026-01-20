import { useDrop } from 'react-dnd';
import { DraggableTeam } from './DraggableTeam';
import { ITeam } from '../interfaces';
import { ISeedProps } from 'react-brackets';
import dayjs from 'dayjs';
import { useRef } from 'react'; // Import useRef from React
import Lucide from '@/components/Base/Lucide';

interface CustomMatchProps {
  seed: ISeedProps['seed'];
  roundIndex: number;
  seedIndex: number;
  readOnly?: boolean;
  round?: "final" | "semi final";
  onSeedClick?: (seed: ISeedProps['seed'], seedIndex: number, roundIndex: number) => void;
  onDrop: (roundIndex: number, matchIndex: number, team: ITeam, position: 'home' | 'away') => void;
}

export const CustomMatch = ({ seed, roundIndex, seedIndex, round, onDrop, onSeedClick, readOnly }: CustomMatchProps) => {
  // Create ref with the correct type
  const dropHomeRef = useRef<HTMLDivElement | null>(null);
  const dropAwayRef = useRef<HTMLDivElement | null>(null);

  const [{ isOverHome }, dropHome] = useDrop(() => ({
    accept: 'TEAM',
    drop: (item: ITeam) => onDrop(roundIndex, seedIndex, item, 'home'),
    collect: (monitor) => ({
      isOverHome: monitor.isOver(),
    }),
  }), [roundIndex, seedIndex]);

  const [{ isOverAway }, dropAway] = useDrop(() => ({
    accept: 'TEAM',
    drop: (item: ITeam) => onDrop(roundIndex, seedIndex, item, 'away'),
    collect: (monitor) => ({
      isOverAway: monitor.isOver(),
    }),
  }), [roundIndex, seedIndex]);

  // Attach the dropHome and dropAway refs to the div elements
  dropHome(dropHomeRef);
  dropAway(dropAwayRef);

  return (
    <div className={`bracket-seed-container `} key={seedIndex}>
      <div className={`bracket-seed bg-white dark:bg-darkmode-600 ${readOnly ? 'hover:transform hover:scale-105 duration-700 transition-all hover:z-10' : ''}`} onClick={() => !!onSeedClick ? onSeedClick(seed, seedIndex, roundIndex) : null}>
        <div className='absolute bottom-[94px] w-full z-10 flex justify-center cursor-pointer text-xs font-medium'>
          <div className='border px-2 rounded-md border-emerald-800 dark:border-emerald-400 text-emerald-800 dark:text-emerald-400 capitalize'>
            {round || `Match ${seedIndex + 1}`}
          </div>
        </div>
        <div ref={dropHomeRef} className='bracket-team' style={{ borderRadius: 12, backgroundColor: isOverHome ? '#d0cebf' : "unset" }} key={"team-1"}>
          {isOverHome ? <div className='h-[45px] flex justify-center items-center text-xs font-medium' key={'td-1'}>Drop Team Here</div> : <DraggableTeam team={seed.teams[0]} readOnly={readOnly} draggable={!roundIndex} key={'t-1'} />}
        </div>
        <div ref={dropAwayRef} className='bracket-team' style={{ borderRadius: 12, backgroundColor: isOverAway ? '#d0cebf' : "unset" }} key={"team-2"}>
          {isOverAway ? <div className='h-[45px] flex justify-center items-center text-xs font-medium' key={'td-2'}>Drop Team Here</div> : <DraggableTeam team={seed.teams[1]} readOnly={readOnly} draggable={!roundIndex} key={'t-2'} isAway />}
        </div>
        {
          (seed.court || seed.time) &&
          <div className='absolute top-[96px] w-full z-10 flex justify-center cursor-pointer'>
            <div className='bg-emerald-800 text-white rounded-lg shadow-xl flex flex-col items-center justify-between pl-1 pr-2'>
              {seed?.court &&
                <div className='flex items-center'>
                  <Lucide icon="MapPin" className='h-3' />
                  <span className='text-[10px] font-medium line-clamp-1 text-ellipsis'>{seed?.court} </span>
                </div>
              }
              {seed?.time &&
                <div className='flex items-center'>
                  <Lucide icon="Calendar" className='h-3' />
                  <span className='text-[10px] line-clamp-1 text-ellipsis'>{dayjs(seed?.time).format("D MMM HH:mm")}</span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  );
};
