
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const MerchOrderApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.MerchProductsListApi,
    endpoints.MerchProductsCreateApi,
    endpoints.MerchProductsUpdateApi,
    endpoints.MerchProductsDetailApi,
    endpoints.MerchProductsDeleteApi,
    endpoints.MerchProductsToggleFeaturedApi,
    endpoints.MerchOrderListApi,
    endpoints.MerchOrderUpdateStatusApi,
    endpoints.MerchOrderDetailApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const MerchOrderApiHooks = new ZodiosHooks("merchOrder", MerchOrderApiClient);
