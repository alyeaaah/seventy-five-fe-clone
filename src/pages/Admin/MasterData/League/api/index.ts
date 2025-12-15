
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const LeagueApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.LeagueListApi,
    endpoints.LeagueCreateApi,
    endpoints.LeagueUpdateApi,
    endpoints.LeagueDeleteApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const LeagueApiHooks = new ZodiosHooks("league", LeagueApiClient);
