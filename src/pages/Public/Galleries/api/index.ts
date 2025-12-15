
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const PublicGalleryApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.FeaturedGalleryApi,
    endpoints.GalleryDetailAlbumApi,
    endpoints.GalleryAlbumsApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const PublicGalleryApiHooks = new ZodiosHooks("publicGallery", PublicGalleryApiClient);
