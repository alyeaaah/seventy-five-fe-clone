import { useState } from "react";
import { MerchOrderApiHooks } from "../api";
import { Table } from "antd";
import Button from "@/components/Base/Button";
import moment from "moment";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";
import Lucide from "@/components/Base/Lucide";
import styles from "../index.module.scss";
import { ColumnsType } from "antd/es/table";
import { MerchOrderData } from "../api/schema";
import { OrderStatus } from "@/utils/faker";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { queryClient } from "@/utils/react-query";
import { useNavigate } from "react-router-dom";

export const Cancelled = ({openDetail}: {openDetail?: (orderId: string) => void}) => {
  const screens = useBreakpoint();
  const navigate = useNavigate()
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    search: "",
  })
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const { data, isLoading, refetch } = MerchOrderApiHooks.useGetMerchOrderList({
    queries: {
      status: OrderStatus.CANCELLED,
      page: pagination.page,
      limit: pagination.limit,
      search: pagination.search,
    }
  })
  const { mutateAsync: updateOrderStatus } = MerchOrderApiHooks.useUpdateMerchOrderStatus({
    params: {
      uuid: modalAlert?.refId || "",
    }
  });

  const tableColumnsAntd: ColumnsType<MerchOrderData> = [
    {
      title: "Order ID",
      dataIndex: "uuid",
      align: "left",
      width: "20%",
      render(value, record,) {
        return <span className="ml-2 font-bold uppercase">{value.split("-")[0] + "SF" + record.id}</span>;
      },
      responsive: ["lg"],
      className: "rounded-l-xl"
    },
    {
      title: "Name",
      dataIndex: "name",
      align: "left",
      width: "40%",
      render: (text, record) => (
        <div className="flex flex-col">
          <span className="font-bold">{text || record.player?.name || record.address.receiver_name}</span>
          <span className="text-xs lowercase">{record.player?.email || record.email}</span>
        </div>
      ),
    },
    {
      title: "Item(s)",
      dataIndex: "items",
      align: "left",
      ellipsis: true,
      width: "40%",
      responsive: ["md"],
      render: (items, record) => <div className="flex flex-col gap-2 my-2">
        {record.items.slice(0, 2).map((item, index) => (
          <div className="flex flex-row items-center justify-between gap-2 rounded p-1 bg-[#00000011]" key={index}>
            <div className="flex flex-row items-center gap-2">
              {item.product_image && <img src={item.product_image || ""} alt="" className="h-6 w-6 object-cover border rounded" />}
              <span key={index}>{item.product_name || "Hidden Products"}{item.product_size ? " - " + item.product_size : ""}</span>
            </div>
            <span className="text-xs">{item.quantity} {item.product_unit}</span>
          </div>
        ))}
        {items.length > 2 && <span className="font-medium text-xs">+{items.length - 2} more</span>}
      </div>,
    },
    {
      title: "Address",
      dataIndex: "address",
      align: "left",
      width: "25%",
      responsive: ["md"],
      render: (address, record) => <div className="flex flex-col">
        <span className="font-bold">{address?.receiver_name}</span>
        <span>{address?.phone}</span>
        <span className="text-xs text-ellipsis line-clamp-2">{address?.address}</span>
      </div>,
    },
    {
      title: "Total",
      dataIndex: "grand_total",
      align: "right",
      responsive: ["md"],
      className: "text-right font-bold text-emerald-800",
      width: "20%",
      ellipsis: true,
      render:(text) => `IDR ${Intl.NumberFormat("id-ID").format(text)}`
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
          <div className="flex flex-col gap-1 my-1 lg:justify-center items-center">
            <Button
              className="flex items-center"
              variant="soft-danger"
              size="sm"
              onClick={() => {
                navigate(`/admin/orders/${value}`);
              }}
            >
              <Lucide icon="Eye" className="w-4 h-4 mx-1" />
            </Button>
          </div>
        )
      },
    },
  ]
  const actionButtonCompleted = (refId: string) => {
    setModalAlert({
      open: true,
      onClose: () => setModalAlert(undefined),
      icon: "CheckCircle",
      iconClassname: "text-emerald-800",
      title: "Are you sure?",
      description: "Do you really want to complete this order? This process cannot be undone. Make sure the order has been delivered to the customer.",
      refId: refId,
      buttons: [
        {
          label: "Complete Order",
          onClick: async () => {
            updateOrderStatus({
              status: OrderStatus.COMPLETED,
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
            console.log(modalAlert?.refId,'refId');
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
      <div className="grid grid-cols-12 gap-2">                
          <div className="col-span-12 overflow-x-auto scrollbar-hidden">
            <Table
              dataSource={data?.data || []}
              columns={tableColumnsAntd}
              rowKey={(d) => d.uuid || ""}
              rowClassName={() => styles.customTableRow}
              className={styles.customTableStyle}
              pagination={{
                total: data?.totalRecords || 0,
                defaultCurrent: pagination.page,
                defaultPageSize: pagination.limit,
                onChange: (page, limit) => {
                  setPagination({
                    ...pagination,
                    page,
                    limit,
                  });
                }
              }}
              expandable={screens.xs ? {
                expandedRowRender: (record) => (
                  <div>
                    <p>Created: {moment(record.createdAt).format("Y-MM-DD HH:mm")}</p>
                    <div className="flex justify-end mt-2">
                      <Button
                        className="flex items-center mr-2"
                        variant="outline-danger"
                        onClick={() => {
                          actionButtonCancel(record.uuid);
                        }}
                      >
                        <Lucide icon="Trash" className="w-4 h-4" />
                      </Button>
                      <Button
                        className="flex items-center"
                        variant="primary"
                        onClick={() => {
                          actionButtonCompleted(record.uuid);
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
      </div>
  )
}