import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { tournamentMatchDetailSchema, tournamentsSchema } from "@/pages/Admin/Tournaments/api/schema";
import { matchesListSchema } from "@/pages/Admin/CustomMatch/api/schema";
import { publicTournamentDetailSchema, groupResponseSchema, draftPickSchema, tournamentJoinStatusSchema } from "./schema";
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

const tournamentDetailAuthApi = makeEndpoint({
  alias: "getTournamentDetailAuth",
  method: "get",
  path: `/player/tournament/:uuid`,
  response: z.object({
    data: publicTournamentDetailSchema
  })
});

const joinTournamentApi = makeEndpoint({
  alias: "joinTournament",
  method: "post",
  path: `/tournament/:uuid/join`,
  parameters: parametersBuilder().addBody(z.object({
    player_uuid: z.string().nullish()
  }).nullish()).build(),
  response: z.object({
    message: z.string(),
    status: z.enum(['REQUESTED', 'APPROVED', 'CONFIRMED', 'REJECTED'])
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

const getTournamentDraftPicksApi = makeEndpoint({
  alias: "getTournamentDraftPicks",
  method: "get",
  path: `/player/tournament/draft-pick/:uuid`,
  response: z.object({
    data: z.array(draftPickSchema)
  })
});

const assignTournamentDraftPickApi = makeEndpoint({
  alias: "assignTournamentDraftPick",
  method: "post",
  path: `/tournament/draft-pick/assign/:uuid`,
  parameters: parametersBuilder().addBody(z.object({
    player_uuid: z.string(),
    partner_uuid: z.string(),
  })).build(),
  response: z.object({
    message: z.string(),
  })
});

const getTournamentJoinStatusApi = makeEndpoint({
  alias: "getTournamentJoinStatus",
  method: "get",
  path: `/player/tournament/status/:uuid`,
  response: z.object({
    data: tournamentJoinStatusSchema
  })
});


export const endpoints = {
  featuredTournamentApi,
  tournamentDetailApi,
  tournamentDetailAuthApi,
  joinTournamentApi,
  tournamentDetailMatchesApi,
  tournamentDetailSponsorsApi,
  upcomingMatchApi,
  ongoingMatchApi,
  getGroupsByTournamentApi,
  getTournamentDraftPicksApi,
  assignTournamentDraftPickApi,
  getTournamentJoinStatusApi,
};