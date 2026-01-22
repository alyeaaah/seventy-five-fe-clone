
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const MatchDetailApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.MatchDetailApi,
    endpoints.MatchScoreUpdateApi,
    endpoints.MatchVideoUpdateApi,
    endpoints.MatchStatusUpdateApi,
    endpoints.MatchNextRoundApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const MatchDetailApiHooks = new ZodiosHooks("match", MatchDetailApiClient);
