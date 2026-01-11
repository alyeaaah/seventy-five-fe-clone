import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import { ReactNode, useState } from "react";
import { MerchProductsApiHooks } from "./api";
import { MerchProductsData } from "./api/schema";
import { useDebounce } from "ahooks";
import { queryClient } from "@/utils/react-query";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { useToast } from "@/components/Toast/ToastContext";
import Table, { ColumnsType } from "antd/es/table";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";
import { useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
import Image from "@/components/Image";
import moment from "moment";
import Tippy from "@/components/Base/Tippy";

export function Merchandise() {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [filter, setFilter] = useState({
    type: "",
    search: "",
  });
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const { showNotification } = useToast();

  const { mutate: actionDeleteMerchProduct } = MerchProductsApiHooks.useDeleteMerchProducts(
    {
      params: {
        uuid: modalAlert?.refId || 0
      }
    },
    {
      onSuccess: () => {
        showNotification({
          duration: 3000,
          text: "MerchProduct deleted successfully",
          icon: "WashingMachine",
          variant: "danger",
        });
        setModalAlert(undefined);
        queryClient.invalidateQueries({
          queryKey: MerchProductsApiHooks.getKeyByAlias("getMerchProducts"),
        });
      }
    }
  );
  const { data, isLoading, refetch } = MerchProductsApiHooks.useGetMerchProducts(
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
  const { mutate: actionFeaturedMerchandise } = MerchProductsApiHooks.useToggleFeaturedMerchProducts(
    {
      params: {
        uuid: modalAlert?.refId || 0
      }
    },
    {
      onSuccess: () => {
        showNotification({
          duration: 3000,
          text: "MerchProduct featured successfully",
          icon: "Star",
          variant: "success",
        });
        setModalAlert(undefined);
        queryClient.invalidateQueries({
          queryKey: MerchProductsApiHooks.getKeyByAlias("getMerchProducts"),
        });
      }
    }
  );
  const handleDeleteMerchProduct = (refId: string) => {
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
            actionDeleteMerchProduct(undefined);
          },
          variant: "danger"
        }
      ]
    });
  };
  const handleFeaturedMerchandise = (refId: string) => {
    setModalAlert({
      open: true,
      onClose: () => setModalAlert(undefined),
      icon: "Star",
      iconClassname: "text-success",
      title: "Are you sure?",
      description: "Do you really want to featured this item? This process cannot be undone.",
      refId: refId,
      buttons: [
        {
          label: "Cancel",
          onClick: () => setModalAlert(undefined),
          variant: "secondary"
        },
        {
          label: "Set as Featured",
          onClick: () => {
            // Handle featured logic here
            actionFeaturedMerchandise(undefined);
          },
          variant: "primary"
        }
      ]
    });
  };

  const tableColumnsAntd: ColumnsType<MerchProductsData> = [
    {
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      render: (_, record) => (
        <div className="col-span-12 sm:col-span-3 grid grid-cols-12 gap-2 box shadow-md overflow-hidden rounded-xl p-2 relative">
          <div className="absolute right-0 top-0 z-10 bg-[#00000030] p-2 rounded-bl-md">
            <Button
              size="sm"
              className="w-full flex align-middle border-white text-white"
              onClick={() => navigate(paths.administrator.merchandise.edit({ id: record.uuid }).$)}
            >
              <Lucide icon="Pencil" className="h-full" />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              className="w-full flex align-middle mt-2"
              onClick={() => handleDeleteMerchProduct(record.uuid)}
            >
              <Lucide icon="Trash" className="h-full" />
            </Button>
          </div>
          <div className="absolute left-0 top-0 z-10 p-2">
            <Tippy
              as="div"
              className=""
              content={`${record.featured_at ? "Featured at " + moment(record.featured_at).format("YYYY-MM-DD HH:mm:ss") : "Set as Featured Product"}`}
            >
              <Button
                size="sm"
                className="w-full flex align-middle border-none shadow-none"
                onClick={() => handleFeaturedMerchandise(record.uuid)}
              >
                <Lucide icon={`${record.featured_at ? "Star" : "StarOff"}`} className={`h-full ${record.featured_at ? "text-yellow-500" : "text-gray-500"}`} />
              </Button>
            </Tippy>
          </div>
          {record.image_cover &&
            <div
              className="col-span-12 relative overflow-hidden h-56 cursor-pointer"
              onClick={() => navigate(paths.administrator.merchandise.detail({ id: record.uuid }).$)}>
              <Image
                src={record.image_cover}
                alt={record.name}
                className="object-cover h-full w-full rounded-md"
              />
            </div>
          }
          <div className="col-span-12  z-10 rounded-t-xl bg-white dark:bg-darkmode-600 py-2 cursor-pointer" onClick={() => navigate(paths.administrator.merchandise.detail({ id: record.uuid }).$)}>
            <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 line-clamp-2 text-ellipsis">{record.name}</h3>
            <p className="text-ellipsis line-clamp-2 break-after-all text-gray-500 dark:text-slate-400 text-xs h-8" dangerouslySetInnerHTML={{ __html: decodeURIComponent(record.description) }}></p>
            <div className="flex flex-row justify-between mt-2">
              <span className="text-sm text-gray-500 dark:text-slate-400 flex flex-row items-center"><Lucide icon="Box" className="h-4" />&nbsp;Stock:&nbsp;{record.details.reduce((acc, detail) => acc + detail.quantity, 0)}</span>
              <span className="text-base font-bold text-emerald-800 dark:text-emerald-400 flex flex-row items-center tracking-tight">
                Rp {(record.details.sort((a, b) => a.price - b.price)[0].price).toLocaleString("id")}
                {record.details.length > 1 && record.details.sort((a, b) => a.price - b.price)[0].price !== record.details.sort((a, b) => b.price - a.price)[0].price &&
                  <> - Rp {(record.details.sort((a, b) => b.price - a.price)[0].price).toLocaleString("id")}</>}
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleFilter = () => {
    refetch();
  };

  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">Merchandise</h2>
        <div className="flex">
          <Button variant="primary" className="mr-2 shadow-md" onClick={() => navigate(paths.administrator.merchandise.new)} >
            Add Product
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
                    queryClient.invalidateQueries({ queryKey: MerchProductsApiHooks.getKeyByAlias("getMerchProducts") });
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
            className="table-grid"
            dataSource={data?.data || []}
            columns={tableColumnsAntd}
            bordered={false}
            showHeader={false}
            rowKey="id"
            components={{
              body: {
                wrapper: ({ children }: { children: ReactNode }) => <tbody className="thumbnail-grid-body">{children}</tbody>,
                row: ({ children }: { children: ReactNode }) => <tr className="thumbnail-grid-row">{children}</tr>,
                cell: ({ children }: { children: ReactNode }) => <td className="thumbnail-grid-cell">{children}</td>,
              },
            }}
            pagination={{
              total: data?.totalRecords,
              defaultCurrent: page,
              defaultPageSize: limit,
              onChange: (page, limit) => {
                setPage(page);
                setLimit(limit);
              }
            }}
          />
        </div>
      </div>
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
    </>
  );
}
