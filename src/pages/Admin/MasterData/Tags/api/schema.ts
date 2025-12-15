import { z } from "zod";

export const tagsSchema = z.object({
  id: z.number().int(),
  uuid: z.string().uuid(),
  name: z.string(),
  type: z.enum(["gallery", "blog", "match"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  parent_uuid: z.string().uuid().nullable(),
  createdBy: z.string().uuid(),
});
export const tagsPayloadSchema = z.object({
  name: z.string()
    .min(2, "Tags must be at least 2 characters long")
    .refine(
      (value: string) => /^[a-zA-Z0-9_]+$/.test(value),
      "Tags can only contain letters, numbers, and underscores" 
    ),
  type: z.enum(["gallery", "blog", "match"], { required_error: "Type is required", message: "Type is required" }),
  parent_uuid: z.string().uuid().nullable(),
});
export type TagsData = z.infer<typeof tagsSchema>;
export type TagsPayload = z.infer<typeof tagsPayloadSchema>;

