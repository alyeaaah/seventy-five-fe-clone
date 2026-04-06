import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { publicChallengerListSchema } from "./schema";
import { fullMatchDetailSchema } from "@/pages/Admin/MatchDetail/api/schema";
import { pointConfigurationDetailSchema } from "@/pages/Admin/PointConfig/api/schema";
import { giveKudosPayloadSchema, kudosSchema } from "@/pages/Admin/MasterData/Kudos/api/schema";


const matchDetailApi = makeEndpoint({
  alias: "getMatchDetail",
  method: "get",
  path: `/public/match/:uuid`,
  parameters: parametersBuilder().addQueries
    ({
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z.object({
    data: fullMatchDetailSchema
  })
});

const pointConfigApi = makeEndpoint({
  alias: "getPointConfig",
  method: "get",
  path: `/public/match/point-config/:uuid`,
  response: z.object({
    data: pointConfigurationDetailSchema
  })
});

const getKudosListApi = makeEndpoint({
  alias: "getKudosList",
  method: "get",
  path: `/public/kudos-list`,
  parameters: parametersBuilder().addQueries
    ({
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
    }).build(),
  response: z.object({
    data: z.array(kudosSchema),
    currentPage: z.number().optional(),
    totalRecords: z.number().optional(),
    totalPages: z.number().optional()
  })
});

const giveKudosApi = makeEndpoint({
  alias: "giveKudos",
  method: "post",
  path: `/match/kudos`,
  parameters: parametersBuilder().addBody(giveKudosPayloadSchema).build(),
  response: z.object({
    message: z.string()
  })
});

const publicChallengerListApi = makeEndpoint({
  alias: "getPublicChallengerList",
  method: "get",
  path: `/public/challenger`,
  parameters: parametersBuilder().addQueries({
    player_uuid: z.string().nullish(),
  }).build(),
  response: z.object({
    data: publicChallengerListSchema,
  }),
});

export const endpoints = {
  matchDetailApi,
  pointConfigApi,
  getKudosListApi,
  giveKudosApi,
  publicChallengerListApi
};