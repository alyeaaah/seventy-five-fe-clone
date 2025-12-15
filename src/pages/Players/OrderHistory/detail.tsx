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
import { useRouteParams } from "typesafe-routes/react-router";
import Image from "@/components/Image";

export const PlayerOrderDetail = () => {
  const userData = useAtomValue(userAtom);
  const uuid = useRouteParams(paths.player.orders.detail).uuid;
  const { data } = PlayerHomeApiHooks.useGetPlayersOrderDetail({
    params: {
      uuid: uuid
    }
  });
  const gatheredProducts = data?.data.products.map((item) => item.details.map((detail) => ({
    name: item.name,
    media_url: item.media_url,
    size: detail.size,
    qty: detail.qty,
    unit: item.unit,
    price: detail.price
  }))).flat() || [];
  
  return (
    <div className="grid grid-cols-12 mt-8 mx-4">
      <div className="col-span-12 grid grid-cols-12 gap-4">
        <div className="col-span-2 flex flex-col">
          <span className="font-bold">Order ID: </span>
          <span className="uppercase">{data?.data.uuid.split("-")[0]}SF{data?.data.id}</span>
          <span className="font-bold mt-2">Order Date: </span>
          <span className="">{moment(data?.data.createdAt).format("DD MMMM YYYY hh:mm")}</span>
        </div>
        <div className="col-span-2 flex flex-col">
          <span className="font-bold">Status: </span>
          <span className="font-bold text-emerald-800">{data?.data.status}</span>
        </div>
        <div className="col-span-3 flex flex-col">
        </div>
        <div className="col-span-1 flex flex-col items-end">
          <span className="font-bold">Delivered to: </span>
        </div>
        <div className="col-span-4 flex flex-col">
          <span className="text-emerald-800 font-semibold capitalize">{data?.data.address?.receiver_name} <span className="font-normal">({data?.data.address?.phone})</span></span>
          <span className="capitalize">{data?.data.address?.address}</span>
          <span className="capitalize">{data?.data.address?.district}, {data?.data.address?.city}</span>
        </div>
        <Divider className="col-span-12" />
      </div>
      <div className="col-span-12 grid grid-cols-12 gap-2">
        <div className="col-span-4 col-start-2 flex flex-col">
          <span className="font-bold">Products </span>
        </div>
        <div className="col-span-1 flex flex-col items-center">
          <span className="font-bold">Variant </span>
        </div>
        <div className="col-span-1 flex flex-col items-end">
          <span className="font-bold">Quantity </span>
        </div>
        <div className="col-span-3 flex flex-col items-end">
          <span className="font-bold">Price </span>
        </div>
        <div className="col-span-2 flex flex-col items-end">
          <span className="font-bold">Summary </span>
        </div>
        {gatheredProducts.map((item, index) => (
          <div key={index} className="col-span-12 grid grid-cols-12 gap-2 border-b pb-2">
            <div className="col-span-1 flex flex-col items-end">
              <span className=""><Image src={item.media_url || ""} alt="" className="h-8 w-8 object-cover border rounded" /></span>
            </div>
            <div className="col-span-4 flex flex-col justify-center">
              <span className="">{item.name}</span>
            </div>
            <div className="col-span-1 flex flex-col justify-center items-center">
              <span className="">{item.size}</span>
            </div>
            <div className="col-span-1 flex flex-col justify-center items-end">
              <span className="">{item.qty} {item.unit}</span>
            </div>
            <div className="col-span-3 flex flex-col justify-center items-end">
              <span className=""> IDR {Intl.NumberFormat("id-ID").format(Number(item.price))}</span>
            </div>
            <div className="col-span-2 flex flex-col justify-center items-end">
              <span className=""> IDR {Intl.NumberFormat("id-ID").format(item.qty * Number(item.price))}</span>
            </div>
          </div>
        ))}
        <div className="col-span-12 grid grid-cols-12 gap-2">
          <div className="col-span-3 col-start-8 flex flex-col items-end">
            <span className="font-bold">Subtotal </span>
          </div>
          <div className="col-span-2 flex flex-col items-end">
            <span className="font-bold">IDR {Intl.NumberFormat("id-ID").format(data?.data.sub_total || 0)}</span>
          </div>

          <div className="col-span-3 col-start-8 flex flex-col items-end">
            <span className="font-bold">Discount </span>
          </div>
          <div className="col-span-2 flex flex-col items-end">
            <span className="font-bold">{!data?.data.discount ? "-" : "IDR " + Intl.NumberFormat("id-ID").format(data?.data.discount || 0)}</span>
          </div>

          <div className="col-span-3 col-start-8 flex flex-col items-end">
            <span className="font-bold">Total </span>
          </div>
          <div className="col-span-2 flex flex-col items-end">
            <span className="font-bold">IDR {Intl.NumberFormat("id-ID").format(data?.data.grand_total || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

