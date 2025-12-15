import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import { useState } from "react";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { useToast } from "@/components/Toast/ToastContext";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";
import { useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
import { Menu, Tab } from "@/components/Base/Headless";
import { Ordered } from "./components/Ordered";
import { OnProcess } from "./components/OnProcess";
import { Delivered } from "./components/Delivered";
import { Completed } from "./components/Completed";
import { Cancelled } from "./components/Cancelled";
import { OrderDetail } from "./Detail";
import { Modal } from "antd";

export function Orders() {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const [modalDetail, setModalDetail] = useState<string | undefined>(undefined);
  const { showNotification } = useToast();

  const EmptyState: React.FC<{ additionalText?: string }> = ({ additionalText }) => {
    return (
      <div className="flex flex-col items-center justify-center h-full my-12">
        <Lucide icon="ShoppingCart" className="h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium">No orders found</h3>
        <p className="text-gray-500 mt-2">You have no orders {additionalText} yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">Merch Orders</h2>
        <div className="flex">
          <Button variant="primary" className="mr-2 shadow-md" onClick={() => navigate(paths.administrator.merchandise.new)} >
            Create Order
          </Button>
        </div>
      </div>
      {/* BEGIN: HTML Table Data */}
      <Tab.Group className="">
        <div className="p-2 mt-5 intro-y box">
          <div className="flex flex-col sm:flex-row sm:items-end xl:items-start">
            <Tab.List variant="pills">
              <Tab>
                <Tab.Button className="w-full py-2 whitespace-nowrap" as="button">
                  ORDERED
                </Tab.Button>
              </Tab>
              <Tab>
                <Tab.Button className="w-full py-2 whitespace-nowrap" as="button">
                  ON PROCESS
                </Tab.Button>
              </Tab>
              <Tab>
                <Tab.Button className="w-full py-2" as="button">
                  DELIVERED
                </Tab.Button>
              </Tab>
              <Tab>
                <Tab.Button className="w-full py-2" as="button">
                  COMPLETED
                </Tab.Button>
              </Tab>
              <Tab>
                <Tab.Button className="w-full py-2" as="button">
                  CANCELLED
                </Tab.Button>
              </Tab>
            </Tab.List>
          </div>
        </div>
        <div className="p-2 mt-5 intro-y box">
          <Tab.Panels>
            <Tab.Panel>
              {/* ORDERED */}
              <Ordered openDetail={(orderId: string) => setModalDetail(orderId)} />
              {/* <EmptyState additionalText="" /> */}
            </Tab.Panel>
            <Tab.Panel>
              {/* ON PROCESS */}
              <OnProcess openDetail={(orderId: string) => setModalDetail(orderId)} />
              {/* <EmptyState additionalText="processed" /> */}
            </Tab.Panel>
            <Tab.Panel>
              {/* DELIVERED */}
              <Delivered openDetail={(orderId: string) => setModalDetail(orderId)} />
              {/* <EmptyState additionalText="delivered" /> */}
            </Tab.Panel>
            <Tab.Panel>
              {/* COMPLETED */}
              <Completed openDetail={(orderId: string) => setModalDetail(orderId)} />
              {/* <EmptyState additionalText="completed" /> */}
            </Tab.Panel>
            <Tab.Panel>
              {/* CANCELLED */}
              <Cancelled openDetail={(orderId: string) => setModalDetail(orderId)} />
              <EmptyState additionalText="cancelled" />
            </Tab.Panel>
          </Tab.Panels>
        </div>
      </Tab.Group>
      <Confirmation
        open={!!modalAlert?.open} 
        onClose={() => setModalAlert(undefined)}
        icon={modalAlert?.icon || "Info"}
        iconClassname={modalAlert?.iconClassname || ""}
        title={modalAlert?.title || ""}
        description={modalAlert?.description || ""}
        refId={modalAlert?.refId}
        buttons={modalAlert?.buttons}
      />
      <Modal
        open={!!modalDetail}
        onCancel={() => setModalDetail(undefined)}
        closeIcon={false}
        footer={null}
        width={"100%"}
        height={"70vh"}
        style={{ bottom: 0 }}
      >
        <OrderDetail orderId={modalDetail || ""} />
      </Modal>
    </>
  );
}
