import Button from "@/components/Base/Button";
import { useState } from "react";
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
        <div className="col-span-12 sm:col-span-6 box p-4">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12">
              <h2 className=" font-medium">Tournament Information</h2>
              <Divider className="mb-0" />
            </div>
            <div className="col-span-12 grid grid-cols-12 gap-2 pl-2">
              <div className="col-span-12 sm:col-span-8 grid grid-cols-12 gap-2">
                <div className="col-span-12">
                  <div className="flex flex-row"><Lucide icon="MapPin" /><span className="ml-2 font-medium">{data?.data?.court}</span></div>
                </div>
                <div className="col-span-12">
                  <div dangerouslySetInnerHTML={{ __html: data?.data?.description || "" }}></div>
                </div>
                <div className="col-span-12">
                  <div >Started on <span className="font-medium">{moment(data?.data?.start_date).format("ddd, D MMMM Y")} at {moment(data?.data?.start_date).format("HH:mm")} WIB</span></div>
                </div>
                <div className="col-span-12">
                  <div >Will be ended on <span className="font-medium">{moment(data?.data?.start_date).format("ddd, D MMMM Y")} at {moment(data?.data?.start_date).format("HH:mm")} WIB</span></div>
                </div>
                <div className="col-span-12">
                  <div >Level <span className="font-medium">{data?.data?.level} {!data?.data?.strict_level ? "Open" : "Strict"} </span></div>
                </div>
              </div>
              <div className="col-span-12 sm:col-span-4 flex justify-end">
                <Image src={data?.data?.media_url} className="max-h-52 object-fit" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 box p-4 ">
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
              rounds={convertMatchToRound(convertTournamentMatchToMatch(matches?.data || []))}
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
        <div className="col-span-12 sm:col-span-4">
          <div className="grid grid-cols-12 mt-6 box p-4">
            <div className="col-span-12 h-fit flex flex-row items-center">
              <h2 className=" font-medium">Point Configuration</h2>
            </div>
            <Divider className="mb-2 col-span-12" />
            <div className="col-span-12 h-fit bg-slate-100 rounded-2xl">
              <div key={"title"} className="grid grid-cols-8 gap-8 font-semibold bg-slate-100 p-2 rounded-2xl ">
                <div className="col-span-2 text-end">Round</div>
                <div className="col-span-3 flex justify-center">Win</div>
                <div className="col-span-3 flex justify-center">Lose</div>
              </div>
              {detailPointConfig?.data?.points?.map((p, i) => {
                return (
                  <div key={i} className={`grid grid-cols-8 gap-8 p-3 col-span-12 rounded-lg text-xs sm:text-base ${i % 2 == 0 ? 'bg-slate-50' : ''}`}>
                    <div className="col-span-2 flex justify-end"><span className="hidden sm:block mr-1">Round</span> {p.round}</div>
                    <div className="col-span-3 text-ellipsis line-clamp-1 flex justify-center">{p.win_point} Point</div>
                    <div className="col-span-3 text-ellipsis line-clamp-1 flex justify-center">{p.lose_point} Point</div>
                  </div>
                );
              })}
            </div>
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
