
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const TagsApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.TagsListApi,
    endpoints.TagsCreateApi,
    endpoints.TagsUpdateApi,
    endpoints.TagsDeleteApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const TagsApiHooks = new ZodiosHooks("tags", TagsApiClient);
