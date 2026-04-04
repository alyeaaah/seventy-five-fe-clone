import { pointSchema } from "@/pages/Admin/PointConfig/api/schema";
import { tournamentMatchDetailSchema, tournamentsSchema } from "@/pages/Admin/Tournaments/api/schema";
import { z } from "zod";

export const draftPickStatusSchema = z.enum(["AVAILABLE", "PICKING", "PICKED"]);

export const draftPickSchema = z.object({
  id: z.number(),
  player_uuid: z.string(),
  name: z.string(),
  nickname: z.string().nullish(),
  email: z.string(),
  username: z.string().nullish(),
  teams_uuid: z.string().nullish(),
  tournament_uuid: z.string(),
  drafted_by: z.string().nullish(),
  position: z.number(),
  status: draftPickStatusSchema.default("AVAILABLE"),
  seeded: z.boolean().default(false),
  deletedBy: z.string().nullish(),
  updatedBy: z.string().nullish(),
  deletedAt: z.string().datetime().nullish(),
  pickingAt: z.string().datetime().nullish(),
  createdAt: z.string().datetime().nullish(),
  updatedAt: z.string().datetime().nullish(),
});

export type DraftPick = z.infer<typeof draftPickSchema>;
export type DraftPickStatus = z.infer<typeof draftPickStatusSchema>;

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

export const tournamentJoinStatusSchema = z.object({
  hasJoined: z.boolean(),
  status: z.enum(['REQUESTED', 'APPROVED', 'CONFIRMED', 'REJECTED']).nullish(),
  teamUuid: z.string().nullish(),
  teamName: z.string().nullish(),
  joinedAt: z.string().datetime().nullish(),
  draftPick: draftPickSchema.omit({
    email:true,
    name: true,
    nickname: true,
    username: true
  }).nullish(),
});

export type TournamentJoinStatus = z.infer<typeof tournamentJoinStatusSchema>;

export const publicTournamentDetailSchema = tournamentsSchema.extend({
  points: z.array(pointSchema),
  court_info: z.object({
    name: z.string(),
    address: z.string(),
    city: z.string(),
    lat: z.string().nullish(),
    long: z.string().nullish(),
  }),
  commitment_fee: z.number().int().default(0),
})

export type PublicTournamentDetail = z.infer<typeof publicTournamentDetailSchema>;
export type GroupResponse = z.infer<typeof groupResponseSchema>;
export type GroupResponseTeam = z.infer<typeof groupResponseTeamSchema>;
export type GroupResponsePlayer = z.infer<typeof groupResponsePlayerSchema>;
