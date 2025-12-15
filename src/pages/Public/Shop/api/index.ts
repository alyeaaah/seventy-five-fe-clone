
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const PublicShopApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.featuredMerchApi,
    endpoints.detailMerchApi,
    endpoints.provinceListApi,
    endpoints.cityListApi,
    endpoints.districtListApi,
    endpoints.checkoutApi,
    endpoints.shippingFeeApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const PublicShopApiHooks = new ZodiosHooks("publicShop", PublicShopApiClient);
