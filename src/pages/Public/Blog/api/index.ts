
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const PublicBlogApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.BlogPostsListApi,
    endpoints.BlogFeaturedListApi,
    endpoints.BlogPostsDetailApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const PublicBlogApiHooks = new ZodiosHooks("publicBlog", PublicBlogApiClient);
