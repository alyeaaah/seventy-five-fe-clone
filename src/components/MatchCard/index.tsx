import { IMatch } from "../TournamentDrawing/interfaces";
import { MatchCardOval } from "./MatchCardOval";
import { MatchCardThumbnail } from "./MatchCardThumbnail";

export interface MatchCardProps {
  match: IMatch;
  matchIndex: number;
  groupIndex: number;
  onClick?: (match: IMatch) => void;
  variant?: 'row-oval' | 'thumbnail';
}

export const MatchCard: React.FC<MatchCardProps> = (props) => {
  const { variant } = props;

  switch (variant) {
    case 'row-oval':
      return <MatchCardOval {...props} />;

    default:
      return <MatchCardThumbnail {...props} />;
  }
};
