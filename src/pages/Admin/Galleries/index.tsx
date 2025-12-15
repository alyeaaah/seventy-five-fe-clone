import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import { ReactNode, useState } from "react";
import { GalleriesApiHooks } from "./api";
import { GalleriesData } from "./api/schema";
import { useDebounce } from "ahooks";
import { queryClient } from "@/utils/react-query";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { useToast } from "@/components/Toast/ToastContext";
import Table, { ColumnsType } from "antd/es/table";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";
import { useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
import Image from "@/components/Image";
import { imageResizer } from "@/utils/helper";

export default function Galleries() {
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

  const { mutate: actionDeleteGallery } = GalleriesApiHooks.useDeleteGalleries(
    {
      params: {
        uuid: modalAlert?.refId || 0
      }
    },
    {
      onSuccess: () => {
        showNotification({
          duration: 3000,
          text: "Gallery deleted successfully",
          icon: "WashingMachine",
          variant: "danger",
        });
        setModalAlert(undefined);
        queryClient.invalidateQueries({
          queryKey: GalleriesApiHooks.getKeyByAlias("getGalleries"),
        });
      }
    }
  );
  const { data, isLoading, refetch } = GalleriesApiHooks.useGetGalleries(
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
  const handleDeleteGallery = (refId: string) => {
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
            actionDeleteGallery(undefined);
          },
          variant: "danger"
        }
      ]
    });
  };

  const tableColumnsAntd: ColumnsType<GalleriesData> = [
    {
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      render: (_, record) => (
        <div className="col-span-12 sm:col-span-3 grid grid-cols-12 gap-2 box shadow-md overflow-hidden rounded-xl pb-2 relative">
          <div className="absolute right-2 top-2 z-10">
            <Button
              variant="primary"
              size="sm"
              className="w-full flex align-middle"
              onClick={() => navigate(paths.administrator.galleries.edit({ id: record.uuid }).$)}
            >
              <Lucide icon="Pencil" className="h-full" />
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="w-full flex align-middle mt-2"
              onClick={() => handleDeleteGallery(record.uuid)}
            >
              <Lucide icon="Trash" className="h-full" />
            </Button>
          </div>
          {record.media &&
            <div
              className="col-span-12 relative overflow-hidden h-48 cursor-pointer"
              onClick={() => navigate(paths.administrator.galleries.detail({ id: record.uuid }).$)}>
              <Image
                src={imageResizer(record.media.link, 360)}
                alt={record.name}
                className="object-cover h-48 w-full"
              />
            </div>
          }
          <div className="col-span-12  mt-[-20px] z-10 rounded-t-xl bg-white p-4 cursor-pointer" onClick={() => navigate(paths.administrator.galleries.detail({ id: record.uuid }).$)}>
            <h3 className="text-lg font-bold text-emerald-800">{record.name}</h3>
            <p className="text-ellipsis line-clamp-2 break-after-all text-gray-500 text-xs h-8">{record.description}</p>
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
        <h2 className="mr-auto text-lg font-medium">Album Gallery</h2>
        <div className="flex">
          <Button variant="primary" className="mr-2 shadow-md" onClick={() => navigate(paths.administrator.galleries.new.index)} >
            Add New Album
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
                    queryClient.invalidateQueries({ queryKey: GalleriesApiHooks.getKeyByAlias("getGalleries") });
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
        title={modalAlert?.title || ""}
        description={modalAlert?.description || ""}
        refId={modalAlert?.refId}
        buttons={modalAlert?.buttons}
      />
    </>
  );
}
