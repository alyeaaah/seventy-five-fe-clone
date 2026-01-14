import { z } from "zod";


export const playerSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  nickname: z.string(),
  username: z.string(),
  city: z.string().nullish(),
  media_url: z.string(),
  avatar_url: z.string().nullish(),
  height: z.number(),
  point: z.number(),
  gender: z.string(),
  level_uuid: z.string().nullish(),
});

const matchStatusSchema = z.enum([
  "UPCOMING",
  "ONGOING",
  "PAUSED",
  "ENDED",
]);

const teamPlayerSchema = z.object({
  uuid: z.string(),
  id: z.number(),
  createdBy: z.string().nullish(),
  player: playerSchema,
});

export const teamSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  alias: z.string(),
  players: z.array(teamPlayerSchema),
});

export const tournamentSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  description: z.string(),
  media_url: z.string(),
  status: z.string(),
  type: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  point_config_uuid: z.string().nullish(),
});

export const courtFieldSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  type: z.string(),
  court_uuid: z.string().nullish(),
  court_name: z.string().nullish(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  lat: z.string().nullish(),
  long: z.string().nullish(),
});

export const matchSchema = z.object({
  uuid: z.string(),
  winner_team_uuid: z.string(),
  point_config_uuid: z.string().nullish(),
  home_team_score: z.number(),
  away_team_score: z.number(),
  game_scores: z.any().nullish(),
  round: z.number(),
  with_ad: z.boolean(),
  youtube_url: z.string().nullish(),
  notes: z.string().nullish(),
  status: matchStatusSchema.nullish(),
  category: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string(),
  id: z.number(),
  time: z.string(),
  away_team: teamSchema.nullish(),
  home_team: teamSchema.nullish(),
  tournament: tournamentSchema.nullish(),
  court_field: courtFieldSchema.nullish(),
});


// Schema for the court
const courtSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  lat: z.string().nullish(),
  long: z.string().nullish(),
  id: z.number(),
});

// Schema for the level
const levelSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  level_tier: z.number(),
  id: z.number(),
});

// Schema for point configuration
const pointConfigSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  id: z.number(),
});

// Schema for the sponsor
const sponsorSchema = z.object({
  uuid: z.string(),
  name: z.string().nullish(),
  id: z.number(),
});

// Schema for player team relation
const playerTeamSchema = z.object({
  uuid: z.string(),
  player_uuid: z.string(),
  team_uuid: z.string(),
  id: z.number(),
  player: playerSchema.nullish(),
});

// Schema for the league
const leagueSchema = z.object({
  name: z.string(),
  description: z.string(),
  media_url: z.string(),
  status: z.string(),
  id: z.number(),
  year: z.number(),
});

// Schema for the tournament
export const tournamentsSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  description: z.string(),
  media_url: z.string(),
  status: z.string(),
  type: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  id: z.number(),
  court_uuid: z.string(),
  strict_level: z.boolean(),
  level_uuid: z.string(),
  league_id: z.number().nullish(),
  point_config_uuid: z.string().nullish(),
  featured_at: z.string().nullish(),
  court: courtSchema,
  level: levelSchema.nullish(),
  league: leagueSchema.nullish(),
  point_config: pointConfigSchema.nullish(),
  sponsors: z.array(sponsorSchema).nullish(),
  playerTeams: z.array(playerTeamSchema).nullish(),
});

export const openChallengerPayloadSchema = z.object({
  court_field_uuid: z.string(),
  time: z.string(),
  point_config_uuid: z.string().nullish(),
  with_ad: z.boolean().nullish(),
  challengerA_uuid: z.string(),
  challengerB_uuid: z.string(),
  opponentA_uuid: z.string().optional(),
  opponentB_uuid: z.string().optional(),
});

export const openChallengerResponseSchema = z.object({
  status: z.string(),
});

export type MatchStatusEnum = z.infer<typeof matchStatusSchema>;
export type MatchSchema = z.infer<typeof matchSchema>;

export type TournamentsSchema = z.infer<typeof tournamentsSchema>;

export type OpenChallengerPayload = z.infer<typeof openChallengerPayloadSchema>;
export type OpenChallengerResponse = z.infer<typeof openChallengerResponseSchema>;