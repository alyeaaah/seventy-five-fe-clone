import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { galleriesMediaSchema } from "@/pages/Admin/Galleries/api/schema";
import { tournamentMatchDetailSchema, tournamentMatchSchema, tournamentsSchema } from "@/pages/Admin/Tournaments/api/schema";
import { matchesListSchema } from "@/pages/Admin/CustomMatch/api/schema";
import { publicTournamentDetailSchema } from "./schema";
import { sponsorsSchema } from "@/pages/Admin/MasterData/Sponsors/api/schema";
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

export const endpoints = {
  matchDetailApi,
  pointConfigApi,
  getKudosListApi,
  giveKudosApi
};