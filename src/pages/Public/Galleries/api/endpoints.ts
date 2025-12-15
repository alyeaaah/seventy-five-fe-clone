import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { galleriesMediaSchema, galleryAlbumsPayloadSchema } from "@/pages/Admin/Galleries/api/schema";


const FeaturedGalleryApi = makeEndpoint({
  alias: "getFeaturedGallery",
  method: "get",
  path: `/public/gallery/featured`,
  parameters: parametersBuilder().addQueries
    ({
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z.object({
    data: z.array(galleriesMediaSchema)
  })
});

const GalleryDetailAlbumApi = makeEndpoint({
  alias: "getGalleryDetailAlbum",
  method: "get",
  path: `/public/gallery/:uuid/`,
  parameters: parametersBuilder().addQueries
    ({
      image: z.string().optional(),
    }).build(),
  response: z.object({
    data: galleryAlbumsPayloadSchema
  })
});
const GalleryAlbumsApi = makeEndpoint({
  alias: "getGalleryAlbums",
  method: "get",
  path: `/public/gallery/`,
  parameters: parametersBuilder().addQueries
    ({
      page: z.number().optional(),
      limit: z.number().optional(),
    }).build(),
  response: z.object({
    data: z.array(galleryAlbumsPayloadSchema)
  })
});

export const endpoints = {
  FeaturedGalleryApi,
  GalleryDetailAlbumApi,
  GalleryAlbumsApi
};