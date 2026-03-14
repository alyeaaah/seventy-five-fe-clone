import Button from "@/components/Base/Button";
import { useEffect, useState } from "react";
import { TournamentsApiHooks } from "./api";
import { useToast } from "@/components/Toast/ToastContext";
import {
  Divider
} from "antd";
import { Navigate, useNavigate } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import Lucide from "@/components/Base/Lucide";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import moment from "moment";
import 'react-quill/dist/quill.snow.css';
import Image from "@/components/Image";
import { DraggableBracket, TournamentDrawingUtils } from "@/components/TournamentDrawing";
import { PointConfigurationsApiHooks } from "../PointConfig/api";
import { ModalSponsors } from "./Components/ModalSponsors";
import { convertTournamentMatchToMatch } from "@/utils/drawing.util";
import { IRound } from "@/components/TournamentDrawing/interfaces";


interface Props {
  tournament?: string;
}

export const TournamentDetail = () => {
  const { convertMatchToRound } = TournamentDrawingUtils;
  const queryParams = useRouteParams(paths.administrator.tournaments.detail);
  const { id: tournamentUuid } = queryParams;
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const [isModalSponsorOpen, setIsModalSponsorOpen] = useState(false);
  const navigate = useNavigate();
  const [allRounds, setAllRounds] = useState<IRound[]>([]);

  const { data } = TournamentsApiHooks.useGetTournamentsDetail({
    params: {
      uuid: tournamentUuid || 0
    }
  }, {
    enabled: !!tournamentUuid
  });

  const { data: detailPointConfig } = PointConfigurationsApiHooks.useGetPointConfigurationsDetail(
    {
      params: {
        uuid: data?.data?.point_config_uuid || 0
      }
    }, {
    enabled: (!!tournamentUuid && !!data?.data?.point_config_uuid)
  }
  );

  const { data: matches } = TournamentsApiHooks.useGetTournamentMatches({
    queries: {
      tournament_uuid: tournamentUuid || ""
    }
  }, {
    enabled: !!tournamentUuid
  });
  useEffect(() => {
    if (!matches?.data?.length) return;
    const knockoutMatches = matches?.data.filter((match) => match.groupKey === null || match.groupKey === undefined);
    setAllRounds(convertMatchToRound(convertTournamentMatchToMatch(knockoutMatches || [])))
  }, [matches])

  const { data: dataSponsors } = TournamentsApiHooks.useGetTournamentSponsors({
    params: {
      uuid: tournamentUuid
    }
  });

  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">{data?.data?.name || "Tournament"}</h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(paths.administrator.tournaments.edit({ tournament: tournamentUuid || "" }).$)}
        >
          Edit Tournament
        </Button>
      </div>
      <Divider className="my-4" />

      <div className="grid grid-cols-12 gap-4 ">
        <div className="col-span-12 sm:col-span-8 box p-4">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12">
              <h2 className=" font-medium">Tournament Information</h2>
              <Divider className="mb-0" />
            </div>
            {/* start info */}
            <div className="col-span-12 grid grid-cols-12 gap-2 pl-2">
              <div className="col-span-12 sm:col-span-3 flex items-center">
                <div className="flex flex-row items-center">
                  <Lucide icon="MapPin" className="w-6 h-6" />
                  <div className="ml-2 font-medium flex flex-col">
                    <span className="text-xs font-normal">Location</span>
                    <span>{data?.data?.court}</span>
                  </div>
                </div>
              </div>
              <div className="col-span-12 sm:col-span-3 flex items-center">
                <div className="flex flex-row items-center">
                  <Lucide icon="Calendar" className="w-6 h-6" />
                  <div className="ml-2 font-medium flex flex-col">
                    <span className="text-xs font-normal">Date</span>
                    <span>
                      {moment(data?.data?.start_date).format('MMMM') === moment(data?.data?.end_date).format('MMMM') ?
                        <>
                          {moment(data?.data?.start_date).format('DD')} - {moment(data?.data?.end_date).format('DD MMMM YYYY')}
                        </> :
                        <>
                          {moment(data?.data?.start_date).format('DD MMMM YYYY')} - {moment(data?.data?.end_date).format('DD MMMM YYYY')}
                        </>
                      }
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-span-12 sm:col-span-3 flex items-center">
                <div className="flex flex-row items-center">
                  <Lucide icon="Award" className="w-6 h-6" />
                  <div className="ml-2 font-medium flex flex-col">
                    <span className="text-xs font-normal">Level</span>
                    <span>
                      {data?.data?.level}</span>
                    <span className="text-xs font-normal">
                      {data?.data?.draft_pick ? "Draft Pick" : ""}
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-span-12 sm:col-span-3 flex items-center">
                <div className="flex flex-row items-center">
                  <Lucide icon="Banknote" className="w-6 h-6" />
                  <div className="ml-2 font-medium flex flex-col">
                    <span className="text-xs font-normal">Commitment Fee</span>
                    <span>
                      IDR {Intl.NumberFormat('id-ID').format(data?.data?.commitment_fee || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Divider className="col-span-12 m-0" />
            {/* logo and desc */}
            <div className="col-span-12 grid grid-cols-12 gap-2 pl-2">
              <div className="col-span-12 sm:col-span-4 flex justify-start aspect-square border  rounded-lg">
                <Image src={data?.data?.media_url} className="object-contain rounded-lg " />
              </div>
              <div className="col-span-12 sm:col-span-8 flex flex-col gap-2">
                <div className="text-lg font-semibold">{data?.data?.name}</div>
                <div dangerouslySetInnerHTML={{ __html: data?.data?.description || "" }}></div>

              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-4 flex flex-col box p-4 max-h-full overflow-hidden">
          <div className="col-span-12 h-fit flex flex-col items-center justify-start">
            <h2 className=" font-medium w-full text-start">Point Configuration</h2>
            <Divider className="mb-2 col-span-12" />
          </div>
          <div className="col-span-12 bg-slate-100 rounded-2xl flex flex-col overflow-scroll h-max border">
            <div key={"title"} className="grid grid-cols-8 gap-8 font-semibold bg-slate-100 p-2 rounded-2xl ">
              <div className="col-span-2 text-end">Round</div>
              <div className="col-span-3 flex justify-center">Win</div>
              <div className="col-span-3 flex justify-center">Lose</div>
            </div>
            {detailPointConfig?.data?.points?.map((p, i) => {
              return (
                <div key={i} className={`grid grid-cols-8 gap-8 p-2 col-span-12 rounded-lg text-xs sm:text-sm ${i % 2 == 0 ? 'bg-slate-50' : ''}`}>
                  <div className="col-span-2 flex justify-end"><span className="hidden sm:block mr-1">Round</span> {p.round}</div>
                  <div className="col-span-3 text-ellipsis line-clamp-1 flex justify-center">{p.win_point} Point</div>
                  <div className="col-span-3 text-ellipsis line-clamp-1 flex justify-center">{p.lose_point} Point</div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
      <div className="grid grid-cols-12 col-span-12 sm:col-span-12 gap-4">
        <div className="col-span-12 sm:col-span-8 mt-6 box p-4 grid grid-cols-12 gap-2">
          <div className="col-span-12 h-fit">
            <h2 className=" font-medium">Bracket</h2>
            <Divider className="mb-2" />
          </div>
          <div className="col-span-12 h-fit overflow-x-scroll">
            <DraggableBracket
              rounds={allRounds}
              readOnly
              setRounds={() => null}
              onSeedClick={(seed) => {
                // setSelectedMatch(seed);
                // setModalFormMatch(true);
                navigate(paths.administrator.tournaments.match({ matchUuid: seed.uuid }).$)
              }}
            // key={`draggable-${selectedMatch?.court_uuid}`}
            />
          </div>
        </div>
        {(data?.data?.rules && data?.data?.rules?.length > 0) && <div className="col-span-12 sm:col-span-4 box p-4 ">
          <div className="grid grid-cols-12 ">
            <div className="col-span-12 h-fit">
              <h2 className=" font-medium">Rules</h2>
              <Divider className="mb-2" />
            </div>
            <div className="col-span-12 grid grid-cols-12 h-fit">
              {data?.data?.rules?.map((rule, index) => (
                <div className="col-span-12 grid grid-cols-12 gap-2" key={index + "_rule"} >
                  <div className="col-span-2 sm:col-span-1 text-right pr-2 ">
                    <Button type="button" size="sm" variant="outline-success" >
                      {index + 1}
                    </Button>
                  </div>
                  <div className="col-span-10 sm:col-span-11 flex items-center">
                    <div className="html-render" dangerouslySetInnerHTML={{ __html: decodeURIComponent(rule.description) }}></div>
                  </div>
                  <Divider className="col-span-12 mt-0 mb-2" />
                </div>
              ))}
            </div>
          </div>
        </div>}
      </div>

      <div className="grid grid-cols-12 mt-6 box p-4">
        <div className="col-span-12 h-fit flex flex-row items-center justify-between">
          <h2 className="font-medium">Tournament Supported by</h2>
          <Button
            onClick={() => setIsModalSponsorOpen(true)}
            variant="outline-primary"
            size="sm"
            className="flex items-center justify-center"
          >
            <Lucide icon="Pencil" className="w-4 h-4" />
          </Button>
        </div>
        <Divider className="mb-2 col-span-12 mt-2" />
        <div className="col-span-12 h-fit bg-slate-100 rounded-2xl">
          {dataSponsors?.data?.map((p, i) => {
            return (
              <div key={i} className={`gap-4 flex flex-row items-center p-3 col-span-12 rounded-lg text-xs sm:text-base ${i % 2 == 0 ? 'bg-slate-50' : ''}`}>
                <img src={p.media_url} className="w-16 h-16 object-contain" />
                <div className="text-ellipsis line-clamp-2 flex justify-start font-semibold text-lg">{p.name}</div>
              </div>
            );
          })}
        </div>
      </div>
      <ModalSponsors
        onDismiss={() => {
          setIsModalSponsorOpen(false);
        }}
        key={dataSponsors?.data?.length + JSON.stringify(isModalSponsorOpen)}
        tournamentUuid={tournamentUuid}
        isModalOpen={isModalSponsorOpen}
        setIsModalOpen={setIsModalSponsorOpen}
        selectedSponsor={dataSponsors?.data.map((sponsor) => ({
          uuid: sponsor.uuid,
          sponsor_uuid: sponsor.sponsor_uuid,
          is_delete: false,
        })) || []}
      />
      <Confirmation
        open={!!modalAlert?.open}
        onClose={() => setModalAlert(undefined)}
        icon={modalAlert?.icon || "Info"}
        title={modalAlert?.title || ""}
        description={modalAlert?.description || ""}
        refId={modalAlert?.refId}
        buttons={modalAlert?.buttons}
      />
    </>
  )
}
