
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const CustomMatchApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.CustomMatchListApi,
    endpoints.CustomMatchCreateApi,
    endpoints.CustomMatchUpdateApi,
    endpoints.CustomMatchDeleteApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const CustomMatchApiHooks = new ZodiosHooks("custom-match", CustomMatchApiClient);
