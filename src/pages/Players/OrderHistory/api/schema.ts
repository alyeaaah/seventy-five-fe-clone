import { merchProductsItemSchema, ProductDetailSchema } from "@/pages/Admin/Merchandise/api/schema";
import { playerAddressSchema } from "@/pages/Admin/Players/api/schema";
import { z } from "zod";
export const orderSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  player_uuid: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  grand_total: z.number(),
  sub_total: z.number(),
  discount: z.number(),
  point_used: z.number(),
  payment_evidence: z.null(),
  status: z.string(),
  createdAt: z.string(),
  createdBy: z.string(),
  updatedAt: z.string(),
  updatedBy: z.string().nullable(),
  deletedBy: z.string().nullable(),
  address: playerAddressSchema,
  products: z.array(merchProductsItemSchema.extend({
    details: z.array(ProductDetailSchema.extend({
      quantity: z.number().nullish(),
      qty: z.number(),
    })),
    galleries: z.any().nullish(),
    media_url: z.string(),
    image_cover: z.string().nullish(),
    
  })),
});

export type OrderData = z.infer<typeof orderSchema>;
