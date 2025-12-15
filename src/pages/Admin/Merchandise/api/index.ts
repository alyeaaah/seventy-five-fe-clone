
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const MerchProductsApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.MerchProductsListApi,
    endpoints.MerchProductsCreateApi,
    endpoints.MerchProductsUpdateApi,
    endpoints.MerchProductsDetailApi,
    endpoints.MerchProductsDeleteApi,
    endpoints.MerchProductsToggleFeaturedApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const MerchProductsApiHooks = new ZodiosHooks("merchProducts", MerchProductsApiClient);
