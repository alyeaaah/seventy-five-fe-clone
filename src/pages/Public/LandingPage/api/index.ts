
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const LandingPageApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.featuredPlayerApi,
    endpoints.featuredBlogApi,
    endpoints.sponsorsBySlot,
    endpoints.levelListApi,
    endpoints.leagueListApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const LandingPageApiHooks = new ZodiosHooks("landingPage", LandingPageApiClient);
