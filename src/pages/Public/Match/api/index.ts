
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const PublicMatchApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.matchDetailApi,
    endpoints.pointConfigApi,
    endpoints.getKudosListApi,
    endpoints.giveKudosApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const PublicMatchApiHooks = new ZodiosHooks("publicMatch", PublicMatchApiClient);
