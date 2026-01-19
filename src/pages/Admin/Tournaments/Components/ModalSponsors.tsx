import Button from "@/components/Base/Button";
import { FormHelp, FormInput, FormLabel, FormSelect, FormTextarea } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import clsx from "clsx";
import {
  Select,
  Table,
  UploadProps
} from "antd";
import { adminApiHooks } from "@/pages/Login/api";
import UploadDropzone from "@/components/UploadDropzone";
import { RcFile } from "antd/es/upload";
import { sponsorTypeValue } from "@/utils/faker";
import { useDebounce } from "ahooks";
import { SponsorsData } from "@/pages/Admin/MasterData/Sponsors/api/schema";
import { TournamentsApiHooks } from "../api";
import { TournamentSponsorPayload, tournamentSponsorSchema } from "../api/schema";
import { SponsorsApiHooks } from "../../MasterData/Sponsors/api";
import { ColumnsType } from "antd/es/table";
import Lucide from "@/components/Base/Lucide";
interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  selectedSponsor?: TournamentSponsorPayload[];
  tournamentUuid: string;
  onDismiss: () => void;
}
export const ModalSponsors = (props: Props) => {
  const { isModalOpen, setIsModalOpen, selectedSponsor, tournamentUuid, onDismiss } = props;
  const submitButtonRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [slotSearch, setSlotSearch] = useState("");
  const [tempSelectedSponsor, setTempSelectedSponsor] = useState<TournamentSponsorPayload[]>(selectedSponsor || []);
  const [filter, setFilter] = useState({
    type: "",
    search: "",
    page: 1,
    limit: 12,
  });

  const { showNotification } = useToast();
  const { mutate: actionUpdateSponsor } = TournamentsApiHooks.useUpdateTournamentSponsors(
    {
      params: {
        uuid: tournamentUuid,
      },
    },
    {
      retry: 0,
    }
  );
  const { data: sponsors } = SponsorsApiHooks.useGetSponsorsList({
    queries: {
      page: filter.page,
      limit: filter.limit,
      search: useDebounce(filter.search, { wait: 500 }),
      type: filter.type,
    }
  });

  const onSubmit = () => {
    const sponsors: TournamentSponsorPayload[] = tempSelectedSponsor.map((s) => ({
      uuid: s.uuid,
      sponsor_uuid: s.sponsor_uuid,
      is_delete: false,
    }));
    // add selected sponsor to body if selected sponsor is not in body
    selectedSponsor?.forEach((s) => {
      if (!sponsors.some((b) => b.sponsor_uuid === s.sponsor_uuid)) {
        sponsors.push({
          uuid: s.uuid,
          sponsor_uuid: s.sponsor_uuid,
          is_delete: true,
        });
      }
    });
    actionUpdateSponsor({ sponsors }, {
      onSuccess: () => {
        setIsModalOpen(false);
        queryClient.invalidateQueries({
          queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentSponsors"),
        });
        showNotification({
          duration: 3000,
          text: "Sponsor updated successfully",
          icon: "CheckSquare2",
          variant: "success",
        });
      },
      onError: (e: any) => {
        showNotification({
          duration: 3000,
          text: e?.message || "Failed to update sponsor",
          icon: "WashingMachine",
          variant: "danger",
        });
      },
    });
  }

  const tableColumnsAntd: ColumnsType<SponsorsData> = [
    {
      title: "",
      dataIndex: "id",
      align: "left",
      render(value, record, index) {
        return index + 1;
      },
      responsive: ["lg"],
    },
    {
      title: "Name",
      dataIndex: "name",
      align: "left",
    },
    {
      title: "Logo",
      dataIndex: "media_url",
      align: "left",
      render(value) {
        return <img src={value} alt="" className="max-h-12" />
      }
    },
    {
      title: "",
      dataIndex: "uuid",
      align: "center",
      render(value, record, index) {
        return (
          <div className="flex lg:justify-center items-center">
            {!tempSelectedSponsor.some((s) => s.sponsor_uuid === record.uuid) ? <Button
              className="flex items-center mr-3"
              variant="primary"
              size="sm"
              onClick={() => {
                setTempSelectedSponsor([...tempSelectedSponsor, {
                  sponsor_uuid: record.uuid,
                  is_delete: false,
                }]);
              }}
            >
              <Lucide icon="Plus" className="w-4 h-4 mr-1" />
              Add
            </Button> : <Button
              className="flex items-center mr-3"
              variant="danger"
              size="sm"
              onClick={() => {
                setTempSelectedSponsor(tempSelectedSponsor.filter((s) => s.sponsor_uuid !== record.uuid));
              }}
            >
              <Lucide icon="Trash" className="w-4 h-4 mr-1" />
              Remove
            </Button>}
          </div>
        )
      },
    },
  ]
  return (
    <Dialog
      open={isModalOpen}
      onClose={() => {
        onDismiss();
      }}
      size="xl"
      initialFocus={submitButtonRef}
    >
      <Dialog.Panel>
        <Dialog.Title className="flex items-center justify-between">
          <h2 className="mr-auto text-base font-medium">
            Manage Sponsor
          </h2>
          {/* <Button>Add Sponsor</Button> */}
        </Dialog.Title>
        <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
          <div className="col-span-12 flex flex-col">
            <Table
              className="w-full"
              dataSource={sponsors?.data || []}
              columns={tableColumnsAntd}
              rowKey={(d) => d.uuid}
              rowClassName={(record) => {
                return tempSelectedSponsor.find((s: any) => s.sponsor_uuid === record.uuid)
                  ? "bg-emerald-50"
                  : "";
              }}
              pagination={{
                total: sponsors?.totalRecords,
                defaultCurrent: filter.page,
                defaultPageSize: filter.limit,
                onChange: (page, limit) => {
                  setFilter({
                    ...filter,
                    page,
                    limit,
                  });
                }
              }}
              showHeader
            />
          </div>
        </Dialog.Description>
        <Dialog.Footer>
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => {
              setIsModalOpen(false);
            }}
            className="w-20 mr-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="button"
            className="w-20"
            onClick={onSubmit}
          >
            Save
          </Button>
        </Dialog.Footer>

      </Dialog.Panel>
    </Dialog>
  )
}