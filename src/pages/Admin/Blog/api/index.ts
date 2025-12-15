
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const BlogPostsApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.BlogPostsListApi,
    endpoints.BlogPostsCreateApi,
    endpoints.BlogPostsUpdateApi,
    endpoints.BlogPostsDetailApi,
    endpoints.BlogPostsDeleteApi,
    endpoints.BlogPostToggleFeaturedApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const BlogPostsApiHooks = new ZodiosHooks("blogPosts", BlogPostsApiClient);
