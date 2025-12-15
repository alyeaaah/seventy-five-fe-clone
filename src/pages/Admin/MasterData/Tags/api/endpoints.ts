import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { tagsPayloadSchema, tagsSchema } from "./schema";


const TagsListApi = makeEndpoint({
  alias: "getTagsList",
  method: "get",
  path: `/tags`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z
    .object({
      data: z.array(tagsSchema),
      currentPage: z.number(),
      totalRecords: z.number(),
      totalPages: z.number()
    })
});

const TagsCreateApi = makeEndpoint({
  alias: "createTag",
  method: "post",
  path: `/tags`,
  request: tagsPayloadSchema,
  response: z
    .object({
      data: tagsSchema,
    })
});

const TagsUpdateApi = makeEndpoint({
  alias: "updateTag",
  method: "put",
  path: `/tags/:uuid`,
  request: tagsPayloadSchema,
  response: z
    .object({
      data: tagsSchema,
    })
});

const TagsDeleteApi = makeEndpoint({
  alias: "deleteTag",
  method: "delete",
  path: `/tags/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});

export const endpoints = {
  TagsListApi,
  TagsCreateApi,
  TagsUpdateApi,
  TagsDeleteApi
};