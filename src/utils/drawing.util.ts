import { TournamentTeams } from "@/pages/Admin/Tournaments/api/schema";
import { IPlayer, ITeam } from "@/components/TournamentDrawing/interfaces";
import { TournamentMatchDetail } from "@/pages/Admin/Tournaments/api/schema";
import { IMatch } from "@/components/TournamentDrawing/interfaces";
import { faker } from "@faker-js/faker";

export const convertTournamentTeamToTeam = (teams: TournamentTeams[]): ITeam[] => {
  const result: ITeam[] = teams.map((team, idx) => ({
    id: team.id || 0,
    uuid: team.uuid || "",
    name: team.name || "",
    alias: team.name || "", // Set alias to team name for lookup
    teamKey: idx+1,
    players: team.players.map((player) => ({
      uuid: player.uuid || "",
      name: player.name,
      media_url: player.media_url || undefined,
      nickname: player.nickname,
      city: player.city
    }))
  }))
  return result;
}
export const convertTeamToTournamentTeam = (teams: ITeam[]): TournamentTeams[] => {
  const result: TournamentTeams[] = teams.map((team, idx) => ({
    id: !isNaN(Number(team.id)) ? Number(team.id): 0,
    uuid: team.uuid || "",
    name: team.name || "",
    alias: team.alias || "",
    players: team.players?.map((player, pIdx) => ({
      id: !isNaN(Number(player.id)) ? Number(player.id): 0,
      uuid: player.uuid || "",
      name: player.name || "",
      player_uuid: player.uuid || "",
      media_url: player.media_url || undefined,
      nickname: "",
      city: ""
    })) || [],
    
  }))
  return result;
}
export const convertTournamentMatchToMatch = (matches: TournamentMatchDetail[]): IMatch[] => {
  const result: IMatch[] = matches.map((match, idx) => ({
    id: match.id || 0,
    teams: [{
      name: match.home_team.name,
      alias: match.home_team.name, // Set alias to team name for lookup
      uuid: match.home_team.uuid,
      players: match.home_team.players.map(hp => ({
        id: hp.uuid || faker.string.uuid(),
        uuid: hp.uuid || faker.string.uuid(),
        name: hp.name,
        alias: hp.nickname,
      } as IPlayer)),
      score:  {
        set: match.home_team_score || 0,
        game: match.game_scores?.sort((a, b) => b.set - a.set)?.[0]?.game_score_away || 0,
      },
    }, {
      name: match.away_team.name,
      alias: match.away_team.name, // Set alias to team name for lookup
      uuid: match.away_team.uuid,
      players: match.away_team.players.map(ap => ({
        id: ap.uuid || faker.string.uuid(),
        uuid: ap.uuid || faker.string.uuid(),
        name: ap.name,
        alias: ap.nickname,
      } as IPlayer)),
      score:  {
        set: match.away_team_score || 0,
        game: match.game_scores?.sort((a, b) => b.set - a.set)?.[0]?.game_score_away || 0,
      },
    }],
    home_team: match.home_team,
    away_team: match.away_team,
    home_team_score: match.home_team_score,
    away_team_score: match.away_team_score,
    game_scores: match.game_scores || undefined,
    round: match.round,
    roundKey:match.round !== undefined && match.round !== null && match.round >= 0 ? match.round : undefined,
    groupKey: match.groupKey || 0,
    group_uuid: match.group_uuid,
    seed_index: match.seed_index || 0,
    status: match.status,
    court_field_uuid: match.court_field_uuid,
    court: match.court || undefined,
    uuid: match.uuid || undefined,
    time: match.time || undefined,
  }))
  return result;
}
