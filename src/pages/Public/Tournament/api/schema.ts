import { pointSchema } from "@/pages/Admin/PointConfig/api/schema";
import { tournamentEventStatusEnum, tournamentsSchema, tournamentStatusEnum } from "@/pages/Admin/Tournaments/api/schema";
import { z } from "zod";

export const draftPickStatusSchema = z.enum(["AVAILABLE", "PICKING", "PICKED", "REQUESTED","REJECTED","APPROVED"]);

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
    fields: z.array(
      z.object({
        uuid: z.string().nullish(),
        name: z.string().nullish(),
      })
    ).nullish()
  }),
  early_bird_price: z.number().or(z.string()).nullish(),
  early_bird_start_date: z.string().datetime().nullish(),
  early_bird_end_date: z.string().datetime().nullish(),
  early_bird_limit: z.number().int().nullish(),
  draft_picks: z.array(z.any()).nullish(),
  commitment_fee: z.number().int().default(0),
})


export const tourneySchema = z.object({
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
  tournament_event_uuid: z.string().nullish(),
})
export const eventTourneySchema = z.object({
  id: z.number().nullish(),
  uuid: z.string().nullish(),
  name: z.string()
    .min(2, "Tournament name must be at least 2 characters long"),
  description: z.string()
    .min(5, "Description must be at least 5 characters long"),
  media_url: z.string()
    .min(2, "Image is required"),
  status: tournamentStatusEnum.default('DRAFT'),
  level: z.string().nullish(),
  court: z.string().nullish(),
  league_id: z.number().nullish(),
  join_status: z.enum(['REQUESTED', 'APPROVED', 'CONFIRMED', 'REJECTED']).nullish(),
  rules: z.string().nullish(),
  published_at: z.string().nullish(),
  createdAt: z.string().datetime().nullish(),
  updatedAt: z.string().datetime().nullish(),
  tournaments: z.array(tournamentsSchema).nullish(),
})
export const featuredTourneySchema = z.discriminatedUnion("isTournamentEvent", [
  // Schema for regular tournaments
  tourneySchema.extend({
    isTournamentEvent: z.literal(false),
    type: z.enum(['KNOCKOUT', 'ROUND ROBIN', 'FRIENDLY MATCH']).default('KNOCKOUT'),
  }),
  // Schema for tournament events  
  eventTourneySchema.extend({
    isTournamentEvent: z.literal(true),
    type: z.undefined().optional(),
    start_date: z.undefined().optional(),
    end_date: z.undefined().optional(),
  })
])

export const featuredTourneySchemaWithEvent = z.discriminatedUnion("hasTournamentEvent", [
  // Schema for tournaments with tournament_event_uuid (regular tournaments)
  z.object({
    hasTournamentEvent: z.literal(true),
    ...tourneySchema.shape,
    type: z.enum(['KNOCKOUT', 'ROUND ROBIN', 'FRIENDLY MATCH']).default('KNOCKOUT')
  }),
  
  // Schema for tournaments without tournament_event_uuid (event tournaments)
  z.object({
    hasTournamentEvent: z.literal(false),
    ...eventTourneySchema.shape,
    type: z.null(),
  })
]);


// Public Tournament Event Schemas
export const publicTournamentEventSchema = z.object({
  id: z.number().nullish(),
  uuid: z.string().nullish(),
  name: z.string(),
  logo: z.string().nullish(),
  description: z.string(),
  rules: z.string(),
  commitment_fee: z.number(),
  status: tournamentEventStatusEnum,
  published_at: z.string().datetime().nullable(),
  media_url: z.string().nullable(),
  registration_closed: z.string().datetime().nullable().optional(),
  created_by: z.string().nullable(),
  updated_by: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
  tournaments: z.array(publicTournamentDetailSchema.partial()).optional(),
});
export const tournamentEventQuotaSchema = z.object({
  tournament_uuid: z.string(),
  is_early_bird: z.boolean(),
  remaining_quota_early_bird: z.number(),
  has_joined: z.boolean(),
  remaining_quota: z.number(),
});

export type PublicTournamentDetail = z.infer<typeof publicTournamentDetailSchema>;
export type GroupResponse = z.infer<typeof groupResponseSchema>;
export type GroupResponseTeam = z.infer<typeof groupResponseTeamSchema>;
export type GroupResponsePlayer = z.infer<typeof groupResponsePlayerSchema>;
export type FeaturedTourney = z.infer<typeof featuredTourneySchema>;
export type PublicTournamentEvent = z.infer<typeof publicTournamentEventSchema>;
export type TournamentEventQuota = z.infer<typeof tournamentEventQuotaSchema>;
