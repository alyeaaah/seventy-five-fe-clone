import { z } from "zod";

export const galleryPlayersSchema = z.object({
  id: z.number(),
  player_uuid: z.string(),
  player_name: z.string(),
  x_percent: z.number(),
  y_percent: z.number(),
  isDeleted: z.boolean().nullish(),
});

export const galleriesMediaSchema = z.object({
  uuid: z.string(),
  name: z.string().nullish(),
  link: z.string(),
  description: z.string().nullable().nullish(),
  featured_at: z.string().nullish(),
  player_uuid: z.string().nullish(),
  album_uuid: z.string().nullish(),
  product_uuid: z.string().nullish(),
  blog_uuid: z.string().nullish(),
  match_uuid: z.string().nullish(),
  tournament_uuid: z.string().nullish(),
  playerGalleries: z.array(galleryPlayersSchema).nullish()
});

const galleriesTournamentSchema = z.object({
  name: z.string(),
  description: z.string(),
  start_date: z.string(),
  end_date: z.string()
});

const galleriesMatchSchema = z.object({
  round: z.number(),
  seed_index: z.number(),
  home_team: z.object({
    name: z.string(),
    alias: z.string().nullish()
  }).nullish(),
  away_team: z.object({
    name: z.string(),
    alias: z.string().nullish()
  }).nullish(),
  youtube_url: z.string().nullish()
});

export const galleriesItemSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  name: z.string(),
  pinned_gallery_uuid: z.string().nullish(),
  description: z.string().nullish(),
  createdAt: z.string().datetime(),
  media: galleriesMediaSchema.nullish(),
  tournament: galleriesTournamentSchema.nullish(),
  match: galleriesMatchSchema.nullish(),
  galleries: z.array(galleriesMediaSchema).nullish(),
});

export const galleryPayloadSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  is_delete: z.boolean().default(false).nullish(),
  pinned: z.boolean().default(false).nullish(),
  link: z.string().url({message: "Invalid Image"})
});

export const galleryAlbumsPayloadSchema = z.object({
  uuid: z.string().optional(),
  name: z.string(),
  description: z.string(),
  pinned_gallery_uuid: z.string().nullish(),
  author: z.string().nullish(),
  media: galleriesMediaSchema.nullish(),
  galleries: z.array(galleryPayloadSchema).nullish(),
  tags: z.array(z.object({
    uuid: z.string().nullish(),
    name: z.string().nullish()
  })).nullish(),
  createdAt: z.string().datetime().nullish()
});


export const galleryPlayersPayloadSchema = z.object({
  gallery_uuid: z.string(),
  players: z.array(galleryPlayersSchema.extend({
    uuid: z.string().nullish(),
  })),
})

export type GalleriesData = z.infer<typeof galleriesItemSchema>;
export type GalleryPayload = z.infer<typeof galleryAlbumsPayloadSchema>;



