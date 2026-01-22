import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { playerDetailSchema, playerPartialSchema, PlayersPayload, playersSchema, quickAddPlayerPayloadSchema, updateAccessPayloadSchema } from "./schema";
import moment from "moment";
import { playersPartialSchema } from "@/pages/Players/Home/api/schema";

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
      data: z.array(playerPartialSchema),
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
      data: playerPartialSchema,
    })
});

const PlayersCreateApi = makeEndpoint({
  alias: "createPlayer",
  method: "post",
  path: `/player/create`,
  parameters: parametersBuilder().addBody(playersSchema).build(),
  response: z
    .object({data: playersSchema})
});

const PlayersUpdateApi = makeEndpoint({
  alias: "updatePlayer",
  method: "put",
  path: `/player/edit/:uuid`,
  parameters: parametersBuilder().addBody(playersSchema).build(),
  response: z
    .object({
      data: playerPartialSchema,
    })
});

const PlayersChangeRoleApi = makeEndpoint({
  alias: "changePlayerRole",
  method: "put",
  path: `/player/role/:uuid`,
  parameters: parametersBuilder().addBody(z.object({
    role: z.enum(["PLAYER", "ADMIN"]),
  })).build(),
  response: z
    .object({
      data: playerPartialSchema,
    })
});

const PlayersDeleteApi = makeEndpoint({
  alias: "deletePlayer",
  method: "delete",
  path: `/player/delete/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});

const PlayersToggleFeaturedApi = makeEndpoint({
  alias: "toggleFeaturedPlayer",
  method: "put",
  path: `/player/toggle-featured/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});

const PlayersQuickAddApi = makeEndpoint({
  alias: "quickAddPlayer",
  method: "post",
  path: `/player/quick-add`,
  parameters: parametersBuilder().addBody(quickAddPlayerPayloadSchema).build(),
  response: z.object({
    message: z.string().optional(),
    data: z.any().optional(),
  }),
});

const PlayersUpdateAccessApi = makeEndpoint({
  alias: "updatePlayerAccess",
  method: "put",
  path: `/player/update-access/:uuid`,
  parameters: parametersBuilder().addBody(updateAccessPayloadSchema).build(),
  response: z
    .object({
      data: playerPartialSchema,
    })
});

export const endpoints = {
  PlayersListApi,
  PlayersCreateApi,
  PlayersUpdateApi,
  PlayersDeleteApi,
  PlayersDetailApi,
  PlayersToggleFeaturedApi,
  PlayersChangeRoleApi,
  PlayersQuickAddApi,
  PlayersUpdateAccessApi
};