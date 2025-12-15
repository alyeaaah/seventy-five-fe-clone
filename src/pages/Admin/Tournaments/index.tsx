import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import { useState } from "react";
import { TournamentsApiHooks } from "./api";
import { useDebounce } from "ahooks";
import moment from "moment";
import { queryClient } from "@/utils/react-query";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { useToast } from "@/components/Toast/ToastContext";
import Table, { ColumnsType } from "antd/es/table";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";
import { Outlet, useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
import styles from "./index.module.scss";
import { TournamentsPayload, TournamentStatusEnum } from "./api/schema";
import Image from "@/components/Image";
import Tippy from "@/components/Base/Tippy";
import { imageResizer } from "@/utils/helper";
import { Menu } from "@/components/Base/Headless";

function Tournaments() {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filter, setFilter] = useState({
    type: "",
    search: "",
  });
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const { showNotification } = useToast();
  const { mutate: actionDeleteTournament } = TournamentsApiHooks.useDeleteTournament({
    params: {
      uuid: modalAlert?.refId || 0
    },
  }, {
    onSuccess: () => {
      showNotification({
        duration: 3000,
        text: "Tournament deleted successfully",
        icon: "WashingMachine",
        variant: "danger",
      });
      setModalAlert(undefined);
      queryClient.invalidateQueries({
        queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsList"),
      });
    },
    retry: false
  });
  const { mutate: actionUpdateTournamentStatus } = TournamentsApiHooks.useUpdateTournamentStatus({
    params: {
      uuid: modalAlert?.refId || 0
    },
  }, {
    onSuccess: () => {
      showNotification({
        duration: 3000,
        text: `Tournament successfully ${modalAlert?.status}`,
        icon: "WashingMachine",
        variant: "success",
      });
      setModalAlert(undefined);
      queryClient.invalidateQueries({
        queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsList"),
      });
    },
    retry: false
  });
  
  const { mutate: actionPublishTournament } = TournamentsApiHooks.usePublishTournament({
    params: {
      uuid: modalAlert?.refId || 0
    },
    queries: {
      unpublish: !!modalAlert?.unpublish
    }
  }, {
    onSuccess: () => {
      showNotification({
        duration: 3000,
        text: `Tournament ${modalAlert?.unpublish ? "unpublished" : "published"} successfully`,
        icon: "WashingMachine",
        variant: "success",
      });
      setModalAlert(undefined);
      queryClient.invalidateQueries({
        queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsList"),
      });
    },
    retry: false
  });
  const { data, isLoading, refetch } = TournamentsApiHooks.useGetTournamentsList(
    {
      queries: {
        page,
        limit,
        search: useDebounce(filter.search, { wait: 500 }),
        type: "KNOCKOUT, ROUND ROBIN"
      },
      cacheTime: 0,
    },
  );

  const handleDeleteTournament = (refId: string) => {
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
            actionDeleteTournament(undefined)
          },
          variant: "danger"
        }
      ]
    });
  };
  const handlePublishTournament = (refId: string, unpublish?: boolean) => {
    setModalAlert({
      open: true,
      onClose: () => setModalAlert(undefined),
      icon: "XCircle",
      title: "Are you sure?",
      description: `Do you really want to ${unpublish ? "unpublish" : "publish"} this tournament? This process cannot be undone.`,
      refId: refId,
      unpublish: unpublish,
      buttons: [
        {
          label: "Cancel",
          onClick: () => setModalAlert(undefined),
          variant: "secondary"
        },
        {
          label: unpublish ? "Unpublish" : "Publish",
          onClick: () => {
            // Handle publish logic here
            actionPublishTournament(undefined)
          },
          variant: "primary"
        }
      ]
    });
  };
  const handleUpdateStatus = (refId: string, status: TournamentStatusEnum) => {
    setModalAlert({
      open: true,
      onClose: () => setModalAlert(undefined),
      icon: "XCircle",
      title: "Are you sure?",
      description: `Do you really want to update status of this tournament to be ${status}? This process cannot be undone.`,
      status: status,
      refId: refId,
      buttons: [
        {
          label: "Cancel",
          onClick: () => setModalAlert(undefined),
          variant: "secondary"
        },
        {
          label: "Update",
          onClick: () => {
            // Handle update logic here
            actionUpdateTournamentStatus({ status })
          },
          variant: "primary"
        }
      ]
    });
  };

  const tableColumnsAntd: ColumnsType<TournamentsPayload> = [
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
      width: screens.xs || screens.sm ?"85%":"60%",
      render: (text, record) => (
        <div className="flex items-center">
          <div className="flex flex-col mr-2">
            <Image
              src={imageResizer(record.media_url)}
              alt={record.name}
              className="rounded-full w-7 h-7 object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{text}</span>
          </div>
          { record.published_at && <div className="text-[8px] !text-emerald-800 border border-emerald-800 px-1 py-0 font-bold rounded ml-2 tracking-wider">PUBLISHED</div>}
        </div>
      ),
    },
    {
      title: "Level",
      dataIndex: "level",
      align: "left",
      ellipsis: true,
      width: "20%",
      responsive: ["md"],
    },
    {
      title: "Participants",
      dataIndex: "player_count",
      align: "center",
      width: "20%",
      responsive: ["md"],
      render: (text: string, record) => {
        if (text == '0') {
          return <span>No Players</span>;
        }
        return <span>{text} Players</span>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      responsive: ["md"],
      width: "20%",
      render: (text: string, record) => {
        let currentStep = 1;
        if (record.player_count && record.player_count != "0") {
          currentStep++;
          if (record.point_config_uuid) {
            currentStep++;
            if (record.match_count && record.match_count != "0") {
              currentStep++;
            }
          }
        }
        let step = () => <div></div>;
        if (currentStep < 4) {
          step = () => <span>{ currentStep} / 4</span>
        } else if (currentStep == 4) {
          step = () => <span className="text-xs font-semibold">{currentStep} / 4</span>
          step = () => <div className="flex flex-row text-xs items-center text-nowrap"><Lucide icon="CheckCircle" className="text-success"/>&nbsp;Ready to start</div>
        }
        return (
          <div className="flex flex-col justify-center items-center">
            <span className="text">{text}</span>
            {text == "DRAFT" && step()}
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "uuid",
      responsive: ["md"],
      align: "right",
      className: "rounded-r-xl",
      width: "20%",
      render(value, record, index) {
        let rtp = false;
        if (record.match_count && record.match_count != "0" && record.status == "DRAFT") {
          rtp = true;
        }
        return (
          <div className="flex lg:justify-end items-center gap-1 pr-1">
            {rtp && <Tippy
              as="div"
              className="flex items-center justify-center dark:border-darkmode-400 text-slate-400"
              content="Start Tournament"
            >
              <Button
                className="flex items-center"
                variant="primary"
                size="sm"
                onClick={() => {
                  handleUpdateStatus(value, "ONGOING");
                }}
              >
                <Lucide icon="Sparkles" className="w-4 h-4 mr-1" /> Start
              </Button>
            </Tippy>}
            <Tippy
              as="div"
              className="flex items-center justify-center dark:border-darkmode-400 text-slate-400"
              content="Detail"
            >
              <Button
                className="flex items-center"
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  navigate(paths.administrator.tournaments.detail({ id: record.uuid || "" }).$);
                }}
              >
                <Lucide icon="Eye" className="w-4 h-4" />
              </Button>
            </Tippy>
            <Menu>
              <Menu.Button as={Button} variant="secondary" size="sm">
                <Lucide icon="MoreHorizontal" className="w-4 h-4" />
              </Menu.Button>
              <Menu.Items>
                {
                (!record.published_at && record.status != "ONGOING") && 
                <Menu.Item
                  className="flex flex-row items-center gap-2 w-40 cursor-pointer hover:bg-slate-200"
                  onClick={() => {
                    navigate(paths.administrator.tournaments.edit({ tournament: record.uuid || "" }).$);
                  }}
                >
                  <Lucide icon="Pencil" className="w-4 h-4" /> Edit
                </Menu.Item>
              }
              {
                !record.published_at &&
                <Menu.Item
                  className="flex flex-row items-center gap-2 w-40 cursor-pointer hover:bg-slate-200"
                  onClick={() => {
                    handlePublishTournament(value, false);
                  }}
                >
                  <Lucide icon="Rocket" className="w-4 h-4" /> Publish
                </Menu.Item>
              }
              {
                !!record.published_at &&
                <Menu.Item
                  className="flex flex-row items-center gap-2 w-40 cursor-pointer hover:bg-slate-200"
                  onClick={() => {
                    handlePublishTournament(value, true);
                  }}
                >
                  <Lucide icon="Rocket" className="w-4 h-4 rotate-[135deg]" /> Unpublish
                </Menu.Item>
                }
                {(!record.published_at && record.status != "ONGOING") &&
                  <Menu.Item
                    className="flex flex-row items-center gap-2 w-40 text-danger cursor-pointer hover:text-danger hover:bg-slate-200 bg-red-50"
                    onClick={() => {
                      handleDeleteTournament(value);
                    }}
                  >
                    <Lucide icon="Trash" className="w-4 h-4" /> Delete
                  </Menu.Item>
                }
              </Menu.Items>
            </Menu>
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
        <h2 className="mr-auto text-lg font-medium">Tournaments</h2>
        <div className="flex">
          <Button variant="primary" className="mr-2 shadow-md" onClick={() => navigate(paths.administrator.tournaments.new.index)} >
            Add New Tournament
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
                    queryClient.invalidateQueries({ queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsList") });
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
            rowKey={(d) => d.uuid || ""}
            rowClassName={(record) => `${styles.customTableRow} ${!record.published_at ? "!bg-slate-100" : "!bg-emerald-100"}`}
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
              expandedRowRender: (record) => {
                let rtp = false;
                if (record.match_count && record.match_count != "0") {
                  rtp = true;
                }
                return (
                <div>
                  <p>Nickname: {record.name}</p>
                  <p>Level: {record.level || ""}</p>
                  <p>Participants: {record.participants}</p>
                  <p>Status: {record.status}</p>
                  <p>Start Date: {moment(record?.start_date).format("Y-MM-DD HH:mm")}</p>
                  <div className="flex justify-end mt-2 gap-1">
                    {rtp && <Tippy
                      as="div"
                      className="flex items-center justify-center dark:border-darkmode-400 text-slate-400"
                      content="Start Tournament"
                    >
                      <Button
                        className="flex items-center"
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          navigate(paths.administrator.tournaments.detail({ id: record.uuid || "" }).$);
                        }}
                      >
                        <Lucide icon="Sparkles" className="w-4 h-4 mr-1" /> Start
                      </Button>
                    </Tippy>}
                    <Tippy
                      as="div"
                      className="flex items-center justify-center dark:border-darkmode-400 text-slate-400"
                      content="Detail"
                    >
                      <Button
                        className="flex items-center"
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          navigate(paths.administrator.tournaments.detail({ id: record.uuid || "" }).$);
                        }}
                      >
                        <Lucide icon="Eye" className="w-4 h-4" />
                      </Button>
                    </Tippy>
                    <Menu>
                      <Menu.Button as={Button} variant="secondary" size="sm">
                        <Lucide icon="MoreHorizontal" className="w-4 h-4" />
                      </Menu.Button>
                      <Menu.Items>
                        {
                          (!record.published_at && record.status != "ONGOING") &&
                          <Menu.Item
                            className="flex flex-row items-center gap-2 w-40 cursor-pointer hover:bg-slate-200"
                            onClick={() => {
                              navigate(paths.administrator.tournaments.edit({ tournament: record.uuid || "" }).$);
                            }}
                          >
                            <Lucide icon="Pencil" className="w-4 h-4" /> Edit
                          </Menu.Item>
                        }
                        {
                          !record.published_at &&
                          <Menu.Item
                            className="flex flex-row items-center gap-2 w-40 cursor-pointer hover:bg-slate-200"
                            onClick={() => {
                              handlePublishTournament(record.uuid || "", false);
                            }}
                          >
                            <Lucide icon="Rocket" className="w-4 h-4" /> Publish
                          </Menu.Item>
                        }
                        {
                          !!record.published_at &&
                          <Menu.Item
                            className="flex flex-row items-center gap-2 w-40 cursor-pointer hover:bg-slate-200"
                            onClick={() => {
                              handlePublishTournament(record.uuid || "", true);
                            }}
                          >
                            <Lucide icon="Rocket" className="w-4 h-4 rotate-[135deg]" /> Unpublish
                          </Menu.Item>
                        }
                        {(!record.published_at && record.status != "ONGOING") &&
                          <Menu.Item
                            className="flex flex-row items-center gap-2 w-40 text-danger cursor-pointer hover:text-danger hover:bg-slate-200 bg-red-50"
                            onClick={() => {
                              handleDeleteTournament(record.uuid || "");
                            }}
                          >
                            <Lucide icon="Trash" className="w-4 h-4" /> Delete
                          </Menu.Item>
                        }
                      </Menu.Items>
                    </Menu>
                  </div>
                </div>
              )},
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

export default Tournaments;