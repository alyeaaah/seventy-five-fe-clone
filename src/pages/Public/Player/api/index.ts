
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const PublicPlayerApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.playerDetailApi,
    endpoints.playerRelatedApi,
    endpoints.playerStandingsApi,
    endpoints.playerRankApi,
    endpoints.playerMatchesApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const PublicPlayerApiHooks = new ZodiosHooks("publicPlayer", PublicPlayerApiClient);
