import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { tournamentMatchDetailSchema, tournamentsSchema } from "@/pages/Admin/Tournaments/api/schema";
import { matchesListSchema } from "@/pages/Admin/CustomMatch/api/schema";
import { publicTournamentDetailSchema } from "./schema";
import { sponsorsSchema } from "@/pages/Admin/MasterData/Sponsors/api/schema";
import { matchStatusEnum } from "@/pages/Admin/MatchDetail/api/schema";


const featuredTournamentApi = makeEndpoint({
  alias: "getFeaturedTournament",
  method: "get",
  path: `/public/tournament/featured`,
  parameters: parametersBuilder().addQueries
    ({
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z.object({
    data: z.array(tournamentsSchema)
  })
});

const tournamentDetailApi = makeEndpoint({
  alias: "getTournamentDetail",
  method: "get",
  path: `/public/tournament/:uuid`,
  response: z.object({
    data: publicTournamentDetailSchema
  })
});

const tournamentDetailMatchesApi = makeEndpoint({
  alias: "getTournamentDetailMatches",
  method: "get",
  path: `/public/tournament/:tournament_uuid/matches`,
  response: z.object({
    data: z.array(tournamentMatchDetailSchema),
    
  })
});
const tournamentDetailSponsorsApi = makeEndpoint({
  alias: "getTournamentDetailSponsors",
  method: "get",
  path: `/public/tournament/:tournament_uuid/sponsors`,
    response: z
      .object({
        data: z.array(sponsorsSchema.extend({
          sponsor_uuid: z.string(),
        })),
      })
    
});

const upcomingMatchApi = makeEndpoint({
  alias: "getUpcomingMatch",
  method: "get",
  path: `/public/match/upcoming`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: matchesListSchema
});
const ongoingMatchApi = makeEndpoint({
  alias: "getOngoingMatch",
  method: "get",
  path: `/public/match/ongoing`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: matchesListSchema
});


const recentMatchApi = makeEndpoint({
  alias: "getMatches",
  method: "get",
  path: `/public/matches`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().nullish(),
      page: z.number().nullish(),
      limit: z.number().nullish(),
      player: z.string().nullish(),
      status: z.union([matchStatusEnum, z.array(matchStatusEnum)]).nullish(),
  }).build(),
  response: matchesListSchema
});

export const endpoints = {
  featuredTournamentApi,
  tournamentDetailApi,
  tournamentDetailMatchesApi,
  tournamentDetailSponsorsApi,
  upcomingMatchApi,
  ongoingMatchApi,
  recentMatchApi
};