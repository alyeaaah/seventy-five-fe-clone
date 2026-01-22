import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { matchCodePayloadSchema } from "./schema";

const ValidateMatchCodeApi = makeEndpoint({
  alias: "validateMatchCode",
  method: "post",
  path: `/referee/validate-match-code`,
  parameters: parametersBuilder().addBody(matchCodePayloadSchema).build(),
  response: z.object({
    message: z.string(),
    matchUuid: z.string().optional(),
  }),
});

export const endpoints = {
  ValidateMatchCodeApi,
};