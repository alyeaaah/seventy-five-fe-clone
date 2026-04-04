import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import {
  tournamentGroupPayloadSchema,
  tournamentGroupOnlyPayloadSchema,
  tournamentMatchDetailSchema,
  tournamentMatchPayloadSchema,
  tournamentMatchSchema,
  tournamentParticipantsSchema,
  tournamentPointsSchema,
  tournamentSponsorSchema,
  tournamentsSchema,
  tournamentTeamsSchema,
  updateMatchPayloadSchema,
  draftPickPayloadSchema,
} from "./schema";
import { sponsorsSchema } from "../../MasterData/Sponsors/api/schema";
import { matchTeamSchema } from "../../MatchDetail/api/schema";
import { message } from "antd";

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

const TournamentsTeamParticipantsApi = makeEndpoint({
  alias: "getTournamentTeamParticipants",
  method: "get",
  path: `/tournament/detail/team/participants/:tournamentUuid`,
  parameters: parametersBuilder().addQueries({
    status: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }).build(),
  response: z.object({
    data: z.object({
      teams: z.array(tournamentTeamsSchema),
      totalTeams: z.number(),
      totalParticipants: z.number(),
      pagination: z.object({
        current: z.number(),
        pageSize: z.number(),
        total: z.number()
      }).optional()
    })
  })
});

const TournamentsUpdateTeamApprovalApi = makeEndpoint({
  alias: "updateTournamentTeamApproval",
  method: "put",
  path: `/tournament/:tournamentUuid/teams/approval`,
  parameters: parametersBuilder().addBody(z.object({
    teamUuid: z.string(),
    status: z.enum(['approved', 'rejected', 'confirmed', 'requested'])
  })).build(),
  response: z.object({
    message: z.string(),
    teamUuid: z.string(),
    tournamentUuid: z.string(),
    status: z.string(),
    affectedPlayers: z.number()
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
  parameters: parametersBuilder().addBody(tournamentMatchPayloadSchema).addQueries({
    mode: z.enum(["group", "knockout", "all"]).default("all")
  }).build(),
  response: z
    .object({
      // data: z.array(tournamentMatchSchema),
      message: z.string().nullish(),
    })
});

const TournamentsUpdateMatchesApi = makeEndpoint({
  alias: "updateTournamentMatches",
  method: "post",
  path: `/match/generate`,
  parameters: parametersBuilder().addBody(tournamentMatchPayloadSchema).build(),
  response: z
    .object({
      data: z.array(tournamentMatchSchema).nullish(),
      message: z.string().nullish(),
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

const TournamentsUpdateGroupsTeamsApi = makeEndpoint({
  alias: "updateTournamentGroupsTeams",
  method: "put",
  path: `/tournament/edit/groups/teams/:uuid`,
  parameters: parametersBuilder().addBody(tournamentGroupOnlyPayloadSchema).build(),
  response: z
    .object({
      message: z.string(),
    })
});

const TournamentsAddTeamApi = makeEndpoint({
  alias: "addTournamentTeam",
  method: "post",
  path: `/tournament/:uuid/add-team`,
  parameters: parametersBuilder().addBody(z.object({
    player_uuids: z.array(z.string()).min(1, "Team must have player(s)"),
    status: z.enum(['REQUESTED', 'APPROVED', 'CONFIRMED', 'REJECTED']).default('REQUESTED')
  })).build(),
  response: z.object({
    message: z.string(),
    status: z.enum(['REQUESTED', 'APPROVED', 'CONFIRMED', 'REJECTED']),
    teamUuid: z.string()
  })
});

const TournamentsAddDraftPickApi = makeEndpoint({
  alias: "addTournamentDraftPick",
  method: "post",
  path: `/tournament/draft-pick/:uuid`,
  parameters: parametersBuilder().addBody(z.object({
    teams: z.array(draftPickPayloadSchema)
  })).build(),
  response: z.object({
    message: z.string(),
  })
});
const TournamentsUpdateDraftPickPositionApi = makeEndpoint({
  alias: "updateTournamentDraftPickPosition",
  method: "put",
  path: `/tournament/draft-pick/position/:uuid`,
  parameters: parametersBuilder().addBody(z.object({
    players: z.array(draftPickPayloadSchema)
  })).build(),
  response: z.object({
    message: z.string(),
  })
});

const TournamentsUpdateMatchApi = makeEndpoint({
  alias: "updateMatch",
  method: "put",
  path: `/match/update/:uuid`,
  parameters: parametersBuilder().addBody(updateMatchPayloadSchema).build(),
  response: z.object({
    message: z.string(),
  })
});

const TournamentsStartDraftPickApi = makeEndpoint({
  alias: "startTournamentDraftPick",
  method: "post",
  path: `/tournament/draft-pick/start/:uuid`,
  parameters: parametersBuilder().build(),
  response: z.object({
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
  TournamentsTeamParticipantsApi,
  TournamentsUpdateTeamApprovalApi,
  TournamentsUpdateParticipantsApi,
  TournamentsPointsApi,
  TournamentsUpdatePointsApi,
  TournamentsUpdateMatchesApi,
  TournamentsCreateMatchesApi,
  TournamentsUpdateMatchApi,
  TournamentsMatchesApi,
  TournamentsToggleFeaturedApi,
  TournamentsSponsorsApi,
  TournamentsSponsorsUpdateApi,
  TournamentsUpdateGroupsApi,
  TournamentsUpdateGroupsTeamsApi,
  TournamentsAddTeamApi,
  TournamentsAddDraftPickApi,
  TournamentsUpdateDraftPickPositionApi,
  TournamentsStartDraftPickApi,
};