import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { loginPayloadSchema, mediaUploadPayloadSchema, userDataSchema } from "./schema";

const loginApi = makeEndpoint({
  alias: "login",
  method: "post",
  path: "/auth/login",
  parameters: parametersBuilder().addBody(loginPayloadSchema).build(),
  response: z.object({
    token: z.string(),
  }),
});

const userDataApi = makeEndpoint({
  alias: "userData",
  method: "get",
  path: `/user/get`,
  response: z
    .object({
      data: userDataSchema
    })
});

const mediaUploadApi = makeEndpoint({
  alias: "mediaUpload",
  method: "post",
  path: "/gallery/upload",
  requestFormat:"form-data",
  parameters: parametersBuilder().addBody(
    mediaUploadPayloadSchema
  ).build(),
  response: z.object({
    imageUrl: z.string(),
  }),
});

export const endpoints = {
  loginApi,
  userDataApi,
  mediaUploadApi
};