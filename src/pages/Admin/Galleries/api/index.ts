
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const GalleriesApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.GalleriesListApi,
    endpoints.GalleriesCreateApi,
    endpoints.GalleriesUpdateApi,
    endpoints.GalleriesDetailApi,
    endpoints.GalleriesDeleteApi,
    endpoints.GalleriesToggleFeaturedApi,
    endpoints.UpdateGalleryPlayersApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const GalleriesApiHooks = new ZodiosHooks("galleries", GalleriesApiClient);
