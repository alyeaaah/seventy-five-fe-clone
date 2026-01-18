import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import {
  tournamentGroupPayloadSchema,
  tournamentMatchDetailSchema,
  tournamentMatchPayloadSchema,
  tournamentMatchSchema,
  tournamentParticipantsSchema,
  tournamentPointsSchema,
  tournamentSponsorSchema,
  tournamentsSchema,
  tournamentTeamsSchema,
} from "./schema";
import { sponsorsSchema } from "../../MasterData/Sponsors/api/schema";

const TournamentsListApi = makeEndpoint({
  alias: "getTournamentsList",
  method: "get",
  path: `/tournament/list`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z
    .object({
      data: z.array(tournamentsSchema),
      currentPage: z.number(),
      totalRecords: z.number(),
      totalPages: z.number()
    })
});

const TournamentsDetailApi = makeEndpoint({
  alias: "getTournamentsDetail",
  method: "get",
  path: `/tournament/detail/:uuid`,
  response: z
    .object({
      data: tournamentsSchema,
    })
});

const TournamentsCreateApi = makeEndpoint({
  alias: "createTournament",
  method: "post",
  path: `/tournament/create`,
  parameters: parametersBuilder().addBody(tournamentsSchema).build(),
  response: z
    .object({data: tournamentsSchema})
});

const TournamentsUpdateApi = makeEndpoint({
  alias: "updateTournament",
  method: "put",
  path: `/tournament/edit/:uuid`,
  parameters: parametersBuilder().addBody(tournamentsSchema).build(),
  response: z
    .object({
      data: tournamentsSchema,
    })
});

const TournamentsDeleteApi = makeEndpoint({
  alias: "deleteTournament",
  method: "delete",
  path: `/tournament/delete/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});
const TournamentsPublishApi = makeEndpoint({
  alias: "publishTournament",
  method: "put",
  path: `/tournament/publish/:uuid`,
  parameters: parametersBuilder().addQueries({
    unpublish: z.boolean().optional(),
  }).build(),
  response: z
    .object({
      message: z.string(),
    })
});
const TournamentsUpdateStatusApi = makeEndpoint({
  alias: "updateTournamentStatus",
  method: "put",
  path: `/tournament/edit/status/:uuid`,
  parameters: parametersBuilder().addBody(z.object({
    status: z.enum(["DRAFT", "POSTPONED", "CANCELLED", "ENDED", "ONGOING"]),
  })).build(),
  response: z
    .object({
      message: z.string(),
    })
});

const TournamentsParticipantsApi = makeEndpoint({
  alias: "getTournamentParticipants",
  method: "get",
  path: `/tournament/detail/participants/:uuid`,
  response: z
    .object({
      data: tournamentParticipantsSchema,
    })
});

const TournamentsUpdateParticipantsApi = makeEndpoint({
  alias: "updateTournamentParticipants",
  method: "put",
  path: `/tournament/edit/participant/:uuid`,
  parameters: parametersBuilder().addBody(tournamentParticipantsSchema).build(),
  response: z
    .object({
      data: tournamentParticipantsSchema,
    })
});

const TournamentsTeamsApi = makeEndpoint({
  alias: "getTournamentTeams",
  method: "get",
  path: `/tournament/detail/teams/:uuid`,
  response: z
    .object({
      data: z.array(tournamentTeamsSchema),
    })
});

const TournamentsPointsApi = makeEndpoint({
  alias: "getTournamentPoints",
  method: "get",
  path: `/tournament/detail/points/:uuid`,
  response: z
    .object({
      data: tournamentPointsSchema,
    })
});

const TournamentsUpdatePointsApi = makeEndpoint({
  alias: "updateTournamentPoints",
  method: "put",
  path: `/tournament/edit/points/:uuid`,
  parameters: parametersBuilder().addBody(tournamentPointsSchema).build(),
  response: z
    .object({
      data: tournamentPointsSchema,
    })
});

const TournamentsCreateMatchesApi = makeEndpoint({
  alias: "createTournamentMatches",
  method: "post",
  path: `/match/update`,
  parameters: parametersBuilder().addBody(tournamentMatchPayloadSchema).build(),
  response: z
    .object({
      data: z.array(tournamentMatchSchema),
    })
});

const TournamentsUpdateMatchesApi = makeEndpoint({
  alias: "updateTournamentMatches",
  method: "post",
  path: `/match/generate`,
  parameters: parametersBuilder().addBody(tournamentMatchPayloadSchema).build(),
  response: z
    .object({
      data: z.array(tournamentMatchSchema),
    })
});

const TournamentsMatchesApi = makeEndpoint({
  alias: "getTournamentMatches",
  method: "get",
  path: `/match/list`,
  parameters: parametersBuilder().addQueries({
    tournament_uuid: z.string(),
  }).build(),
  response: z
    .object({
      data: z.array(tournamentMatchDetailSchema),
    })
});

const TournamentsSponsorsApi = makeEndpoint({
  alias: "getTournamentSponsors",
  method: "get",
  path: `/tournament/:uuid/sponsors`,
  response: z
    .object({
      data: z.array(sponsorsSchema.extend({
        sponsor_uuid: z.string(),
      })),
    })
});

const TournamentsSponsorsUpdateApi = makeEndpoint({
  alias: "updateTournamentSponsors",
  method: "put",
  path: `/tournament/:uuid/sponsors`,
  parameters: parametersBuilder()
  .addBody(
    z.object({
      sponsors: z.array(
        tournamentSponsorSchema
      )
    })
  ).build(),
  response: z
    .object({
      message: z.string(),
      data: z.array(sponsorsSchema.extend({
        sponsor_uuid: z.string(),
      })).nullish(),
    })
});

const TournamentsToggleFeaturedApi = makeEndpoint({
  alias: "toggleFeaturedTournament",
  method: "put",
  path: `/tournament/toggle-featured/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});

const TournamentsUpdateGroupsApi = makeEndpoint({
  alias: "updateTournamentGroups",
  method: "put",
  path: `/tournament/edit/groups/:uuid`,
  parameters: parametersBuilder().addBody(tournamentGroupPayloadSchema).build(),
  response: z
    .object({
      message: z.string(),
    })
});

export const endpoints = {
  TournamentsListApi,
  TournamentsCreateApi,
  TournamentsUpdateApi,
  TournamentsDeleteApi,
  TournamentsPublishApi,
  TournamentsUpdateStatusApi,
  TournamentsDetailApi,
  TournamentsTeamsApi,
  TournamentsParticipantsApi,
  TournamentsUpdateParticipantsApi,
  TournamentsPointsApi,
  TournamentsUpdatePointsApi,
  TournamentsUpdateMatchesApi,
  TournamentsCreateMatchesApi,
  TournamentsMatchesApi,
  TournamentsToggleFeaturedApi,
  TournamentsSponsorsApi,
  TournamentsSponsorsUpdateApi,
  TournamentsUpdateGroupsApi,
};