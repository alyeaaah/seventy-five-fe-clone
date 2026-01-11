import { MatchScoreFirestore } from "@/pages/Admin/MatchDetail/api/schema";
import { ITeam } from "../TournamentDrawing/interfaces";

export interface Match {
  id?: number;
  uuid?: string;
  tournament_uuid?: string;
  home_team_uuid: string;
  away_team_uuid: string;
  home_team: ITeam;
  away_team: ITeam;
  home_team_score?: number;
  away_team_score?: number;
  round?: number;
  status?: string;
  court_field_uuid?: string;
  court?: string;
  date?: string;
  updatedAt?: string;
}

export interface DrawingTeamsProps {
  data: Match[];
  onMatchClicked?: (match: Match) => void;
  onTeamsChanged?: (updatedMatches: Match[]) => void;
  draggable?: boolean;
  scores?: MatchScoreFirestore[]
}
