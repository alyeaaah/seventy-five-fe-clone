import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { customMatchesPayloadSchema, customMatchPayloadSchema, matchesListSchema, acceptChallengerPayloadSchema } from "./schema";

const CustomMatchListApi = makeEndpoint({
  alias: "getCustomMatchList",
  method: "get",
  path: `/match/list`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: matchesListSchema
});
const CustomMatchCreateApi = makeEndpoint({
  alias: "createCustomMatch",
  method: "post",
  path: `/match/custom`,
  parameters: parametersBuilder().addBody(customMatchesPayloadSchema).build(),
  response: z
    .object({
      message: z.string(),
    })
});
const CustomMatchUpdateApi = makeEndpoint({
  alias: "updateCustomMatch",
  method: "put",
  path: `/match/custom/:uuid`,
  parameters: parametersBuilder().addBody(customMatchPayloadSchema).build(),
  response: z
    .object({
      message: z.string(),
    })
});
const CustomMatchDeleteApi = makeEndpoint({
  alias: "deleteCustomMatch",
  method: "delete",
  path: `/match/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});

const AcceptChallengerApi = makeEndpoint({
  alias: "acceptChallenger",
  method: "post",
  path: `/challenger/accept`,
  parameters: parametersBuilder().addBody(acceptChallengerPayloadSchema).build(),
  response: z.object({
    status: z.string(),
  }),
});

export const endpoints = {
  CustomMatchListApi,
  CustomMatchCreateApi,
  CustomMatchUpdateApi,
  CustomMatchDeleteApi,
  AcceptChallengerApi
};