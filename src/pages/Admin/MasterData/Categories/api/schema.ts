import { z } from "zod";

export const categoriesSchema = z.object({
  id: z.number().int(),
  uuid: z.string().uuid(),
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});
export const categoriesPayloadSchema = z.object({
  name: z.string()
    .min(2, "Categories must be at least 2 characters long")
    .refine(
      (value: string) => /^[a-zA-Z0-9_ ]+$/.test(value), // Added space after underscore
      "Categories can only contain letters, numbers, underscores, and spaces"
    ),
  category_tier: z.number().int().min(1).max(6),
});
export type CategoriesData = z.infer<typeof categoriesSchema>;
export type CategoriesPayload = z.infer<typeof categoriesPayloadSchema>;

