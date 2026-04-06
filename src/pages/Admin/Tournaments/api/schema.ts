
import { z } from "zod";
import { matchTeamSchema } from "../../MatchDetail/api/schema";

export const draftPickStatusEnum = z.enum(["AVAILABLE", "PICKING", "PICKED"]);

export const draftPickPayloadSchema = z.object({
  id:z.number().nullish(),
  player_uuid: z.string(),
  team_uuid: z.string().optional(),
  position: z.number().min(1),
  status: draftPickStatusEnum,
  seeded: z.boolean().default(false),
});

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
  group_qualifier: z.number().default(1),
  point_config_uuid: z.string().nullish(),
  match_count: z.string().or(z.number()).nullish(),
  player_count: z.string().or(z.number()).nullish(),
  strict_level: z.boolean().default(false),
  draft_pick: z.boolean().default(false),
  show_bracket: z.boolean().default(false),
  commitment_fee: z.number().or(z.string()).default(0),
  participants: z.number().nullish(),
  join_status: z.enum(['REQUESTED', 'APPROVED', 'CONFIRMED', 'REJECTED']).nullish(),
  max_player: z.number().nullish(),
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
  if (data.type === "ROUND ROBIN" && (!data.group_qualifier || data.group_qualifier <= 0)) {
    ctx.addIssue({
      path: ["group_qualifier"],
      code: z.ZodIssueCode.custom,
      message: "Group qualifier is required when type is ROUND ROBIN",
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
  id: z.number().nullish(),
  uuid: z.string().uuid().nullish(),
  name: z.string(),
  alias: z.string(),
  players: z.array(z.object({
    id: z.number(),
    uuid: z.string().nullish(),
    name: z.string(),
    nickname: z.string().nullish(),
    city: z.string().nullish(),
    level: z.string().nullish(), // Added from tournamentTeamParticipantSchema
    media_url: z.string().nullish(),
    player_uuid: z.string().nullish(), // Added from tournamentTeamParticipantSchema
    status: z.string().nullish(), // Added from tournamentTeamParticipantSchema
  })),
  registeredAt: z.string().nullish(), // Added from tournamentTeamParticipantSchema
  status: z.string().nullish(), // Added from tournamentTeamParticipantSchema
});

// Remove duplicate tournamentTeamParticipantSchema as it's now merged into tournamentTeamsSchema

export const tournamentMatchSchema = z.object({
  id: z.number(),
  uuid: z.string().nullish(),
  tournament_uuid: z.string().nullish(),
  home_team_uuid: z.string().uuid().or(z.enum(["TBD", "BYE"])),
  away_team_uuid: z.string().uuid().or(z.enum(["TBD", "BYE"])),
  home_team_alias: z.string().nullish(),
  home_group_uuid: z.string().nullish(),
  home_group_index: z.number().nullish(),
  home_group_position: z.number().nullish(),
  away_group_uuid: z.string().nullish(),
  away_group_index: z.number().nullish(),
  away_group_position: z.number().nullish(),
  away_team_alias: z.string().nullish(),
  home_team_score: z.number().default(0).nullish(),
  away_team_score: z.number().default(0).nullish(),
  game_scores: z.array(z.object({
    game_score_home: z.string().or(z.number()),
    game_score_away: z.string().or(z.number()),
    set: z.number().default(0),
    game: z.number().default(0)
  })).nullish(),
  round: z.number().nullish(),
  seed_index: z.number().nullish(),
  group: z.number().nullish(),
  group_uuid: z.string().nullish(),
  groupKey: z.number().nullish(),
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
  join_status: z.enum(['REQUESTED', 'APPROVED', 'CONFIRMED', 'REJECTED']).nullish(),
  max_player: z.number().nullish(),
});
 
export const tournamentSponsorSchema =z.object({
  uuid: z.string().nullish(),
  sponsor_uuid: z.string(),
  is_delete: z.boolean().default(false),
});

export const matchGroupPayloadSchema = z.object({
  uuid: z.string().nullish(),
  away_team_uuid: z.string(),
  home_team_uuid: z.string(),
  court_field_uuid: z.string(),
  time: z.string(),
  group_uuid: z.string().nullish(),
  status: z.string().nullish(),
  groupKey: z.number(),
});

export const updateMatchPayloadSchema = z.object({
  uuid: z.string().optional(),
  home_team_uuid: z.string().optional(),
  away_team_uuid: z.string().optional(),
  court_field_uuid: z.string().nullable().optional(),
  status: z.enum(["UPCOMING", "ONGOING", "PAUSED", "ENDED"]).optional(),
  time: z.string().optional(),
  round: z.number().optional(),
  group: z.number().optional(),
  seed_index: z.number().optional(),
  home_group_index: z.number().optional(),
  home_group_position: z.number().optional(),
  away_group_index: z.number().optional(),
  away_group_position: z.number().optional(),
});

export const tournamentGroupPayloadSchema = z.object({
  groups: z.array(z.object({
    uuid: z.string().nullish(),
    groupKey: z.number(),
    name: z.string(),
    teams: z.array(z.object({
      uuid: z.string().nullish(),
      name: z.string(),
      position: z.number().nullish(),
    })),
  })),
  matches: z.array(matchGroupPayloadSchema),
});

// Using extend method to create groups-only schema
export const tournamentGroupOnlyPayloadSchema = tournamentGroupPayloadSchema.extend({
  groups: tournamentGroupPayloadSchema.shape.groups,
}).omit({ matches: true });


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
export type TournamentJoinStatusEnum = z.infer<typeof tournamentDetailSchema>['join_status'];
export type TournamentUpdateGroupPayload = z.infer<typeof tournamentGroupPayloadSchema>;
export type TournamentUpdateGroupOnlyPayload = z.infer<typeof tournamentGroupOnlyPayloadSchema>;
export type UpdateMatchPayload = z.infer<typeof updateMatchPayloadSchema>;
