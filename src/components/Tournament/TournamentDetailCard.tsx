import { useState } from 'react';
import { Segmented } from 'antd';
import Lucide from '../Base/Lucide';
import moment from 'moment';
import { imageResizerDimension } from '../../utils/helper';
import { IconLogoAlt } from '../../assets/images/icons';
import { TournamentStory } from '../TournamentStory';
import { DraggableBracket } from '../TournamentDrawing';
import { convertTournamentMatchToMatch } from '../../utils/drawing.util';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../router/paths';
import { PublicTournamentApiHooks } from '../../pages/Public/Tournament/api';
import { useAtomValue } from 'jotai';
import { accessTokenAtom, userAtom } from '../../utils/store';
import Confirmation, { AlertProps } from '../Modal/Confirmation';
import { queryClient } from '../../utils/react-query';
import TournamentJoinModal from './TournamentJoinModal';
import { GroupsTab } from './GroupsTab';
import { BracketTab } from './BracketTab';
import { TournamentDraftPick } from '@/pages/Admin/Tournaments/detail/DraftPick';
import { TournamentsApiHooks } from '@/pages/Admin/Tournaments/api';
import { useToast } from '../Toast/ToastContext';
import Button from '../Base/Button';

interface TournamentDetailCardProps {
  tournamentUuid?: string;
}

const TournamentDetailCard: React.FC<TournamentDetailCardProps> = ({
  tournamentUuid
}) => {
  const navigate = useNavigate();
  const { showNotification } = useToast();
  const accessToken = useAtomValue(accessTokenAtom);
  const user = useAtomValue(userAtom);
  const userIsLogin = !!accessToken && !!user;
  const [modalJoin, setModalJoin] = useState<AlertProps | undefined>(undefined);
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);

  // Join tournament mutation
  const { mutate: joinTournament, isLoading: isJoining } = PublicTournamentApiHooks.useJoinTournament({
    params: {
      uuid: tournamentUuid || ''
    }
  }, {
    onSuccess: () => {
      setModalAlert(undefined);
      queryClient.invalidateQueries({ queryKey: PublicTournamentApiHooks.getKeyByAlias("getTournamentDetail") });
    }
  });

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
  const { data: tournamentJoinStatus } = PublicTournamentApiHooks.useGetTournamentJoinStatus(
    {
      params: {
        uuid: tournamentUuid || ''
      }
    },
    {
      enabled: !!tournamentUuid
    }
  );
  const { data: draftPickData } = PublicTournamentApiHooks.useGetTournamentDraftPicks({
    params: {
      uuid: tournamentUuid || ''
    },
  }, {
    enabled: !!tournamentUuid
  });

  const { mutate: actionAssignDraftPick } = PublicTournamentApiHooks.useAssignTournamentDraftPick({
    params: {
      uuid: tournamentUuid || ''
    },
  }, {
    onSuccess: () => {
      // TODO: Refresh draft pick data
      showNotification({
        duration: 3000,
        text: "Draft Pick assigned successfully",
        icon: "UserPlus"
      })
      setModalAlert(undefined);
      queryClient.invalidateQueries({
        queryKey: PublicTournamentApiHooks.getKeyByAlias("getTournamentDraftPicks")
      });
      queryClient.invalidateQueries({
        queryKey: PublicTournamentApiHooks.getKeyByAlias("getTournamentJoinStatus")
      });
      queryClient.invalidateQueries({
        queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentTeamParticipants")
      });
    }
  });

  // Handle tournament matches data
  const { data: tournamentMatches } = PublicTournamentApiHooks.useGetTournamentDetailMatches(
    {
      params: {
        tournament_uuid: tournamentUuid || ''
      }
    },
    {
      enabled: !!tournamentUuid,
      retry: false
    }
  );

  const matches = {
    group: tournamentMatches?.data?.filter(md => md.round === -1),
    knockout: tournamentMatches?.data?.filter(md => md.round !== -1)
  }
  // Handle tournament groups data
  const { data: tournamentGroups, isLoading: isLoadingGroup } = PublicTournamentApiHooks.useGetGroupsByTournament({
    params: {
      tournament_uuid: tournamentUuid || ""
    }
  }, {
    enabled: !!tournamentUuid
  });

  // Handle knockout rounds with proper conversion
  const [knockoutRound, setKnockoutRound] = useState<any[]>([]);

  // State for round robin tabs
  const [activeTab, setActiveTab] = useState<'groups' | 'bracket'>('groups');

  // Tab styling constants
  const tabInactiveClassName = '!bg-transparent !text-emerald-800 hover:!border-emerald-800 border !border-transparent';
  const tabActiveClassName = '!bg-emerald-800 !text-white !border-transparent';
  const tabBaseClassName = 'px-2 mx-1 flex items-center justify-center';
  // Join tournament handler
  const handleJoinTournament = () => {
    if (!userIsLogin) {
      setModalAlert({
        title: 'Login Required',
        description: "Please login to join tournament",
        onClose: () => {
          setModalAlert(undefined);
        },
        icon: 'AlertTriangle',
        open: true,
        buttons: [{
          label: 'Cancel',
          onClick: () => {
            setModalAlert(undefined);
          },
          variant: 'outline-primary'
        }]
      });
      return;
    }

    if (!detailTournament?.data) return;

    setModalJoin({
      title: 'Join Tournament',
      description: `Are you sure you want to join this tournament? Once you join, you must complete the payment by IDR ${Intl.NumberFormat('id-ID').format(detailTournament?.data?.commitment_fee || 0)} to confirm`,
      onClose: () => {
        setModalJoin(undefined);
      },
      icon: 'AlertTriangle',
      open: true,
      buttons: [{
        label: 'Cancel',
        onClick: () => {
          setModalJoin(undefined);
        },
        variant: 'outline-primary'
      },
      {
        label: 'Join',
        onClick: () => {
          joinTournament(undefined);
        },
        variant: 'primary'
      }]
    });
  };

  if (!detailTournament?.data) {
    return (
      <div className="col-span-12 grid grid-cols-12 sm:gap-4 gap-2 mt-2 rounded-xl min-h-20 text-emerald-800">
        <div className="col-span-12 flex flex-col items-center justify-center py-12 px-4 rounded-2xl">
          <Lucide icon="Trophy" className="h-16 w-16 text-emerald-800/60 mb-4" />
          <h3 className="text-emerald-800 text-lg font-medium mb-2 text-center">No Tournament Available</h3>
          <p className="text-emerald-800/80 text-sm text-center">Please come back later once the tournament is available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 grid grid-cols-12 sm:gap-4 gap-2 mt-2 rounded-xl min-h-20 text-emerald-800">
      <div className="col-span-12 sm:col-span-8">
        <h2 className="text-2xl font-bold relative pb-2">
          {detailTournament?.data.name}
          <div className="w-8 bottom-0 absolute border-b-4 border-b-emerald-800"></div>
        </h2>
        <h4
          className="text-sm font-light text-gray-500 py-4"
          dangerouslySetInnerHTML={{ __html: detailTournament?.data.description || "" }}
        />

        <div className="text-xs font-medium bg-[#EBCE56] w-fit rounded-md px-2 py-1 my-2">
          Commitment Fee: <span className="font-bold">
            {detailTournament?.data.commitment_fee > 0
              ? "IDR " + Intl.NumberFormat('id-ID').format(detailTournament?.data.commitment_fee)
              : 'Free'
            }
          </span>
        </div>

        <div className="grid grid-cols-3 gap-y-2">
          <a
            className="col-span-3 md:col-span-1 text-gray-500 hover:text-emerald-800 text-[11px] font-light flex flex-row items-center"
            href={`https://www.google.com/maps/search/?api=1&query=${detailTournament?.data.court_info?.lat},${detailTournament?.data.court_info?.long}`}
            target="_blank"
            rel="noreferrer"
          >
            <div className="h-full aspect-square p-2 w-12">
              <Lucide icon="MapPin" className="h-full w-full" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{detailTournament?.data.court_info?.name}</span>
              <span className="text-xs font-normal text-ellipsis line-clamp-2">{detailTournament?.data.court_info?.address}</span>
              <span className="text-xs font-light">{detailTournament?.data.court_info?.city}</span>
            </div>
          </a>

          <div className="col-span-3 md:col-span-1 text-gray-500 text-[11px] font-light flex flex-row items-center">
            <div className="h-full aspect-square p-2 w-12">
              <Lucide icon="Calendar" className="h-full w-full" />
            </div>
            <div className="flex flex-col flex-1">
              {moment(detailTournament?.data.start_date).format('DD MMM YYYY') === moment(detailTournament?.data.end_date).format('DD MMM YYYY') ?
                <span className="font-semibold text-sm">{moment(detailTournament?.data.start_date).format('DD MMM YYYY')}</span> :
                <span className="font-semibold text-sm">{moment(detailTournament?.data.start_date).format('DD MMM')} - {moment(detailTournament?.data.end_date).format('DD MMM YYYY')}</span>
              }
              <span className="text-xs font-semibold text-emerald-800">{moment(detailTournament?.data.start_date).format('HH:mm')} - {moment(detailTournament?.data.end_date).format('HH:mm')}</span>
              <span className="text-xs font-normal">GMT +7</span>
            </div>
          </div>

          <div className="col-span-3 md:col-span-1 text-gray-500 text-[11px] font-light flex flex-row items-center">
            <div className="h-full aspect-square p-2 w-12">
              <Lucide icon="GitPullRequest" className="h-full w-full" />
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-sm">Level</span>
              <span className="text-xs text-emerald-800 font-semibold">
                {detailTournament?.data.level} {detailTournament && detailTournament.data.strict_level === false ? "Open" : ""}
              </span>
              {detailTournament?.data.draft_pick && <span className='text-xs font-normal'>Draft Pick</span>}
            </div>
          </div>
        </div>

        <div className="mt-4 lg:col-span-12 col-span-3 flex justify-between">
          {userIsLogin && (
            <>
              {detailTournament?.data?.join_status === "CONFIRMED" && (
                <Button
                  variant="primary"
                  color="primary"
                  className="font-medium text-xs shadow-none uppercase"
                >
                  Confirmed to join
                </Button>
              )}
              {detailTournament?.data?.join_status === "REJECTED" && (
                <Button
                  variant="danger"
                  color="danger"
                  className="font-medium text-xs shadow-none uppercase"
                >
                  Rejected
                </Button>
              )}
              {detailTournament?.data?.join_status === "REQUESTED" && (
                <Button
                  variant="primary"
                  color="primary"
                  className="font-medium text-xs shadow-none uppercase"
                  onClick={() => { }}
                >
                  Requested
                </Button>
              )}
              {detailTournament?.data?.join_status === "APPROVED" && (
                <Button
                  variant="primary"
                  color="primary"
                  className="font-medium text-xs shadow-none uppercase"
                >
                  Pay IDR {new Intl.NumberFormat('id-ID', {}).format(detailTournament.data.commitment_fee || 0)}
                </Button>
              )}
              {(!detailTournament?.data?.join_status && detailTournament?.data?.status === "DRAFT" && new Date(detailTournament?.data?.start_date || "") > new Date()) && (
                <Button
                  variant="primary"
                  color="primary"
                  disabled={isJoining}
                  className="font-medium text-xs shadow-none uppercase"
                  onClick={handleJoinTournament}
                >
                  Request to Join
                </Button>
              )}
            </>
          )}
          {(detailTournament?.data && tournamentMatches?.data) && (
            <TournamentStory tournament={detailTournament?.data} matches={tournamentMatches?.data} />
          )}
        </div>
        {tournamentJoinStatus?.data?.draftPick?.status === "PICKING" && (
          <div className="col-span-12 bg-gradient-to-r from-emerald-600 to-emerald-800 mt-6 rounded-2xl shadow-lg border border-emerald-500">
            <div className='flex flex-col gap-3 items-center justify-center p-6'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 bg-yellow-400 rounded-full animate-pulse'></div>
                <span className='text-3xl font-bold font-marker -rotate-0 text-white tracking-wide'>YOUR TURN TO PICK!</span>
                <div className='w-3 h-3 bg-yellow-400 rounded-full animate-pulse'></div>
              </div>
              <span className='text-emerald-100 text-center font-medium'>Draft pick session is in progress. Choose your partner wisely!</span>
              <Button
                className='bg-[#EBCE56] border-none text-emerald-800 font-semibold'
                type='button'
                onClick={() => {
                  // TODO: Open partner selection modal
                  setModalAlert({
                    open: true,
                    icon: "Users",
                    onClose: () => setModalAlert(undefined),
                    title: "Draft Pick Player",
                    description: `Choose your partner wisely!`,
                    buttons: [
                      ...draftPickData?.data?.filter(d => !!d.seeded).sort(() => Math.random() - 0.5).map(d => ({
                        label: d.name,
                        variant: "outline-primary" as const,
                        onClick: () => {
                          // TODO: Implement pick player logic
                          actionAssignDraftPick({
                            player_uuid: user?.uuid || "",
                            partner_uuid: d.player_uuid,
                          });
                        },
                      })) || [],
                      {
                        label: "Cancel",
                        variant: "primary",
                        onClick: () => {
                          setModalAlert(undefined)
                        },
                      },
                    ],
                  })
                }}
              >
                Select Partner
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="col-span-12 sm:col-span-4">
        <img
          src={imageResizerDimension(detailTournament?.data.media_url || '', 420, "h")}
          className="flex w-full object-contain h-auto rounded-xl border"
        />
      </div>

      {detailTournament?.data?.show_bracket == true && (
        <>
          <div className="col-span-12 text-emerald-800 flex flex-row my-4">
            <IconLogoAlt className="h-10 w-20" />
            <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
              <div className="h-10 absolute -right-12 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
              <span className="hidden sm:flex">TOURNAMENT&nbsp;</span>MATCHES
            </div>
          </div>

          {detailTournament?.data?.type === "ROUND ROBIN" ? (
            <div className="col-span-12">
              <div className="w-full overflow-x-auto mb-6">
                <Segmented
                  options={[
                    {
                      label: (
                        <div className="flex items-center justify-center space-x-2">
                          <Lucide icon="Users" className="h-4 w-4" />
                          <span>Groups</span>
                        </div>
                      ),
                      value: 'groups',
                      className: `${tabBaseClassName} ${activeTab === 'groups' ? tabActiveClassName : tabInactiveClassName}`
                    },
                    {
                      label: (
                        <div className="flex items-center justify-center space-x-2">
                          <Lucide icon="Trophy" className="h-4 w-4" />
                          <span>Bracket</span>
                        </div>
                      ),
                      value: 'bracket',
                      className: `${tabBaseClassName} ${activeTab === 'bracket' ? tabActiveClassName : tabInactiveClassName}`
                    }
                  ]}
                  value={activeTab}
                  defaultValue="groups"
                  className="w-full rounded-lg border-emerald-800 font-semibold border-2 bg-[#EBCE56] shadow-none px-1 py-2 min-w-max sm:w-full [&_.ant-segmented-item]:transition-all [&_.ant-segmented-item]:duration-200 [&_.ant-segmented-item]:ease-in-out [&_.ant-segmented-item]:border-emerald-800 [&_.ant-segmented-item]:bg-transparent [&_.ant-segmented-item:not(.ant-segmented-item-selected)]:text-emerald-800 [&_.ant-segmented-item-selected]:bg-emerald-800 [&_.ant-segmented-item-selected]:text-white [&_.ant-segmented-thumb]:bg-emerald-800 [&_.ant-segmented-thumb]:border-emerald-800 [&_.ant-segmented-item-disabled]:opacity-70"
                  onChange={(val) => setActiveTab(val as 'groups' | 'bracket')}
                />
              </div>

              <div className="bg-slate-200 rounded-lg p-4">
                {activeTab === 'groups' && <GroupsTab tournamentGroups={tournamentGroups} isLoading={isLoadingGroup} matches={matches.group} />}
                {activeTab === 'bracket' && <BracketTab matchesData={matches.knockout || []} />}
              </div>
            </div>
          ) : detailTournament?.data?.type === "KNOCKOUT" ? (
            <div className="col-span-12 h-fit overflow-x-scroll" key={JSON.stringify(knockoutRound)}>
              <DraggableBracket
                rounds={knockoutRound}
                readOnly
                className=""
                setRounds={() => null}
                onSeedClick={(seed: any) => {
                  navigate(paths.tournament.match({ matchUuid: seed.uuid }).$)
                }}
              />
            </div>
          ) : null}
        </>
      )}
      <TournamentJoinModal
        tournamentUuid={tournamentUuid || ""}
        show={modalJoin?.open || false}
        onClose={() => setModalAlert(undefined)}
      />

      {modalAlert && (
        <Confirmation
          {...modalAlert}
        />
      )}
    </div>
  );
};

export default TournamentDetailCard;
