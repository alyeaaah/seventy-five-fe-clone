
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const LevelsApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.LevelsListApi,
    endpoints.LevelsCreateApi,
    endpoints.LevelsUpdateApi,
    endpoints.LevelsDeleteApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const LevelsApiHooks = new ZodiosHooks("levels", LevelsApiClient);
