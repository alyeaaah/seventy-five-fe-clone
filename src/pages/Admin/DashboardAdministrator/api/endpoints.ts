import { makeEndpoint } from "@zodios/core";
import { z } from "zod";
import { generalReportSchema } from "./schema";
import { playerSchemaList } from "../../Players/api/schema";
import { tournamentSchema } from "@/pages/Players/Matches/api/schema";



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
      data: z.array(playerSchemaList),
    })
});

const UpcomingTournamentsApi = makeEndpoint({
  alias: "getUpcomingTournaments",
  method: "get",
  path: `/general/upcoming-tournaments`,
  response: z
    .object({
      message: z.string(),
      data: z.array(tournamentSchema),
    })
});


export const endpoints = {
  GeneralReportApi,
  TopPlayersApi,
  UpcomingTournamentsApi
}