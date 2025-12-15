import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { courtDetailSchema, courtsPayloadSchema, courtsSchema } from "./schema";


const CourtsListApi = makeEndpoint({
  alias: "getCourtsList",
  method: "get",
  path: `/courts`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z
    .object({
      data: z.array(courtsSchema),
      currentPage: z.number(),
      totalRecords: z.number(),
      totalPages: z.number()
    })
});

const CourtsDetailApi = makeEndpoint({
  alias: "getCourtsDetail",
  method: "get",
  path: `/courts/:uuid`,
  response: z
    .object({
      data: courtDetailSchema,
    })
});

const CourtsCreateApi = makeEndpoint({
  alias: "createCourt",
  method: "post",
  path: `/courts`,
  parameters: parametersBuilder().addBody(courtsPayloadSchema).build(),
  response: z
    .object({
      data: courtsSchema,
    })
});

const CourtsUpdateApi = makeEndpoint({
  alias: "updateCourt",
  method: "put",
  path: `/courts/:uuid`,
  parameters: parametersBuilder().addBody(courtsPayloadSchema).build(),
  response: z
    .object({
      data: courtsSchema,
    })
});

const CourtsDeleteApi = makeEndpoint({
  alias: "deleteCourt",
  method: "delete",
  path: `/courts/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});

export const endpoints = {
  CourtsListApi,
  CourtsCreateApi,
  CourtsUpdateApi,
  CourtsDeleteApi,
  CourtsDetailApi
  
};