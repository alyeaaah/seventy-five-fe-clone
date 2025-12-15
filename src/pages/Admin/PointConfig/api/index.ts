
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const PointConfigurationsApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.PointConfigurationsListApi,
    endpoints.PointConfigurationsDropdownApi,
    endpoints.PointConfigurationsCreateApi,
    endpoints.PointConfigurationsUpdateApi,
    endpoints.PointConfigurationsDeleteApi,
    endpoints.PointConfigurationsDetailApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const PointConfigurationsApiHooks = new ZodiosHooks("pointConfigurations", PointConfigurationsApiClient);
