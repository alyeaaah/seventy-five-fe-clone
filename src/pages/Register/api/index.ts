
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const RegisterApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.RegisterApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const RegisterApiHooks = new ZodiosHooks("register", RegisterApiClient);
