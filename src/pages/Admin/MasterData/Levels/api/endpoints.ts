import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { levelsPayloadSchema, levelsSchema } from "./schema";


const LevelsListApi = makeEndpoint({
  alias: "getLevelsList",
  method: "get",
  path: `/levels`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z
    .object({
      data: z.array(levelsSchema),
      currentPage: z.number(),
      totalRecords: z.number(),
      totalPages: z.number()
    })
});

const LevelsCreateApi = makeEndpoint({
  alias: "createLevel",
  method: "post",
  path: `/levels`,
  request: levelsPayloadSchema,
  response: z
    .object({
      data: levelsSchema,
    })
});

const LevelsUpdateApi = makeEndpoint({
  alias: "updateLevel",
  method: "put",
  path: `/levels/:uuid`,
  request: levelsPayloadSchema,
  response: z
    .object({
      data: levelsSchema,
    })
});

const LevelsDeleteApi = makeEndpoint({
  alias: "deleteLevel",
  method: "delete",
  path: `/levels/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});

export const endpoints = {
  LevelsListApi,
  LevelsCreateApi,
  LevelsUpdateApi,
  LevelsDeleteApi
};