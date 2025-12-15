import { Dialog } from "@/components/Base/Headless";
import { PlayerList, PlayersPayload } from "../api/schema";
import { useState } from "react";
import { PlayersApiHooks } from "../api";
import { Table } from "antd";
import styles from "../index.module.scss";
import { ColumnsType } from "antd/es/table";
import Image from "@/components/Image";
import { imageResizer } from "@/utils/helper";
import Button from "@/components/Base/Button";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";
import moment from "moment";
import { useDebounce } from "ahooks";
import { FormInput, InputGroup } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { PlayersPartialSchema } from "@/pages/Players/Home/api/schema";
export interface PlayerPickerProps {
  choosenPlayer?: Partial<PlayersPayload>;
  open?: boolean;
  onClose: () => void;
  onSelect: (player: PlayerList) => void;
  disabledPlayers?: string[];
}
export const PlayerPicker = (props: PlayerPickerProps) => {
  const screens = useBreakpoint();
  const { choosenPlayer, open, onClose, onSelect, disabledPlayers } = props;
  const [filter, setFilter] = useState({
    search: "",
    type: "",
    page: 1,
    limit: 10
  })
  const {data, isLoading} = PlayersApiHooks.useGetPlayersList({
    queries: {
      page: filter.page,
      limit: filter.limit,
      search: useDebounce(filter.search, { wait: 300 }),
      type: useDebounce(filter.type, { wait: 500 }),
    }
  })

  const tableColumnsAntd: ColumnsType<PlayerList> = [
    {
      title: "Name",
      dataIndex: "name",
      align: "left",
      className: "rounded-l-xl pl-5 rounded-r-xl sm:rounded-r-none",
      width: "50%",
      render: (text, record) => (
        <div className="flex items-center">
          <div className="flex flex-col mx-2">
            <Image
              src={imageResizer(record.media_url || "", 50)}
              alt={record.name}
              className="rounded-full w-7 h-7 object-cover"
            />
          </div>
          <div className="flex flex-col w-full">
            <span className="text-sm font-medium">{text}</span>
            <span className="text-xs text-gray-500">{record.nickname}</span>
          </div>
          {disabledPlayers?.includes(record.uuid || "") && <span className="text-xs text-gray-500 text-nowrap text-end">In Match</span>}
        </div>
      ),
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
      width: "20%",
      ellipsis: true,
    },
    {
      title: "",
      dataIndex: "uuid",
      responsive: ["md"],
      align: "center",
      className: "rounded-r-xl",
      width: "20%",
      render(value, record, index) {
        return (
          <div className="flex lg:justify-center items-center">
            <Button
              className="flex items-center mr-3"
              variant="primary"
              size="sm"
              disabled={disabledPlayers?.includes(record.uuid || "")}
              onClick={() => {
                onSelect(record);
              }}
            >
              Choose
            </Button>
          </div>
        )
      },
    },
  ]
  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
      }}
      staticBackdrop={false}
      size="lg"
    >
      <Dialog.Panel className="grid grid-cols-12 gap-4 p-4">
        <Dialog.Title className="col-span-12 px-0">
          <h2 className="mr-auto text-base font-medium">
            Choose Player
          </h2>
          <Button
            onClick={() => {
              onClose();
            }}
            className="border-none shadow-none"
          >
            <Lucide icon="X" />
          </Button>
        </Dialog.Title>
        
        <div className="col-span-12">
          <InputGroup>
            <FormInput
              name="search"
              size={12}
              value={filter.search}
              placeholder="Search"
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
            <InputGroup.Text className="flex items-center justify-center">
              <Lucide icon="Search" className="w-4 h-4" />
            </InputGroup.Text>
          </InputGroup>
        </div>
        <div className="col-span-12">
          <Table
            dataSource={data?.data || []}
            columns={tableColumnsAntd}
            rowKey={(d) => d.uuid || ""}
            rowClassName={(record) => `${styles.customTableRow} ${disabledPlayers?.includes(record.uuid || "") ? 'opacity-40' : ''}`}
            onRow={(record) => ({
              onClick: () => {
                if (!disabledPlayers?.includes(record.uuid || "")) {
                  onSelect(record);
                }
              }
            })}
            className={styles.customTableStyle}
            pagination={{
              total: data?.totalRecords,
              defaultCurrent: filter.page,
              defaultPageSize: 10,
              onChange: (page, limit) => {
                setFilter({
                  ...filter,
                  page,
                  limit
                })
              }
            }}
            showHeader={false}
          />
        </div>
    </Dialog.Panel>
    </Dialog>
  )
}