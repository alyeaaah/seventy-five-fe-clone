
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const adminApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.loginApi,
    endpoints.userDataApi,
    endpoints.mediaUploadApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const adminApiHooks = new ZodiosHooks("login", adminApiClient);
