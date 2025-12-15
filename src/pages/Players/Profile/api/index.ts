
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const PlayerProfileApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.PlayersListApi,
    endpoints.PlayersUpdateApi,
    endpoints.PlayersAddressApi,
    endpoints.PlayersAddressUpdateApi,
    endpoints.PlayerGalleryApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const PlayerProfileApiHooks = new ZodiosHooks("players", PlayerProfileApiClient);
