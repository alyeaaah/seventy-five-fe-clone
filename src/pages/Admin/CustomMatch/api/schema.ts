import { z } from "zod";
import { matchDetailSchema, matchStatusEnum } from "../../MatchDetail/api/schema";
import { playersSchema } from "../../Players/api/schema";
import { openChallengerPayloadSchema } from "@/pages/Players/Matches/api/schema";


export const matchesListSchema = z.object({
  data: z.array(matchDetailSchema),
  currentPage: z.number(),
  totalRecords: z.number(),
  totalPages: z.number()
});
export const teamSchema = z.object({
  name: z.string().nullish(),
  alias: z.string().nullish(),
  uuid: z.string().nullish(),
  players: z.array(playersSchema.partial())
});
export const customMatchPayloadSchema = matchDetailSchema.extend({
    id: z.number(),
    uuid: z.string().optional(),
    tournament_uuid: z.string().nullish(),
    home_team_uuid: z.string().nullish(),
    home_team: teamSchema.nullish(),
    away_team_uuid: z.string().nullish(),
    away_team: teamSchema.nullish(),
    winner_team_uuid: z.string().nullish(),
    home_team_score: z.number().or(z.string()).default(0),
    away_team_score: z.number().or(z.string()).default(0),
    with_ad: z.boolean().default(false),
    round: z.number().default(1).nullish(),
    status: matchStatusEnum.default("UPCOMING"),
    youtube_url: z.string().optional(),
    court_field_uuid: z.string().min(1, "Court field is required"),
    court: z.string().optional(),
    point_config_uuid: z.string(),
    point_win: z.number().or(z.string()).default(0).nullish(),
    point_lose: z.number().or(z.string()).default(0).nullish(),
    point_config: z.string().optional(),
    date: z.string(),
})
export const customMatchesPayloadSchema = z.object({
  matches: z.array(customMatchPayloadSchema)
});

export const acceptChallengerPayloadSchema = openChallengerPayloadSchema.extend({
  challenger_id: z.number(),
  court_field_uuid: z.string().optional(),
  challengerA_uuid: z.string(),
  challengerB_uuid: z.string(),
  opponentA_uuid: z.string().optional(),
  opponentB_uuid: z.string().optional(),
});

export type AcceptChallengerPayload = z.infer<typeof acceptChallengerPayloadSchema>;

export type MatchesList = z.infer<typeof matchesListSchema>;
export type CustomMatchPayload = z.infer<typeof customMatchPayloadSchema>;
export type CustomMatchesPayload = z.infer<typeof customMatchesPayloadSchema>;
