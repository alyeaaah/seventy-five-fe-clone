import { pointSchema } from "@/pages/Admin/PointConfig/api/schema";
import { tournamentsSchema } from "@/pages/Admin/Tournaments/api/schema";
import { z } from "zod";

export const playerStatsSchema = z.object({
  matches: z.number().default(0),
  wins: z.number().default(0),
  loses: z.number().default(0),
  tournaments: z.number().default(0),
  titles: z.number().default(0),
});

export type PlayerStats = z.infer<typeof playerStatsSchema>;

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
