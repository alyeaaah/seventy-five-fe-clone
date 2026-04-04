
import { Zodios } from "@zodios/core";
import { endpoints } from "./endpoints";
import { ZodiosHooks } from "@zodios/react";
import { createAxiosInstance } from "@/utils/axios";
import { clientEnv } from "@/env";
export { endpoints };


export const PublicTournamentApiClient = new Zodios(
  clientEnv.API_BASE_URL,
  [
    endpoints.featuredTournamentApi,
    endpoints.upcomingMatchApi,
    endpoints.ongoingMatchApi,
    endpoints.tournamentDetailApi,
    endpoints.tournamentDetailAuthApi,
    endpoints.joinTournamentApi,
    endpoints.tournamentDetailMatchesApi,
    endpoints.tournamentDetailSponsorsApi,
    endpoints.getGroupsByTournamentApi,
    endpoints.getTournamentDraftPicksApi,
    endpoints.assignTournamentDraftPickApi,
    endpoints.getTournamentJoinStatusApi
  ],
  { validate: true, axiosInstance: createAxiosInstance() },
);

export const PublicTournamentApiHooks = new ZodiosHooks("publicTournament", PublicTournamentApiClient);
