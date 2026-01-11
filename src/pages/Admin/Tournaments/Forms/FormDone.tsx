import { useToast } from "@/components/Toast/ToastContext";
import {
  Divider
} from "antd";
import { useNavigate } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import 'react-quill/dist/quill.snow.css';
import TournamentSteps from "../Components/TournamentSteps";
import TournamentDone from '@/assets/images/illustrations/gif/check-alt.json'
import { LottieAnimation } from "@/components/LottieAnimation";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import { TournamentsApiHooks } from "../api";
import { ModalSponsors } from "../Components/ModalSponsors";
import { useState } from "react";

export const TournamentFormDone = () => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.administrator.tournaments.new.players);
  const { id: tournamentUuid } = queryParams;
  const { showNotification } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: dataSponsors } = TournamentsApiHooks.useGetTournamentSponsors({
    params: {
      uuid: tournamentUuid
    }
  });
  const { data: tournamentData } = TournamentsApiHooks.useGetTournamentsDetail({
    params: {
      uuid: tournamentUuid || 0
    }
  }, {
    enabled: !!tournamentUuid
  });

  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">{tournamentUuid ? "Edit" : "Add New"} Tournament</h2>
      </div>
      <Divider />
      <TournamentSteps step={tournamentData?.data?.type === "ROUND ROBIN" ? 6 : 5} tournamentUuid={tournamentUuid} showGroup={tournamentData?.data?.type === "ROUND ROBIN"} tournamentType={tournamentData?.data?.type} />

      <div className="grid grid-cols-12 gap-4 ">
        <div className="col-span-12 box h-fit p-4 grid grid-cols-12 ">
          <div className="col-span-12 flex flex-col items-center">
            <div className="w-32 h-32">
              <LottieAnimation animationData={TournamentDone} autoplay={true} loop={false} />
            </div>
            <h2 className=" font-medium text-2xl">Tournament saved successfully!</h2>
            <p className="text-gray-600">You can now view and publish your tournament.</p>
            <div className="flex flex-row items-center gap-2 mt-4">
              <Button
                onClick={() => navigate(paths.administrator.tournaments.detail({ id: tournamentUuid }).$)}
                variant="outline-primary"
              >
                View Tournament
              </Button>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="primary"
              >
                <Lucide icon="Plus" className="w-5 h-5 text-white mr-1" />
                Add Sponsors
              </Button>
            </div>

            { dataSponsors?.data && dataSponsors?.data?.length > 0 && <div className="flex flex-col w-full items-center gap-2 mt-8 border border-emerald-800 rounded-xl relative">
              <div className="absolute left-[calc(50%-64px)] -top-4 w-32 h-8 bg-white justify-center flex flex-row items-center font-medium text-emerald-800">Sponsored By</div>
              <div className="flex flex-row items-center gap-6 overflow-x-scroll justify-center">
                {dataSponsors?.data?.map((sponsor) => (
                  <div
                    className="flex flex-col items-center"
                    key={sponsor.uuid}
                    onClick={() => navigate(paths.administrator.tournaments.new.done({ id: tournamentUuid }).$)}
                >
                  <img src={sponsor.media_url} alt={sponsor.name} className="w-24 h-24 object-contain" />
                </div>
                ))}
              </div>
            </div>}
            <ModalSponsors
              onDismiss={() => {
                setIsModalOpen(false);
              }}
              key={dataSponsors?.data?.length + JSON.stringify(isModalOpen)}
              tournamentUuid={tournamentUuid}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              selectedSponsor={dataSponsors?.data.map((sponsor) => ({
                uuid: sponsor.uuid,
                sponsor_uuid: sponsor.sponsor_uuid,
                is_delete: false,
              })) || []}
            />
          </div>
        </div>
      </div>
    </>
  )
}
