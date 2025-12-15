
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const KudosApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.KudosListApi,
    endpoints.KudosCreateApi,
    endpoints.KudosUpdateApi,
    endpoints.KudosDeleteApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const KudosApiHooks = new ZodiosHooks("kudos", KudosApiClient);
