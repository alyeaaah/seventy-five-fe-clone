import { z } from "zod";

export const pointSchema = z.object({
  uuid: z.string().nullish(),
  round: z.number(),
  win_point: z.number(),
  lose_point: z.number(),
  win_coin: z.number(),
  lose_coin: z.number(),
  is_delete: z.boolean().nullish(),
});
export const pointConfigurationsSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  totalRound: z.number().or(z.string()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  points: z.array(pointSchema).nullish(),
});
export const pointConfigurationDetailSchema = z.object({
  uuid: z.string().optional(),
  name: z.string()
    .min(2, "PointConfiguration name must be at least 2 characters long"),
  points: z.array(pointSchema),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export const pointConfigurationFormSchema = z.object({
  uuid: z.string().optional(),
  name: z.string()
    .min(2, "PointConfiguration name must be at least 2 characters long"),
  points: z.array(pointSchema.extend({
    win_point: z.number().min(1, "Win Point must be at least 1"),
    lose_point: z.number().min(1, "Lose Point must be at least 1"),
    win_coin: z.number().min(1, "Win Coin must be at least 1"),
    lose_coin: z.number().min(1, "Lose Coin must be at least 1"),
  })),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type PointConfigurationsData = z.infer<typeof pointConfigurationsSchema>;
export type PointConfigurationsPayload = z.infer<typeof pointConfigurationDetailSchema>;
export type PointConfigurationsFormData = z.infer<typeof pointConfigurationFormSchema>;
export type PointConfig = z.infer<typeof pointSchema>;
