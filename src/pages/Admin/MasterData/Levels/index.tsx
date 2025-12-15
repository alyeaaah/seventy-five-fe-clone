import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import { useState } from "react";
import { LevelsApiHooks } from "./api";
import { LevelsData } from "./api/schema";
import { useDebounce } from "ahooks";
import moment from "moment";
import { queryClient } from "@/utils/react-query";
import { ModalForm } from "./ModalForm";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { useToast } from "@/components/Toast/ToastContext";
import Table, { ColumnsType } from "antd/es/table";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";

function Levels() {
  const screens = useBreakpoint();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [filter, setFilter] = useState({
    type: "",
    search: "",
  });
  const [tableData, setTableData] = useState<LevelsData[]>([]);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const [selectedLevel, setSelectedLevel] = useState<Partial<LevelsData> | undefined>();
  const { showNotification } = useToast();
  const { mutate: actionDeleteLevel } = LevelsApiHooks.useDeleteLevel({
    params: {
      uuid: modalAlert?.refId || 0
    },
  }, {
    onSuccess: () => {
      showNotification({
        duration: 3000,
        text: "Level deleted successfully",
        icon: "WashingMachine",
        variant: "danger",
      });
      setModalAlert(undefined);
      queryClient.invalidateQueries({
        queryKey: LevelsApiHooks.getKeyByAlias("getLevelsList"),
      });
    }
  });
  const { data, isLoading, refetch } = LevelsApiHooks.useGetLevelsList(
    {
      queries: {
        page,
        limit,
        search: useDebounce(filter.search, { wait: 500 }),
        type: useDebounce(filter.type, { wait: 500 }),
      },
      cacheTime: 0,
    },
  );


  const tableColumnsAntd: ColumnsType<LevelsData> = [
    {
      title: "",
      dataIndex: "id",
      align: "left",
      width: "5%",
      render(value, record, index) {
        return (limit * (page - 1)) + index + 1;
      },
      responsive: ["lg"],
    },
    {
      title: "Name",
      dataIndex: "name",
      align: "left",
      width: "40%",
    },
    {
      title: "Tier",
      dataIndex: "level_tier",
      align: "left",
      width: "10%",
    },
    {
      title: "Created On",
      dataIndex: "createdAt",
      align: "left",
      width: "25%",
      responsive: ["md"],
      render(value) {
        return moment(value).format("Y-MM-DD HH:mm")
      }
    },
    {
      title: "",
      dataIndex: "uuid",
      align: "center",
      width: "20%",
      render(value, record, index) {
        return (
          <div className="flex lg:justify-center items-center">
            <Button
              className="flex items-center mr-3"
              variant="primary"
              onClick={() => {
                setSelectedLevel(record);
                setIsModalCreateOpen(true);
              }}
            >
              <Lucide icon="Pencil" className="w-4 h-4 mr-1" />
            </Button>
            <Button
              className="flex items-center text-danger"
              onClick={() => {
                setModalAlert({
                  open: true,
                  onClose: () => setModalAlert(undefined),
                  icon: "XCircle",
                  title: "Are you sure?",
                  description: "Do you really want to delete these records? This process cannot be undone.",
                  refId: value,
                  buttons: [
                    {
                      label: "Cancel",
                      onClick: () => setModalAlert(undefined),
                      variant: "secondary"
                    },
                    {
                      label: "Delete",
                      onClick: () => {
                        // Handle delete logic here
                        actionDeleteLevel(undefined)
                      },
                      variant: "danger"
                    }
                  ]
                });
              }}
            >
              <Lucide icon="Trash" className="w-4 h-4 mr-1" />
            </Button>
          </div>
        )
      },
    },
  ]

  const handleFilter = () => {
    refetch();
  };

  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">Levels</h2>
        <div className="flex">
          <Button variant="primary" className="mr-2 shadow-md" onClick={() => setIsModalCreateOpen(true)}>
            Add New Level
          </Button>
        </div>
      </div>
      {/* BEGIN: HTML Table Data */}
      <div className="p-5 mt-5 intro-y box">
        <div className="flex flex-col sm:flex-row sm:items-end xl:items-start">
          <form
            id="tabulator-html-filter-form"
            className="sm:ml-auto sm:mb-4 flex-col sm:flex-row flex"
            onSubmit={(e) => {
              e.preventDefault();
              handleFilter();
            }}
          >
            <div className="items-center mt-2 sm:mr-4 xl:mt-0">
              <FormInput
                id="tabulator-html-filter-value"
                value={filter.search}
                onChange={(e) => {
                  setPage(1);
                  setFilter({
                    ...filter,
                    search: e.target.value,
                  });
                  if (!e.target.value) {
                    queryClient.invalidateQueries({ queryKey: LevelsApiHooks.getKeyByAlias("getLevelsList") });
                  }
                }}
                type="text"
                className="mt-2 sm:w-40 2xl:w-full sm:mt-0"
                placeholder="Search..."
              />
            </div>
            <div className="mt-2 xl:mt-0 md:w-16 sm:w-full">
              <Button
                id="tabulator-html-filter-go"
                variant="primary"
                type="button"
                className="w-full flex align-middle"
                onClick={handleFilter}
              >
                <Lucide icon="Search" className="h-full" />
              </Button>
            </div>
          </form>
          <div className="flex mt-4 sm:mt-0">
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-hidden">
          <Table
            dataSource={data?.data || []}
            columns={tableColumnsAntd}
            rowKey={(d) => d.uuid}
            pagination={{
              total: data?.totalRecords,
              defaultCurrent: page,
              defaultPageSize: limit,
              onChange: (page, limit) => {
                setPage(page);
                setLimit(limit);
              }
            }}
            expandable={screens.xs ? {
              expandedRowRender: (record) => (
                <div>
                  <p>Created: {moment(record.createdAt).format("Y-MM-DD HH:mm")}</p>
                </div>
              ),
              rowExpandable: (record) => !!record.uuid, // Only expand rows with an address
            } : undefined}
            showHeader
            bordered
          />
        </div>
      </div>
      {/* END: HTML Table Data */}
      <ModalForm
        key={selectedLevel?.uuid || ""}
        isModalOpen={isModalCreateOpen}
        setIsModalOpen={setIsModalCreateOpen}
        selectedLevel={selectedLevel}
        onDismiss={() => {
          setIsModalCreateOpen(false);
          setTimeout(() => {
            setSelectedLevel(undefined);
          }, 300);
        }} />
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
  );
}

export default Levels;