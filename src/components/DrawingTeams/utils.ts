import { CourtField } from "@/pages/Admin/Courts/api/schema";
import { Team } from "../Bracket/interfaces";
import { Match } from "./interface";
import { generateSchedules } from "@/utils/helper";

export const generateInitialMatches = (teams: Team[], tournamentUuid: string, startDate: Date, endDate: Date, courtOptions: CourtField[]): Match[]  => {
  const matches: Match[] = [];
  const now = new Date().toISOString();
  const schedules = generateSchedules(courtOptions, startDate, endDate, Math.ceil(teams.length / 2));
  let index = 0;
  for (let i = 0; i < teams.length; i += 2) {
    const homeTeam = teams[i];
    const awayTeam = i + 1 < teams.length ? teams[i + 1] : null;
    const schedule = schedules[index];
    
    if (homeTeam) {
      const match: Match = {
        id: new Date().getTime() - Math.floor(Math.random() * 10001), // Random ID for demo
        tournament_uuid: tournamentUuid,
        home_team_uuid: homeTeam.uuid,
        away_team_uuid: awayTeam?.uuid || '',
        home_team: homeTeam,
        away_team: awayTeam || null!,
        home_team_score: 0,
        away_team_score: 0,
        round: 1,
        status: 'UPCOMING',
        date: schedule.date.toISOString(),
        court_field_uuid: schedule.court_uuid,
        court: schedule.name,
        updatedAt: now
      };
      
      matches.push(match);
    }
    index++;
  }
  return matches;
}