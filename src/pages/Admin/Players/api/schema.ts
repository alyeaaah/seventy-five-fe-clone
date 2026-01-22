import { playerLeagueSchema } from "@/pages/Players/Home/api/schema";
import { z } from "zod";

export const quickAddPlayerPayloadSchema = z.object({
  name: z.string().min(2, "Player name must be at least 2 characters long"),
  nickname: z.string().min(2, "Nickname must be at least 2 characters long"),
  gender: z.enum(["m", "f"], {
    required_error: "Gender can't be empty",
    invalid_type_error: "Please select a valid gender (male or female)",
    message: "Please select a valid gender (male or female)",
  }),
  password: z.string().nullish(),
  level_uuid: z.string().nullish(),
  league_id: z.number().int().min(1, "League is required"),
});

export const updateAccessPayloadSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
  password: z.string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(32, { message: "Password must not exceed 32 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  isReferee: z.boolean(),
});

export const playersSchema = z.object({
  uuid: z.string().nullish(),
  name: z.string()
    .min(2, "Player name must be at least 2 characters long"),
  username: z.string()
    .min(2, "Username must be at least 2 characters long"),
  nickname: z.string()
    .min(2, "Nickname must be at least 2 characters long"),
  email: z.string().nullish(),
  city: z.string()
    .min(2, "City must be at least 2 characters long"),
  address: z.string()
    .min(2, "Address must be at least 2 characters long"),
  phone: z.string({required_error: "Phone is required" })
    .min(8, "Phone must be at least 8 characters long")
    .max(15, "Phone must be at most 15 characters long")
    .refine(
      (value: string) => /^[0-9]+$/.test(value),
      "Phone can only contain numbers"
    ),
  media_url: z.string()
    .min(2, "Image is required"),
  avatar_url: z.string().nullish(),
  dateOfBirth: z.string().date().nullish(),
  placeOfBirth: z.string().nullish(),
  gender: z.enum(['m', 'f'], {
    required_error: "Gender can't be empty",
    invalid_type_error: "Please select a valid gender (male or female)",
    message: "Please select a valid gender (male or female)",
  }),
  isVerified: z.boolean().default(false),
  height: z.number().nullish(),
  turnDate: z.string().date().nullish(),
  skills: z.object({
    forehand: z.number().default(0),
    backhand: z.number().default(0),
    serve: z.number().default(0),
    volley: z.number().default(0),
    overhead: z.number().default(0),
  }).nullish(),
  playstyleForehand: z.enum(['RIGHT', 'LEFT']).default('RIGHT').nullish(),
  playstyleBackhand: z.enum(['One Handed', 'Double Handed']).default('Double Handed').nullish(),
  socialMediaIg: z.string().nullish(),
  socialMediaX: z.string().nullish(),
  level: z.string().nullish(),
  level_uuid: z.string({ required_error: "Level is required" }),
  league: playerLeagueSchema.nullish(),
  league_id: z.number().nullish(),
  point: z.number().nullish(),
  isReferee: z.boolean().default(false).nullish(),
  createdAt: z.string().datetime().nullish(),
  updatedAt: z.string().datetime().nullish(),
  role: z.enum(['PLAYER', 'ADMIN']).nullish()
});
export const playerPartialSchema = playersSchema.extend({
  nickname: z.string().nullish(),
  media_url: z.string().nullish(),
  avatar_url: z.string().nullish(),
  level: z.string().nullish(),
  level_uuid: z.string().nullish(),
  city: z.string().nullish(),
  age: z.number().nullish(),
  address: z.string().nullish(),
  height: z.number().nullish(),
  turnDate: z.string().nullish(),
  phone: z.string(),
});
export const playerDetailSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  email: z.string(),
  city: z.string(),
  address: z.string(),
  lat: z.string().nullish(),
  long: z.string().nullish(),
  createdAt: z.string().datetime().nullish(),
  updatedAt: z.string().datetime().nullish(),
});
export const playerAddressSchema = z.object({
  uuid: z.string().nullish(),
  player_uuid: z.string().nullish(),
  receiver_name: z.string(),
  phone: z.string(),
  address: z.string(),
  city: z.string().nullish(),
  city_id: z.number().nullish(),
  province: z.string().nullish(),
  province_id: z.number().nullish(),
  district: z.string().nullish(),
  district_id: z.number().nullish(),
  note: z.string().nullish(),
  lat: z.string().nullish(),
  long: z.string().nullish(),
});
export const playerAddressPayloadSchema = playerAddressSchema.extend({
  player_uuid: z.string({ required_error: "Player is required" }).nullish(),
  receiver_name: z.string()
    .min(2, "Receiver name must be at least 2 characters long"),
  phone: z.string({ required_error: "Phone is required" })
    .min(8, "Phone must be at least 8 characters long")
    .max(15, "Phone must be at most 15 characters long")
    .refine(
      (value: string) => /^[0-9]+$/.test(value),
      "Phone can only contain numbers"
    ),
  address: z.string()
    .min(2, "Address must be at least 2 characters long"),
});

const productSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  description: z.string(),
  unit: z.string(),
  status: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  category: z.any().nullish(),
  id: z.number(),
  media_url: z.string().nullish(),
  pinned_image_uuid: z.string(),
  featured_at: z.string().datetime(),
  createdBy: z.string(),
  updatedBy: z.string(),
  deletedBy: z.string().nullish(),
});

const productDetailSchema = z.object({
  uuid: z.string(),
  product_uuid: z.string(),
  size: z.string(),
  price: z.number(),
  quantity: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  id: z.number(),
  createdBy: z.string(),
  updatedBy: z.string(),
  product: productSchema,
});

const orderItemSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  order_uuid: z.string(),
  product_detail_uuid: z.string(),
  quantity: z.number(),
  price: z.number(),
  sub_total: z.number(),
  createdBy: z.string().nullish(),
  updatedBy: z.string().nullish(),
  deletedBy: z.string().nullish(),
  updatedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  product_detail: productDetailSchema,
});

const playerSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  nickname: z.string(),
  username: z.string(),
  email: z.string(),
  phone: z.string(),
  city: z.string(),
  media_url: z.string(),
  gender: z.string(),
});

const orderAddressSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  order_uuid: z.string(),
  receiver_name: z.string(),
  phone: z.string(),
  address: z.string(),
  province_id: z.number(),
  city_id: z.number(),
  district_id: z.number(),
  note: z.string(),
  lat: z.string(),
  long: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullish(),
  updated_by: z.string().nullish(),
  deleted_at: z.string().datetime().nullish(),
});

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
  payment_evidence: z.any().nullish(),
  shipping_cost: z.number(),
  shipping_code: z.string().nullish(),
  status: z.string(),
  createdAt: z.string().datetime(),
  createdBy: z.string().nullish(),
  updatedAt: z.string().datetime(),
  updatedBy: z.string().nullish(),
  deletedBy: z.string().nullish(),
  player: playerSchema,
  items: z.array(orderItemSchema),
  addresses: z.array(orderAddressSchema),
});

export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;

export type PlayersPayload = z.infer<typeof playersSchema>;
export type PlayerAddressPayload = z.infer<typeof playerAddressPayloadSchema>;
export type PlayerAddress = z.infer<typeof playerAddressSchema>;
export type PlayerList = z.infer<typeof playerPartialSchema>;

export type QuickAddPlayerPayload = z.infer<typeof quickAddPlayerPayloadSchema>;
export type UpdateAccessPayload = z.infer<typeof updateAccessPayloadSchema>;

