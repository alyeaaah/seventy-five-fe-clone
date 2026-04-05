import React from 'react';
import Lucide from '../Base/Lucide';
import { GroupResponse } from '../../pages/Public/Tournament/api/schema';
import { PublicTournamentApiHooks } from '../../pages/Public/Tournament/api';
import { useAtomValue } from 'jotai';
import { accessTokenAtom, userAtom } from '@/utils/store';

interface StandingTabProps {
  tournamentUuid?: string;
  isLoading?: boolean;
}

export const StandingTab: React.FC<StandingTabProps> = ({
  tournamentUuid,
  isLoading = false
}) => {
  const accessToken = useAtomValue(accessTokenAtom);
  const user = useAtomValue(userAtom);
  const userIsLogin = !!accessToken && !!user;
  // Handle tournament detail data
  const { data: detailTournament } = !userIsLogin ? PublicTournamentApiHooks.useGetTournamentDetail(
    {
      params: {
        uuid: tournamentUuid || ''
      }
    },
    {
      enabled: !!tournamentUuid
    }
  ) : PublicTournamentApiHooks.useGetTournamentDetailAuth(
    {
      params: {
        uuid: tournamentUuid || ''
      }
    },
    {
      enabled: !!tournamentUuid
    }
  );
  // Fetch groups with backend sorting
  const { data: tournamentGroups } = PublicTournamentApiHooks.useGetGroupsByTournament({
    params: {
      tournament_uuid: tournamentUuid || ""
    },
  }, {
    enabled: !!tournamentUuid
  });

  const matchesStarted = tournamentGroups?.data?.some(group => group.teams?.some(team => !!team.matches_played)) || false;

  if (isLoading || !tournamentGroups) {
    return (
      <div className="text-center py-8">
        <Lucide icon="Loader2" className="w-8 h-8 mx-auto animate-spin text-gray-400" />
        <p className="text-gray-500 mt-2">Loading standings...</p>
      </div>
    );
  }

  if (!tournamentGroups?.data || tournamentGroups.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl bg-gray-50">
        <Lucide icon="BarChart4" className="h-16 w-16 text-emerald-800/60 mb-4" />
        <h3 className="text-emerald-800 text-lg font-medium mb-2 text-center">No Standings Available</h3>
        <p className="text-emerald-800/80 text-sm text-center">Standings will be displayed here once available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 w-full">
      {tournamentGroups.data.map((group) => (
        <div key={group.group_uuid} className="col-span-12 sm:col-span-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-emerald-800 text-white px-4 py-3">
            <h3 className="font-semibold text-lg">{group.group_name}</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0  w-fit" colSpan={2}>
                    Team
                  </th>
                  <th className="px-2 py-4 sm:p-4 text-center text-[8px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Won
                  </th>
                  <th className="px-2 py-4 sm:p-4 text-center text-[8px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-2 py-4 sm:p-4 text-center text-[8px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Played
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {group.teams?.map((team, teamIndex) => (
                  <tr
                    key={team.uuid}
                    className={`${teamIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      } group hover:bg-gray-100 transition-colors`}
                  >
                    <td className="px-0 py-2 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 pl-2 sm:pl-0">
                        {(teamIndex < (detailTournament?.data?.group_qualifier || 0) && !!matchesStarted) && (
                          <Lucide icon="Network" className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${teamIndex % 2 === 0 ? 'bg-gray-300 text-gray-800' : 'bg-gray-400 text-gray-900'
                          }`}>
                          {teamIndex + 1}
                        </span>
                      </div>
                    </td>
                    <td className={`pl-2 pr-0 py-4 sm:p-4 whitespace-nowrap  ${teamIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} group-hover:bg-gray-100 transition-colors`}>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-emerald-800 text-xs font-medium">
                            {team.name?.length === 2 ? team.name : team.players?.map(p => p.name?.charAt(0).toUpperCase()).join('')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 sm:p-4 whitespace-nowrap max-w-1/2 sticky shadow-lg left-0 z-10">
                      <div className="flex items-center">
                        <div className="">
                          {team.players && team.players.length > 0 && (
                            team.players.map(p => (
                              <div key={p.uuid} className="text-xs text-primary font-medium line-clamp-1">
                                {p.name}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={`px-2 py-4 sm:p-4 whitespace-nowrap text-center text-sm text-gray-900 relative z-20 ${teamIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} group-hover:bg-gray-100 transition-colors`}>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {team.matches_won || 0}
                      </span>
                    </td>
                    <td className={`px-2 py-4 sm:p-4 whitespace-nowrap text-center text-sm text-gray-900 relative z-20 ${teamIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} group-hover:bg-gray-100 transition-colors`}>

                      {team.point || 0}
                    </td>
                    <td className={`px-2 py-4 sm:p-4 whitespace-nowrap text-center text-sm text-gray-900 relative z-20 ${teamIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} group-hover:bg-gray-100 transition-colors`}>
                      {team.matches_played || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StandingTab;
