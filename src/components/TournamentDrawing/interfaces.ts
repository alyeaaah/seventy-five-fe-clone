import { IRoundProps, ISeedProps } from "react-brackets";

export interface IPlayer {
  id?: string | number;
  uuid: string;
  name?: string;
  alias?: string;
  nickname?: string | null;
  media_url?: string;
  level?: string | null;
  // Additional fields from API response
  player_uuid?: string | null;
  status?: string | null;
}

export type TournamentRounds = {
  teams: number;
  byes: number;
  rounds: number;
  nextPowerOf2: number;
};

export interface ITeam {
  id?: number | null;
  teamKey?: string | number;
  uuid: string;
  name: string;
  alias?: string;
  group_index?: number;
  group_position?: number;
  position?: number; // Position within group
  score?: {
    point?: number | string;
    game?: number | string;
    set?: number | string;
  };
  players?: IPlayer[];
  // Group fields for knockout phase (generic team fields)
  team_group_uuid?: string;
  team_group_position?: number;
  team_group_index?: number;
  status?: string | null | undefined;
  registeredAt?: string | null | undefined;
  // Additional fields from API response
  level?: string | null | undefined;
  nickname?: string | null | undefined;
  city?: string | null | undefined;
  // Fields from tournament team participants
  captain?: boolean | null | undefined;
  player_uuid?: string | null | undefined;
}
export interface IGroup {
  id?: number | string;
  uuid?: string;
  groupKey?: number;
  name?: string;
  teams: ITeam[]
}

export interface IMatch extends ISeedProps {
  uuid?: string;
  link?: string;
  teams: ITeam[];
  game_scores?: {
    game_score_home: string | number,
    game_score_away: string | number,
    set: number
  }[],
  court?: string; // court.name
  court_uuid?: string; // court.uuid
  groupKey?: number; // if groupKey is not undefined, means this is match for group stage, and group key stand for group index
  roundKey?: number; // if roundKey is not undefined, means this is for "knockout" phase , roundKey will be stand for round index
  seed_index?: number;
  time?: string; // datetime iso string
}

export interface IRound extends IRoundProps {
  index?: number;
  seeds: IMatch[]
}

export interface ITournamentInfo {
  startDate: Date,
  endDate: Date,
  courts: {
    uuid: string, name: string
  }[]
}

export interface DraggableTeamProps {
  team: ITeam;
  matchId: number | string;
  teamIndex: 0 | 1;
  onDrop: (matchId: number | string , teamIndex: 0 | 1, team: ITeam) => void;
}
