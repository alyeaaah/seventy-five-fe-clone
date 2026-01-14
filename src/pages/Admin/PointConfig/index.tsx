import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import { useState } from "react";
import { PointConfigurationsApiHooks } from "./api";
import { PointConfigurationsData } from "./api/schema";
import { useDebounce } from "ahooks";
import moment from "moment";
import { queryClient } from "@/utils/react-query";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { useToast } from "@/components/Toast/ToastContext";
import Table, { ColumnsType } from "antd/es/table";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";
import { useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
import styles from "./index.module.scss";

function PointConfigurations() {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [filter, setFilter] = useState({
    type: "",
    search: "",
  });
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const { showNotification } = useToast();
  const { mutate: actionDeletePointConfiguration } = PointConfigurationsApiHooks.useDeletePointConfiguration({
    params: {
      uuid: modalAlert?.refId || 0
    },
  }, {
    onSuccess: () => {
      showNotification({
        duration: 3000,
        text: "PointConfiguration deleted successfully",
        icon: "WashingMachine",
        variant: "danger",
      });
      setModalAlert(undefined);
      queryClient.invalidateQueries({
        queryKey: PointConfigurationsApiHooks.getKeyByAlias("getPointConfigurationsList"),
      });
    }
  });

  const { mutate: actionSetDefaultPointConfiguration } = PointConfigurationsApiHooks.useSetDefaultPointConfiguration(
    {
      params: {
        uuid: modalAlert?.refId || 0
      }
    },
    {
      onSuccess: () => {
        showNotification({
          duration: 3000,
          text: "PointConfiguration set as default successfully",
          icon: "Star",
          variant: "success",
        });
        setModalAlert(undefined);
        queryClient.invalidateQueries({
          queryKey: PointConfigurationsApiHooks.getKeyByAlias("getPointConfigurationsList"),
        });
        queryClient.invalidateQueries({
          queryKey: PointConfigurationsApiHooks.getKeyByAlias("getPointConfigurationsDropdown"),
        });
      },
      onError: (e: any) => {
        showNotification({
          duration: 3000,
          text: e?.message || "Failed to set default point configuration",
          icon: "WashingMachine",
          variant: "danger",
        });
      }
    }
  );
  const { data, isLoading, refetch } = PointConfigurationsApiHooks.useGetPointConfigurationsList(
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
  const handleDeletePointConfiguration = (refId: string) => {
    setModalAlert({
      open: true,
      onClose: () => setModalAlert(undefined),
      icon: "XCircle",
      title: "Are you sure?",
      description: "Do you really want to delete these records? This process cannot be undone.",
      refId: refId,
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
            actionDeletePointConfiguration(undefined)
          },
          variant: "danger"
        }
      ]
    });
  };

  const handleSetDefaultPointConfiguration = (refId: string) => {
    setModalAlert({
      open: true,
      onClose: () => setModalAlert(undefined),
      icon: "Star",
      title: "Set as default?",
      description: "This point configuration will be used as the default for new matches.",
      refId: refId,
      buttons: [
        {
          label: "Cancel",
          onClick: () => setModalAlert(undefined),
          variant: "secondary"
        },
        {
          label: "Set Default",
          onClick: () => {
            actionSetDefaultPointConfiguration(undefined);
          },
          variant: "primary"
        }
      ]
    });
  };

  const tableColumnsAntd: ColumnsType<PointConfigurationsData> = [
    {
      title: "",
      dataIndex: "id",
      align: "center",
      width: "5%",
      render(value, record, index) {
        return index + 1;
      },
      responsive: ["lg"],
      className: "rounded-l-xl"
    },
    {
      title: "Name",
      dataIndex: "name",
      align: "left",
      width: "80%",
      render(value, record) {
        return (
          <div className="flex flex-row items-center min-w-0">
            <span className="truncate">{value}</span>
            {!!record.isDefault && (
              <span className="ml-2 text-xs bg-emerald-800 text-white rounded-full px-2 py-0.5">Default</span>
            )}
          </div>
        );
      },
    },
    {
      title: "Round",
      dataIndex: "totalRound",
      align: "center",
      responsive: ["md"],
      width: "10%",
      ellipsis: true,
    },
    {
      title: "",
      dataIndex: "uuid",
      responsive: ["md"],
      align: "right",
      className: "rounded-r-xl",
      width: "20%",
      render(value, record, index) {
        return (
          <div className="flex lg:justify-end items-center">
            {!record.isDefault ? (
              <Button
                className="flex items-center mr-3 border-emerald-800"
                variant="outline-success"
                onClick={() => {
                  handleSetDefaultPointConfiguration(record.uuid);
                }}
              >
                <Lucide icon="Star" className="w-4 h-4 text-emerald-800" />
              </Button>
            ) :
              <Button
                className="flex items-center mr-3"
                variant="primary"
                onClick={() => {
                }}
              >
                <Lucide icon="Star" className="w-4 h-4 text-white" />
              </Button>
            }
            <Button
              className="flex items-center mr-3"
              variant="primary"
              onClick={() => {
                navigate(paths.administrator.masterData.pointConfigForm({ uuid: record.uuid }).$);
              }}
            >
              <Lucide icon="Pencil" className="w-4 h-4 mr-1" />
            </Button>
            <Button
              className="flex items-center text-danger"
              onClick={() => {
                handleDeletePointConfiguration(value);
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
        <h2 className="mr-auto text-lg font-medium">Points Configuration</h2>
        <div className="flex">
          <Button variant="primary" className="mr-2 shadow-md" onClick={() => {
            navigate(paths.administrator.masterData.pointConfigForm({ uuid: "new" }).$);
          }} >
            Add New Config
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
                    queryClient.invalidateQueries({ queryKey: PointConfigurationsApiHooks.getKeyByAlias("getPointConfigurationsList") });
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
            // className="bg-slate-300"
            rowClassName={() => styles.customTableRow}
            className={styles.customTableStyle}
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
                  <p>Points: {record.totalRound}</p>
                  <p>Created: {moment(record.createdAt).format("Y-MM-DD HH:mm")}</p>
                  <div className="flex justify-end mt-2">
                    {!record.isDefault && (
                      <Button
                        className="flex items-center mr-2"
                        variant="outline-success"
                        onClick={() => {
                          handleSetDefaultPointConfiguration(record.uuid);
                        }}
                      >
                        <Lucide icon="Star" className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      className="flex items-center mr-2"
                      variant="outline-danger"
                      onClick={() => {
                        handleDeletePointConfiguration(record.uuid);
                      }}
                    >
                      <Lucide icon="Trash" className="w-4 h-4" />
                    </Button>
                    <Button
                      className="flex items-center"
                      variant="primary"
                      onClick={() => {
                        navigate(paths.administrator.masterData.pointConfigForm({ uuid: record.uuid }).$);
                      }}
                    >
                      <Lucide icon="Pencil" className="w-4 h-4 " />
                    </Button>
                  </div>
                </div>
              ),
              rowExpandable: (record) => !!record.uuid, // Only expand rows with an address
            } : undefined}
            showHeader
          />
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
  );
}

export default PointConfigurations;