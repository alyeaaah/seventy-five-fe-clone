import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { playersSchema } from "./schema";
import { playerAddressPayloadSchema, playerAddressSchema } from "@/pages/Admin/Players/api/schema";
import { galleriesMediaSchema } from "@/pages/Admin/Galleries/api/schema";

const PlayersListApi = makeEndpoint({
  alias: "getPlayersList",
  method: "get",
  path: `/player/list`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      level: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z
    .object({
      data: z.array(playersSchema),
      currentPage: z.number(),
      totalRecords: z.number(),
      totalPages: z.number()
    })
});

const PlayersDetailApi = makeEndpoint({
  alias: "getPlayersDetail",
  method: "get",
  path: `/player/detail/:uuid`,
  response: z
    .object({
      data: playersSchema,
    })
});


const PlayersUpdateApi = makeEndpoint({
  alias: "updatePlayer",
  method: "put",
  path: `/player/edit/:uuid`,
  parameters: parametersBuilder().addBody(playersSchema).build(),
  response: z
    .object({
      message: z.string(),
    })
});

const PlayersAddressApi = makeEndpoint({
  alias: "getPlayerAddress",
  method: "get",
  path: `/player/address`,
  parameters: parametersBuilder().addBody(playerAddressSchema).build(),
  response: z
    .object({
      data: playerAddressSchema,
    })
});

const PlayersAddressUpdateApi = makeEndpoint({
  alias: "updatePlayerAddress",
  method: "put",
  path: `/player/address`,
  parameters: parametersBuilder().addBody(playerAddressPayloadSchema).build(),
  response: z
    .object({
      data: playerAddressSchema,
    })
});

const PlayerGalleryApi = makeEndpoint({
  alias: "getPlayerGallery",
  method: "get",
  path: `/gallery/players/all`,
  parameters: parametersBuilder().addQueries
    ({
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z
    .object({
      data: z.array(galleriesMediaSchema),
      count: z.number().nullish(),
    })
});

export const endpoints = {
  PlayersListApi,
  PlayersUpdateApi,
  PlayersDetailApi,
  PlayersAddressApi,
  PlayersAddressUpdateApi,
  PlayerGalleryApi
};