import React from "react";
import { Divider } from "antd";
import Lucide from "@/components/Base/Lucide";
import Image from "@/components/Image";
import moment from "moment";
import { TournamentsPayload } from "../api/schema";
import { PointConfigurationsApiHooks } from "../../PointConfig/api";
import { TournamentsApiHooks } from "../api";
import Button from "@/components/Base/Button";
import { ModalSponsors } from "../Components/ModalSponsors";

interface TournamentDetailGeneralProps {
  tournamentUuid: string;
  data?: TournamentsPayload;
}

export const TournamentDetailGeneral: React.FC<TournamentDetailGeneralProps> = ({
  tournamentUuid,
  data
}) => {
  const [isModalSponsorOpen, setIsModalSponsorOpen] = React.useState(false);

  const { data: detailPointConfig } = PointConfigurationsApiHooks.useGetPointConfigurationsDetail(
    {
      params: {
        uuid: data?.point_config_uuid || 0
      }
    }, {
    enabled: (!!tournamentUuid && !!data?.point_config_uuid)
  }
  );

  const { data: dataSponsors } = TournamentsApiHooks.useGetTournamentSponsors({
    params: {
      uuid: tournamentUuid
    }
  });

  return (
    <div className="grid grid-cols-12 gap-4">
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
                  <span>{data?.court}</span>
                </div>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-3 flex items-center">
              <div className="flex flex-row items-center">
                <Lucide icon="Calendar" className="w-6 h-6" />
                <div className="ml-2 font-medium flex flex-col">
                  <span className="text-xs font-normal">Date</span>
                  <span>
                    {moment(data?.start_date).format('MMMM') === moment(data?.end_date).format('MMMM') ?
                      <>
                        {moment(data?.start_date).format('DD')} - {moment(data?.end_date).format('DD MMMM YYYY')}
                      </> :
                      <>
                        {moment(data?.start_date).format('DD MMMM YYYY')} - {moment(data?.end_date).format('DD MMMM YYYY')}
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
                    {data?.level}
                  </span>
                  <span className="text-xs font-normal">
                    {data?.draft_pick ? "Draft Pick" : ""}
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
                    IDR {Intl.NumberFormat('id-ID').format(Number(data?.commitment_fee) || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Divider className="col-span-12 m-0" />
          {/* logo and desc */}
          <div className="col-span-12 grid grid-cols-12 gap-2 pl-2">
            <div className="col-span-12 sm:col-span-4 flex justify-start aspect-square border  rounded-lg">
              <Image src={data?.media_url} className="object-contain rounded-lg " />
            </div>
            <div className="col-span-12 sm:col-span-8 flex flex-col gap-2">
              <div className="text-lg font-semibold">{data?.name}</div>
              <div dangerouslySetInnerHTML={{ __html: data?.description || "" }}></div>
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
      <div className="grid grid-cols-12 col-span-12 mt-6 box p-4">
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
    </div>
  );
};