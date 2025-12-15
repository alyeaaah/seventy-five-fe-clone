import { playerAddressSchema } from "@/pages/Admin/Players/api/schema";
import { PaymentMethodEnum } from "@/utils/faker";
import { z } from "zod";

const BlogTagSchema = z.object({
  name: z.string(),
  tag_uuid: z.string().uuid(),
  uuid: z.string().uuid().nullish(),
});

const BlogGallerySchema = z.object({
  uuid: z.string().optional(),
  name: z.string(),
  link: z.string(),
});
export const blogPostsItemSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  title: z.string(),
  content: z.string(),
  category_uuid: z.string().nullish(),
  status: z.enum(['DRAFT', 'PUBLISHED']), // Assuming possible statuses
  read: z.number().default(0),
  createdAt: z.string().nullish(),  
  createdBy: z.string().nullish(),
  updatedAt: z.string().nullish(),
  updatedBy: z.string().nullish(),
  deletedBy: z.string().nullish(),
  author: z.string(),
  tags: z.array(BlogTagSchema).nullish(),
  galleries: z.array(BlogGallerySchema).nullish(),
  image_cover: z.string(),
});

export const provinceSchema = z.object({
  id: z.number(),
  name: z.string(),
});
export const citySchema = z.object({
  id: z.number(),
  province_id: z.number(),
  name: z.string(),
});
export const districtSchema = z.object({
  id: z.number(),
  city_id: z.number(),
  name: z.string(),
});

export const cartProductDetailSchema = z.object({
  uuid: z.string(),
  product_uuid: z.string(),
  product_name: z.string(),
  product_image: z.string(),
  product_size: z.string(),
  product_unit: z.string(),
  price: z.number(),
  qty: z.number(),
});

export const checkoutPayloadSchema = z.object({
  player_uuid: z.string().nullish(),
  email:z.string().nullish(),
  point_used: z.number().default(0),
  address: playerAddressSchema,
  payment_method: z.enum([PaymentMethodEnum.COD, PaymentMethodEnum.BANK_TRANSFER, PaymentMethodEnum.QRIS]),
  total: z.number(),
  subtotal: z.number(),
  note: z.string().nullish(),
  carts: z.array(cartProductDetailSchema)
})

export type BlogPostsData = z.infer<typeof blogPostsItemSchema>;
export type CheckoutPayloadData = z.infer<typeof checkoutPayloadSchema>;



