import moment from "moment";
import { MerchOrderApiHooks } from "../api";
import { useNavigate } from "react-router-dom";
import { Divider } from "antd";
import Image from "@/components/Image";
import { Menu } from "@/components/Base/Headless";
import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import { OrderStatus } from "@/utils/faker";
import { useState } from "react";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { queryClient } from "@/utils/react-query";
interface Props {
  orderId?: string;
}

export const OrderDetail = ({orderId}: Props) => {
  const navigate = useNavigate();
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);

  const {data} = MerchOrderApiHooks.useGetMerchOrderDetail({
    params: {
      uuid: orderId || ""
    }
  })

  const { mutateAsync: updateOrderStatus } = MerchOrderApiHooks.useUpdateMerchOrderStatus({
    params: {
      uuid: modalAlert?.refId || "",
    }
  });
  const actionButtonPrimary = (refId: string) => {
    let description = "Do you really want to deliver this order? This process cannot be undone.";
    let buttonLabel = "Confirm Delivery";
    switch (data?.data.status) {
      case OrderStatus.PROCESSED:
        description = "Do you really want to deliver this order? This process cannot be undone.";
        buttonLabel = "Confirm Delivery";
        break;
      case OrderStatus.ORDERED:
        description = "Do you really want to process this order? This process cannot be undone.";
        buttonLabel = "Process Order";
        break;
      case OrderStatus.DELIVERED:
        description = "Do you really want to complete this order? This process cannot be undone.";
        buttonLabel = "Complete Order";
        break;
      default:
        break;
    }
    
    setModalAlert({
      open: true,
      onClose: () => setModalAlert(undefined),
      icon: "CheckCircle",
      iconClassname: "text-emerald-800",
      title: "Are you sure?",
      description: description,
      refId: refId,
      notes: data?.data.status == OrderStatus.PROCESSED ? {
        label: "Tracking Number",
        placeholder: "Enter your delivery tracking number",
        value: "",
        required: true
      } : undefined,
      buttons: [
        {
          label: buttonLabel,
          onClick: async (note: string) => {
            updateOrderStatus({
              status: OrderStatus.DELIVERED,
              shipping_code: note,
              note: note,
            }).then(() => {
              queryClient.invalidateQueries({
                queryKey: MerchOrderApiHooks.getKeyByAlias("getMerchOrderList")
              });
              setModalAlert(undefined);
            });
          },
          variant: "primary",
          main: true
        },
        {
          label: "Check Again",
          onClick: () => {
            setModalAlert(undefined);
          },
          variant: "secondary"
        }
      ]
    });
  }
  const actionButtonCancel = (refId: string) => {
    setModalAlert({
      open: true,
      onClose: () => setModalAlert(undefined),
      icon: "XCircle",
      iconClassname: "text-danger",
      title: "Are you sure?",
      description: "Do you really want to cancel this order? This process cannot be undone.",
      refId: refId,
      notes: {
        label: "Reason",
        placeholder: "Enter your reason to cancel this order",
        value: "",
        required: true
      },
      buttons: [
        {
          label: "Cancel Order",
          onClick: (noteText: string) => {
          
            updateOrderStatus({
              status: OrderStatus.CANCELLED,
              note: noteText,
            }).then(() => {
              queryClient.invalidateQueries({
                queryKey: MerchOrderApiHooks.getKeyByAlias("getMerchOrderList")
              });
              setModalAlert(undefined);
            });
          },
          variant: "secondary",
          main: true
        },
        {
          label: "Check Again",
          onClick: () => {
            setModalAlert(undefined);
          },
          variant: "danger"
        }
      ]
    });
  }

  return (
    <>
      <div className="flex flex-row items-center justify-between">
        <span className="font-bold">Order Information</span>
        {(data?.data.status && data?.data.status != OrderStatus.COMPLETED) && <Menu>
          <Menu.Button as={Button} variant="primary" size="sm">
            Action
          </Menu.Button>
          <Menu.Items className="w-40 text-sm">
            {(data?.data.status && ![OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(data?.data.status as OrderStatus))
              && <Menu.Item
                className='hover:bg-emerald-800 hover:!text-white'
                onClick={() => {
                  actionButtonPrimary(data?.data.uuid || "");
                }}
              >
                <Lucide icon="Check" className="h-4 w-4 mr-2" /> 
                {data?.data.status == OrderStatus.ORDERED ? "Process Order" : ""}
                {data?.data.status == OrderStatus.PROCESSED ? "Deliver Order" : ""}
                {data?.data.status == OrderStatus.DELIVERED ? "Complete Order" : ""}
              </Menu.Item>
            }
            {(data?.data.status && [OrderStatus.ORDERED, OrderStatus.PROCESSED].includes(data?.data.status as OrderStatus))
              && <Menu.Item
                className='hover:bg-red-500 hover:!text-white'
                onClick={() => {
                  actionButtonCancel(data?.data.uuid || "");
                }}
              >
                <Lucide icon="Trash" className="h-4 w-4 mr-2" /> Delete Order
              </Menu.Item>
            }
          </Menu.Items>
        </Menu>}
      </div>
      <Divider/>
      <div className="grid grid-cols-12 mt-0 mx-4">
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
          {data?.data?.items?.map((item, index) => (
            <div key={index} className="col-span-12 grid grid-cols-12 gap-2 border-b pb-2">
              <div className="col-span-1 flex flex-col items-end">
                <span className=""><Image src={item.product_image || ""} alt="" className="h-8 w-8 object-cover border rounded" /></span>
              </div>
              <div className="col-span-4 flex flex-col justify-center">
                <span className="">{item.product_name}</span>
              </div>
              <div className="col-span-1 flex flex-col justify-center items-center">
                <span className="">{item.product_size}</span>
              </div>
              <div className="col-span-1 flex flex-col justify-center items-end">
                <span className="">{item.quantity} {item.product_unit}</span>
              </div>
              <div className="col-span-3 flex flex-col justify-center items-end">
                <span className=""> IDR {Intl.NumberFormat("id-ID").format(Number(item.price))}</span>
              </div>
              <div className="col-span-2 flex flex-col justify-center items-end">
                <span className=""> IDR {Intl.NumberFormat("id-ID").format(item.quantity * Number(item.price))}</span>
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
      <Confirmation
        key={modalAlert?.refId}
        open={!!modalAlert?.open} 
        onClose={() => setModalAlert(undefined)}
        icon={modalAlert?.icon || "Info"}
        iconClassname={modalAlert?.iconClassname}
        title={modalAlert?.title || ""}
        notes={modalAlert?.notes}
        description={modalAlert?.description || ""}
        refId={modalAlert?.refId}
        buttons={modalAlert?.buttons}
      />
    </>
  )
}