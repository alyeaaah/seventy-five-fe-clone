import { Zodios } from "@zodios/core";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
import { endpoints } from "./endpoints";

export { endpoints };

export const RefereeApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.ValidateMatchCodeApi,
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const RefereeApiHooks = new ZodiosHooks("referee", RefereeApiClient);