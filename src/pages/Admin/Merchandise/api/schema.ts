import { z } from "zod";

export const ProductDetailSchema = z.object({
  uuid: z.string(),
  product_uuid: z.string().nullish(),
  size: z.string(),
  price: z.number(),
  quantity: z.number(),
  id: z.number(),
});

// Schema for product galleries
const ProductGallerySchema = z.object({
  uuid: z.string().uuid(),
  link: z.string().url({message: "Invalid Image"}),
  name: z.string(),
});

export const merchProductsItemSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  unit: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']), // Adjust based on possible statuses
  createdAt: z.string().datetime(),
  id: z.number(),
  media_url: z.string().nullish(),
  createdBy: z.string().uuid(),
  details: z.array(ProductDetailSchema),
  galleries: z.array(ProductGallerySchema),
  image_cover: z.string(),
  featured_at: z.string().nullish(),
});



export const merchProductPayloadSchema = z.object({
  uuid: z.string().optional(),
  name: z.string().min(2,{message: "Name must be at least 2 characters long"}),
  description: z.string().min(12,{message: "Description must be at least 12 characters long"}),
  unit: z.string().min(2,{message: "Unit is required"}),
  status: z.enum(['ACTIVE', 'INACTIVE']), // Adjust based on possible statuses
  id: z.number().optional(),
  media_url: z.string().optional(),
  details: z.array(ProductDetailSchema.extend({
    uuid: z.string().nullish(),
    is_delete: z.boolean().default(false).nullish(),
    id: z.number().nullish()
  })),
  galleries: z.array(ProductGallerySchema.extend({
    uuid: z.string().nullish(),
    is_delete: z.boolean().default(false).nullish(),
    pinned: z.boolean().default(false).nullish()
  })),
  image_cover: z.string().nullish(),
  tags: z.array(z.object({
    uuid: z.string().nullish(),
    tag_uuid: z.string().nullish(),
    name: z.string().nullish(),
    is_delete: z.boolean().default(false).nullish()
  })).nullish()
});

export type MerchProductsData = z.infer<typeof merchProductsItemSchema>;
export type MerchProductPayload = z.infer<typeof merchProductPayloadSchema>;


