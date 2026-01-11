import Button from "@/components/Base/Button";
import { useRef, useState } from "react";
import { TournamentsApiHooks } from "@/pages/Admin/Tournaments/api";
import { useToast } from "@/components/Toast/ToastContext";
import {
  Divider
} from "antd";
import { useNavigate } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import Lucide from "@/components/Base/Lucide";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import moment from "moment";
import 'react-quill/dist/quill.snow.css';
import Image from "@/components/Image";
import { DraggableBracket } from "@/components/TournamentDrawing/Bracket";
import { PointConfigurationsApiHooks } from "@/pages/Admin/PointConfig/api";
import TournamentDrawingUtils from "@/components/TournamentDrawing/utils";
import { DrawingTeams } from "@/components/DrawingTeams";
import { Match } from "@/components/DrawingTeams/interface";
import { useTournamentScore } from "../../MatchDetail/api/firestore";

export const FriendlyMatchDetail = () => {
  const queryParams = useRouteParams(paths.administrator.customMatch.friendlyMatch.detail);
  const { friendlyMatchUuid } = queryParams;
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const navigate = useNavigate();

  const { data } = TournamentsApiHooks.useGetTournamentsDetail({
    params: {
      uuid: friendlyMatchUuid || 0
    }
  }, {
    enabled: !!friendlyMatchUuid
  });

  const { data: detailPointConfig } = PointConfigurationsApiHooks.useGetPointConfigurationsDetail(
    {
      params: {
        uuid: data?.data?.point_config_uuid || 0
      }
    }, {
    enabled: (!!friendlyMatchUuid && !!data?.data?.point_config_uuid)
  }
  );

  const { data: matches } = TournamentsApiHooks.useGetTournamentMatches({
    queries: {
      tournament_uuid: friendlyMatchUuid || ""
    }
  }, {
    enabled: !!friendlyMatchUuid
  });

  const { data: tournamentScores, unsubscribe: unsubscribeFirestore } = useTournamentScore(
    friendlyMatchUuid || "",
    () => { }
  );
  const handlePopState = useRef((event: PopStateEvent) => {
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
    event.preventDefault();
  });
  window.addEventListener("popstate", handlePopState.current);
  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">{data?.data?.name || "Tournament"}</h2>
      </div>
      <Divider />

      <div className="grid grid-cols-12 gap-4 ">
        <div className="col-span-12 sm:col-span-6 box p-4">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12">
              <h2 className=" font-medium">Friendly Match Information</h2>
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
            <h2 className=" font-medium">Match Drawing</h2>
            <Divider className="mb-2" />
          </div>
          <div className="col-span-12 h-fit overflow-x-scroll">
            <DrawingTeams
              key={matches?.data?.length || 0}
              data={(matches?.data || []) as Match[]}
              onMatchClicked={(data) => {
                navigate(paths.administrator.customMatch.detail({ matchUuid: data.uuid || "" }).$)
              }}
              draggable={false}
              onTeamsChanged={(data) => {
              }}
              scores={tournamentScores || []}
            />
          </div>
        </div>
        <div className="col-span-12 sm:col-span-4 mt-6 box p-4">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 h-fit">
              <h2 className=" font-medium">Point Configuration</h2>
              <Divider className="mb-2" />
            </div>
            <div className="col-span-12 h-fit bg-slate-100 dark:bg-darkmode-800 rounded-2xl">
              <div key={"title"} className="grid grid-cols-8 gap-8 font-semibold bg-slate-100 dark:bg-darkmode-800 p-2 rounded-2xl ">
                <div className="col-span-2 text-end">Round</div>
                <div className="col-span-3 flex justify-center">Win</div>
                <div className="col-span-3 flex justify-center">Lose</div>
              </div>
              {detailPointConfig?.data?.points?.map((p, i) => {
                if (i > 0) return null;
                return (
                  <div key={i} className={`grid grid-cols-8 gap-8 p-3 col-span-12 rounded-lg text-xs sm:text-base ${i % 2 == 0 ? 'bg-slate-50 dark:bg-darkmode-700' : ''}`}>
                    <div className="col-span-2 flex justify-end"><span className="hidden sm:block mr-1">Round</span> {p.round}</div>
                    <div className="col-span-3 text-ellipsis line-clamp-1 flex justify-center">{p.win_point} Point</div>
                    <div className="col-span-3 text-ellipsis line-clamp-1 flex justify-center">{p.lose_point} Point</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
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
