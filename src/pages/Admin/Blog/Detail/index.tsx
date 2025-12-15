import { useState } from "react";
import { BlogPostsApiHooks } from "../api";
import { useToast } from "@/components/Toast/ToastContext";
import {
  Divider
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import { AlertProps } from "@/components/Modal/Confirmation";
import Image from "@/components/Image";
import Lucide from "@/components/Base/Lucide";
import moment from "moment";
import Button from "@/components/Base/Button";
interface Props {
  blogPost?: string;
}

export const BlogPostsDetail = (props: Props) => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.administrator.blog.edit);
  const { id: blogPostUuid } = queryParams;
  const { data } = BlogPostsApiHooks.useGetBlogPostsDetail({
    params: {
      uuid: blogPostUuid || 0
    }
  }, {
    onSuccess: (data) => {
    },
    enabled: !!blogPostUuid
  });

  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium flex flex-row items-center">Blog Post Preview: {data?.data?.title}
          <Button
            onClick={() => navigate(paths.administrator.blog.edit({ id: blogPostUuid }).$)}
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
          <div className="col-span-12 sm:col-span-12 w-full relative">
            <Image src={data?.data?.image_cover} alt={data?.data?.title} className="object-cover h-full w-full rounded-md" />
          </div>
          <div className="col-span-12 sm:col-span-12">
            <span className="text-xl font-bold">{data?.data?.title}</span>
            <div className="flex flex-row items-center">
              <Lucide icon="Calendar" className="h-4 w-4" />&nbsp;Created on:&nbsp;{moment(data?.data?.createdAt).format('YYYY-MM-DD')}&nbsp;|&nbsp;<Lucide icon="User" className="h-4 w-4" />&nbsp;Author:&nbsp;{data?.data?.author}
            </div>
          </div>
          <Divider className="col-span-12 my-0"/>
          <div className="col-span-12 sm:col-span-12">
            <div dangerouslySetInnerHTML={{ __html: decodeURIComponent(data?.data?.content || '') }}></div>
          </div>
          <div className="col-span-12 ">
            {
              data?.data?.tags?.map(d =>
              (
                <div
                  key={d.tag_uuid}
                  className="inline-flex flex-row text-xs bg-[#065740] text-[#f6d05d] rounded-lg mr-2 mb-2 hover:cursor-pointer hover:bg-[#0e3228] overflow-hidden"
                >
                  <span className="flex flex-col py-1 px-2">#{d.name}</span>
                </div>
              ))
          }
          </div>
        </div>
      </div>
    </>
  )
}