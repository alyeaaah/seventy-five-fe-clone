import { useEffect } from 'react';
import { useMatchSocket } from '@/hooks/useMatchSocket';
import { useScore } from '@/utils/score.util';
import { ScoreUpdatePayload } from '@/pages/Admin/MatchDetail/api/schema';

interface ScoreWebSocketListenerProps {
  enabled?: boolean;
  onChange?: (matches: ScoreUpdatePayload[]) => void;
}

/**
 * Reusable component that automatically listens to WebSocket score updates
 * and updates local state using setAllScore for all matches
 * 
 * Usage:
 * <ScoreWebSocketListener />
 * 
 * Then in your component, just use:
 * const { getCurrentMatchScores } = useScore();
 * const currentScores = getCurrentMatchScores(matchUuid);
 */
export const ScoreWebSocketListener = ({
  enabled = true,
  onChange
}: ScoreWebSocketListenerProps) => {
  const { matches, isConnected } = useMatchSocket();
  const { setAllScore } = useScore();

  useEffect(() => {
    if (!enabled || !isConnected) return;

    if (matches.length > 0) {
      // Convert all WebSocket data to ScoreUpdatePayload format
      const allScoreUpdates: ScoreUpdatePayload[] = matches.map(match => ({
        match_uuid: match.matchUuid,
        home_team_score: match.score.filter(g => g.game_score_home === "WIN").length.toString(),
        away_team_score: match.score.filter(g => g.game_score_away === "WIN").length.toString(),
        game_scores: match.score.map(game => ({
          set: game.set,
          game: game.game,
          game_score_home: game.game_score_home,
          game_score_away: game.game_score_away,
          status: (game as any).status || "PAUSED" as const,
          last_updated_at: new Date().toISOString()
        }))
      }));

      // Update all scores from WebSocket data
      setAllScore(allScoreUpdates);
      onChange?.(allScoreUpdates);
    }
  }, [matches, isConnected, enabled]);

  // This component doesn't render anything - it's just for the side effect
  return null;
};
