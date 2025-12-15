import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { kudosPayloadSchema, kudosSchema } from "./schema";


const KudosListApi = makeEndpoint({
  alias: "getKudosList",
  method: "get",
  path: `/kudos`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z
    .object({
      data: z.array(kudosSchema),
      currentPage: z.number(),
      totalRecords: z.number(),
      totalPages: z.number()
    })
});

const KudosCreateApi = makeEndpoint({
  alias: "createKudos",
  method: "post",
  path: `/kudos`,
  request: kudosPayloadSchema,
  response: z
    .object({
      data: kudosSchema,
    })
});

const KudosUpdateApi = makeEndpoint({
  alias: "updateKudos",
  method: "put",
  path: `/kudos/:uuid`,
  request: kudosPayloadSchema,
  response: z
    .object({
      data: kudosSchema,
    })
});

const KudosDeleteApi = makeEndpoint({
  alias: "deleteKudos",
  method: "delete",
  path: `/kudos/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});

export const endpoints = {
  KudosListApi,
  KudosCreateApi,
  KudosUpdateApi,
  KudosDeleteApi
};