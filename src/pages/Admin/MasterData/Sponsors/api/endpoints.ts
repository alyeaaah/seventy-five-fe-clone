import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { sponsorsPayloadSchema, sponsorsSchema } from "./schema";


const SponsorsListApi = makeEndpoint({
  alias: "getSponsorsList",
  method: "get",
  path: `/sponsors`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z
    .object({
      data: z.array(sponsorsSchema),
      currentPage: z.number(),
      totalRecords: z.number(),
      totalPages: z.number()
    })
});

const SponsorsCreateApi = makeEndpoint({
  alias: "createSponsor",
  method: "post",
  path: `/sponsors`,
  request: sponsorsPayloadSchema,
  response: z
    .object({
      data: sponsorsSchema,
    })
});

const SponsorsUpdateApi = makeEndpoint({
  alias: "updateSponsor",
  method: "put",
  path: `/sponsors/:uuid`,
  request: sponsorsPayloadSchema,
  response: z
    .object({
      data: sponsorsSchema,
    })
});

const SponsorsDeleteApi = makeEndpoint({
  alias: "deleteSponsor",
  method: "delete",
  path: `/sponsors/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});
const SponsorsSlotApi = makeEndpoint({
  alias: "getSponsorsSlot",
  method: "get",
  path: `/sponsors/slot`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }).build(),
  response: z
    .object({
      data: z.array(z.object({
        name: z.string(),
      })),
    })
});

export const endpoints = {
  SponsorsListApi,
  SponsorsCreateApi,
  SponsorsUpdateApi,
  SponsorsDeleteApi,
  SponsorsSlotApi
};