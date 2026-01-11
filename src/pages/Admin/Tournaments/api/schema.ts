
import { z } from "zod";
import { matchTeamSchema } from "../../MatchDetail/api/schema";

export const tournamentStatusEnum = z.enum(['DRAFT', 'POSTPONED','CANCELLED','ENDED','ONGOING']);

export const tournamentsSchema = z.object({
  id: z.number().nullish(),
  uuid: z.string().nullish(),
  name: z.string()
    .min(2, "Tournament name must be at least 2 characters long"),
  description: z.string()
    .min(5, "Description must be at least 5 characters long"),
  media_url: z.string()
    .min(2, "Image is required"),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  status: tournamentStatusEnum.default('DRAFT'),
  type: z.enum(['KNOCKOUT', 'ROUND ROBIN', 'FRIENDLY MATCH']).default('KNOCKOUT').nullish(),
  level: z.string().nullish(),
  level_uuid: z.string({ required_error: "Level is required" }),
  court: z.string().nullish(),
  court_uuid: z.string({ required_error: "Court is required" }),
  league_id: z.number().nullish(),
  total_group: z.number().default(0),
  point_config_uuid: z.string().nullish(),
  match_count: z.string().or(z.number()).nullish(),
  player_count: z.string().or(z.number()).nullish(),
  strict_level: z.boolean().default(false),
  participants: z.number().nullish(),
  rules: z.array(z.object({
    uuid: z.string().nullish(),
    description: z.string({ required_error: "Rule is required" }).min(5, "Description must be at least 5 characters long"),
    is_delete: z.boolean().default(false).nullish(),
  })).nullish(),
  published_at: z.string().nullish(),
  createdAt: z.string().datetime().nullish(),
  updatedAt: z.string().datetime().nullish(),
})
const tournamentsSchemaRefine = tournamentsSchema.superRefine((data, ctx) => {
  if (data.type === "ROUND ROBIN" && (!data.total_group || data.total_group <= 0)) {
    ctx.addIssue({
      path: ["total_group"],
      code: z.ZodIssueCode.custom,
      message: "Total group is required when type is ROUND ROBIN",
    });
  }
});

export const tournamentParticipantsSchema = z.object({
  uuid: z.string().nullish(),
  players: z.array(z.object({
    uuid: z.string().nullish(),
    player_uuid: z.string({ required_error: "Player is required" }),
    player_name: z.string().nullish(),
    media_url: z.string().nullish(),
    team_uuid: z.string().nullish(),
    team_name: z.string().min(2, "Team name must be at least 2 characters long").nullish(),
    team_alias: z.string().nullish(),
    isDeleted: z.boolean().default(false).nullish(),
  })),
});

export const tournamentTeamsSchema = z.object({
  id: z.number(),
  uuid: z.string().uuid().nullish(),
  name: z.string(),
  alias: z.string(),
  players: z.array(z.object({
    id: z.number(),
    uuid: z.string().nullish(),
    name: z.string(),
    nickname: z.string().nullish(),
    city: z.string().nullish(),
    media_url: z.string().nullish(),
  })),
});

export const tournamentMatchSchema = z.object({
  id: z.number(),
  uuid: z.string().nullish(),
  tournament_uuid: z.string().nullish(),
  home_team_uuid: z.string().uuid().or(z.enum(["TBD", "BYE"])),
  away_team_uuid: z.string().uuid().or(z.enum(["TBD", "BYE"])),
  home_group_index: z.number().nullish(),
  home_group_position: z.number().nullish(),
  away_group_index: z.number().nullish(),
  away_group_position: z.number().nullish(),
  home_team_score: z.number().default(0).nullish(),
  away_team_score: z.number().default(0).nullish(),
  game_scores: z.array(z.object({
    game_score_home: z.string().or(z.number()),
    game_score_away: z.string().or(z.number()),
    set: z.number()
  })).nullish(),
  round: z.number().nullish(),
  seed_index: z.number().nullish(),
  group: z.number().nullish(),
  group_uuid: z.string().nullish(),
  status: z.string().nullish(),
  court_field_uuid: z.string(),
  court: z.string().nullish(),
  time: z.string().nullish(),
  updatedAt: z.string().nullish(),
});
export const tournamentMatchDetailSchema = tournamentMatchSchema.extend({
  home_team: matchTeamSchema,
  away_team: matchTeamSchema,
})
export const tournamentMatchPayloadSchema = z.object({
  tournament_uuid: z.string().nullish(),
  matches:z.array(tournamentMatchSchema)
})
export const tournamentPointsSchema = z.object({
  uuid: z.string().nullish(),
  single_point: z.boolean().default(false).nullish(),
  points: z.array(z.object({
    uuid: z.string().nullish(),
    round: z.number().min(1, "Round must be at least 1"),
    win_point: z.number().min(1, "Point must be at least 1"),
    lose_point: z.number().min(0, "Point must be at least 0"),
    win_coin: z.number().min(1, "Coin must be at least 1"),
    lose_coin: z.number().min(0, "Coin must be at least 0"),
    isDeleted: z.boolean().default(false).nullish(),
  })).nullish(),
});
  
export const tournamentDetailSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  city: z.string(),
  address: z.string(),
  lat: z.string().nullish(),
  long: z.string().nullish(),
  fields: z.array(z.object({
    uuid: z.string().uuid(),
    name: z.string(),
    type: z.enum(['Grass', 'Hard Tournament', 'Clay', 'Flexi Pave']),
    media_url: z.string().nullish(),
    media_uuid: z.string().uuid().nullish(),
  })),
  createdAt: z.string().datetime().nullish(),
  updatedAt: z.string().datetime().nullish(),
});
 
export const tournamentSponsorSchema =z.object({
  uuid: z.string().nullish(),
  sponsor_uuid: z.string(),
  is_delete: z.boolean().default(false),
});

export const tournamentGroupPayloadSchema = z.object({
  uuid: z.string().nullish(),
  name: z.string().nullish(),
  players: z.array(z.object({
    uuid: z.string(),
    name: z.string().nullish(),
  })).nullish(),
});

export type TournamentGroupPayloadData = z.infer<typeof tournamentGroupPayloadSchema>;

export type TournamentRounds = {
  teams: number;
  byes: number;
  rounds: number;
  nextPowerOf2: number;
};
export type TournamentsPayload = z.infer<typeof tournamentsSchemaRefine>;
export type TournamentParticipants = z.infer<typeof tournamentParticipantsSchema>;
export type TournamentPoints = z.infer<typeof tournamentPointsSchema>;
export type TournamentTeams = z.infer<typeof tournamentTeamsSchema>;
export type TournamentMatchDetail = z.infer<typeof tournamentMatchDetailSchema>;
export type TournamentMatchPayload = z.infer<typeof tournamentMatchSchema>;
export type TournamentMatchesPayload = z.infer<typeof tournamentMatchPayloadSchema>;
export type TournamentSponsorPayload = z.infer<typeof tournamentSponsorSchema>;
export type TournamentStatusEnum = z.infer<typeof tournamentStatusEnum>;

