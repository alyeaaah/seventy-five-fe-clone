import React from 'react';
import { Dialog } from "@/components/Base/Headless";
import Lucide, { icons } from "@/components/Base/Lucide";
import Button, { Variant } from "@/components/Base/Button";
import { FormSelect, FormLabel } from "@/components/Base/Form";
import { AutoComplete } from "antd";
import Image from "@/components/Image";
import moment from 'moment';
import { imageResizerDimension } from '@/utils/helper';
import { useAtomValue } from 'jotai';
import { accessTokenAtom, userAtom } from '@/utils/store';
import { useDebounce } from 'ahooks';
import { PublicTournamentApiHooks } from '@/pages/Public/Tournament/api';
import { PlayerHomeApiHooks } from '@/pages/Players/Home/api';
import { PlayerDropdownData } from '@/pages/Players/Home/api/schema';
import { queryClient } from '@/utils/react-query';
import { useToast } from '../Toast/ToastContext';

interface TournamentJoinModalProps {
  show: boolean;
  tournamentUuid: string;
  onClose: () => void;
}

const TournamentJoinModal: React.FC<TournamentJoinModalProps> = ({
  show,
  tournamentUuid,
  onClose
}) => {
  const accessToken = useAtomValue(accessTokenAtom);
  const user = useAtomValue(userAtom);
  const userIsLogin = !!accessToken && !!user;
  const toast = useToast()

  // Fetch tournament details
  const { data: tournament, isLoading } = PublicTournamentApiHooks.useGetTournamentDetailAuth(
    {
      params: {
        uuid: tournamentUuid
      }
    },
    {
      enabled: !!tournamentUuid && show
    }
  );

  // Join tournament mutation
  const { mutateAsync: joinTournament, isLoading: isJoining } = PublicTournamentApiHooks.useJoinTournament({
    params: {
      uuid: tournamentUuid
    },

  }, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PublicTournamentApiHooks.getKeyByAlias("getTournamentDetail") });
      queryClient.invalidateQueries({ queryKey: PublicTournamentApiHooks.getKeyByAlias("getTournamentDetailAuth") });
      onClose();
    },
    onError: (error) => {
      toast.showNotification({
        text: error.message,
        duration: 2000,
        icon: "UserRoundX"
      });
    },
    retry: false
  });


  // State for selected players (for non-draft tournaments)
  const [selectedPlayer, setSelectedPlayer] = React.useState<PlayerDropdownData | null>(null);
  const [searchKeyword, setSearchKeyword] = React.useState('');

  // Debounce search keyword to optimize API calls
  const debouncedSearchKeyword = useDebounce(searchKeyword, { wait: 500 });

  // Player dropdown hook
  const { data: playersDropdown, isLoading: isLoadingPlayers } = PlayerHomeApiHooks.useGetPlayersDropdown(
    {
      queries: {
        keyword: debouncedSearchKeyword,
        tournamentUuid: tournamentUuid
      }
    },
    {
      enabled: !!debouncedSearchKeyword && debouncedSearchKeyword.length >= 2
    }
  );

  const handleJoinTournament = async () => {
    if (!userIsLogin) {
      // Handle redirect to login or show login modal
      return;
    }
    await joinTournament({
      player_uuid: selectedPlayer?.uuid
    });
  };

  const tournamentData = tournament?.data;

  if (!show) return null;

  return (
    <Dialog
      className="z-[1000]"
      open={show}
      onClose={onClose}
      staticBackdrop={true}
      size="lg"
    >
      <Dialog.Panel>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Tournament Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Lucide icon="X" className="h-6 w-6" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : tournamentData ? (
            <div className="space-y-6">
              {/* Tournament Image and Basic Info */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={imageResizerDimension(
                      tournamentData.media_url || "", 120, "h"
                    )}
                    alt={tournamentData.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {tournamentData.name}
                  </h3>
                  <p className="text-xs opacity-80 mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: tournamentData?.description }}>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tournamentData.draft_pick && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full uppercase text-xs font-medium bg-green-100 text-green-800">
                      Draft Pick
                    </span>}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tournamentData.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tournament Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Lucide icon="Users" className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Participants</p>
                      <p className="text-sm text-gray-600">
                        {(tournamentData.max_player && tournamentData?.participants ? tournamentData?.participants + " /" : "") + (tournamentData.max_player || 'No limit')} participants
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Lucide icon="DollarSign" className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Commitment Fee</p>
                      <p className="text-sm text-gray-600">
                        {tournamentData.commitment_fee > 0
                          ? `Rp ${tournamentData.commitment_fee.toLocaleString('id-ID')}`
                          : 'Free'
                        }
                      </p>
                    </div>
                  </div>

                  {tournamentData.level && (
                    <div className="flex items-center gap-3">
                      <Lucide icon="Award" className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Level</p>
                        <p className="text-sm text-gray-600">{tournamentData.level}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Lucide icon="Calendar" className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Date</p>
                      <p className="text-sm text-gray-600">
                        {moment(tournamentData.start_date).format('MMMM') === moment(tournamentData.end_date).format('MMMM') ?
                          <>
                            {moment(tournamentData.start_date).format('DD')} - {moment(tournamentData.end_date).format('DD MMMM YYYY')}
                          </> :
                          <>
                            {moment(tournamentData.start_date).format('DD MMMM YYYY')} - {moment(tournamentData.end_date).format('DD MMMM YYYY')}
                          </>
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Lucide icon="MapPin" className="h-5 min-w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Venue</p>
                      <p className="text-sm text-gray-600">{tournamentData.court}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{tournamentData.court_info?.address}</p>
                    </div>
                  </div>
                </div>
              </div>
              {tournamentData.draft_pick && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Lucide icon="Info" className="h-5 min-w-5 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      This tournament uses draft pick system. You will be able to select your team members during the draft phase.
                    </p>
                  </div>
                </div>
              )}

              {!tournamentData.draft_pick && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <FormLabel htmlFor="player-search" className='font-medium'>My Double Partner</FormLabel>
                    <AutoComplete
                      className="shadow-sm w-full"
                      suffixIcon={<Lucide icon="Search" />}
                      id='player-search'
                      value={searchKeyword}
                      options={playersDropdown?.data?.map(player => {
                        const isAlreadySelected = selectedPlayer?.uuid === player.uuid;
                        return {
                          value: player.uuid,
                          label: (
                            <div className={`flex flex-row justify-between ${isAlreadySelected ? 'opacity-60' : ''}`}>
                              <div className="flex items-center flex-row">
                                <Image src={player.media_url || ""} alt={player.name} className="w-6 h-6 rounded-full mr-2" />
                                <span className="flex flex-col">
                                  <span className="mb-0">
                                    {player.name}
                                    <span className="text-gray-400 text-[12px] font-medium italic"> {player.nickname}</span>
                                  </span>
                                  <span className="text-gray-400 text-[11px] mt-0">{player.username}</span>
                                </span>
                              </div>
                              <div className="flex items-center flex-row">
                                {isAlreadySelected ? (
                                  <div className="text-[10px] text-gray-500">Selected</div>
                                ) : (
                                  <Lucide icon="Plus" className="w-4 h-4" />
                                )}
                              </div>
                            </div>
                          ),
                          ...player
                        };
                      })}
                      onSelect={(_value, option) => {
                        // Replace existing selection with new player
                        setSelectedPlayer(option);
                        setSearchKeyword('');
                      }}
                      onChange={(value) => setSearchKeyword(value)}
                      placeholder="Type at least 2 characters to search..."
                      notFoundContent={searchKeyword.length < 2 ? "Type at least 2 characters to search" : "No players found"}
                    />

                    {selectedPlayer && (
                      <div className="">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded p-3 text-sm relative">
                          <Image
                            src={imageResizerDimension(selectedPlayer.media_url || "", 120, "w")}
                            alt={selectedPlayer.name}
                            className="w-14 h-14 rounded"
                          />
                          <div className='flex flex-col'>
                            <span className='text-lg font-medium'>{selectedPlayer.name}</span>
                            <span className='text-sm'>{selectedPlayer.nickname}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlayer(null);
                          }}
                          className=" text-gray-400 hover:text-gray-600 flex items-center gap-2 justify-center text-xs py-2 w-full"
                        >
                          Clear
                          <Lucide icon="X" className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* Join Status */}
              {tournamentData.join_status && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Lucide icon="Info" className="h-5 w-5 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Your join status: <span className="font-medium text-gray-900">{tournamentData.join_status}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline-primary"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>

                {userIsLogin ? (
                  <Button
                    variant="primary"
                    onClick={handleJoinTournament}
                    disabled={(!tournamentData.draft_pick && !selectedPlayer) || isJoining || tournamentData.join_status === 'CONFIRMED' || tournamentData.join_status === 'APPROVED'}
                    className="flex-1"
                  >
                    {isJoining ? 'Joining...' :
                      tournamentData.join_status === 'CONFIRMED' ? 'Already Joined' :
                        tournamentData.join_status === 'APPROVED' ? 'Approved' :
                          'Join Tournament'}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => {
                      // Handle redirect to login
                      window.location.href = '/login';
                    }}
                    className="flex-1"
                  >
                    Login to Join
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Lucide icon="AlertTriangle" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tournament not found</p>
            </div>
          )}
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default TournamentJoinModal;
