import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import { useState } from "react";
import { PlayersApiHooks } from "./api";
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
import { PlayerList, PlayersPayload } from "./api/schema";
import Image from "@/components/Image";
import { imageResizer } from "@/utils/helper";
import { Menu } from "@/components/Base/Headless";

function Players() {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState({
    type: "",
    search: "",
  });
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const { showNotification } = useToast();
  const { mutate: actionDeletePlayer } = PlayersApiHooks.useDeletePlayer({
    params: {
      uuid: modalAlert?.refId || 0
    },
  }, {
    onSuccess: () => {
      showNotification({
        duration: 3000,
        text: "Player deleted successfully",
        icon: "WashingMachine",
        variant: "danger",
      });
      setModalAlert(undefined);
      queryClient.invalidateQueries({
        queryKey: PlayersApiHooks.getKeyByAlias("getPlayersList"),
      });
    }
  });
  const { mutate: actionChangeRolePlayer } = PlayersApiHooks.useChangePlayerRole({
    params: {
      uuid: modalAlert?.refId || 0
    },
  }, {
    onSuccess: () => {
      showNotification({
        duration: 3000,
        text: "Player role changed successfully",
        icon: "WashingMachine",
        variant: "danger",
      });
      setModalAlert(undefined);
      queryClient.invalidateQueries({
        queryKey: PlayersApiHooks.getKeyByAlias("getPlayersList"),
      });
    }
  });
  const { data, isLoading, refetch } = PlayersApiHooks.useGetPlayersList(
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
  const handleDeletePlayer = (refId: string) => {
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
            actionDeletePlayer(undefined)
          },
          variant: "danger"
        }
      ]
    });
  };
  const changeRolePlayer = (refId: string) => {
    const player = data?.data?.find((item) => item.uuid === refId);
    console.log(player)
    setModalAlert({
      open: true,
      onClose: () => setModalAlert(undefined),
      icon: "XCircle",
      title: "Are you sure?",
      description: `Do you really want to change the role of ${player?.name} to be ${player?.role === "PLAYER" ? "ADMIN" : "PLAYER"}? This process cannot be undone.`,
      refId: refId,
      buttons: [
        {
          label: "Cancel",
          onClick: () => setModalAlert(undefined),
          variant: "secondary"
        },
        {
          label: "Change",
          onClick: () => {
            // Handle delete logic here
            actionChangeRolePlayer({ role: player?.role === "PLAYER" ? "ADMIN" : "PLAYER" })
          },
          variant: "danger"
        }
      ]
    });
  };

  const tableColumnsAntd: ColumnsType<PlayerList> = [
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
      fixed: "left",
      title: "Name",
      dataIndex: "name",
      align: "left",
      width: "70%",
      render: (text, record) => (
        <div className="flex items-center">
          <div className="flex flex-col mr-2">
            <Image
              src={imageResizer(record?.media_url || "", 50)}
              alt={record.name}
              className="rounded-full w-7 h-7 object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{text}</span>
            <span className="text-xs text-gray-500">{record.username}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Nickname",
      dataIndex: "nickname",
      align: "left",
      ellipsis: true,
      width: "40%",
      responsive: ["md"],
    },
    {
      title: "City",
      dataIndex: "city",
      align: "left",
      width: "25%",
      responsive: ["md"],
    },
    {
      title: "Level",
      dataIndex: "level",
      align: "center",
      responsive: ["md"],
      width: "10%",
      ellipsis: true,
    },
    {
      title: "",
      dataIndex: "uuid",
      responsive: ["md"],
      align: "center",
      className: "rounded-r-xl",
      width: "30%",
      render(value, record, index) {
        return (
          <div className="flex lg:justify-center items-center gap-2">
            <Button
              className="flex items-center"
              variant="primary"
              onClick={() => {
                navigate(paths.administrator.players.edit({ player: record.uuid || "" }).$);
              }}
            >
              <Lucide icon="Pencil" className="w-4 h-4" />
            </Button>
            <Menu>
              <Menu.Button as={Button} variant="secondary">
                <Lucide icon="MoreHorizontal" className="w-4 h-4" />
              </Menu.Button>
              <Menu.Items className="w-40">
                <Menu.Header className="bg-emerald-800 italic font-bold text-white rounded-xl tracking-widestç text-xs p-1">{record.role}</Menu.Header>
                <Menu.Divider/>
                <Menu.Item onClick={() => changeRolePlayer(record.uuid || "")}>
                  <Lucide icon="UserCog" className="w-4 h-4 mr-2"/>
                  Set as {record.role === "PLAYER" ? "Admin" : "Player"}
                </Menu.Item>
                <Menu.Item onClick={() => handleDeletePlayer(value)} className="text-danger">
                  <Lucide icon="Trash" className="w-4 h-4 mr-2" />
                  Delete
                </Menu.Item>
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
        <h2 className="mr-auto text-lg font-medium">Players</h2>
        <div className="flex">
          <Button variant="primary" className="mr-2 shadow-md" onClick={() => navigate(paths.administrator.players.new)} >
            Add New Player
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
                    queryClient.invalidateQueries({ queryKey: PlayersApiHooks.getKeyByAlias("getPlayersList") });
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
                  <p>Nickname: {record.nickname}</p>
                  <p>City: {record.city}</p>
                  <p>Level: {record.level || ""}</p>
                  <p>Created: {moment(record.createdAt).format("Y-MM-DD HH:mm")}</p>
                  <div className="flex justify-end mt-2 gap-2">
                    <Button
                      className="flex items-center"
                      variant="primary"
                      onClick={() => {
                        navigate(paths.administrator.players.edit({ player: record.uuid || "" }).$);
                      }}
                    >
                      <Lucide icon="Pencil" className="w-4 h-4 " />
                    </Button>
                    <Menu>
                      <Menu.Button as={Button} variant="secondary">
                        <Lucide icon="MoreHorizontal" className="w-4 h-4" />
                      </Menu.Button>
                      <Menu.Items className="w-40">
                        <Menu.Header className="bg-emerald-800 text-center italic font-bold text-white rounded-xl tracking-tighter text-xs p-1">{record.role}</Menu.Header>
                        <Menu.Divider />
                        <Menu.Item onClick={() => changeRolePlayer(record.uuid || "")} >
                          <Lucide icon="UserCog" className="w-4 h-4 mr-2"/>
                          Set as {record.role === "PLAYER" ? "Admin" : "Player"}
                        </Menu.Item>
                        <Menu.Item onClick={() => handleDeletePlayer(record.uuid || "")} className="text-danger">
                          <Lucide icon="Trash" className="w-4 h-4 mr-2" />
                          Delete
                        </Menu.Item>
                      </Menu.Items>
                    </Menu>
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

export default Players;