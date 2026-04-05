import React from 'react';
import { IconVS } from '@/assets/images/icons';
import moment from 'moment';
import { MatchCardProps } from '.';

export const MatchCardThumbnail: React.FC<MatchCardProps> = ({
  match,
  matchIndex,
  groupIndex,
  onClick
}) => {
  return (
    <div
      key={match.uuid || `match-${matchIndex}`}
      className={`bg-white border border-gray-200 rounded-lg p-3 shadow-sm ${onClick ? 'cursor-pointer' : ''}`}
      onClick={() => onClick?.(match)}
    >
      <div className="flex items-center justify-between border-b border-b-gray-200 mb-1 pb-1">
        <span className="text-xs text-gray-500">
          {match.time ? moment(match.time).format('DD MMM HH:mm')
            : 'TBD'}
        </span>
        {match.court && (
          <span className="text-xs text-gray-500 text-end">{match.court}</span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center w-full justify-between">
          <div className="flex flex-col">
            <span className='text-sm font-medium text-gray-800 text-start'>{match.teams[0]?.name || 'TBD'}</span>
            {match.teams[0]?.players?.map(player =>
              <span className='font-normal text-xs line-clamp-1' key={player.uuid}>
                {player.name}
              </span>)
            }
          </div>
          <span className="text-sm font-bold text-emerald-600">
            {match.teams[0]?.score && (
              match.teams[0].score.point || match.teams[0].score.game || match.teams[0].score.set || '-'
            )}
          </span>
        </div>
        <div className=" mx-2"><IconVS className='h-4 w-8' /></div>
        <div className="flex items-center w-full justify-between">
          <span className="text-sm font-bold text-emerald-600">
            {match.teams[1]?.score && (
              match.teams[1].score.point || match.teams[1].score.game || match.teams[1].score.set || '-'
            )}
          </span>
          <div className="flex flex-col items-end">
            <span className='text-sm font-medium text-gray-800 text-end'>{match.teams[1]?.name || 'TBD'}</span>
            {match.teams[1]?.players?.map(player =>
              <span className='font-sm font-medium text-xs text-end line-clamp-1' key={player.uuid}>
                {player.name}
              </span>)
            }
          </div>
        </div>
      </div>
      {match.status && (
        <div className="mt-2 text-xs">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${match.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
            match.status === 'ONGOING' ? 'bg-blue-100 text-blue-800' :
              match.status === 'SCHEDULED' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
            }`}>
            {match.status}
          </span>
        </div>
      )}
    </div>
  );
};
