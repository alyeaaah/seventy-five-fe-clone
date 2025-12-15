import { pointSchema } from "@/pages/Admin/PointConfig/api/schema";
import { tournamentMatchDetailSchema, tournamentsSchema } from "@/pages/Admin/Tournaments/api/schema";
import { z } from "zod";

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
