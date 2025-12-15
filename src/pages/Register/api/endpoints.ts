import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { registerSchema } from "./schema";

const RegisterApi = makeEndpoint({
  alias: "register",
  method: "post",
  path: `/public/register`,
  parameters: parametersBuilder().addBody(registerSchema).build(),
  response: z
    .object({message: z.string()})
});

export const endpoints = {
  RegisterApi
};