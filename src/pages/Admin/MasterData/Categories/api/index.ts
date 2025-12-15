
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const CategoriesApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.CategoriesListApi,
    endpoints.CategoriesCreateApi,
    endpoints.CategoriesUpdateApi,
    endpoints.CategoriesDeleteApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const CategoriesApiHooks = new ZodiosHooks("categories", CategoriesApiClient);
