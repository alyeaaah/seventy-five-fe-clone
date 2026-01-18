import { pointSchema } from "@/pages/Admin/PointConfig/api/schema";
import { tournamentMatchDetailSchema, tournamentsSchema } from "@/pages/Admin/Tournaments/api/schema";
import { z } from "zod";

export const groupResponsePlayerSchema = z.object({
  uuid: z.string().nullish(),
  name: z.string().nullish(),
  nickname: z.string().nullish(),
  username: z.string().nullish(),
  email: z.string().email().nullish(),
  city: z.string().nullish(),
  media_url: z.string().nullish(),
  avatar_url: z.string().nullish(),
  isVerified: z.boolean().nullish(),
  featured: z.any().nullish(),
  turnDate: z.string().nullish(), // ISO date string
});

const groupResponseTeamSchema = z.object({
  uuid: z.string().nullish(),
  name: z.string().nullish(),
  alias: z.string().nullish(),
  matches_won: z.number().nullish(),
  games_won: z.number().nullish(),
  point: z.number().nullish(),
  matches_played: z.number().nullish(),
  players: z.array(groupResponsePlayerSchema).nullish(),
});

export const groupResponseSchema = z.object({
  id: z.number(),
  group_name: z.string(),
  group_uuid: z.string(),
  winner_uuid: z.string().nullish(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullish(),
  teams: z.array(groupResponseTeamSchema).nullish(),
});

export const publicTournamentDetailSchema = tournamentsSchema.extend({
  points: z.array(pointSchema),
  court_info: z.object({
    name: z.string(),
    address: z.string(),
    city: z.string(),
    lat: z.string().nullish(),
    long: z.string().nullish(),
  })
})

export type PublicTournamentDetail = z.infer<typeof publicTournamentDetailSchema>;
export type GroupResponse = z.infer<typeof groupResponseSchema>;
export type GroupResponseTeam = z.infer<typeof groupResponseTeamSchema>;
export type GroupResponsePlayer = z.infer<typeof groupResponsePlayerSchema>;
