import { GameScoreData, ScoreUpdatePayload } from "@/pages/Admin/MatchDetail/api/schema";
import { matchScoresAtom } from "@/utils/store/atoms";
import { useAtomValue, useSetAtom } from "jotai/react";

/**
 * Calculates tennis score progression (0 -> 15 -> 30 -> 40 -> AD -> WIN)
 * @param currentScore - Current score value
 * @param direction - "UP" to increase score, "DOWN" to decrease
 * @param withAd - Whether advantage rule is enabled
 * @returns Next score value
 */
const calculateTennisScore = (currentScore: string, direction: "UP" | "DOWN", withAd: boolean = false): string => {
  const scores = ["0", "15", "30", "40"];
  
  if (currentScore === "WIN") {
    return currentScore;
  }
  
  const currentIndex = scores.indexOf(currentScore);
  
  if (direction === "UP") {
    if (currentIndex === -1) {
      if (currentScore === "AD") {
        return "WIN";
      }
      return "15";
    }
    
    if (currentIndex === scores.length - 1) {
      return withAd ? "AD" : "WIN";
    }
    
    return scores[currentIndex + 1];
  } else {
    if (currentScore === "AD") {
      return "40";
    }
    
    if (currentIndex === 0) {
      return "0";
    }
    
    if (currentIndex === -1) {
      return "40";
    }
    
    return scores[currentIndex - 1];
  }
};

/**
 * Calculates tie-break score progression (0 -> 1 -> 2 -> ... -> 7 -> WIN)
 * @param currentScore - Current score value
 * @param direction - "UP" to increase score, "DOWN" to decrease
 * @returns Next score value
 */
const calculateTieBreakScore = (currentScore: string | number, direction: "UP" | "DOWN"): string => {
  const score = typeof currentScore === "string" ? parseInt(currentScore) : currentScore;
  
  if (currentScore === "WIN") {
    return "WIN";
  }
  
  if (direction === "UP") {
    const newScore = score + 1;
    return newScore >= 7 ? "WIN" : newScore.toString();
  } else {
    const newScore = Math.max(0, score - 1);
    return newScore.toString();
  }
};

/**
 * Score management hook for tennis matches
 * Provides all score-related operations using atom-based storage
 * Follows tennis scoring rules with advantage support
 */
export const useScore = () => {
  const matchScores = useAtomValue(matchScoresAtom);
  const setMatchScores = useSetAtom(matchScoresAtom);

  /**
   * Creates initial score structure for a new match
   * @param matchUuid - UUID of the match
   * @returns Initial score payload
   */
  const createInitialScore = (matchUuid: string): ScoreUpdatePayload => {
    return {
      match_uuid: matchUuid,
      home_team_score: "0", 
      away_team_score: "0",
      game_scores: [{
        set: 1,
        game: 1,
        status: "PAUSED",
        game_score_home: "0",
        game_score_away: "0"
      }]
    };
  };

  /**
   * Gets the current game (highest set and game number from game scores)
   * @param gameScores - Array of game scores
   * @returns Current game score or undefined
   */
  const getCurrentGameScore = (gameScores: GameScoreData[]): GameScoreData | undefined => {
    if (gameScores.length === 0) return undefined;
    
    const sortedScores = [...gameScores].sort((a, b) => {
      if (a.set !== b.set) return b.set - a.set;
      return b.game - a.game;
    });
    return sortedScores[0];
  };

  /**
   * Gets the full match score data for a specific match
   * @param matchUuid - UUID of the match
   * @returns Full match score data or undefined
   */
  const getCurrentMatchScores = (matchUuid: string) => {
    return matchScores.find(score => score.match_uuid === matchUuid);
  };

  /**
   * Updates the game score for a specific match and team
   * @param params - Object containing match update parameters
   */
  const updateGameScore = ({
    matchUuid,
    team,
    direction,
    withAd = true,
    raceTo = 6
  }: {
    matchUuid: string;
    team: "home" | "away";
    direction: "UP" | "DOWN";
    withAd?: boolean;
    raceTo?: number;
    }) => {
  
    let currentMatchScore = getCurrentMatchScores(matchUuid);
    
    // If match doesn't exist, create it
    if (!currentMatchScore) {
      const newScore = createInitialScore(matchUuid);
      
      if (newScore.game_scores && newScore.game_scores.length > 0) {
        if (team === "home") {
          newScore.game_scores[0].game_score_home = "15";
        } else {
          newScore.game_scores[0].game_score_away = "15";
        }
        
        newScore.game_scores[0].status = "ONGOING";
      }
      
      setMatchScores([...matchScores, newScore]);
      return;
    }

    if (!currentMatchScore.game_scores) return;

    const currentGame = getCurrentGameScore(currentMatchScore.game_scores);
    if (!currentGame) return;

    const updatedGameScores = currentMatchScore.game_scores.filter(s => !(s.set === currentGame.set && s.game === currentGame.game));
    const updatedGame = { ...currentGame };
    
    // Check if we're in tie-break situation (both teams have raceTo - 1 games)
    const homeGamesWon = updatedGameScores.filter(g => g.game_score_home === "WIN").length;
    const awayGamesWon = updatedGameScores.filter(g => g.game_score_away === "WIN").length;
    const isTieBreak = homeGamesWon === raceTo - 1 && awayGamesWon === raceTo - 1;
    
    if (team === "home") {
      if (isTieBreak) {
        updatedGame.game_score_home = calculateTieBreakScore(updatedGame.game_score_home.toString(), direction);
      } else {
        updatedGame.game_score_home = calculateTennisScore(updatedGame.game_score_home.toString(), direction, withAd);
      }
    } else {
      if (isTieBreak) {
        updatedGame.game_score_away = calculateTieBreakScore(updatedGame.game_score_away.toString(), direction);
      } else {
        updatedGame.game_score_away = calculateTennisScore(updatedGame.game_score_away.toString(), direction, withAd);
      }
    }
    
    updatedGame.status = "ONGOING";
    updatedGameScores.push(updatedGame);

    // Check if set is won based on raceTo parameter
    const finalHomeGamesWon = updatedGameScores.filter(g => g.game_score_home === "WIN").length;
    const finalAwayGamesWon = updatedGameScores.filter(g => g.game_score_away === "WIN").length;
    
    // Check if current game is won (someone reached WIN status)
    const gameWon = updatedGame.game_score_home === "WIN" || updatedGame.game_score_away === "WIN";
    
    if (gameWon && (finalHomeGamesWon < raceTo && finalAwayGamesWon < raceTo)) {
      // Game is won but set is not finished, create next game
      const nextGame = {
        set: currentGame.set,
        game: Math.max(...updatedGameScores.map(g => g.game)) + 1,
        game_score_home: "0",
        game_score_away: "0",
        status: "PAUSED" as const,
        last_updated_at: new Date().toISOString()
      };
      
      updatedGameScores.push(nextGame);
      
      // Update match scores with current game wins
      const updatedMatchScores = {
        ...currentMatchScore,
        home_team_score: finalHomeGamesWon.toString(),
        away_team_score: finalAwayGamesWon.toString(),
        game_scores: updatedGameScores
      };
      
      const updatedScores = matchScores.map(score => 
        score.match_uuid === matchUuid ? updatedMatchScores : score
      );
      
      setMatchScores(updatedScores);
    } else if (finalHomeGamesWon >= raceTo || finalAwayGamesWon >= raceTo) {
      // Set is won, update match scores
      const updatedMatchScores = {
        ...currentMatchScore,
        home_team_score: finalHomeGamesWon.toString(),
        away_team_score: finalAwayGamesWon.toString(),
        game_scores: updatedGameScores
      };
      
      const updatedScores = matchScores.map(score => 
        score.match_uuid === matchUuid ? updatedMatchScores : score
      );
      
      setMatchScores(updatedScores);
    } else {
      // Set not won yet, just update game scores
      const updatedScores = matchScores.map(score => 
        score.match_uuid === matchUuid 
          ? { ...score, game_scores: updatedGameScores }
          : score
      );
      
      setMatchScores(updatedScores);
    }
  };

  /**
   * Deletes a specific score entry (by set and optionally game)
   * @param matchUuid - UUID of the match
   * @param setNumber - Set number to delete
   * @param gameNumber - Optional specific game number to delete
   */
  const deleteScore = (matchUuid: string, setNumber: number, gameNumber?: number) => {
    const updatedScores = matchScores.map(score => {
      if (score.match_uuid === matchUuid && score.game_scores) {
        const updatedGameScores = score.game_scores.filter(gameScore => {
          if (gameNumber !== undefined) {
            return !(gameScore.set === setNumber && gameScore.game === gameNumber);
          }
          return gameScore.set !== setNumber;
        });
        return {
          ...score,
          game_scores: updatedGameScores
        };
      }
      return score;
    });

    setMatchScores(updatedScores);
  };

  /**
   * Resets a match score to initial state (0-0, first game)
   * @param matchUuid - UUID of the match to reset
   */
  const resetMatchScores = (matchUuid: string) => {
    const matchIndex = matchScores.findIndex(score => score.match_uuid === matchUuid);
    if (matchIndex === -1) return;
    
    const updatedScores = matchScores.map((score, index) => 
      index === matchIndex ? createInitialScore(matchUuid) : score
    );
    
    setMatchScores(updatedScores);
  };

  /**
   * Returns all score management functions and current scores
   */
  return {
    updateGameScore,      // Updates game score for specific team (creates match if needed)
    deleteScore,          // Deletes specific score entries
    resetMatchScores,      // Resets match to initial state
    getCurrentGameScore,    // Gets current game score
    getCurrentMatchScores,   // Gets full match score data
    matchScores,           // All scores from atom storage
  };
};
