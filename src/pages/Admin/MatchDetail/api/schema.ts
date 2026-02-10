import { z } from "zod";
import { playerPartialSchema } from "../../Players/api/schema";
import { pointSchema } from "../../PointConfig/api/schema";
import { courtFieldSchema, courtsSchema } from "../../Courts/api/schema";

export const matchStatusEnum = z.enum(["UPCOMING", "ONGOING", "PAUSED", "ENDED"]);

export const matchTeamSchema = z.object({
  uuid: z.string().uuid().or(z.enum(["TBD", "BYE"])),
  name: z.string(),
  alias: z.string(),
  players: z.array(playerPartialSchema)
});
const playerKudosSchema = z.object({
  kudos: z.string().nullish(),
  kudos_rating: z.number().nullish(),
  kudos_text: z.string().nullish(),
  player_uuid: z.string().nullish(),
  by_uuid: z.string().nullish(),
  by: z.string().nullish(),
})
export const matchDetailSchema = z.object({
  id: z.number(),
  uuid: z.string().optional(),
  shortcode: z.string().nullish(),
  tournament_uuid: z.string().nullish(),
  home_team_uuid: z.string().uuid().or(z.enum(["TBD", "BYE"])),
  away_team_uuid: z.string().uuid().or(z.enum(["TBD", "BYE"])),
  home_team: matchTeamSchema.nullish(),
  away_team: matchTeamSchema.nullish(),
  winner_team_uuid: z.string().nullish(),
  home_team_score: z.number().or(z.string()).default(0).optional(),
  away_team_score: z.number().or(z.string()).default(0).optional(),
  point_config_uuid: z.string().nullish(),
  round: z.number().nullish(),
  with_ad: z.boolean().default(false),
  seed_index: z.number().nullish(),
  status: matchStatusEnum.nullish(),
  notes: z.string().nullish(),
  youtube_url: z.string().optional(),
  court_field_uuid: z.string(),
  court: z.string().optional(),
  court_field: courtFieldSchema.extend({
    court: courtsSchema.nullish()
  }).nullish(),
  court_uuid: z.string().nullish(),
  date: z.string().optional(),
  player_kudos: z.array(playerKudosSchema).nullish(),
  createdAt: z.string().datetime().nullish(),
  updatedAt: z.string().datetime().nullish(),
});


export const fullMatchDetailSchema = matchDetailSchema.extend({
  home_team: matchTeamSchema.nullish(),
  away_team: matchTeamSchema.nullish(),
  point_config: z.object({
    name:z.string().nullish(),
    points: z.array(
      pointSchema.partial()
    ).nullish()
  }).nullish()
})

export const matchTeamPartialSchema = z.object({
  uuid: z.string().uuid().or(z.enum(["TBD", "BYE"])),
  name: z.string(),
  alias: z.string(),
  players: z.array(playerPartialSchema).nullish()
});
export const updateMatchResponseSchema = matchDetailSchema.extend({
  home_team: matchTeamPartialSchema.nullish(),
  away_team: matchTeamPartialSchema.nullish(),
  point_config: z.object({
    name:z.string().nullish(),
    points: z.array(
      pointSchema.partial()
    ).nullish()
  }).nullish()
})

export const matchScoreFirestoreSchema = z.object({
  refId: z.string().nullish(),
  match_uuid: z.string(),
  tournament_uuid:z.string(),
  set: z.number(),
  game_score_home: z.string().or(z.number()).default("0"),
  game_score_away: z.string().or(z.number()).default("0"),
  last_updated_at: z.string(),
  with_ad: z.boolean().default(false),
  prev: z.object({
    set_score_home: z.number().or(z.string()).default("0"),
    set_score_away: z.number().or(z.string()).default("0")
  })
})
export const matchesScoreFirestoreSchema = z.object({
  match_uuid: z.string().nullish(),
  matchScore: z.array(matchScoreFirestoreSchema)
})
export const gameScoreSchema = z.object({
  set: z.number().default(1),
  game: z.number().default(1),
  game_score_home: z.string().or(z.number()).default("0"),
  game_score_away: z.string().or(z.number()).default("0"),
})
export const scoreUpdatePayloadSchema = z.object({
  home_team_score: z.string().or(z.number()).default("0"),
  away_team_score: z.string().or(z.number()).default("0"),
  game_scores: z.array(gameScoreSchema).nullish(),
  player_uuid: z.string().nullish(),
  notes: z.string().nullish(),
  status: z.enum(["INJURY", "NO_SHOW","OTHERS","RESET"]).nullish(),
})

export type GameScoreData = z.infer<typeof gameScoreSchema>;
export type MatchDetail = z.infer<typeof matchDetailSchema>;
export type MatchScoreFirestore = z.infer<typeof matchScoreFirestoreSchema>;
export type MatchesScoreFirestore = z.infer<typeof matchesScoreFirestoreSchema>;
export type ScoreUpdatePayload = z.infer<typeof scoreUpdatePayloadSchema>;
export type MatchStatusEnum = z.infer<typeof matchStatusEnum>;
export type MatchTeam = z.infer<typeof matchTeamSchema>;

