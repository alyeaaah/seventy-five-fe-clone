import { z } from "zod";

export const leagueSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  color_scheme: z.string().nullish(),
  media_url: z.string(),
  status: z.enum(["ONGOING", "ENDED", "SOON"]),
  year: z.number().int(),
  createdAt: z.string().datetime().nullish(),
  updatedAt: z.string().datetime().nullish(),
});
export const leaguePayloadSchema = z.object({
  id: z.number().int().nullish(),
  name: z.string()
    .min(2, "League must be at least 2 characters long")
    .refine(
      (value: string) => /^[a-zA-Z0-9_ ]+$/.test(value), // Added space after underscore
      "League can only contain letters, numbers, underscores, and spaces"
    ),
  description: z.string(),
  color_scheme: z.string().nullish(),
  media_url: z.string(),
  status: z.enum(["ONGOING", "ENDED", "SOON"]),
  year: z.number().int(),
});
export type LeagueData = z.infer<typeof leagueSchema>;
export type LeaguePayload = z.infer<typeof leaguePayloadSchema>;

