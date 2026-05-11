import { useState } from 'react';
import Lucide from '../Base/Lucide';
import moment from 'moment';
import { imageResizerDimension } from '../../utils/helper';
import { Link, useNavigate } from 'react-router-dom';
import { paths } from '../../router/paths';
import { PublicTournamentApiHooks } from '../../pages/Public/Tournament/api';
import { useAtomValue } from 'jotai';
import { accessTokenAtom, userAtom } from '../../utils/store';
import Confirmation, { AlertProps } from '../Modal/Confirmation';
import { queryClient } from '../../utils/react-query';
import { useToast } from '../Toast/ToastContext';
import Button from '../Base/Button';
import TournamentJoinModal from './TournamentJoinModal';
import TournamentEventJoinModal from './TournamentEventJoinModal';
import { PlayerHomeApiHooks } from '@/pages/Players/Home/api';
import { IconLogo, IconLogoAlt } from '@/assets/images/icons';
import Image from '../Image';

interface TournamentEventCardProps {
  tournamentEventUuid?: string;
  expanded?: boolean;
}

const TournamentEventCard: React.FC<TournamentEventCardProps> = ({
  tournamentEventUuid,
  expanded = false,
}) => {
  const navigate = useNavigate();
  const { showNotification } = useToast();
  const accessToken = useAtomValue(accessTokenAtom);
  const user = useAtomValue(userAtom);
  const userIsLogin = !!accessToken && !!user;
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const [modalJoin, setModalJoin] = useState<AlertProps | undefined>(undefined);
  const [showRules, setShowRules] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [filterParticipants, setFilterParticipants] = useState("")


  const { mutate: joinTournament, isLoading: isJoining } = PublicTournamentApiHooks.useJoinTournament({
    params: {
      uuid: tournamentEventUuid || ''
    }
  }, {
    onSuccess: () => {
      setModalAlert(undefined);
      queryClient.invalidateQueries({ queryKey: PublicTournamentApiHooks.getKeyByAlias("getTournamentDetail") });
      queryClient.invalidateQueries({ queryKey: PublicTournamentApiHooks.getKeyByAlias("getPublicTournamentEventDetail") });
      queryClient.invalidateQueries({ queryKey: PublicTournamentApiHooks.getKeyByAlias("getPublicTournamentEventAuthDetail") });
      queryClient.invalidateQueries({ queryKey: PublicTournamentApiHooks.getKeyByAlias("getTournamentDetailAuth") });
      setTimeout(() => {
        setModalAlert({
          title: 'Success',
          description: 'You have successfully joined the tournament',
          type: 'success',
          icon: "CheckCircle",
          onClose: () => setModalAlert(undefined),
          open: true,
          buttons: [
            {
              label: 'Okay',
              variant: 'primary',
              onClick: () => setModalAlert(undefined),
            }
          ]
        })
      }, 500);
    }
  });
  // Get tournament event detail data
  const { data: tournamentEvent, isLoading: eventLoading } = userIsLogin ? PublicTournamentApiHooks.useGetPublicTournamentEventAuthDetail({
    params: {
      uuid: tournamentEventUuid || ''
    }
  },
    {
      enabled: !!tournamentEventUuid,
      retry: false
    }) : PublicTournamentApiHooks.useGetPublicTournamentEventDetail(
      {
        params: {
          uuid: tournamentEventUuid || ''
        }
      },
      {
        enabled: !!tournamentEventUuid,
        retry: false
      }
    );

  const joinStatus = tournamentEvent?.data?.tournaments?.find(t => t.join_status)?.join_status;
  const startDate = tournamentEvent?.data?.tournaments?.length ? tournamentEvent?.data?.tournaments?.sort((a, b) => new Date(a.start_date || '').getTime() - new Date(b.start_date || '').getTime())?.[0]?.start_date : undefined;
  const endDate = tournamentEvent?.data?.tournaments?.length ? tournamentEvent?.data?.tournaments?.sort((a, b) => new Date(b.end_date || '').getTime() - new Date(a.end_date || '').getTime())?.[0]?.end_date : undefined;
  const commitmentFee = tournamentEvent?.data?.commitment_fee;

  const { data: tournamentDraftParticipantsData } = PublicTournamentApiHooks.useGetPublicTournamentDraftParticipants({
    params: {
      tournamentUuid: tournamentEvent?.data?.tournaments?.[0]?.uuid || ''
    },
    queries: {
      status: ["APPROVED", "AVAILABLE", "PICKED", "PICKING"],
      tournamentEventUuid: tournamentEventUuid || ''
    }
  }, {
    enabled: !!(tournamentEventUuid),
  });
  const draftParticipants = tournamentDraftParticipantsData?.data?.participants || [];

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

    if (!tournamentEvent?.data) return;

    setModalJoin({
      title: 'Join Tournament',
      description: `Are you sure you want to join this tournament? Once you join, you must complete the payment by IDR ${Intl.NumberFormat('id-ID').format(tournamentEvent?.data?.commitment_fee || 0)} to confirm`,
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
  // Loading state
  if (eventLoading) {
    return (
      <div className="col-span-12 grid grid-cols-12 sm:gap-4 gap-2 mt-2 rounded-xl min-h-20 text-emerald-800">
        <div className="col-span-12">
          <div className="grid grid-cols-12 sm:gap-4 gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="col-span-12 sm:col-span-8 space-y-3">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-4">
              <div className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!tournamentEvent?.data) {
    return (
      <div className="col-span-12 grid grid-cols-12 sm:gap-4 gap-2 mt-2 rounded-xl min-h-20 text-emerald-800">
        <div className="col-span-12 flex flex-col items-center justify-center py-12 px-4 rounded-2xl">
          <Lucide icon="Calendar" className="h-16 w-16 text-emerald-800/60 mb-4" />
          <h3 className="text-emerald-800 text-lg font-medium mb-2 text-center">No Tournament Event Available</h3>
          <p className="text-emerald-800/80 text-sm text-center">Please come back later once tournament event is available.</p>
        </div>
      </div>
    );
  }

  const event = tournamentEvent.data;

  return (
    <div className="col-span-12 grid grid-cols-12 sm:gap-4 gap-2 mt-2 rounded-xl min-h-20 text-emerald-800">
      <div className="col-span-12 sm:col-span-8">

        {event.media_url && (
          <img
            src={imageResizerDimension(event.media_url, 400, "h")}
            className="w-full h-fit sm:h-64 object-cover rounded-xl shadow-sm border border-gray-100 sm:hidden visible mb-2"
            alt={event.name}
            onClick={() => {
              if (event.media_url) {
                window.open(event.media_url, '_blank');
              }
            }}
          />
        )}

        {!event.media_url && (
          <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl items-center justify-center hidden sm:visible">
            <Lucide icon="Calendar" className="h-16 w-16 text-emerald-400" />
          </div>
        )}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-3 py-1 ${showParticipants ? 'bg-gray-200 text-gray-800' : 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white'} text-xs font-semibold rounded-full uppercase`} onClick={() => setShowParticipants(false)}>
            Tournament Event
          </span>
          {draftParticipants?.length > 0 ? <span className={`px-3 py-1 ${showParticipants ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white' : 'bg-gray-200 text-gray-800'} text-xs font-semibold rounded-full uppercase`} onClick={() => setShowParticipants(true)}>
            Participants
          </span> : ""}
          {event.status !== "DRAFT" && <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
            event.status === 'ONGOING' ? 'bg-blue-100 text-blue-800' :
              event.status === 'ENDED' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
            }`}>
            {event.status}
            {event.status == 'ONGOING' && 'ONGOING'}
            {event.status == 'PUBLISHED' && 'SOON'}
            {event.status == 'ENDED' && 'ENDED'}
          </span>}
        </div>

        <h2 className="text-2xl font-bold relative pb-2">
          {event.name}
          <div className="w-8 bottom-0 absolute border-b-4 border-b-emerald-800"></div>
        </h2>
        {!showParticipants ? <>
          <div
            className="text-sm font-light text-gray-500 py-4"
            dangerouslySetInnerHTML={{ __html: decodeURIComponent(event.description || "") }}
          />


          <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Lucide icon="CircleDollarSign" className="h-4 w-4 min-w-4 text-emerald-600" />
                <div className='flex flex-col'>
                  <span className="text-gray-600 text-xs block">Commitment Fee</span>
                  <span className="text-emerald-600 font-semibold">
                    {event.commitment_fee > 0 ? `Rp ${event.commitment_fee.toLocaleString()}` : 'Free'}
                  </span>

                  <span className="text-gray-400 text-xs font-medium line-clamp-2 min-h-4">
                    {event.commitment_fee > 0 ? 'Early Bird' : 'Normal Price'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Lucide icon="MapPin" className="h-4 w-4 min-w-4 text-emerald-600" />
                <div className='flex flex-col'>
                  <span className="text-gray-600 text-xs block">Location</span>
                  <span className="text-emerald-600 font-semibold">
                    {event.tournaments?.[0]?.court || 'TBD'}
                  </span>
                  <span className="text-gray-400 text-xs font-medium line-clamp-1">
                    {event.tournaments?.[0]?.court_info?.address}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Lucide icon="Calendar" className="h-4 w-4 min-w-4 text-emerald-600" />
                <div className='flex flex-col'>
                  <span className="text-gray-600 text-xs block">Event Date</span>
                  <span className="text-emerald-600 font-semibold">

                    {moment(startDate).format('DD MMM YYYY') === moment(endDate).format('DD MMM YYYY') ?
                      <span className="font-semibold text-sm">{moment(startDate).format('DD MMM YYYY')}</span> :
                      (moment(startDate).format('MMM YYYY') === moment(endDate).format('MMM YYYY')
                        ? <span className="font-semibold text-sm">{moment(startDate).format('DD')} - {moment(endDate).format('DD MMM YYYY')}</span>
                        : <span className="font-semibold text-sm">{moment(startDate).format('DD MMM')} - {moment(endDate).format('DD MMM YYYY')}</span>
                      )
                    }
                  </span>
                  <span className="text-gray-400 text-xs font-medium line-clamp-2 min-h-4">
                    {/* {moment(startDate).format('HH:mm')} - {moment(endDate).format('HH:mm')} GMT +7 */}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-row gap-3 flex sm:hidden items-center">

            {userIsLogin && (
              <>
                {joinStatus === "CONFIRMED" && (
                  <Button
                    variant="primary"
                    color="primary"
                    className="font-medium text-xs shadow-none uppercase mt-3"
                  >
                    Confirmed to join
                  </Button>
                )}
                {joinStatus === "REJECTED" && (
                  <Button
                    variant="danger"
                    color="danger"
                    className="font-medium text-xs shadow-none uppercase mt-3"
                  >
                    Rejected
                  </Button>
                )}
                {joinStatus === "REQUESTED" && (
                  <Button
                    variant="primary"
                    color="primary"
                    className="font-medium text-xs shadow-none uppercase mt-3"
                    onClick={() => {
                      setModalAlert({
                        title: "Please Wait",
                        message: "",
                        description: "Your request has been submitted and is awaiting review by our tournament officials.",
                        icon: "Clock",
                        open: true,
                        onClose: () => {
                          setModalAlert(undefined)
                        }
                      });
                    }}
                  >
                    JOINED
                  </Button>
                )}
                {joinStatus === "APPROVED" && (
                  <Button
                    variant="primary"
                    color="primary"
                    className="font-medium text-xs shadow-none uppercase mt-3"
                  >
                    {/* Pay IDR {new Intl.NumberFormat('id-ID', {}).format(commitmentFee || 0)} */}
                    You have approved! check your email inbox!
                  </Button>
                )}
                {(!joinStatus && new Date(startDate || "") > new Date()) && (
                  <Button
                    variant="primary"
                    color="primary"
                    disabled={isJoining}
                    className="font-medium text-xs shadow-none uppercase mt-3"
                    onClick={handleJoinTournament}
                  >
                    Request to Join
                  </Button>
                )}
              </>
            )}
            {(!joinStatus && !user && endDate && new Date(endDate) > new Date()) && (
              <Button
                variant="primary"
                color="primary"
                disabled={isJoining}
                className="font-medium text-xs shadow-none uppercase mt-2 w-full"
                onClick={() => {
                  setModalAlert({
                    description: "You need to create an account to join this tournament. Register now or sign in to your existing account.",
                    open: true,
                    onClose: () => setModalAlert(undefined),
                    buttons: [
                      {
                        label: "Create Account",
                        onClick: () => {
                          const currentPath = window.location.pathname + window.location.search;
                          navigate(paths.register({ redirect: `${(currentPath)}` }).$);
                        },
                        variant: "primary",
                      },
                      {
                        label: "Sign In",
                        onClick: () => {
                          const currentPath = window.location.pathname;
                          navigate(paths.login({ redirect: `${(currentPath)}` }).$);
                        },
                        variant: "secondary",
                      },
                    ],
                    icon: "Info",
                    title: "Join Tournament",
                  })
                }}
              >
                Ask to Join
              </Button>
            )}
            <Button variant='outline-primary' className='h-8 mt-3' onClick={() => setShowParticipants(!showParticipants)}>{showParticipants ? 'See less' : 'Show Participants'}</Button>
          </div>
          {event.rules && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className='flex flex-row gap-2 items-center mb-2'>
                <h4 className="text-sm font-semibold text-gray-700">Tournament Rules</h4>
              </div>
              <div
                className={`text-sm text-gray-600 overflow-hidden ${showRules ? 'h-auto' : 'h-40'}`}
                dangerouslySetInnerHTML={{ __html: decodeURIComponent(event.rules || "") }}
              />
              <Button variant='outline-primary' className='h-8 mt-2' onClick={() => setShowRules(!showRules)}>{showRules ? 'See less' : 'Show More'}</Button>

            </div>
          )}
        </> : <>
          {draftParticipants?.length && <div className="col-span-12 sm:hidden grid grid-cols-12 gap-2 mt-4 h-max">
            <div className="col-span-12 text-emerald-800 flex flex-row my-4">
              <IconLogoAlt className="h-10 w-20" />
              <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
                <div className="h-10 absolute -right-12 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
                participants
              </div>
            </div>
            <div className="col-span-12 flex flex-wrap gap-2">

              <div key="all" className={`boder px-1 py-1 ${!filterParticipants ? 'border-x-2' : ''} !border-emerald-800 rounded-full text-emerald-800 cursor-pointer `} onClick={() => setFilterParticipants("")}>
                <div className={`border font-medium border-emerald-800 rounded-full px-3 py-1 ${!filterParticipants ? 'bg-emerald-800 text-white' : ''}`}>
                  All participants
                </div>
              </div>
              {tournamentEvent?.data?.tournaments?.map((tournament) => (
                <div key={tournament.uuid} className={`boder px-1 py-1 ${tournament.uuid === filterParticipants ? 'border-x-2' : ''} !border-emerald-800 rounded-full text-emerald-800 cursor-pointer `} onClick={() => setFilterParticipants(tournament.uuid || "")}>
                  <div className={`border font-medium border-emerald-800 rounded-full px-3 py-1 ${tournament.uuid === filterParticipants ? 'bg-emerald-800 text-white' : ''}`}>
                    {tournament.name}
                  </div>
                </div>
              ))}
            </div>
            <div className="col-span-12 text-emerald-800 grid grid-cols-12 gap-3">
              {draftParticipants?.filter((participant) => !filterParticipants || participant.tournament_uuid == filterParticipants).map((participant, index) => (
                <Link to={paths.players.info({ uuid: participant.player_uuid || "" }).$} key={index} className="col-span-6 aspect-[3/4] relative overflow-hidden rounded-lg">
                  <div className="h-full w-full overflow-hidden relative z-0">
                    {participant.player?.media_url ? <Image
                      src={participant.player?.media_url}
                      alt={participant.player?.name || ""}
                      width={100}
                      height={100}
                      className="h-full w-full object-cover"
                    /> : <div className="h-full w-full bg-gray-200 flex items-center justify-center flex-col pb-12">
                      <IconLogo className="w-24 h-16 text-gray-400" />
                      <span className="text-sm text-gray-500 text-center flex flex-col gap-2 px-2">
                        No profile picture yet
                        <span className="text-xs">If this is you or you know them, tell them to update their profile!</span>
                      </span>
                    </div>}
                  </div>
                  <div className="absolute bg-[#ebce56]/50 backdrop-blur-sm rounded-t-xl p-2 bottom-0 min-h-12 w-full z-[1] flex flex-col">
                    <span className="text-lg font-bold [text-shadow:_1px_1px_0px_#ebce56]">
                      {participant.player?.name}
                    </span>
                    <div className="flex flex-row items-center gap-1">
                      {(participant.player?.nickname && participant.player?.nickname !== participant.player?.name) ? <span className="text-xs capitalize">
                        ({participant.player?.nickname})
                      </span> : ""}
                      {!!participant.player?.level?.name ? <span className="text-xs text-purple-700 capitalize">
                        {participant.player?.level.name}
                      </span> : ""}
                    </div>

                  </div>
                </Link>
              ))}
              {draftParticipants?.filter((participant) => !filterParticipants || participant.tournament_uuid == filterParticipants).length === 0 && (
                <div className="col-span-12 text-center text-gray-500 aspect-video w-full flex flex-col items-center justify-center">
                  <Lucide icon="UserRoundX" className="w-16 h-16 mb-2" />
                  No Participants Found
                </div>
              )}
            </div>
          </div>}
        </>}

      </div>

      <div className="col-span-12 sm:col-span-4">
        {event.media_url && (
          <img
            src={imageResizerDimension(event.media_url, 400, "h")}
            className="w-full h-48 sm:h-fit object-cover rounded-xl shadow-sm border border-gray-100 hidden sm:flex"
            alt={event.name}
            onClick={() => {
              if (event.media_url) {
                window.open(event.media_url, '_blank');
              }
            }}
          />
        )}

        {!event.media_url && (
          <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl items-center justify-center hidden sm:flex">
            <Lucide icon="Calendar" className="h-16 w-16 text-emerald-400" />
          </div>
        )}

        <div className="flex-wrap gap-3 sm:flex sm:flex-row hidden">

          {userIsLogin && (
            <>
              {joinStatus === "CONFIRMED" && (
                <Button
                  variant="primary"
                  color="primary"
                  className="font-medium text-xs shadow-none uppercase mt-3 flex-1"
                >
                  Confirmed to join
                </Button>
              )}
              {joinStatus === "REJECTED" && (
                <Button
                  variant="danger"
                  color="danger"
                  className="font-medium text-xs shadow-none uppercase mt-3 flex-1"
                >
                  Rejected
                </Button>
              )}
              {joinStatus === "REQUESTED" && (
                <Button
                  variant="primary"
                  color="primary"
                  className="font-medium text-xs shadow-none uppercase mt-3 flex-1"
                  onClick={() => {
                    setModalAlert({
                      title: "Please Wait",
                      message: "",
                      description: "Your request has been submitted and is awaiting review by our tournament officials.",
                      icon: "Clock",
                      open: true,
                      onClose: () => {
                        setModalAlert(undefined)
                      }
                    });
                  }}
                >
                  Joined
                </Button>
              )}
              {joinStatus === "APPROVED" && (
                <Button
                  variant="primary"
                  color="primary"
                  className="font-medium text-xs shadow-none uppercase mt-3 flex-1"
                >
                  {/* Pay IDR {new Intl.NumberFormat('id-ID', {}).format(commitmentFee || 0)} */}
                  You have approved! check your email inbox!
                </Button>
              )}
              {(!joinStatus && new Date(startDate || "") > new Date()) && (
                <Button
                  variant="primary"
                  color="primary"
                  disabled={isJoining}
                  className="font-medium text-xs shadow-none uppercase mt-3 flex-1"
                  onClick={handleJoinTournament}
                >
                  Request to Join
                </Button>
              )}
            </>
          )}
          {(!joinStatus && !user && endDate && new Date(endDate) > new Date()) && (
            <Button
              variant="primary"
              color="primary"
              disabled={isJoining}
              className="font-medium text-xs shadow-none uppercase mt-2"
              onClick={() => {
                setModalAlert({
                  description: "You need to create an account to join this tournament. Register now or sign in to your existing account.",
                  open: true,
                  onClose: () => setModalAlert(undefined),
                  buttons: [
                    {
                      label: "Create Account",
                      onClick: () => {
                        const currentPath = window.location.pathname + window.location.search;
                        navigate(paths.register({ redirect: `${(currentPath)}` }).$);
                      },
                      variant: "primary",
                    },
                    {
                      label: "Sign In",
                      onClick: () => {
                        const currentPath = window.location.pathname;
                        navigate(paths.login({ redirect: `${(currentPath)}` }).$);
                      },
                      variant: "secondary",
                    },
                  ],
                  icon: "Info",
                  title: "Join Tournament",
                })
              }}
            >
              Ask to Join
            </Button>
          )}
          {/* <Link to={`${paths.tournament.index({ uuid: event.uuid || "" }).$}#participant`}>
            <Button
              variant="outline-primary"
              color="primary"
              disabled={isJoining}
              className="font-medium text-xs shadow-none uppercase mt-3 flex-1"
            >
              <Lucide icon="Users" />&nbsp;
              PARTICIPANTS
            </Button>
          </Link> */}
        </div>
        {event.tournaments && event.tournaments.length > 0 && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
            <h4 className="text-sm font-semibold text-emerald-800 mb-2">Tournament Categories</h4>
            <ul className="space-y-2 list-disc ml-4 flex flex-col">
              {event.tournaments.slice(0, 12).map((tournament, index) => (
                <li
                  key={index}
                  className=" hover:text-emerald-900 cursor-pointer"
                  onClick={() => navigate(paths.tournament.index({ uuid: tournament.uuid || "" }).$)}
                >
                  <div className='flex flex-col'>

                    <span className='text-sm font-medium  text-emerald-700'>
                      {tournament.name}
                    </span>
                    {tournament.subtitle && (
                      <span className='text-xs text-emerald-600'>
                        ({tournament.subtitle})
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>


      {modalAlert && (
        <Confirmation {...modalAlert} />
      )}
      <TournamentEventJoinModal
        tournamentEventUuid={tournamentEventUuid || ""}
        show={modalJoin?.open || false}
        onClose={() => setModalJoin(undefined)}
      />
    </div>
  );
};

export default TournamentEventCard;
