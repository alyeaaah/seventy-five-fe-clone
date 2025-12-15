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


// Item schema
const itemSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  product_detail_uuid: z.string(),
  product_name: z.string().nullish(),
  product_image: z.string().nullish(),
  product_unit: z.string().nullish(),
  product_size: z.string().nullish(),
  quantity: z.number(),
  price: z.number(),
  sub_total: z.number(),
  product_uuid: z.string(),
});

// Address schema
const addressSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  order_uuid: z.string(),
  receiver_name: z.string(),
  phone: z.string(),
  address: z.string(),
  province_id: z.number(),
  province: z.string().nullish(),
  city_id: z.number(),
  city: z.string().nullish(),
  district_id: z.number(),
  district: z.string().nullish(),
  note: z.string(),
  lat: z.string(),
  long: z.string(),
  created_at: z.string(),
});

// Player schema
const playerSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  nickname: z.string().nullish(),
  username: z.string(),
  email: z.string(),
  phone: z.string(),
  city: z.string().nullish(),
  media_url: z.string().nullish(),
  gender: z.string().nullish(),
});

// Order schema
export const orderSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  player_uuid: z.string().nullish(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  grand_total: z.number(),
  sub_total: z.number(),
  discount: z.number(),
  point_used: z.number(),
  payment_evidence: z.string().nullish(),
  shipping_cost: z.number(),
  shipping_code: z.string().nullish(),
  status: z.string(),
  createdAt: z.string(),
  createdBy: z.string().nullish(),
  updatedAt: z.string(),
  updatedBy: z.string().nullish(),
  deletedBy: z.string().nullish(),
  player: playerSchema.nullish(),
  items: z.array(itemSchema),
  address: addressSchema,
});
export type MerchOrderData = z.infer<typeof orderSchema>;
export type MerchProductsData = z.infer<typeof merchProductsItemSchema>;
export type MerchProductPayload = z.infer<typeof merchProductPayloadSchema>;


