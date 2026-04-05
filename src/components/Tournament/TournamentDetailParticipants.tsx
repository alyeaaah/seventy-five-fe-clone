import React from 'react';
import { IconLogoAlt } from '@/assets/images/icons';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/router/paths';
import { tournamentTeamsSchema } from '@/pages/Admin/Tournaments/api/schema';
import { z } from 'zod';
import { PublicTournamentApiHooks } from '@/pages/Public/Tournament/api';

type TournamentTeamsSchema = z.infer<typeof tournamentTeamsSchema>;

interface TournamentParticipantsProps {
  tournamentUuid?: string;
}

export const TournamentDetailParticipants: React.FC<TournamentParticipantsProps> = ({
  tournamentUuid
}) => {
  const navigate = useNavigate();

  // Fetch tournament participants data
  const { data: tournamentTeamParticipants } = PublicTournamentApiHooks.useGetTournamentTeamParticipants({
    params: {
      uuid: tournamentUuid || ''
    }
  }, {
    enabled: !!tournamentUuid
  });

  if (!tournamentTeamParticipants?.data || tournamentTeamParticipants.data.teams.length === 0) {
    return null;
  }

  return (
    <div className="col-span-12">
      <div className="col-span-12 text-emerald-800 flex flex-row my-4">
        <IconLogoAlt className="h-10 w-20" />
        <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
          <div className="h-10 absolute -right-12 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
          <span className="hidden sm:flex">TOURNAMENT&nbsp;</span>PARTICIPANTS
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tournamentTeamParticipants.data.teams.flatMap(team => team.players || []).map((player) => (
          <div key={player.uuid} className="bg-white border overflow-hidden border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow items-center flex cursor-pointer"
            onClick={() => player.uuid && navigate(paths.players.info({ uuid: player.player_uuid || "" }).$)}>
            <div className="flex items-center space-x-3">
              <div className="">
                {player.media_url ? (
                  <img
                    src={player.media_url}
                    alt={player.name || 'Player'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {player.name?.charAt(0).toUpperCase() || 'P'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col items-start justify-center">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                  {player.name}
                </h4>
                {(
                  <p className="text-xs text-gray-500 truncate">
                    {player.nickname && player.nickname !== player.name && player.nickname}
                  </p>
                )}
                {player.status && (
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${player.status === 'approved' || player.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : player.status === 'requested'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}>
                    {player.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
