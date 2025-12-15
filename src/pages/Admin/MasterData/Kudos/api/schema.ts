import { z } from "zod";

export const kudosSchema = z.object({
  id: z.number().int(),
  uuid: z.string().uuid(),
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});
export const kudosPayloadSchema = z.object({
  name: z.string()
    .min(2, "Kudos must be at least 2 characters long")
    .refine(
      (value: string) => /^[a-zA-Z0-9_ ]+$/.test(value), // Added space after underscore
      "Kudos can only contain letters, numbers, underscores, and spaces"
    ),
});

export const giveKudosPayloadSchema = z.object({
  match_uuid: z.string(),
  player_uuid: z.string(),
  kudos_uuid: z.string(),
  kudos_text: z.string().nullish(),
});
export type KudosData = z.infer<typeof kudosSchema>;
export type KudosPayload = z.infer<typeof kudosPayloadSchema>;
export type GiveKudosPayload = z.infer<typeof giveKudosPayloadSchema>;

