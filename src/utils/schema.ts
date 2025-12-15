import { merchProductsItemSchema, ProductDetailSchema } from "@/pages/Admin/Merchandise/api/schema";
import { z } from "zod";
export const cartProductDetailSchema = ProductDetailSchema.extend({
  qty: z.number().default(1),
})
export const cartProductSchema = merchProductsItemSchema.extend({
  details: z.array(cartProductDetailSchema)
})
export type CartProduct = z.infer<typeof cartProductSchema>
export type CartProductDetail = z.infer<typeof cartProductDetailSchema>
