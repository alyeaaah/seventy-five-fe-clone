import { IRoundProps, ISeedProps } from "react-brackets";

export interface IPlayer {
    id?: string | number;
    uuid: string;
    name?: string;
    alias?: string;
    media_url?: string;
    level?: string;
  }

export type TournamentRounds = {
  teams: number;
  byes: number;
  rounds: number;
  nextPowerOf2: number;
};

export interface ITeam {
  id?: number | string;
  teamKey?: string | number;
  uuid: string;
  name: string;
  group_index?: number;
  group_position?: number;
  alias?: string;
  score?: {
    point?: number | string;
    game?: number | string;
    set?: number | string;
  };
  players?: IPlayer[];
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
