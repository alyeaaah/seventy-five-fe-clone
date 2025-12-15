
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const SponsorsApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.SponsorsListApi,
    endpoints.SponsorsCreateApi,
    endpoints.SponsorsUpdateApi,
    endpoints.SponsorsDeleteApi,
    endpoints.SponsorsSlotApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const SponsorsApiHooks = new ZodiosHooks("sponsors", SponsorsApiClient);
