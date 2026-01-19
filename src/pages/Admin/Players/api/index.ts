
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const PlayersApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.PlayersListApi,
    endpoints.PlayersCreateApi,
    endpoints.PlayersUpdateApi,
    endpoints.PlayersDeleteApi,
    endpoints.PlayersDetailApi,
    endpoints.PlayersToggleFeaturedApi,
    endpoints.PlayersChangeRoleApi,
    endpoints.PlayersQuickAddApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const PlayersApiHooks = new ZodiosHooks("players", PlayersApiClient);
