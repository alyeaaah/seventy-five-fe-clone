import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { orderSchema } from "./schema";

const PlayersOrderHistoryApi = makeEndpoint({
  alias: "getPlayersOrderHistory",
  method: "get",
  path: `/public/merchandise/order-history`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z
    .object({
      data: z.array(orderSchema),
      // currentPage: z.number(),
      // totalRecords: z.number(),
      // totalPages: z.number()
    })
});

const PlayersOrderDetailApi = makeEndpoint({
  alias: "getPlayersOrderDetail",
  method: "get",
  path: `/public/merchandise/order-history/:uuid`,
  response: z
    .object({
      data: orderSchema,
    })
});


export const endpoints = {
  PlayersOrderHistoryApi,
  PlayersOrderDetailApi
  
};