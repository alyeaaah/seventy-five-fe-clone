import React from 'react';
import { IconVS } from '@/assets/images/icons';
import moment from 'moment';
import { MatchCardProps } from '.';

export const MatchCardOval: React.FC<MatchCardProps> = ({
  match,
  matchIndex,
  groupIndex,
  onClick
}) => {
  return (
    <button
      key={match.id || match.uuid || `match-${matchIndex}`}
      type="button"
      className="col-span-12 border border-emerald-800 rounded-full hover:bg-stone-200 dark:border-darkmode-100 dark:hover:bg-darkmode-200 cursor-pointer text-left"
      onClick={() => onClick?.(match)}
    >
      <div className="flex flex-row items-center justify-between gap-2 px-2 py-2">
        <div className="flex flex-row items-center justify-between gap-2 border flex-1 bg-[#EBce56] dark:bg-darkmode-300 rounded-full px-4 py-2">
          <div className="flex flex-row items-center gap-2 flex-1">
            <span className="font-medium bg-emerald-800 px-2 py-1 text-xs rounded-full text-white line-clamp-1 min-w-fit">
              {match.teams[0]?.name ?? "TBD"}
            </span>
            <div className="flex flex-col gap-1">
              {match.teams[0]?.players?.map((player) => (
                <span key={player.uuid || player.name} className="text-xs font-medium line-clamp-1">
                  {player.name}
                </span>
              ))}
            </div>
          </div>
          <IconVS className="w-12 h-6 text-emerald-800" />
          <div className="flex flex-row justify-end items-center gap-2 flex-1">
            <div className="flex flex-col text-right gap-1">
              {match.teams[1]?.players?.map((player) => (
                <span key={player.uuid || player.name} className="text-xs font-medium line-clamp-1">
                  {player.name}
                </span>
              ))}
            </div>
            <span className="font-medium bg-emerald-800 px-2 py-1 text-xs rounded-full text-white line-clamp-1 min-w-fit">
              {match.teams[1]?.name ?? "TBD"}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium">
            {match.court}
          </span>
          <span className="text-xs font-medium">
            {moment(match.time).format('ddd, DD MMM YYYY HH:mm')}
          </span>
        </div>
        <div className="bg-emerald-800 text-white h-[54px] w-[54px] aspect-square rounded-full flex items-center justify-end overflow-hidden">
          <span className="text-5xl font-semibold font-marker uppercase text-end">
            {`${String.fromCodePoint(65 + groupIndex)}${matchIndex + 1}`}
          </span>
        </div>
      </div>
    </button>
  );
};