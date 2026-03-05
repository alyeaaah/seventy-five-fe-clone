import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";

const wallOfFameSchema = z.object({
  uuid: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  category: z.string().optional(),
  year: z.string().optional(),
  achievement: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const FeaturedWallOfFameApi = makeEndpoint({
  alias: "getFeaturedWallOfFame",
  method: "get",
  path: `/public/wall-of-fame/featured`,
  parameters: parametersBuilder().addQueries
    ({
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z.object({
    data: z.array(wallOfFameSchema)
  })
});

const WallOfFameDetailApi = makeEndpoint({
  alias: "getWallOfFameDetail",
  method: "get",
  path: `/public/wall-of-fame/:uuid/`,
  parameters: parametersBuilder().addQueries
    ({}).build(),
  response: z.object({
    data: wallOfFameSchema
  })
});

const WallOfFameListApi = makeEndpoint({
  alias: "getWallOfFameList",
  method: "get",
  path: `/public/wall-of-fame/`,
  parameters: parametersBuilder().addQueries
    ({
      page: z.number().optional(),
      limit: z.number().optional(),
      category: z.string().optional(),
      year: z.string().optional(),
    }).build(),
  response: z.object({
    data: z.array(wallOfFameSchema)
  })
});

export const endpoints = {
  FeaturedWallOfFameApi,
  WallOfFameDetailApi,
  WallOfFameListApi
};
