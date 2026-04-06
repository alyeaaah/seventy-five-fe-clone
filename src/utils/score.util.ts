import { GameScoreData, ScoreUpdatePayload } from "@/pages/Admin/MatchDetail/api/schema";
import { matchScoresAtom } from "@/utils/store/atoms";
import { useAtomValue, useSetAtom } from "jotai/react";
import { useDebouncedScoreUpdate } from "./direct-api";

/**
 * Recalculates team scores based on game scores
 * @param gameScores - Array of game scores
 * @returns Object with home and away team scores
 */
const recalculateTeamScores = (gameScores: GameScoreData[]) => {
  const homeTeamScore = gameScores.filter(g => g.game_score_home === "WIN").length;
  const awayTeamScore = gameScores.filter(g => g.game_score_away === "WIN").length;
  return {
    home_team_score: homeTeamScore.toString(),
    away_team_score: awayTeamScore.toString()
  };
};

/**
 * Calculates tennis score progression (0 -> 15 -> 30 -> 40 -> AD -> WIN)
 * @param currentScore - Current score value
 * @param opponentScore - Opponent's current score value
 * @param direction - "UP" to increase score, "DOWN" to decrease
 * @param withAd - Whether advantage rule is enabled
 * @returns Object with updated current and opponent scores
 */
const calculateTennisScore = (currentScore: string, opponentScore: string, direction: "UP" | "DOWN", withAd: boolean = false): {currentScore: string, opponentScore: string} => {
  const scores = ["0", "15", "30", "40"];
  
  if (currentScore === "WIN") {
    return {currentScore, opponentScore};
  }
  
  const currentIndex = scores.indexOf(currentScore);
  
  if (direction === "UP") {
    if (currentIndex === -1) {
      if (currentScore === "AD") {
        return {currentScore: "WIN", opponentScore};
      }
      return {currentScore: "15", opponentScore};
    }
    
    if (currentIndex === scores.length - 1) {
      // At 40, check if opponent is at AD (advantage situation)
      if (withAd && opponentScore === "AD") {
        return {currentScore: "40", opponentScore: "40"}; // Reset both to 40 when opponent had advantage
      }
      return {currentScore: withAd ? "AD" : "WIN", opponentScore};
    }
    
    return {currentScore: scores[currentIndex + 1], opponentScore};
  } else {
    if (currentScore === "AD") {
      return {currentScore: "40", opponentScore};
    }
    
    if (currentIndex === 0) {
      return {currentScore: "0", opponentScore};
    }
    
    if (currentIndex === -1) {
      return {currentScore: "40", opponentScore};
    }
    
    return {currentScore: scores[currentIndex - 1], opponentScore};
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
  const debouncedUpdateScore = useDebouncedScoreUpdate();

  /**
   * Sets the complete score for a match based on ScoreUpdatePayload
   * @param scoreData - Complete score data to set for the match
   * @param skipApiCall - Optional flag to skip API call (for testing or bulk operations)
   */
  const setScore = (scoreData: ScoreUpdatePayload, skipApiCall: boolean = false) => {
    const existingScoreIndex = matchScores.findIndex(score => score.match_uuid === scoreData.match_uuid);
    
    if (existingScoreIndex === -1) {
      // If match doesn't exist, add new score
      setMatchScores([...matchScores, scoreData]);
    } else {
      // If match exists, overwrite with new data
      const updatedScores = [...matchScores];
      updatedScores[existingScoreIndex] = scoreData;
      setMatchScores(updatedScores);
    }
    
    // Call debounced API function unless explicitly skipped
    if (!skipApiCall) {
      debouncedUpdateScore(scoreData).catch(error => {
        console.error('API call failed in setScore:', error);
        // Could add toast notification here if needed
      });
    }
  };

  const setAllScore = (scoreData: ScoreUpdatePayload[]) => {
    setMatchScores(scoreData);
  };

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
 * @param skipApiCall - Optional flag to skip API call (for testing or bulk operations)
 */
  const updateGameScore = ({
    matchUuid,
    team,
    direction,
    withAd = true,
    raceTo = 6,
    skipApiCall = false
  }: {
    matchUuid: string;
    team: "home" | "away";
    direction: "UP" | "DOWN";
    withAd?: boolean;
    raceTo?: number;
    skipApiCall?: boolean;
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
      
      setScore(newScore, skipApiCall);
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
    
    // Check if advantage should apply (both teams at 40)
    const bothAtForty = updatedGame.game_score_home === "40" && updatedGame.game_score_away === "40";
    
    if (team === "home") {
      if (isTieBreak) {
        updatedGame.game_score_home = calculateTieBreakScore(updatedGame.game_score_home.toString(), direction);
      } else if (bothAtForty && withAd) {
        // Both teams at 40, use advantage logic
        const homeResult = calculateTennisScore(updatedGame.game_score_home.toString(), updatedGame.game_score_away.toString(), direction, withAd);
        updatedGame.game_score_home = homeResult.currentScore;
        updatedGame.game_score_away = homeResult.opponentScore;
      } else {
        // Normal tennis progression, no advantage
        const homeResult = calculateTennisScore(updatedGame.game_score_home.toString(), updatedGame.game_score_away.toString(), direction, false);
        updatedGame.game_score_home = homeResult.currentScore;
        updatedGame.game_score_away = homeResult.opponentScore;
      }
    } else {
      if (isTieBreak) {
        updatedGame.game_score_away = calculateTieBreakScore(updatedGame.game_score_away.toString(), direction);
      } else if (bothAtForty && withAd) {
        // Both teams at 40, use advantage logic
        const awayResult = calculateTennisScore(updatedGame.game_score_away.toString(), updatedGame.game_score_home.toString(), direction, withAd);
        updatedGame.game_score_away = awayResult.currentScore;
        updatedGame.game_score_home = awayResult.opponentScore;
      } else {
        // Normal tennis progression, no advantage
        const awayResult = calculateTennisScore(updatedGame.game_score_away.toString(), updatedGame.game_score_home.toString(), direction, false);
        updatedGame.game_score_away = awayResult.currentScore;
        updatedGame.game_score_home = awayResult.opponentScore;
      }
    }
    
    // Handle DOWN direction when both teams have score 0 - remove current game and revert previous game
    if (direction === "DOWN" && currentGame.game_score_home === "0" && currentGame.game_score_away === "0") {
      // Remove current game
      const filteredGameScores = updatedGameScores.filter(g => !(g.set === currentGame.set && g.game === currentGame.game));
      
      // Find previous game (highest game number less than current)
      const previousGames = filteredGameScores.filter(g => g.set === currentGame.set && g.game < currentGame.game);
      if (previousGames.length > 0) {
        const previousGame = previousGames.reduce((prev, current) => 
          current.game > prev.game ? current : prev
        );
        
        // Just mark previous game as ONGOING and convert winner's WIN back to actual score
        let previousGameUpdated = { ...previousGame };
        previousGameUpdated.status = "ONGOING";
        
        // Convert winner's WIN back to actual tennis score
        if (previousGame.game_score_home === "WIN") {
          // Home team won, convert WIN back to appropriate score
          if (previousGame.game_score_away === "40") {
            // Opponent at 40, so winner should go to AD (if enabled) or stay at 40
            previousGameUpdated.game_score_home = withAd ? "AD" : "40";
          } else {
            // Opponent at 30 or less, winner goes to 40
            previousGameUpdated.game_score_home = "40";
          }
        } else if (previousGame.game_score_away === "WIN") {
          // Away team won, convert WIN back to appropriate score
          if (previousGame.game_score_home === "40") {
            // Opponent at 40, so winner should go to AD (if enabled) or stay at 40
            previousGameUpdated.game_score_away = withAd ? "AD" : "40";
          } else {
            // Opponent at 30 or less, winner goes to 40
            previousGameUpdated.game_score_away = "40";
          }
        }
        
        // Update the game scores array
        const finalGameScores = filteredGameScores.map(g => 
          (g.set === previousGame.set && g.game === previousGame.game) ? previousGameUpdated : g
        );
        
        // Calculate team scores using helper function
        const teamScores = recalculateTeamScores(finalGameScores);
        let recalculatedHomeGamesWon = parseInt(teamScores.home_team_score);
        let recalculatedAwayGamesWon = parseInt(teamScores.away_team_score);
        
        // Update match scores with recalculated team scores
        const updatedMatchScores = {
          ...currentMatchScore,
          home_team_score: recalculatedHomeGamesWon.toString(),
          away_team_score: recalculatedAwayGamesWon.toString(),
          game_scores: finalGameScores
        };
        
        setScore(updatedMatchScores, skipApiCall);
        return;
      }
    }
    
    updatedGame.status = "ONGOING";
    updatedGameScores.push(updatedGame);

    // Check if set is won based on raceTo parameter
    const teamScores = recalculateTeamScores(updatedGameScores);
    let finalHomeGamesWon = parseInt(teamScores.home_team_score);
    let finalAwayGamesWon = parseInt(teamScores.away_team_score);
    
    // Check if current game is won (someone reached WIN status)
    const gameWon = updatedGame.game_score_home === "WIN" || updatedGame.game_score_away === "WIN";
    
    if (gameWon) {
      // Set current game status to ENDED
      updatedGame.status = "ENDED";
    }
    
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
      
      setScore(updatedMatchScores, skipApiCall);
    } else if (finalHomeGamesWon >= raceTo || finalAwayGamesWon >= raceTo) {
      // Set is won, update match scores
      const updatedMatchScores = {
        ...currentMatchScore,
        home_team_score: finalHomeGamesWon.toString(),
        away_team_score: finalAwayGamesWon.toString(),
        game_scores: updatedGameScores
      };

      setScore(updatedMatchScores, skipApiCall);
    } else {
      // Set not won yet, just update game scores
      const updatedScores = matchScores.map(score => 
        score.match_uuid === matchUuid 
          ? { ...score, game_scores: updatedGameScores }
          : score
      );
      
      setScore(updatedScores.find(score => score.match_uuid === matchUuid)!, skipApiCall);
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
        
        // Recalculate team scores after game deletion
        const teamScores = recalculateTeamScores(updatedGameScores);
        
        return {
          ...score,
          home_team_score: teamScores.home_team_score,
          away_team_score: teamScores.away_team_score,
          game_scores: updatedGameScores
        };
      }
      return score;
    });

    setScore(updatedScores.find(score => score.match_uuid === matchUuid)!);
  };

  const toggleGameStatus = (matchUuid: string) => {
    const currentMatchScore = getCurrentMatchScores(matchUuid);
    
    if (!currentMatchScore || !currentMatchScore.game_scores || currentMatchScore.game_scores.length === 0) {
      // No current game exists, create initial game with ONGOING status
      const initialScore = createInitialScore(matchUuid);
      if (initialScore.game_scores && initialScore.game_scores.length > 0) {
        initialScore.game_scores[0].status = "ONGOING";
      }
      setScore(initialScore);
      return;
    }
    
    // Find current game (highest set and game number)
    const currentGame = getCurrentGameScore(currentMatchScore.game_scores);
    if (!currentGame) return;
    
    // Toggle status between ONGOING and PAUSED
    const updatedGameScores = currentMatchScore.game_scores.map(game => {
      if (game.set === currentGame.set && game.game === currentGame.game) {
        return {
          ...game,
          status: game.status === "ONGOING" ? "PAUSED" as const : "ONGOING" as const
        };
      }
      return game;
    });
    
    // Update match scores with toggled game status
    const updatedMatchScores = {
      ...currentMatchScore,
      game_scores: updatedGameScores
    };
    
    setScore(updatedMatchScores);
  }

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
    console.log("updatedScores",updatedScores);
    
    setScore(updatedScores.find(score => score.match_uuid === matchUuid)!, true);
  };

  /**
   * Returns all score management functions and current scores
   */
  return {
    updateGameScore,      // Updates game score for specific team (creates match if needed)
    toggleGameStatus,     // Toggles game status between ONGOING and PAUSED
    setAllScore,
    setScore,             // Sets complete score data for a match
    deleteScore,          // Deletes specific score entries
    resetMatchScores,      // Resets match to initial state
    getCurrentGameScore,    // Gets current game score
    getCurrentMatchScores,   // Gets full match score data
    matchScores,           // All scores from atom storage
  };
};
