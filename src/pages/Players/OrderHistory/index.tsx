import { PlayerHomeApiHooks } from "./api";
import { useAtomValue } from "jotai";
import { userAtom } from "@/utils/store";
import { Divider, Progress, Table, TableColumnsType } from "antd";
import Lucide from "@/components/Base/Lucide";
import { IconLogo, IconPlayer, IconRacket, IconXTwitter } from "@/assets/images/icons";
import moment from "moment";
import Button from "@/components/Base/Button";
import { OrderData } from "./api/schema";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { paths } from "@/router/paths";

export const PlayerOrderHistory = () => {
  const userData = useAtomValue(userAtom);
  const { data } = PlayerHomeApiHooks.useGetPlayersOrderHistory({
    queries: {
      page: 1,
      limit: 10
    }
  });
  const columns: TableColumnsType<OrderData> = [{
    title: "No",
    dataIndex: "id",
    key: "id",
    width: "100%",
    className: "w-full !rounded-3xl !border-emerald-800 border lg:border-0 lg:!border-[#f0f0f0] mb-4 pb-12 hover:bg-slate-200 transition-all  duration-1000 ease-in-out",
    render: (text, record, index) => {
      const productInfo = record.products.map((item, index) => (
        item.details.map((detail, idx) => ({
          name: item.name,
          media_url: item.media_url,
          size: detail.size,
          qty: detail.qty,
          unit: item.unit
        }))
      )).flat();
      return (
        <Link to={paths.player.orders.detail({uuid: record.uuid}).$} className="w-full grid grid-cols-12 gap-4">
          <div className="lg:col-span-2 hidden lg:grid">
            <div className="flex items-center gap-2">
              <div className="h-24 flex items-center justify-center gap-3">
                <Lucide icon="Calendar" className="h-12 w-12" />
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold">{moment(record.createdAt).format("DD")}</span>
                  </div>
                  <span className="text-lg">{moment(record.createdAt).format("MMM YY")}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-2">
            <div className="flex flex-row lg:flex-col lg:items-start justify-between lg:justify-start items-start gap-2">
              <div className="flex flex-col items-start">
                <span className="font-bold">Order ID: </span>
                <span className="uppercase">{record.uuid.split("-")[0]}SF{record.id}</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="font-bold lg:mt-2">Status: </span>
                <span className="font-bold text-emerald-800 lg:text-lg">{record.status}</span>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <div className="flex flex-col items-start gap-1">
              {productInfo.map((item, index) => index < 2 && (
                  <div key={`${index}`} className="flex items-center flex-row gap-2">
                    <div className="flex flex-col">
                      <img src={item.media_url || ""} alt="" className="w-10 h-10 object-cover border rounded-md overflow-hidden"/>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold">{item.name}</span>
                      <span className="text-xs text-gray-500">Variant: {item.size} - {item.qty} {item.unit}</span>
                    </div>
                  </div>
              ))}
              {productInfo.length > 2 && (
                <Link to={paths.player.orders.detail({uuid: record.uuid}).$} className="flex items-center flex-row gap-2">
                  {productInfo.length > 2 && <span className="font-bold text-xs border rounded-md border-emerald-800 px-2">+{productInfo.length - 2} More Items...</span>}
                </Link>
              )}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <div className="flex flex-col items-start">
              <span className="font-bold">Shipped to: </span>
              <span className="font-semibold capitalize">{record.address?.receiver_name} ({record.address?.phone})</span>
              <span>{record.address?.address}</span>
              <span>{record.address?.province}, {record.address?.city}</span>
            </div>
          </div>
        </Link>
      )
    }
  },
  ]
  return (
    <div className="w-full py-5 flex flex-col items-center justify-center">
      <Table
        columns={columns}
        className="!bg-transparent table-grid gap-2 border-separate border-spacing-y-2 w-full"
        rootClassName="!bg-transparent !rounded-3xl "
        locale={{
          emptyText: (<>
            <div className="w-full flex flex-col items-center justify-center min-h-[60vh]">
              <Lucide icon="ShoppingCart" className="h-12 w-12" />
              <span className="text-gray-500 text-xs">You don't have any order history</span>
              <Link to={paths.shop.index}>
                <Button size="sm" variant="primary" className="mt-4">Place an Order</Button>
              </Link>
            </div>
          </>)
        }}
        rowClassName={(record, index) => `!bg-gray-50 py-2 !rounded-3xl !overflow-hidden border-4 hover:bg-gray-100`}
        // components={{
        //   body: {
        //     row: ({ children, record, index }: { children: ReactNode, record: OrderData, index: number }) => <tr className={index % 2 === 0 ? "!bg-gray-100 !rounded-3xl !overflow-hidden" : `!bg-gray-50 !rounded-3xl !overflow-hidden`}>{children}</tr>,
        //   },
        // }}  
        dataSource={data?.data}
        showHeader={false}
      />
    </div>
  );
}

