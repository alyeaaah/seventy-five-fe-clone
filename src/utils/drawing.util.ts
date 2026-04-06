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
      nickname: player.nickname || '',
      alias: player.nickname || '',
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
        game: (match.game_scores?.sort((a, b) => ( b.game || 0 ) - ( a.game || 0 ))?.[0]?.game_score_home) || 0,
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
        game: (match.game_scores?.sort((a, b) => ( b.game || 0 ) - ( a.game || 0 ))?.[0]?.game_score_away) || 0,
      },
    }],
    home_team: match.home_team,
    away_team: match.away_team,
    home_team_score: match.home_team_score,
    home_group_index: match.home_group_index,
    home_group_position: match.home_group_position,
    home_group_uuid: match.home_group_uuid,
    away_team_score: match.away_team_score,
    away_group_index: match.away_group_index,
    away_group_position: match.away_group_position,
    away_group_uuid: match.away_group_uuid,
    game_scores: match.game_scores || undefined,
    round: match.round,
    roundKey:(match.round !== undefined && match.round !== null && match.round >= 0) ? match.round : undefined,
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

export const sortMatchesDefault = (matches: IMatch[]): IMatch[] => {
  return matches.sort((a, b) => {
    // Finally sort by groupKey asc
    if (a.groupKey !== undefined && b.groupKey !== undefined) {
      return a.groupKey - b.groupKey;
    } else if (a.groupKey !== undefined) {
      return -1;
    } else if (b.groupKey !== undefined) {
      return 1;
    }

    if (a.roundKey !== undefined && b.roundKey !== undefined) {
      return a.roundKey - b.roundKey;
    } else if (a.roundKey !== undefined) {
      return -1;
    } else if (b.roundKey !== undefined) {
      return 1;
    }

    if (a.seed_index !== undefined && b.seed_index !== undefined) {
      return a.seed_index - b.seed_index;
    } else if (a.seed_index !== undefined) {
      return -1;
    } else if (b.seed_index !== undefined) {
      return 1;
    }
    // Then sort by court asc
    if (a.court && b.court) {
      const courtComparison = (a.court || '').localeCompare(b.court || '');
      if (courtComparison !== 0) return courtComparison;
    } else if (a.court && !b.court) {
      return -1;
    } else if (!a.court && b.court) {
      return 1;
    }
    
    // First sort by time asc
    if (a.time && b.time) {
      const timeComparison = new Date(a.time).getTime() - new Date(b.time).getTime();
      if (timeComparison !== 0) return timeComparison;
    } else if (a.time && !b.time) {
      return -1;
    } else if (!a.time && b.time) {
      return 1;
    }
        
    return 0;
  }).map(match => ({
    ...match,
    // Sort teams within each match by team name
    teams: match.teams?.sort((teamA, teamB) => {
      const nameA = (teamA.name || '').trim().toLowerCase();
      const nameB = (teamB.name || '').trim().toLowerCase();
      // Extract numbers from team names for proper numerical comparison
      const numA = parseInt(nameA.replace(/[^\d]/g, '')) || 0;
      const numB = parseInt(nameB.replace(/[^\d]/g, '')) || 0;      
      return numA - numB;
    }) || []

  }));
}
export const alphabetToNumber = (alphabet: string): number => {
  return alphabet.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) + 1;
}
