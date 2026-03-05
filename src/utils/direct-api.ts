import { clientEnv } from "@/env";
import { createAxiosInstance } from "./axios";
import { ScoreUpdatePayload } from "@/pages/Admin/MatchDetail/api/schema";
import { debounce } from "lodash-es";

// Create axios instance with all interceptors and auth
const axiosInstance = createAxiosInstance();

/**
 * Direct API call for updating match scores
 * @param scoreData - Score data to update
 * @returns Promise with API response
 */
export const updateMatchScoreDirectly = async (scoreData: ScoreUpdatePayload) => {
  try {
    const response = await axiosInstance.put(
      `/match/score-update/${scoreData.match_uuid}`,
      scoreData
    );
    
    return response.data;
  } catch (error) {
    console.error('Direct API call failed:', error);
    throw error;
  }
};

// Create a stable debounced function that won't be recreated
const debouncedUpdate = debounce(async (scoreData: ScoreUpdatePayload) => {
  return updateMatchScoreDirectly(scoreData);
}, 500);

/**
 * Hook for debounced score updates
 * @returns Debounced function
 */
export const useDebouncedScoreUpdate = (): ((scoreData: ScoreUpdatePayload) => Promise<any>) => {
  return (scoreData: ScoreUpdatePayload) => {
    return debouncedUpdate(scoreData) || Promise.resolve();
  };
};