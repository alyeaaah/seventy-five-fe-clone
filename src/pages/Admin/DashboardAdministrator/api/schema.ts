import { z } from "zod";

export const generalReportSchema = z.object({
  matches: z.object({
    total: z.number(),
    upcoming: z.number(),
    finished: z.number(),
  }),
  players: z.object({
    total: z.number(),
    verified: z.number(),
    unverified: z.number(),
  }),
  tournaments: z.object({
    total: z.number(),
    upcoming: z.number(),
  }),
  orders: z.object({
    total: z.number(),
    done: z.number().nullish(),
    monthly_gmv: z.number().nullish(),
    new: z.number(),
  }),
})

export type GeneralReport = z.infer<typeof generalReportSchema>;

