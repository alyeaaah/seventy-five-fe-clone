import { makeEndpoint } from "@zodios/core";
import { z } from "zod";
import { generalReportSchema } from "./schema";
import { playerPartialSchema } from "../../Players/api/schema";
import { tournamentsSchema } from "../../Tournaments/api/schema";



const GeneralReportApi = makeEndpoint({
  alias: "getGeneralReport",
  method: "get",
  path: `/general/report`,
  response: z
    .object({
      message: z.string(),
      data: generalReportSchema,
    })
});


const TopPlayersApi = makeEndpoint({
  alias: "getTopPlayers",
  method: "get",
  path: `/general/top-players`,
  response: z
    .object({
      message: z.string(),
      data: z.array(playerPartialSchema),
    })
});

const UpcomingTournamentsApi = makeEndpoint({
  alias: "getUpcomingTournaments",
  method: "get",
  path: `/general/upcoming-tournaments`,
  response: z
    .object({
      message: z.string(),
      data: z.array(tournamentsSchema),
    })
});


export const endpoints = {
  GeneralReportApi,
  TopPlayersApi,
  UpcomingTournamentsApi
}