import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { galleriesItemSchema, galleryAlbumsPayloadSchema, galleryPlayersPayloadSchema } from "./schema";


const GalleriesListApi = makeEndpoint({
  alias: "getGalleries",
  method: "get",
  path: `/gallery-albums`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z
    .object({
      data: z.array(galleriesItemSchema),
      currentPage: z.number(),
      totalRecords: z.number(),
      totalPages: z.number()
    })
});

const GalleriesDetailApi = makeEndpoint({
  alias: "getGalleriesDetail",
  method: "get",
  path: `/gallery-albums/:uuid`,
  response: z
    .object({
      data: galleriesItemSchema,
    })
});

const GalleriesCreateApi = makeEndpoint({
  alias: "createGalleries",
  method: "post",
  path: `/gallery-albums`,
  parameters: parametersBuilder().addBody(galleryAlbumsPayloadSchema).build(),
  response: z
    .object({
      message: z.string(),
    })
});

const GalleriesUpdateApi = makeEndpoint({
  alias: "updateGalleries",
  method: "put",
  path: `/gallery-albums/:uuid`,
  parameters: parametersBuilder().addBody(galleryAlbumsPayloadSchema).build(),
  response: z
    .object({
      message: z.string(),
    })
});
const GalleriesDeleteApi = makeEndpoint({
  alias: "deleteGalleries",
  method: "delete",
  path: `/gallery-albums/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});

const GalleriesToggleFeaturedApi = makeEndpoint({
  alias: "toggleFeaturedGalleries",
  method: "put",
  path: `/gallery-albums/toggle-featured/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});

const UpdateGalleryPlayersApi = makeEndpoint({
  alias: "updateGalleryPlayers",
  method: "put",
  path: `/gallery/players/:uuid`,
  parameters: parametersBuilder().addBody(galleryPlayersPayloadSchema).build(),
  response: z
    .object({
      message: z.string(),
    })
});

export const endpoints = {
  GalleriesListApi,
  GalleriesDetailApi,
  GalleriesCreateApi,
  GalleriesUpdateApi,
  GalleriesDeleteApi,
  GalleriesToggleFeaturedApi,
  UpdateGalleryPlayersApi
};