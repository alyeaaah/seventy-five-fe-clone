import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import { ReactNode, useState } from "react";
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
import Image from "@/components/Image";
import Tippy from "@/components/Base/Tippy";
import { TournamentsApiHooks } from "../Tournaments/api";
import { TournamentsPayload } from "../Tournaments/api/schema";
import { imageResizer } from "@/utils/helper";
import { CustomMatchApiHooks } from "./api";
import { MatchDetail } from "../MatchDetail/api/schema";
import { IconVS } from "@/assets/images/icons";
import { useAtomValue } from "jotai";
import { userAtom } from "@/utils/store/atoms";
import { PublicMatchApiHooks } from "@/pages/Public/Match/api";
import { Divider } from "antd";
import { ChallengerProcessModal } from "./ChallengerProcess.modal";
import { PublicChallenger } from "@/pages/Public/Match/api/schema";

export const CustomMatchPage = () => {
  const screens = useBreakpoint();

  const thumbnailBreakPoint = () => {
    if (screens.xxl) return 4;
    if (screens.xl) return 3;
    if (screens.lg) return 3;
    if (screens.md) return 4;
    return 4;
  };
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [matchPage, setMatchPage] = useState(1);
  const [filter, setFilter] = useState({
    type: "",
    search: "",
  });
  const [matchFilter, setMatchFilter] = useState({
    level: "",
    search: "",
  });

  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const [challengerProcessModal, setChallengerProcessModal] = useState<{
    open: boolean;
    challengerData: PublicChallenger | null;
  }>({ open: false, challengerData: null });
  const { showNotification } = useToast();
  const { mutate: actionDeleteFriendlyMatch } = TournamentsApiHooks.useDeleteTournament({
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
  const { mutate: actionPublishFriendlyMatch } = TournamentsApiHooks.usePublishTournament({
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
        limit: thumbnailBreakPoint(),
        search: useDebounce(filter.search, { wait: 500 }),
        type: "FRIENDLY MATCH",
      },
      cacheTime: 0,
    },
  );

  const { mutate: actionDeleteCustomMatch } = CustomMatchApiHooks.useDeleteCustomMatch({
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
        queryKey: CustomMatchApiHooks.getKeyByAlias("getCustomMatchList"),
      });
    },
    retry: false
  });
  const handleDeleteFriendlyMatch = (refId: string) => {
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
            actionDeleteFriendlyMatch(undefined)
          },
          variant: "danger"
        }
      ]
    });
  };
  const handlePublishFriendlyMatch = (refId: string, unpublish?: boolean) => {
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
            actionPublishFriendlyMatch(undefined)
          },
          variant: "primary"
        }
      ]
    });
  };
  const handleDeleteCustomMatch = (refId: string) => {
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
            actionDeleteCustomMatch(undefined)
          },
          variant: "danger"
        }
      ]
    });
  };
  const { data: matches, isLoading: isLoadingMatches } = CustomMatchApiHooks.useGetCustomMatchList({
    queries: {
      search: matchFilter.search,
      page: matchPage,
      limit: 10,
    },
  });

  const userData = useAtomValue(userAtom);
  const { data: challengerList, isLoading: isChallengerListLoading } = PublicMatchApiHooks.useGetPublicChallengerList(
    {},
    {
      enabled: !!userData?.uuid,
    }
  );

  const friendlyMatchColumnsAntd: ColumnsType<TournamentsPayload> = [
    {
      dataIndex: 'uuid',
      key: 'uuid',
      render: (value, record) => {
        let rtp = false;
        if (record.match_count && record.match_count != "0" && record.status == "DRAFT") {
          rtp = true;
        }
        return (
          <div className="col-span-12 2xl:col-span-3 xl:col-span-4 sm:col-span-6 grid grid-cols-12 box shadow-md overflow-hidden rounded-xl pb-0 relative">
            {record.media_url &&
              <div
                className="col-span-3 relative overflow-hidden h-full cursor-pointer"
                onClick={() => navigate(paths.administrator.customMatch.friendlyMatch.detail({ friendlyMatchUuid: record.uuid || "" }).$)}>
                <Image
                  src={imageResizer(record.media_url, 200)}
                  alt={record.name}
                  className="object-cover h-full w-full"
                />

                {
                  rtp &&
                  <Tippy
                    as="div"
                    className="flex items-center justify-center dark:border-darkmode-400 text-slate-400 absolute bottom-2 right-[calc(50%-16px)]"
                    content="Publish"
                  >
                    <Button
                      className="flex items-center text-warning shadow-md w-8 h-8 p-0 border border-warning"
                      variant="primary"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePublishFriendlyMatch(value, false);
                      }}
                    >
                      <Lucide icon="Rocket" className="w-4 h-4" />
                    </Button>
                  </Tippy>
                }

                {
                  record.status == "DRAFT" &&
                  <Tippy
                    as="div"
                    className="flex items-center justify-center dark:border-darkmode-400 text-slate-400 absolute bottom-2 right-[calc(50%-16px)]"
                    content="Unpublish"
                  >
                    <Button
                      className="flex items-center text-warning shadow-md w-8 h-8 p-0 border border-warning"
                      variant="dark"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePublishFriendlyMatch(value, true);
                      }}
                    >
                      <Lucide icon="Rocket" className="w-4 h-4 rotate-[135deg]" />
                    </Button>
                  </Tippy>
                }
              </div>
            }
            <div className="col-span-9 rounded-t-xl bg-white dark:bg-darkmode-600 px-3 py-2 cursor-pointer" onClick={() => navigate(paths.administrator.customMatch.friendlyMatch.detail({ friendlyMatchUuid: record.uuid || "" }).$)}>
              <div className="flex items-center min-h-14 max-h-14">
                <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 text-ellipsis line-clamp-2">{record.name}</h3>
              </div>
              <div className="flex flex-row justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-slate-400 flex flex-row items-center"><Lucide icon="MapPin" className="h-4 w-4" />{record.court}</span>
                <div className="border border-emerald-800 dark:border-emerald-400 rounded-xl text-xs px-2 dark:text-emerald-400">{record.status}</div>
              </div>
              <div className="flex flex-row justify-between items-end">
                <div className="flex flex-col">
                  <div className="flex flex-row justify-between mt-2">
                    <span className="text-xs text-gray-500 dark:text-slate-400 flex flex-row items-center"><Lucide icon="Calendar" className="h-4 w-4" />&nbsp;<span className="text-ellipsis line-clamp-1">{moment(record.createdAt).format('ddd, DD MMM YYYY')}</span></span>
                  </div>
                  <div className="flex flex-row justify-between mt-2">
                    <span className="text-xs text-gray-500 dark:text-slate-400 flex flex-row items-center"><Lucide icon="Clock" className="h-4 w-4" />&nbsp;{moment(record.createdAt).format('hh:mm')}</span>
                    <span className="text-xs text-gray-500 dark:text-slate-400 flex flex-row items-center mr-1"><Lucide icon="User" className="h-4 w-4" />{record.player_count || "0"}</span>
                  </div>
                </div>
                <div className="flex flex-row justify-end items-en">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="flex align-middle w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(paths.administrator.customMatch.friendlyMatch.edit.index({ friendlyMatchUuid: record.uuid || "" }).$)
                    }}
                  >
                    <Lucide icon="Pencil" className="h-full" />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="flex align-middle ml-2 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFriendlyMatch(record.uuid || "");
                    }}
                  >
                    <Lucide icon="Trash" className="h-full" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
  ];
  const customMatchColumnsAntd: ColumnsType<MatchDetail> = [
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
      title: "Matches",
      dataIndex: "name",
      align: "left",
      width: screens.xs ? "100%" : "60%",
      render: (text, record) => (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2">
          {record.home_team && (
            <div className="flex flex-col w-full">
              <div className="flex flex-row items-center ">
                <span className="text-sm font-bold text-ellipsis line-clamp-1 text-emerald-800 dark:text-emerald-400">{record.home_team.name} </span>
                {record.home_team.alias && <span className="text-xs border rounded-md border-emerald-800 dark:border-emerald-400 text-emerald-800 dark:text-emerald-400 px-1 capitalize ml-1 ">{record.home_team.alias} </span>}
              </div>
              {record.home_team.players?.map((player) => (
                <div className="flex flex-row items-center">
                  <span className="text-xs font-medium mr-1">{player.name}</span>
                  <span className="text-xs font-light">({player.nickname})</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex my-2">
            <IconVS className="w-16 h-6 text-emerald-800 dark:text-emerald-400" />
          </div>
          {record.away_team && (
            <div className="flex flex-col w-full">
              <div className="flex flex-row items-center justify-end">
                {record.away_team.alias && <span className="text-xs border rounded-md border-emerald-800 dark:border-emerald-400 text-emerald-800 dark:text-emerald-400 px-1 capitalize mr-1 ">{record.away_team.alias} </span>}
                <span className="text-sm font-bold text-ellipsis line-clamp-1 max-w-full text-emerald-800 dark:text-emerald-400 text-end">{record.away_team.name} </span>
              </div>
              {record.away_team.players?.map((player) => (
                <div className="flex flex-row items-center justify-end">
                  <span className="text-xs font-medium mr-1">{player.name}</span>
                  <span className="text-xs font-light">({player.nickname})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Court",
      dataIndex: "court",
      key: "court",
      align: "left",
      ellipsis: true,
      width: "20%",
      responsive: ["md"],
    },
    {
      title: "Date",
      dataIndex: "time",
      align: "center",
      width: "20%",
      responsive: ["md"],
      render: (text: string, record) => {
        return <span>{moment(record.date).format("ddd, DD MMM YYYY hh:mm")}</span>;
      },
    },
    {
      title: "",
      dataIndex: "uuid",
      align: "center",
      width: "10%",
      responsive: ["md"],
      render: (text: string, record) => {
        return (
          <div className="flex flex-row items-center">
            <Button
              size="sm"
              variant="outline-primary"
              className="flex align-middle w-8"
              onClick={(e) => {
                e.stopPropagation();
                navigate(paths.administrator.customMatch.edit({ customMatchUuid: record.uuid || "" }).$)
              }}
            >
              <Lucide icon="Pencil" className="h-full" />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              className="flex align-middle ml-2 w-8"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteCustomMatch(record.uuid || "");
              }}
            >
              <Lucide icon="Trash" className="h-full" />
            </Button>
          </div>
        );
      },
    },
  ]

  const handleFilter = () => {
    refetch();
  };

  return (
    <>
      {/* BEGIN: Incoming Challenger Requests */}
      {(!!challengerList?.data && !isChallengerListLoading) &&
        <>
          <div className="flex flex-row items-center mt-8 intro-y justify-between">
            <h2 className="mr-auto text-lg font-medium">Incoming Challenger Requests</h2>
          </div>
          {/* BEGIN: HTML Table Data */}
          <div className="p-5 mt-2 intro-y box rounded-2xl">
            <div className="overflow-x-auto scrollbar-hidden">
              {isChallengerListLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800"></div>
                </div>
              ) : challengerList && challengerList.data.length > 0 ? (
                <div className="flex flex-row gap-4 overflow-x-auto pb-4">
                  {challengerList.data?.map((challenger) => (
                    <div key={challenger.id} className="flex-shrink-0 w-64 lg:w-80 bg-white dark:bg-darkmode-600 rounded-lg border border-slate-200 dark:border-darkmode-400 p-3 hover:border-emerald-800 ">
                      <div className="flex flex-col relative gap-1">
                        {/* Header with status */}
                        <div className="flex justify-between items-start absolute top-1 right-1">
                          <div className="flex flex-col">
                            <div className="">
                              {(() => {
                                const getStatusColor = (status: string) => {
                                  switch (status) {
                                    case "OPEN": return "text-warning bg-warning/20 border-warning";
                                    case "ACCEPTED": return "text-success bg-success/20 border-success";
                                    case "REJECTED": return "text-danger bg-danger/20 border-danger";
                                    case "COMPLETED": return "text-primary bg-primary/20 border-primary";
                                    case "CANCELLED": return "text-slate-500 bg-slate-200 border-slate-500";
                                    default: return "text-slate-500 bg-slate-200 border-slate-500";
                                  }
                                };
                                return (
                                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(challenger.status)}`}>
                                    {challenger.status}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                        <div className="absolute -bottom-3 -right-3 rounded-tl-md  p-2 flex flex-row gap-1.5">
                          <Button className="rounded-full h-6 w-6 p-1 overflow-hidden bg-transparent border-danger dark:border-danger !border-1">
                            <Lucide icon="X" className="text-danger w-full h-full" />
                          </Button>
                          <Button className="rounded-full h-6 w-6 p-1 border-none overflow-hidden bg-emerald-800" onClick={() => {
                            setChallengerProcessModal({
                              open: true,
                              challengerData: challenger
                            });
                          }}>
                            <Lucide icon="Check" className="text-white w-full h-full" />
                          </Button>
                        </div>

                        {/* Challenger Info */}
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Challenger(s):</span>
                          {[challenger.challengerA, challenger.challengerB]
                            .filter((p): p is NonNullable<typeof challenger.challengerA> => !!p)
                            .map((player) => (
                              <div key={player.uuid} className="flex items-center space-x-2">
                                {player.image_url && (
                                  <img
                                    src={player.image_url}
                                    alt={player.name}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                )}
                                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-400">{player.name}</span>
                              </div>
                            ))}
                        </div>
                        <Divider className="m-1" />
                        {/* Court Info */}
                        <div className="flex flex-row gap-1 items-center">
                          <Lucide icon="MapPin" className="text-xs text-slate-500 dark:text-slate-400 h-4" />
                          <span className="text-xs text-slate-700 dark:text-slate-300">{challenger.court?.name || 'N/A'}</span>
                        </div>

                        {/* Time Info */}
                        <div className="flex flex-row gap-1 items-center">
                          <Lucide icon="Calendar" className="text-xs text-slate-500 dark:text-slate-400  h-4" />
                          <span className="text-xs text-slate-700 dark:text-slate-300">{moment(challenger.time).format("ddd, DD MMM YYYY hh:mm")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center py-8">
                  <span className="text-slate-500 dark:text-slate-400">No incoming challenger requests</span>
                </div>
              )}
            </div>
          </div>
        </>
      }
      {/* END: HTML Table Data */}
      {/* END: Incoming Challenger Requests */}

      {/* BEGIN: Custom Matches */}
      <div className="flex flex-row items-center mt-4 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">Challenger</h2>
        <div className="flex">
          <Button variant="primary" className="mr-2 shadow-md" onClick={() => navigate(paths.administrator.customMatch.new)} >
            <Lucide icon="PlusCircle" />&nbsp;
            Create New Match
          </Button>

        </div>
      </div>
      {/* BEGIN: HTML Table Data */}
      <div className="p-5 mt-2 intro-y box rounded-2xl">
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
            dataSource={matches?.data || []}
            columns={customMatchColumnsAntd}
            rowKey={(d) => d.uuid || ""}
            onRow={(record) => ({
              onClick: () => {
                navigate(paths.administrator.customMatch.detail({ matchUuid: record.uuid || "" }).$);
              }
            })}
            rowClassName={() => `${styles.customTableRow} cursor-pointer`}
            className={styles.customTableStyle}
            pagination={{
              total: data?.totalRecords,
              defaultCurrent: page,
              defaultPageSize: thumbnailBreakPoint(),
              onChange: (page, limit) => {
                setPage(page);
              }
            }}
            expandable={screens.xs ? {
              expandedRowRender: (record) => {
                return (
                  <div className="flex justify-stretch">
                    <Button
                      className="flex items-center w-full"
                      variant="outline-success"
                      onClick={() => {
                        navigate(paths.administrator.customMatch.edit({ customMatchUuid: record.uuid || "" }).$);
                      }}
                    >
                      <Lucide icon="Pencil" className="w-4 h-4" />
                    </Button>
                    <Button
                      className="flex items-center ml-2 w-full"
                      variant="outline-danger"
                      onClick={() => {
                        handleDeleteCustomMatch(record.uuid || "");
                      }}
                    >
                      <Lucide icon="Trash" className="w-4 h-4" />
                    </Button>
                  </div>
                )
              },
              rowExpandable: (record) => !!record.uuid, // Only expand rows with an address
            } : undefined}
            showHeader
          />
        </div>
      </div>
      {/* END: HTML Table Data */}
      {/* END: Custom Matches */}
      <Divider />
      {/* BEGIN: Friendly Matches */}
      <div className="flex flex-col sm:flex-row items-center mt-8 intro-y justify-between">
        <div className="flex justify-start items-center w-full sm:w-auto">
          <h2 className="text-lg font-medium">Friendly Matches</h2>
          <Button variant="primary" className="ml-2 shadow-md flex sm:hidden" onClick={() => navigate(paths.administrator.customMatch.friendlyMatch.new)} >
            <Lucide icon="PlusCircle" />
          </Button>
        </div>
        <div className="flex sm:flex-row flex-col sm:w-auto w-full">
          <Button variant="primary" className="mr-2 shadow-md sm:flex hidden" onClick={() => navigate(paths.administrator.customMatch.friendlyMatch.new)} >
            <Lucide icon="PlusCircle" />&nbsp;New Friendly Match
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-end xl:items-start">
            <form
              id="tabulator-html-filter-form"
              className="sm:ml-auto flex-col sm:flex-row flex"
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
          </div>
        </div>
      </div>
      {/* BEGIN: HTML Table Data */}
      <div className="sm:p-5 py-4 intro-y ">
        <div className="overflow-x-auto scrollbar-hidden">
          <Table
            className="table-grid"
            dataSource={data?.data || []}
            columns={friendlyMatchColumnsAntd}
            rowKey={(d) => d.uuid || ""}
            rowClassName={() => styles.customTableRow}
            showHeader={false}
            bordered={false}
            components={{
              body: {
                wrapper: ({ children }: { children: ReactNode }) => <tbody className="thumbnail-grid-body bg-slate-100 dark:bg-darkmode-800">{children}</tbody>,
                row: ({ children }: { children: ReactNode }) => <tr className="thumbnail-grid-row">{children}</tr>,
                cell: ({ children }: { children: ReactNode }) => <td className="thumbnail-grid-cell">{children}</td>,
              },
            }}
            pagination={{
              total: data?.totalRecords,
              defaultCurrent: page,
              defaultPageSize: thumbnailBreakPoint(),
              onChange: (page, limit) => {
                setPage(page);
              }
            }}
          />
        </div>
      </div>
      {/* END: HTML Table Data */}
      {/* END: Friendly Matches */}


      <Confirmation
        open={!!modalAlert?.open}
        onClose={() => setModalAlert(undefined)}
        icon={modalAlert?.icon || "Info"}
        title={modalAlert?.title || ""}
        description={modalAlert?.description || ""}
        refId={modalAlert?.refId}
        buttons={modalAlert?.buttons}
      />
      <ChallengerProcessModal
        open={challengerProcessModal.open}
        onClose={() => setChallengerProcessModal({ open: false, challengerData: null })}
        challengerData={challengerProcessModal.challengerData}
      />
    </>
  );
}
