import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { matchSchema, openChallengerPayloadSchema, openChallengerResponseSchema, tournamentsSchema } from "./schema";
import { matchStatusEnum } from "@/pages/Admin/MatchDetail/api/schema";

const playerMatchesApi = makeEndpoint({
  alias: "getPlayerMatches",
  method: "get",
  path: `/match/player`,
  parameters: parametersBuilder().addQueries
    ({
      status: z.union([matchStatusEnum, z.array(matchStatusEnum)]).nullish(),
    }).build(),
  response: z.object({
    data: z.array(matchSchema),
  })
}); 

const playerTournamentsJoinedApi = makeEndpoint({
  alias: "getPlayerTournamentsJoined",
  method: "get",
  path: `/player/tournament/joined`,
  response: z.object({
    data: z.array(tournamentsSchema),
  })
});

const playerTournamentsUpcomingApi = makeEndpoint({
  alias: "getPlayerTournamentsUpcoming",
  method: "get",
  path: `/player/tournament/upcoming`,
  response: z.object({
    data: z.array(tournamentsSchema),
  })
});

const openChallengerApi = makeEndpoint({
  alias: "openChallenger",
  method: "post",
  path: `/challenger/open`,
  parameters: parametersBuilder().addBody(openChallengerPayloadSchema).build(),
  response: openChallengerResponseSchema,
});

export const endpoints = {
  playerMatchesApi,
  playerTournamentsJoinedApi,
  playerTournamentsUpcomingApi,
  openChallengerApi
};