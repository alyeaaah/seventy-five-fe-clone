import { z } from "zod";

export const matchCodePayloadSchema = z.object({
  matchCode: z.string().min(1, "Match code is required"),
});

export type MatchCodePayload = z.infer<typeof matchCodePayloadSchema>;