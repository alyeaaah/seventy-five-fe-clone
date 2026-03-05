import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const PublicWallOfFameApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.FeaturedWallOfFameApi,
    endpoints.WallOfFameDetailApi,
    endpoints.WallOfFameListApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const PublicWallOfFameApiHooks = new ZodiosHooks("publicWallOfFame", PublicWallOfFameApiClient);
