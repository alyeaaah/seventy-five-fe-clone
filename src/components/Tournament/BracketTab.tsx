import React, { useEffect } from 'react';
import Lucide from '../Base/Lucide';
import { DraggableBracket, TournamentDrawingUtils } from '../TournamentDrawing';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../router/paths';
import { TournamentMatchDetail } from '@/pages/Admin/Tournaments/api/schema';
import { convertTournamentMatchToMatch, sortMatchesDefault } from '@/utils/drawing.util';
import { IMatch } from '../TournamentDrawing/interfaces';

interface BracketTabProps {
  matchesData: TournamentMatchDetail[];
}

export const BracketTab: React.FC<BracketTabProps> = ({ matchesData }) => {
  const navigate = useNavigate();
  const [matches, setMatches] = React.useState<IMatch[]>([]);
  const { convertMatchToRound } = TournamentDrawingUtils;


  const groupLabeling = (groupIndex: number, groupPosition: number) => {
    // Convert group index to letter (0 -> A, 1 -> B, etc.)
    const groupLetter = String.fromCharCode(65 + groupIndex); // 65 = 'A' in ASCII

    // Convert position to ordinal number (1 -> 1st, 2 -> 2nd, 3 -> 3rd, etc.)
    const getPositionOrdinal = (position: number) => {
      if (position === 1) return "1st";
      if (position === 2) return "2nd";
      if (position === 3) return "3rd";
      if (position === 4) return "4th";
      return `${position}th`; // fallback for other positions
    };

    return `Group ${groupLetter} ${getPositionOrdinal(groupPosition)}`;
  }

  useEffect(() => {
    if (!matchesData.length) return;

    if (!matchesData?.length) {
      return;
    } else {
      const tempMatches = convertTournamentMatchToMatch(matchesData || []);
      tempMatches.map((match) => {
        if (match.home_group_uuid) {
          match.teams[0].name = groupLabeling(match.home_group_index, match.home_group_position)
        }
        if (match.away_group_uuid) {
          match.teams[1].name = groupLabeling(match.away_group_index, match.away_group_position)
        }
        return match;
      })

      setMatches(sortMatchesDefault(tempMatches));
    }
  }, [matchesData]);

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl bg-gray-50">
        <Lucide icon="Trophy" className="h-16 w-16 text-emerald-800/60 mb-4" />
        <h3 className="text-emerald-800 text-lg font-medium mb-2 text-center">No Bracket Available</h3>
        <p className="text-emerald-800/80 text-sm text-center">Knockout bracket will be displayed here once available.</p>
      </div>
    );
  }

  return (
    <div className="h-fit overflow-x-scroll">
      <DraggableBracket
        rounds={convertMatchToRound(matches)}
        readOnly
        className=""
        setRounds={() => null}
        onSeedClick={(seed: any) => {
          navigate(paths.tournament.match({ matchUuid: seed.uuid }).$)
        }}
      />
    </div>
  );
};
