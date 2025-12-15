import { MerchProductsApiHooks } from "../api";
import {
  Divider,
  Table
} from "antd";
import { useNavigate } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import Image from "@/components/Image";
import Lucide from "@/components/Base/Lucide";
import styles from "../index.module.scss";
import moment from "moment";
import Button from "@/components/Base/Button";
import ImagePreview from "@/components/ImagePreview/ImagePreview";
interface Props {
  merchProduct?: string;
}

export const MerchandiseDetail = (props: Props) => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.administrator.merchandise.edit);
  const { id: merchProductUuid } = queryParams;
  const { data } = MerchProductsApiHooks.useGetMerchProductsDetail({
    params: {
      uuid: merchProductUuid || 0
    }
  }, {
    onSuccess: (data) => {
    },
    enabled: !!merchProductUuid
  });

  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium flex flex-row items-center">Merchandise: {data?.data?.name}
          <Button
            onClick={() => navigate(paths.administrator.merchandise.edit({ id: merchProductUuid }).$)}
            variant="outline-primary"
            size="sm"
            className="bg-white text-black rounded-lg ml-2"
          >
            <Lucide icon="Pencil" className="h-4 w-4" />
          </Button>
        </h2>
      </div>
      <Divider />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8 xl:col-start-3 grid grid-cols-12 gap-4 intro-y box p-4">
          <div className="col-span-12 sm:col-span-12 grid grid-cols-12 line-clamp-1 gap-4 h-24">
            {data?.data?.galleries?.map((g, i) => (
              <div key={g.uuid} className="col-span-2 h-24">
                <ImagePreview
                  items={data?.data?.galleries?.map(g => g.link) || []}
                  preview={{
                    defaultCurrent: i
                  }}
                  className="w-full "
                >
                  <Image src={g.link} alt={g.name} className="object-cover h-24 w-full rounded-md" />
                </ImagePreview>
              </div>
            ))}
          </div>
          <div className="col-span-12 sm:col-span-12">
            <span className="text-xl font-bold">{data?.data?.name}</span>
            <div className="flex flex-row items-center">
              <Lucide icon="Calendar" className="h-4 w-4" />&nbsp;Created on:&nbsp;{moment(data?.data?.createdAt).format('YYYY-MM-DD')}&nbsp;|&nbsp;<Lucide icon="User" className="h-4 w-4" />&nbsp;Author:&nbsp;{data?.data?.createdBy}
            </div>
          </div>
          <Divider className="col-span-12 my-0"/>
          <div className="col-span-12 sm:col-span-12">
            <div dangerouslySetInnerHTML={{ __html: decodeURIComponent(data?.data?.description || '') }}></div>
          </div>
          <div className="col-span-12 grid grid-cols-12 gap-2">
            <Table
              columns={[
                {
                  title: "Size",
                  dataIndex: "size",
                  key: "size",
                  align: "center",
                  className: "rounded-l-xl"
                },
                {
                  title: "Stock",
                  dataIndex: "quantity",
                  key: "quantity",
                  render: (text) => <div className="text-right capitalize p-2 text-nowrap">{Intl.NumberFormat('id-ID').format(text)} {data?.data?.unit}</div>
                },
                {
                  title: "Price",
                  dataIndex: "price",
                  key: "price",
                  align: "right",
                  className: "rounded-r-xl",
                  render: (text) => <div className="text-right capitalize p-2 text-nowrap">Rp {Intl.NumberFormat('id-ID').format(text)}/{data?.data?.unit}</div>
                }
              ]}
              rowClassName={() => styles.customTableRow}
              className={`${styles.customTableStyle} w-full`}
              dataSource={data?.data?.details}
              pagination={false}
            />
          </div>
        </div>
      </div>
    </>
  )
}