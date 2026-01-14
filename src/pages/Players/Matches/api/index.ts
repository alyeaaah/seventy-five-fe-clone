
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const PlayerMatchApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.playerMatchesApi,
    endpoints.playerTournamentsJoinedApi,
    endpoints.playerTournamentsUpcomingApi,
    endpoints.openChallengerApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const PlayerMatchApiHooks = new ZodiosHooks("players", PlayerMatchApiClient);
