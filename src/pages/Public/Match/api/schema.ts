import { pointSchema } from "@/pages/Admin/PointConfig/api/schema";
import { tournamentMatchDetailSchema, tournamentsSchema } from "@/pages/Admin/Tournaments/api/schema";
import { z } from "zod";

export enum ChallengerStatus {
  OPEN = "OPEN",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const challengerStatusSchema = z.nativeEnum(ChallengerStatus);

export const challengerPlayerSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  image_url: z.string().nullish(),
});

export const publicChallengerSchema = z.object({
  id: z.number(),
  court: z.object({
    uuid: z.string(),
    court_field_uuid: z.string().nullish(),
    name: z.string().nullish(),
  }),
  time: z.string(),
  status: challengerStatusSchema,
  challengerA: challengerPlayerSchema.optional(),
  challengerB: challengerPlayerSchema.optional(),
  opponentA: challengerPlayerSchema.optional(),
  opponentB: challengerPlayerSchema.optional(),
  createdBy: z.string(),
  createdAt: z.string()
});

export const publicChallengerListSchema = z.array(publicChallengerSchema);

export const publicTournamentDetailSchema = tournamentsSchema.extend({
  points: z.array(pointSchema),
  court_info: z.object({
    name: z.string(),
    address: z.string(),
    city: z.string(),
    lat: z.string().nullish(),
    lng: z.string().nullish(),
  })
})

export type PublicTournamentDetail = z.infer<typeof publicTournamentDetailSchema>;
export type PublicChallenger = z.infer<typeof publicChallengerSchema>;
