
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const GeneralReportApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.GeneralReportApi,
    endpoints.TopPlayersApi,
    endpoints.UpcomingTournamentsApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const GeneralReportApiHooks = new ZodiosHooks("general-report", GeneralReportApiClient);
