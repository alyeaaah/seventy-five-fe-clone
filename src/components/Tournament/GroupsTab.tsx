import React, { useState } from 'react';
import Lucide from '../Base/Lucide';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../router/paths';
import { GroupResponse } from '../../pages/Public/Tournament/api/schema';
import { MatchCard } from '../MatchCard';
import { TournamentMatchDetail } from '@/pages/Admin/Tournaments/api/schema';
import { convertTournamentMatchToMatch } from '../../utils/drawing.util';
import Tippy from '../Base/Tippy';

interface GroupsTabProps {
  tournamentGroups?: {
    data: GroupResponse[];
  };
  isLoading?: boolean;
  matches?: TournamentMatchDetail[];
}

export const GroupsTab: React.FC<GroupsTabProps> = ({
  tournamentGroups,
  isLoading = false,
  matches = []
}) => {
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Lucide icon="Loader2" className="w-8 h-8 mx-auto animate-spin text-gray-400" />
        <p className="text-gray-500 mt-2">Loading group matches...</p>
      </div>
    );
  }

  if (!tournamentGroups?.data || tournamentGroups.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl bg-gray-50">
        <Lucide icon="Users" className="h-16 w-16 text-emerald-800/60 mb-4" />
        <h3 className="text-emerald-800 text-lg font-medium mb-2 text-center">No Groups Available</h3>
        <p className="text-emerald-800/80 text-sm text-center">Group information will be displayed here once available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:p-2 w-full">
      {tournamentGroups.data.map((group, groupIndex) => {
        const groupMatches = matches.filter(match => match.group_uuid === group.group_uuid);
        const convertedMatches = convertTournamentMatchToMatch(groupMatches);

        return (
          <div
            key={group.group_uuid}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="bg-emerald-800 text-white px-2 py-1 flex items-center justify-center">
              <h3 className="text-lg font-semibold text-center">
                {group.group_name?.toLowerCase().includes("group") ? group.group_name : `Group ${group.group_name}`}
              </h3>
              {/* <Tippy content="Click to see group standings"><Lucide icon="Medal" className="h-4 w-4" /></Tippy> */}
            </div>
            <div className="grid grid-cols-12 p-0">
              {group.teams && group.teams.length > 0 ? (
                <>
                  {/* Teams Section - Left Side */}
                  <div className="col-span-12 sm:col-span-3 sm:p-3 p-2 bg-gray-100 gap-2 flex flex-row sm:flex-col overflow-scroll">
                    {group.teams.map((team) => (
                      <div
                        key={team.uuid}
                        className="flex sm:flex-row flex-col-reverse sm:items-center justify-between px-2 py-2 bg-gray-50 rounded-lg border border-gray-200 min-w-64 sm:min-w-full gap-1 relative overflow-hidden"
                      >
                        <div className={`absolute grid grid-cols-12 top-0 -right-96 z-10 bg-emerald-100 h-full w-3/4 sm:w-1/2 transition-all duration-700 rounded-l-lg shadow-md ${showStats ? '-translate-x-96' : ''}`}>
                          {/* show stats here */}
                          <div className="col-span-4 p-2 flex flex-col items-center justify-center text-xs">
                            <span>Match</span>
                            <span className='font-semibold flex'>{team.matches_played}</span>
                          </div>
                          <div className="col-span-4 p-2 flex flex-col items-center justify-center text-xs">
                            <span>Win</span>
                            <span className='font-semibold flex'>{team.matches_won} <span className='font-normal'>({team.games_won})</span></span>
                          </div>
                          <div className="col-span-4 p-2 flex flex-col items-center justify-center text-xs">
                            <span>Point</span>
                            <span className='font-semibold flex'>{team.point}</span>
                          </div>

                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center" onClick={() => setShowStats(!showStats)}>
                            <span className="text-emerald-800 text-sm font-medium">
                              {!showStats ? team.players?.map(p => p.name?.charAt(0).toUpperCase()).join('') : team.name?.split(' ')[1]}
                            </span>
                          </div>
                          <div>
                            {team.players?.map((player) => (
                              <div key={player.uuid}>
                                <p className="w-full line-clamp-1 flex flex-row gap-1 items-center">
                                  {player?.nickname && player.nickname !== player.name && (
                                    <span className="font-medium text-gray-900">{`${player.nickname}`}</span>
                                  )}
                                  <span className={`line-clamp-1 w-fit ${player?.nickname && player.nickname !== player.name
                                    ? 'text-gray-500 font-normal text-xs'
                                    : 'font-medium text-gray-900'
                                    }`}>
                                    {player.name}
                                  </span>
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right w-fit">
                          <span className="text-xs px-2 py-1 text-white bg-primary rounded-md whitespace-nowrap">
                            {team.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Matches Section - Right Side */}
                  <div className="col-span-12 sm:col-span-9 p-3">
                    <div className="grid grid-cols-3 gap-2">
                      {convertedMatches.length > 0 ? (
                        convertedMatches.map((match, midx) => (
                          <div className="col-span-3 sm:col-span-1" key={midx}>
                            <MatchCard
                              key={match.uuid || `match-${midx}`}
                              match={match}
                              matchIndex={midx}
                              groupIndex={groupIndex}
                              variant="thumbnail"
                              onClick={(m) => {
                                if (m.uuid) {
                                  navigate(paths.tournament.match({ matchUuid: m.uuid }).$);
                                }
                              }}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 col-span-12">
                          <p className="text-sm text-gray-500">No matches scheduled</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 px-2 col-span-12">
                  <p className="text-gray-500 text-sm">No teams assigned</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
