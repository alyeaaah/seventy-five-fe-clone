
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const PlayerHomeApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.PlayersListApi,
    endpoints.PlayersUpdateApi,
    endpoints.PlayersDetailApi,
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const PlayerHomeApiHooks = new ZodiosHooks("players", PlayerHomeApiClient);
