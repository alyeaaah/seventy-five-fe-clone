import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { fullMatchDetailSchema, matchStatusEnum, scoreUpdatePayloadSchema } from "./schema";

const MatchDetailApi = makeEndpoint({
  alias: "getMatchDetail",
  method: "get",
  path: `/match/detail/:uuid`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z
    .object({
      data: fullMatchDetailSchema
    })
});
const MatchScoreUpdateApi = makeEndpoint({
  alias: "updateMatchScoreApi",
  method: "put",
  path: `/match/score-update/:uuid`,
  parameters: parametersBuilder().addBody(scoreUpdatePayloadSchema).build(),
  response: z
    .object({
      message: z.string().nullish(),
    })
});

const MatchVideoUpdateApi = makeEndpoint({
  alias: "updateMatchVideoApi",
  method: "put",
  path: `/match/video-url/:uuid`,
  parameters: parametersBuilder().addBody(z.object({
    video_url: z.string()
  })).build(),
  response: z
    .object({
      message: z.string().nullish(),
    })
});

const MatchStatusUpdateApi = makeEndpoint({
  alias: "updateMatchStatusApi",
  method: "put",
  path: `/match/status/:uuid`,
  parameters: parametersBuilder().addBody(z.object({
    status: matchStatusEnum,
    notes: z.string().optional()
  })).build(),
  response: z
    .object({
      message: z.string().nullish(),
    })
});

export const endpoints = {
  MatchDetailApi,
  MatchScoreUpdateApi,
  MatchVideoUpdateApi,
  MatchStatusUpdateApi
};