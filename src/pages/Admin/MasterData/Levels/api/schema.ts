import { z } from "zod";

export const levelsSchema = z.object({
  id: z.number().int(),
  uuid: z.string().uuid(),
  name: z.string(),
  level_tier: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});
export const levelsPayloadSchema = z.object({
  name: z.string()
    .min(2, "Levels must be at least 2 characters long")
    .refine(
      (value: string) => /^[a-zA-Z0-9_ ]+$/.test(value), // Added space after underscore
      "Levels can only contain letters, numbers, underscores, and spaces"
    ),
  level_tier: z.number().int().min(1).max(6),
});
export type LevelsData = z.infer<typeof levelsSchema>;
export type LevelsPayload = z.infer<typeof levelsPayloadSchema>;

