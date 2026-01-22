import { z } from "zod";

const playerSkillsSchema = z.object({
  forehand: z.number().default(0),
  backhand: z.number().default(0),
  serve: z.number().default(0),
  volley: z.number().default(0),
  overhead: z.number().default(0),
});
export const playerLeagueSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  color_scheme: z.string().nullish(),
  media_url: z.string().nullish(),
})

export const playersSchema = z.object({
  uuid: z.string().optional(),
  name: z.string()
    .min(2, "Player name must be at least 2 characters long"),
  username: z.string()
    .min(2, "Username must be at least 2 characters long"),
  nickname: z.string()
    .min(2, "Nickname must be at least 2 characters long"),
  email: z.string().email().nullish(),
  city: z.string()
    .min(2, "City must be at least 2 characters long"),
  address: z.string()
    .min(2, "Address must be at least 2 characters long").nullish(),
  phone: z.string({required_error: "Phone is required" })
    .min(8, "Phone must be at least 8 characters long")
    .max(15, "Phone must be at most 15 characters long")
    .refine(
      (value: string) => /^[0-9]+$/.test(value),
      "Phone can only contain numbers"
    ),
  media_url: z.string()
    .min(2, "Image is required"),
  avatar_url: z.string()
    .min(2, "Image is required").nullish(),
  dateOfBirth: z.string().date().optional(),
  placeOfBirth: z.string().optional(),
  gender: z.enum(['m', 'f'], {
    required_error: "Gender can't be empty",
    invalid_type_error: "Please select a valid gender (male or female)",
    message: "Please select a valid gender (male or female)",
  }),
  isVerified: z.boolean().default(false),
  height: z.number().min(120, "Height must be at least 120 cm").max(250, "Height must be at most 250 cm"),
  turnDate: z.string().date().optional(),
  skills: playerSkillsSchema.nullish(),
  playstyleForehand: z.enum(['RIGHT', 'LEFT']).default('RIGHT').optional(),
  playstyleBackhand: z.enum(['One Handed', 'Double Handed']).default('Double Handed').optional(),
  socialMediaIg: z.string().optional(),
  socialMediaX: z.string().optional(),
  level: z.string().optional(),
  level_uuid: z.string({ required_error: "Level is required" }),
  league: playerLeagueSchema.nullish(),
  league_id: z.number().nullish(),
  point: z.number().optional(),
  isReferee: z.boolean().default(false),
  createdAt: z.string().datetime().nullish(),
  updatedAt: z.string().datetime().nullish(),
});
export const playersPartialSchema = playersSchema.extend({
  email: z.string().nullish(),
  nickname: z.string().nullish(),
  media_url: z.string().nullish(),
  socialMediaIg: z.string().nullish(),
  socialMediaX: z.string().nullish(),
  avatar_url: z.string().nullish(),
  level: z.string().nullish(),
  level_uuid: z.string().nullish(),
  city: z.string().nullish(),
  address: z.string().nullish(),
  height: z.number().nullish(),
})
export const playerDetailSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  email: z.string(),
  city: z.string(),
  address: z.string(),
  lat: z.string().optional(),
  long: z.string().optional(),
  createdAt: z.string().datetime().nullish(),
  updatedAt: z.string().datetime().nullish(),
});


export type PlayersPayload = z.infer<typeof playersSchema>;
export type PlayersPartialSchema = z.infer<typeof playersPartialSchema>;
export type PlayerSkillsPayload = z.infer<typeof playerSkillsSchema>;
export type PlayerLeagueData = z.infer<typeof playerLeagueSchema>;


