import React, { useState } from 'react';
import { Modal } from 'antd';
import Lucide from '@/components/Base/Lucide';
import Button from '@/components/Base/Button';
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
import { PublicTournamentDetail } from '@/pages/Public/Tournament/api/schema';
import Tippy from '../Base/Tippy';
import Confirmation, { AlertProps } from '../Modal/Confirmation';
import UploadDropzone from '../UploadDropzone';
import { adminApiHooks } from '@/pages/Login/api';
import { compressImage } from '@/utils/image-compression';

interface TournamentEventJoinModalProps {
  show: boolean;
  tournamentEventUuid: string;
  onClose: (data?: any) => void;
}

const TournamentEventJoinModal: React.FC<TournamentEventJoinModalProps> = ({
  show,
  tournamentEventUuid,
  onClose
}) => {
  const accessToken = useAtomValue(accessTokenAtom);
  const user = useAtomValue(userAtom);
  const userIsLogin = !!accessToken && !!user;
  const toast = useToast()

  const { data: playerData } = PlayerHomeApiHooks.useGetPlayersDetail({
    params: {
      uuid: user?.uuid as string
    }
  });
  const { data: tournamentEventQuota } = PublicTournamentApiHooks.useGetPublicTournamentEventQuota({
    params: {
      uuid: tournamentEventUuid || ''
    }
  })
  const getTournamentQuota = (uuid: string) => {
    return tournamentEventQuota?.data?.find((item) => item.tournament_uuid === uuid)
  }
  // Fetch tournament event details
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

  // State for selected players (for non-draft tournaments)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDropdownData | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const [step, setStep] = useState<number>(1)
  const [paymentReceipt, setPaymentReceipt] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const startDate = tournamentEvent?.data?.tournaments?.length ? tournamentEvent?.data?.tournaments?.sort((a, b) => new Date(a.start_date || '').getTime() - new Date(b.start_date || '').getTime())?.[0]?.start_date : undefined;
  const endDate = tournamentEvent?.data?.tournaments?.length ? tournamentEvent?.data?.tournaments?.sort((a, b) => new Date(b.end_date || '').getTime() - new Date(a.end_date || '').getTime())?.[0]?.end_date : undefined;
  // State for selected tournament
  const [selectedTournament, setSelectedTournament] = React.useState<string | null>(null);

  // State for agreement checkbox
  const [isAgreed, setIsAgreed] = React.useState(false);

  // Debounce search keyword to optimize API calls
  const debouncedSearchKeyword = useDebounce(searchKeyword, { wait: 500 });


  // Join tournament event mutation
  const { mutateAsync: joinTournament, isLoading: isJoining } = PublicTournamentApiHooks.useJoinTournament({
    params: {
      uuid: selectedTournament || tournamentEventUuid
    },
  }, {
    onSuccess: (data) => {
      setModalAlert(undefined);
      queryClient.invalidateQueries({ queryKey: PublicTournamentApiHooks.getKeyByAlias("getTournamentDetail") });
      queryClient.invalidateQueries({ queryKey: PublicTournamentApiHooks.getKeyByAlias("getPublicTournamentEventDetail") });
      queryClient.invalidateQueries({ queryKey: PublicTournamentApiHooks.getKeyByAlias("getPublicTournamentEventAuthDetail") });
      queryClient.invalidateQueries({ queryKey: PublicTournamentApiHooks.getKeyByAlias("getTournamentDetailAuth") });
      onClose();
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

    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: PublicTournamentApiHooks.getKeyByAlias("getTournamentDetail") });
      queryClient.invalidateQueries({ queryKey: PublicTournamentApiHooks.getKeyByAlias("getPublicTournamentEventDetail") });
      queryClient.invalidateQueries({ queryKey: PublicTournamentApiHooks.getKeyByAlias("getPublicTournamentEventAuthDetail") });
      queryClient.invalidateQueries({ queryKey: PublicTournamentApiHooks.getKeyByAlias("getTournamentDetailAuth") });
      toast.showNotification({
        text: error.message,
        duration: 2000,
        icon: "UserRoundX"
      });
    },
    retry: false
  });

  const handleModalTnC = () => {
    setModalAlert({
      title: 'Rules',
      description: "",
      size: "lg",
      onClose: () => {
        setModalAlert(undefined);
      },
      icon: 'Info',
      content: <div className='min-w-32 p-4' dangerouslySetInnerHTML={{ __html: decodeURIComponent(tournamentEvent?.data?.rules || "") }}>

      </div>,
      open: true,
    })
  }
  const handleContinueTournament = () => {
    if (!isAgreed) return;
    if (step < 2) {
      setStep(step + 1)
    } else {
      handleJoinTournament()
    }
  }
  const { mutateAsync: actionUploadImage } = adminApiHooks.useMediaUpload({});

  const handleReceiptUpload = async (file: any, index: number) => {
    const uploadedFile = file.file?.originFileObj || file.fileList[file.fileList.length - 1]?.originFileObj;

    if (uploadedFile) {
      // Validate file type
      if (!uploadedFile.type?.startsWith('image/')) {
        toast.showNotification({
          text: 'Please upload an image file',
          duration: 2000,
          icon: 'AlertTriangle'
        });
        return;
      }

      // Validate file size (max 5MB)
      if (uploadedFile.size > 5 * 1024 * 1024) {
        toast.showNotification({
          text: 'Image size should be less than 5MB',
          duration: 2000,
          icon: 'AlertTriangle'
        });
        return;
      }

      setUploading(true);

      try {
        // Compress image before upload
        const compressedFile = await compressImage(uploadedFile);

        // Upload to server with correct payload format
        const response = await actionUploadImage({ image: compressedFile });

        // Save URL to state
        if (response?.imageUrl) {
          setPaymentReceipt(response.imageUrl);
          toast.showNotification({
            text: 'Payment receipt uploaded successfully',
            duration: 2000,
            icon: 'CheckCircle'
          });
        } else {
          throw new Error('Upload failed - no URL returned');
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        toast.showNotification({
          text: error?.message?.includes('compress') ? 'Failed to compress image' : 'Failed to upload payment receipt',
          duration: 2000,
          icon: 'AlertTriangle'
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveReceipt = () => {
    setPaymentReceipt('');
  };
  const handleCancelTournament = () => {
    if (step <= 1) {
      onClose();
    } else {
      setStep(step - 1)
    }
  }
  const handleJoinTournament = async () => {
    if (!userIsLogin) {
      // Handle redirect to login or show login modal
      return;
    }
    await joinTournament({
      player_uuid: selectedPlayer?.uuid,
      commitment_fee: Number(tournamentEvent?.data?.tournaments?.find(t => t.uuid === selectedTournament)?.commitment_fee || "0"),
      media_url: paymentReceipt
    });
  };
  const isEarlyBird = (tournament: Partial<PublicTournamentDetail>) => {
    const earlybird = {
      active: true,
      available: true,
      expired: false
    }
    if (!tournament.early_bird_price) {
      earlybird.active = false
      earlybird.available = false
      return earlybird
    };
    if (tournament.early_bird_end_date && new Date(tournament.early_bird_end_date || "") < new Date()) {
      earlybird.active = true
      earlybird.expired = true
      return earlybird
    };
    if (tournament.early_bird_start_date && new Date(tournament.early_bird_start_date || "") > new Date()) {
      earlybird.active = true;
      earlybird.available = false
      earlybird.expired = false
      return earlybird
    };
    if (
      tournament.early_bird_start_date &&
      tournament.early_bird_end_date &&
      new Date(tournament.early_bird_start_date || "") <= new Date() &&
      new Date(tournament.early_bird_end_date || "") >= new Date()
    ) {
      earlybird.active = true
      earlybird.available = true
      earlybird.expired = false
      if (tournament.early_bird_limit && tournament.draft_picks) {
        const availableDraftPicks = tournament.draft_picks.filter(d => d.status != "REJECTED").length
        if (tournament.early_bird_limit >= availableDraftPicks) {
          earlybird.available = true;
        } else {
          earlybird.available = false;
        }
      }
      return earlybird
    }

    return earlybird;
  };

  const tournamentEventData = tournamentEvent?.data;
  const selectedTournamentData = tournamentEventData?.tournaments?.find(t => t.uuid == selectedTournament);

  return (
    <Modal
      open={show}
      onCancel={onClose}
      title="Tournament Event Details"
      width={800}
      footer={null}
    >
      {eventLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : tournamentEventData ? (
        <div className="space-y-6">
          {/* Tournament Event Image and Basic Info */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <img
                src={imageResizerDimension(
                  tournamentEventData.media_url || "", 120, "h"
                )}
                alt={tournamentEventData.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {tournamentEventData.name}
              </h3>
              <p className="text-xs opacity-80 mb-2 line-clamp-3" dangerouslySetInnerHTML={{ __html: decodeURIComponent(tournamentEventData?.description || "") }}>
              </p>
            </div>
          </div>
          {step == 1 && <>
            {/* Tournament Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Lucide icon="Network" className="h-5 min-w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Game System</p>
                    <p className="text-sm text-gray-600 capitalize">{tournamentEventData?.tournaments?.find((t, i) => selectedTournament ? t.uuid === selectedTournament : i === 0)?.type || 'Round Robin'}</p>
                    <p className="text-xs text-gray-600">{tournamentEventData?.tournaments?.find((t, i) => selectedTournament ? t.uuid === selectedTournament : i === 0)?.max_player || '16'} Participants</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Lucide icon="MapPin" className="h-5 min-w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Venue</p>
                    <p className="text-sm text-gray-600">{tournamentEventData?.tournaments?.[0]?.court_info?.name}</p>
                    <p className="text-xs text-gray-600">{tournamentEventData?.tournaments?.[0]?.court_info?.address}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Lucide icon="Gamepad2" className="h-5 min-w-5 text-gray-400" />
                  <Tippy content='Semua pemain daftar perorangan dan nanti pasangan akan ditentukan menggunakan sistem draft pick.
Kenapa memakai sistem draft pick? Supaya semua Tim lebih balance dan lebih fair.
'>
                    <p className="text-sm font-medium text-gray-900">Tournament System</p>
                    <p className="text-sm text-gray-600 capitalize inline-flex">{tournamentEventData?.tournaments?.find(t => t.uuid === selectedTournament)?.draft_pick ? 'DRAFT PICK' : "TEAM"} <Lucide icon='MessageCircleQuestion' className='w-4 h-4 ml-2' /></p>
                    <p className="text-xs text-gray-600">{tournamentEventData?.tournaments?.find(t => t.uuid === selectedTournament)?.draft_pick ? 'Lowest seeded choose partner first' : "Bring your own team"}</p>
                  </Tippy>
                </div>
                <div className="flex items-center gap-3">
                  <Lucide icon="Calendar" className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Event Period</p>
                    <p className="text-sm text-gray-600">
                      {tournamentEventData.tournaments && tournamentEventData.tournaments.length > 0 ? (
                        (() => {
                          const sortedTournaments = [...tournamentEventData.tournaments].sort((a, b) =>
                            new Date(a.start_date || '').getTime() - new Date(b.start_date || '').getTime()
                          );
                          const firstTournament = sortedTournaments[0];
                          const lastTournament = sortedTournaments[sortedTournaments.length - 1];
                          return (
                            <>
                              {moment(firstTournament?.start_date).format('DD MMM YYYY')} - {moment(lastTournament?.end_date).format('DD MMM YYYY')}
                            </>
                          );
                        })()
                      ) : (
                        'No tournaments scheduled'
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      &nbsp;
                      {/* {moment(startDate).format('HH:mm')} - {moment(endDate).format('HH:mm')} GMT +7 */}
                    </p>

                  </div>
                </div>
              </div>
            </div>

            {/* Tournament Picker */}
            <div className='flex flex-col justify-center gap-2'>
              <span className="text-sm font-medium text-gray-900 text-center">Choose your level to join</span>
              <div className="flex flex-col sm:flex-row gap-2">
                {tournamentEventData.tournaments?.map((tournament, index) => (
                  <div
                    key={index}
                    className={`flex-1 border pt-1 pb-2 px-3 rounded-lg cursor-pointer transition-all flex flex-row justify-between ${selectedTournament === tournament.uuid
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-emerald-800 hover:border-emerald-600 hover:bg-emerald-50'
                      }
                      ${(getTournamentQuota(tournament.uuid || "")?.remaining_quota || 0) <= 0 ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    onClick={() => (getTournamentQuota(tournament.uuid || "")?.remaining_quota || 0) <= 0 ? null : setSelectedTournament(tournament.uuid || "")}
                  >
                    <div className='flex flex-col'>
                      <span className="text-xs text-gray-500 p-0">{tournament.level}</span>
                      <p className="text-base font-semibold text-emerald-800">{tournament.name}</p>
                      <p className="text-sm text-gray-600 font-bold">IDR {Intl.NumberFormat('id-ID').format(Number(isEarlyBird(tournament).active ? tournament.early_bird_price || 0 : tournament.commitment_fee || 0))}</p>
                      <p className="text-xs text-purple-600">{isEarlyBird(tournament).active ? 'Early Bird' : 'Regular'}</p>
                    </div>
                    <div className='flex flex-col items-center justify-center'>
                      {selectedTournament === tournament.uuid && (
                        <div className='text-white bg-emerald-700 rounded-full p-1.5 animate-pulse'>
                          <Lucide icon="CheckCircle" className="h-5 w-5 text-white ml-auto" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className='inline-flex flex-row justify-center items-center gap-2 bg-gray-100 rounded-xl p-2'>
              <input
                type="checkbox"
                id="agreement-checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <div className='inline'>
                <label htmlFor="agreement-checkbox" className="text-sm text-gray-700 cursor-pointer">
                  Saya setuju dan telah memahami aturan dalam turnamen ini.
                </label>
                <span className='text-emerald-700 cursor-pointer' onClick={handleModalTnC}>Lihat Peraturan</span>
              </div>

            </div>
            {/* Join Status */}
            {
              tournamentEventData.tournaments?.some(t => t.join_status) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Lucide icon="Info" className="h-5 w-5 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Your join status: <span className="font-medium text-gray-900">
                        {tournamentEventData.tournaments?.find(t => t.join_status)?.join_status}
                      </span>
                    </p>
                  </div>
                </div>
              )
            }
          </>}
          {
            step === 2 && (<>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className='flex flex-row items-center gap-2'>
                    <Lucide icon="Info" className="h-5 w-5 text-gray-400" />
                    Please complete the payment before proceeding.
                  </span>
                </div>
              </div>
              <div className='border-2 border-gray-200 rounded-lg p-6 bg-white shadow-sm'>
                <div className='flex justify-between items-start mb-6'>
                  <div>
                    <h3 className='text-lg font-bold text-gray-900 mb-2'>PAYMENT RECEIPT</h3>
                    <p className='text-sm text-gray-500'>Tournament Registration Fee</p>
                  </div>
                  <div className='text-right'>
                    <div className='text-sm text-gray-500'>Receipt ID</div>
                    <div className='font-mono text-sm font-semibold'>#{Date.now()}</div>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                  <div className='border-l-4 border-emerald-500 pl-4'>
                    <div className='text-xs text-gray-500 uppercase tracking-wide mb-1'>BILLED TO</div>
                    <div className='font-semibold text-gray-900'>{user?.name}</div>
                    <div className='text-sm text-gray-600 mt-1'>{playerData?.data?.email}</div>
                    <div className='text-sm text-gray-600'>{playerData?.data?.phone}</div>
                  </div>
                  <div className='border-l-4 border-blue-500 pl-4'>
                    <div className='text-xs text-gray-500 uppercase tracking-wide mb-1'>TOURNAMENT</div>
                    <div className='font-semibold text-gray-900'>{selectedTournamentData?.name}</div>
                    <div className='text-sm text-gray-600 mt-1'>{selectedTournamentData?.court || 'TBD'}</div>
                  </div>
                </div>

                <div className='border-t border-gray-200 pt-4'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-gray-200'>
                        <th className='text-left py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider'>No</th>
                        <th className='text-left py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider'>Item</th>
                        <th className='text-center py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider'>Qty</th>
                        <th className='text-right py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider'>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className='border-b border-gray-100'>
                        <td className='py-3 text-sm text-gray-900'>1</td>
                        <td className='py-3 text-sm text-gray-900 font-medium'>Tournament Registration</td>
                        <td className='py-3 text-sm text-gray-900 text-center'>1 Slot</td>
                        <td className='py-3 text-sm text-gray-900 text-right font-semibold'>
                          IDR {(selectedTournamentData && isEarlyBird(selectedTournamentData) ? selectedTournamentData?.early_bird_price : selectedTournamentData?.commitment_fee)?.toLocaleString()}
                        </td>
                      </tr>
                      <tr className='bg-gray-50'>
                        <td colSpan={3} className='py-3 text-sm font-semibold text-gray-900 text-right pr-4'>TOTAL</td>
                        <td className='py-3 text-lg font-bold text-emerald-600 text-right'>
                          IDR {(selectedTournamentData && isEarlyBird(selectedTournamentData) ? selectedTournamentData?.early_bird_price : selectedTournamentData?.commitment_fee)?.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className='mt-6 pt-4 border-t border-gray-200'>
                  <div className='flex justify-between items-center text-xs text-gray-500'>
                    <div>Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div className='font-semibold text-emerald-600'>Payment Pending</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="grid grid-cols-2 text-gray-600 ">
                  <div className='sm:col-span-1 col-span-2 flex flex-col gap-2 mt-4'>
                    <span className='text-sm font-medium'>Bank Transfer</span>
                    <div className='flex flex-row items-center bg-gray-100 w-fit p-2 rounded-lg'>
                      <div className='bank-logo flex items-center justify-center'>
                        <Image src='https://res.cloudinary.com/doqyrkqgw/image/upload/v1777910633/pngwing.com_2_c4flh0.png' alt="bca" className=' object-contain aspect-video h-8' />
                      </div>
                      <div className='flex flex-col'>
                        <div className='text-sm font-medium'>Bank BCA</div>
                        <div className='text-lg font-bold'>7881 233 944</div>
                        <div className='text-sm font-semibold'>an. Dedhi Ruliawan</div>
                      </div>
                    </div>
                  </div>
                  <div className='flex sm:col-span-1 col-span-2 gap-4 mt-4'>
                    <div className='flex flex-col'>
                      <label className='text-sm font-medium text-gray-700 mb-2'>
                        Upload Bukti Transfer
                      </label>
                      <UploadDropzone
                        uploadType="image"
                        name="payment_receipt"
                        index={0}
                        onChange={handleReceiptUpload}
                        fileList={paymentReceipt ? [paymentReceipt] : []}
                        onRemove={handleRemoveReceipt}
                        loading={uploading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
            )
          }
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline-primary"
              onClick={handleCancelTournament}
              className="flex-1"
            >
              Cancel
            </Button>

            {userIsLogin ? (
              // <Button
              //   variant="primary"
              //   onClick={handleJoinTournament}
              //   disabled={isJoining || tournamentEventData.tournaments?.some(t => t.join_status === 'CONFIRMED' || t.join_status === 'APPROVED')}
              //   className="flex-1"
              // >
              //   {isJoining ? 'Joining...' :
              //     tournamentEventData.tournaments?.some(t => t.join_status === 'CONFIRMED') ? 'Already Joined' :
              //       tournamentEventData.tournaments?.some(t => t.join_status === 'APPROVED') ? 'Approved' :
              //         'Request to Join'}
              // </Button>

              <Button
                variant="primary"
                onClick={handleContinueTournament}
                disabled={(step == 2 && !paymentReceipt) || !isAgreed || !selectedTournament || isJoining || tournamentEventData.tournaments?.some(t => t.join_status === 'CONFIRMED' || t.join_status === 'APPROVED')}
                className="flex-1"
              >
                {isJoining ? 'Joining...' :
                  tournamentEventData.tournaments?.some(t => t.join_status === 'CONFIRMED') ? 'Already Joined' :
                    tournamentEventData.tournaments?.some(t => t.join_status === 'APPROVED') ? 'Approved' :
                      (step == 2 ? "Submit Registration" : 'Continue')}
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
        </div >
      ) : (
        <div className="text-center py-8">
          <Lucide icon="AlertTriangle" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Tournament event not found</p>
        </div>
      )
      }
      <Confirmation
        open={!!modalAlert?.open}
        onClose={() => setModalAlert(undefined)}
        size={modalAlert?.size}
        icon={modalAlert?.icon || "Info"}
        iconClassname={modalAlert?.iconClassname}
        title={modalAlert?.title || ""}
        description={modalAlert?.description || ""}
        refId={modalAlert?.refId}
        buttons={modalAlert?.buttons}
        content={modalAlert?.content}
      />
    </Modal >

  );
};

export default TournamentEventJoinModal;
