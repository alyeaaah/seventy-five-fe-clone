import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { galleriesMediaSchema } from "@/pages/Admin/Galleries/api/schema";
import { tournamentMatchDetailSchema, tournamentMatchSchema, tournamentsSchema } from "@/pages/Admin/Tournaments/api/schema";
import { matchesListSchema } from "@/pages/Admin/CustomMatch/api/schema";
import { publicTournamentDetailSchema, groupResponseSchema } from "./schema";
import { sponsorsSchema } from "@/pages/Admin/MasterData/Sponsors/api/schema";


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

const upcomingTournamentApi = makeEndpoint({
  alias: "getUpcomingTournament",
  method: "get",
  path: `/public/tournament/upcoming`,
  parameters: parametersBuilder().addQueries
    ({
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z.object({
    data: z.array(tournamentsSchema)
  })
});

const recentTournamentApi = makeEndpoint({
  alias: "getRecentTournament",
  method: "get",
  path: `/public/tournament/recent`,
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

const getGroupsByTournamentApi = makeEndpoint({
  alias: "getGroupsByTournament",
  method: "get",
  path: `/public/tournament/groups/:tournament_uuid`,
  response: z.object({
    data: z.array(groupResponseSchema)
  })
});

export const endpoints = {
  featuredTournamentApi,
  tournamentDetailApi,
  tournamentDetailMatchesApi,
  tournamentDetailSponsorsApi,
  upcomingMatchApi,
  ongoingMatchApi,
  getGroupsByTournamentApi
};