import { z } from "zod";

export const sponsorsSchema = z.object({
  id: z.number().int(),
  uuid: z.string().uuid(),
  name: z.string(),
  slot: z.string().nullish(),
  description: z.string(),
  type: z.enum(["global", "blog", "match", "tournament"]),
  media_url: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});
export const sponsorsPayloadSchema = z.object({
  name: z.string()
    .min(2, "Sponsor name must be at least 2 characters long")
    .refine(
      (value: string) => /^[a-zA-Z0-9_ ]+$/.test(value), // Added space after underscore
      "Sponsor name can only contain letters, numbers, underscores, and spaces"
  ),
  description: z.string()
    .min(2, "Description must be at least 2 characters long"),
  media_url: z.string()
    .min(2, "Image can't be empty"),
  type: z.enum(["global", "blog", "match", "tournament"], {
    required_error: "Type can't be empty"
  }),
  slot: z.string({required_error: "Slot can't be empty"}),
});
export type SponsorsData = z.infer<typeof sponsorsSchema>;
export type SponsorsPayload = z.infer<typeof sponsorsPayloadSchema>;

