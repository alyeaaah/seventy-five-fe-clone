
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const TournamentsApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.TournamentsListApi,
    endpoints.TournamentsCreateApi,
    endpoints.TournamentsUpdateApi,
    endpoints.TournamentsDeleteApi,
    endpoints.TournamentsPublishApi,
    endpoints.TournamentsUpdateStatusApi,
    endpoints.TournamentsDetailApi,
    endpoints.TournamentsParticipantsApi,
    endpoints.TournamentsTeamsApi,
    endpoints.TournamentsUpdateParticipantsApi,
    endpoints.TournamentsPointsApi,
    endpoints.TournamentsUpdatePointsApi,
    endpoints.TournamentsUpdateMatchesApi,
    endpoints.TournamentsCreateMatchesApi,
    endpoints.TournamentsMatchesApi,
    endpoints.TournamentsToggleFeaturedApi,
    endpoints.TournamentsSponsorsApi,
    endpoints.TournamentsSponsorsUpdateApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const TournamentsApiHooks = new ZodiosHooks("tournaments", TournamentsApiClient);
