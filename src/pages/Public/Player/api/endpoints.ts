import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { playerLeagueSchema, playersPartialSchema, playersSchema } from "@/pages/Players/Home/api/schema";
import { matchSchema } from "@/pages/Players/Matches/api/schema";
import { playerPartialSchema } from "@/pages/Admin/Players/api/schema";
import { playerStatsSchema } from "./schema";

const playerDetailApi = makeEndpoint({
  alias: "getPlayerDetail",
  method: "get",
  path: `/public/player/:uuid`,
  response: z.object({
    data: playersPartialSchema
  })
});

const playerRelatedApi = makeEndpoint({
  alias: "getPlayerRelated",
  method: "get",
  path: `/public/player/:uuid/related`,
  response: z.object({
    data: z.array(playersSchema)
  })
});

const playerStatsApi = makeEndpoint({
  alias: "getPlayerStats",
  method: "get",
  path: `/public/player/stats/:uuid`,
  response: z.object({
    data: playerStatsSchema
  })
});

const playerStandingsApi = makeEndpoint({
  alias: "getPlayerStandings",
  method: "get",
  path: `/public/player/standings`,
  parameters: parametersBuilder().addQueries
    ({
      level: z.string().nullish(),
      league: z.string().nullish(),
    }).build(),
  response: z.object({
    data: z.array(playerPartialSchema.extend({
      age: z.number().nullish(),
      dateOfBirth: z.string(),
    }))
  })
});

const playerRankApi = makeEndpoint({
  alias: "getPlayerRank",
  method: "get",
  path: `/public/player/rank-position/:player_uuid`,
  response: z.object({
    data: z.object({
      position: z.number(),
      level: z.string(),
    })
  })
});
const playerMatchesApi = makeEndpoint({
  alias: "getPlayerMatches",
  method: "get",
  path: `/public/matches/player/:player_uuid`,
  response: z.object({
    data: z.array(matchSchema)
  })
});

export const endpoints = {
  playerDetailApi,
  playerRelatedApi,
  playerStatsApi,
  playerStandingsApi,
  playerRankApi,
  playerMatchesApi
};