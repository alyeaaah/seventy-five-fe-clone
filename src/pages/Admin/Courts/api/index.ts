
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const CourtsApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.CourtsListApi,
    endpoints.CourtsCreateApi,
    endpoints.CourtsUpdateApi,
    endpoints.CourtsDeleteApi,
    endpoints.CourtsDetailApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const CourtsApiHooks = new ZodiosHooks("courts", CourtsApiClient);
