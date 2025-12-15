import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import { ReactNode, useState } from "react";
import { BlogPostsApiHooks } from "./api";
import { BlogPostsData } from "./api/schema";
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
import { imageResizer } from "@/utils/helper";
import Tippy from "@/components/Base/Tippy";

export default function BlogPosts() {
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

  const { mutate: actionDeleteBlogPost } = BlogPostsApiHooks.useDeleteBlogPosts(
    {
      params: {
        uuid: modalAlert?.refId || 0
      }
    },
    {
      onSuccess: () => {
        showNotification({
          duration: 3000,
          text: "BlogPost deleted successfully",
          icon: "WashingMachine",
          variant: "danger",
        });
        setModalAlert(undefined);
        queryClient.invalidateQueries({
          queryKey: BlogPostsApiHooks.getKeyByAlias("getBlogPosts"),
        });
      }
    }
  );
  const { mutate: actionFeaturedBlogPost } = BlogPostsApiHooks.useToggleBlogPostFeatured(
    {
      params: {
        uuid: modalAlert?.refId || 0
      }
    },
    {
      onSuccess: () => {
        showNotification({
          duration: 3000,
          text: "BlogPost featured successfully",
          icon: "WashingMachine",
          variant: "success",
        });
        setModalAlert(undefined);
        queryClient.invalidateQueries({
          queryKey: BlogPostsApiHooks.getKeyByAlias("getBlogPosts"),
        });
      }
    }
  );
  const { data, isLoading, refetch } = BlogPostsApiHooks.useGetBlogPosts(
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
  const handleDeleteBlogPost = (refId: string) => {
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
            actionDeleteBlogPost(undefined);
          },
          variant: "danger"
        }
      ]
    });
  };
  const handleFeaturedBlogPost = (refId: string) => {
    setModalAlert({
      open: true,
      onClose: () => setModalAlert(undefined),
      icon: "Star",
      iconClassname: "text-success",
      title: "Are you sure?",
      description: "Do you really want to featured this blog post? This process cannot be undone.",
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
            actionFeaturedBlogPost(undefined);
          },
          variant: "primary"
        }
      ]
    });
  };

  const tableColumnsAntd: ColumnsType<BlogPostsData> = [
    {
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      render: (_, record) => (
        <div className="col-span-12 sm:col-span-3 grid grid-cols-12 gap-2 box shadow-md overflow-hidden rounded-xl pb-0 relative">
          <div className="absolute right-0 top-0 z-10 bg-[#00000030] p-2 rounded-bl-md">
            <Button
              size="sm"
              className="w-full flex align-middle border-white text-white"
              onClick={() => navigate(paths.administrator.blog.edit({ id: record.uuid }).$)}
            >
              <Lucide icon="Pencil" className="h-full" />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              className="w-full flex align-middle mt-2"
              onClick={() => handleDeleteBlogPost(record.uuid)}
            >
              <Lucide icon="Trash" className="h-full" />
            </Button>
          </div>
          <div className="absolute left-0 top-0 z-10 p-2">

            <Tippy
              as="div"
              className=""
              content={`${record.featured_at ? "Featured at " + moment(record.featured_at).format("YYYY-MM-DD HH:mm:ss") : "Set as Featured Post"}`}
            >
              <Button
                size="sm"
                className="w-full flex align-middle border-none shadow-none"
                onClick={() => handleFeaturedBlogPost(record.uuid)}
              >
                <Lucide icon={`${record.featured_at ? "Star" : "StarOff"}`} className={`h-full ${record.featured_at ? "text-yellow-500" : "text-gray-500"}`} />
              </Button>
            </Tippy>
          </div>
          {record.image_cover &&
            <div
              className="col-span-12 relative overflow-hidden h-56 cursor-pointer"
              onClick={() => navigate(paths.administrator.blog.detail({ id: record.uuid }).$)}>
              <Image
                src={imageResizer(record.image_cover || "", 360)}
                alt={record.title}
                className="object-cover h-full w-full"
              />
            </div>
          }
          <div className="h-20"></div>
          <div className="col-span-12  mt-[-20px] z-10 rounded-t-xl bg-white px-3 py-2 cursor-pointer absolute bottom-0" onClick={() => navigate(paths.administrator.blog.detail({ id: record.uuid }).$)}>
            <h3 className="text-lg font-bold text-emerald-800 line-clamp-2 text-ellipsis">{record.title}</h3>
            <p className="text-ellipsis line-clamp-2 break-after-all text-gray-500 text-xs h-8" dangerouslySetInnerHTML={{ __html: decodeURIComponent(record.content) }}></p>
            <div className="flex flex-row justify-between mt-2">
              <span className="text-xs text-gray-500 flex flex-row items-center"><Lucide icon="User" className="h-4" />&nbsp;Author:&nbsp;{record.author}</span>
              <span className="text-xs text-gray-500 flex flex-row items-center"><Lucide icon="Calendar" className="h-4" />&nbsp;{moment(record.createdAt).format('YYYY-MM-DD')}</span>
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
        <h2 className="mr-auto text-lg font-medium">Blog Post</h2>
        <div className="flex">
          <Button variant="primary" className="mr-2 shadow-md" onClick={() => navigate(paths.administrator.blog.new.index)} >
            Create Blog Post
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
                    queryClient.invalidateQueries({ queryKey: BlogPostsApiHooks.getKeyByAlias("getBlogPosts") });
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
        iconClassname={modalAlert?.iconClassname}
        title={modalAlert?.title || ""}
        description={modalAlert?.description || ""}
        refId={modalAlert?.refId}
        buttons={modalAlert?.buttons}
      />
    </>
  );
}
