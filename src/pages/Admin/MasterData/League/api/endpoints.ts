import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { leaguePayloadSchema, leagueSchema } from "./schema";


const LeagueListApi = makeEndpoint({
  alias: "getLeagueList",
  method: "get",
  path: `/leagues`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
      year: z.number().nullish(),
      future: z.boolean().nullish(),
      status: z.enum(["ONGOING", "ENDED", "SOON"]).nullish(),
  }).build(),
  response: z
    .object({
      data: z.array(leagueSchema),
      currentPage: z.number(),
      totalRecords: z.number(),
      totalPages: z.number()
    })
});

const LeagueCreateApi = makeEndpoint({
  alias: "createLeague",
  method: "post",
  path: `/leagues`,
  request: leaguePayloadSchema,
  response: z
    .object({
      data: leagueSchema,
    })
});

const LeagueUpdateApi = makeEndpoint({
  alias: "updateLeague",
  method: "put",
  path: `/leagues/:uuid`,
  request: leaguePayloadSchema,
  response: z
    .object({
      data: leagueSchema,
    })
});

const LeagueDeleteApi = makeEndpoint({
  alias: "deleteLeague",
  method: "delete",
  path: `/leagues/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});

export const endpoints = {
  LeagueListApi,
  LeagueCreateApi,
  LeagueUpdateApi,
  LeagueDeleteApi
};