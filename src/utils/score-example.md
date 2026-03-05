# Example: Using updateGameScore with Debounced API Calls

## In your component (e.g., MatchDetail/index.tsx):

```typescript
import { useDebounceFn } from "ahooks";
import { MatchDetailApiHooks } from "./api";
import { useScore } from "@/utils/score.util";

export const MatchDetail = () => {
  const { mutate: updateScoreApi } = MatchDetailApiHooks.useUpdateMatchScoreApi({
    params: {
      uuid: matchUuid
    },
  }, {
    retry: false,
    onSuccess: (ds, e, s) => {
      // Handle success
    },
    onError: (error) => {
      // Handle error
    }
  });

  // Create debounced API function
  const { run: debouncedUpdateScore } = useDebounceFn(
    (scoreData: ScoreUpdatePayload) => {
      updateScoreApi({
        body: scoreData
      });
    },
    {
      wait: 500 // 500ms debounce
    }
  );

  const {
    updateGameScore,
    deleteScore,
    resetMatchScores,
    toggleGameStatus,
    // ... other functions
  } = useScore();

  // Usage examples:

  // Update game score with debounced API call
  const handleScoreUpdate = () => {
    updateGameScore({
      matchUuid,
      team: "home",
      direction: "UP",
      withAd: data?.data?.with_ad || false,
      debouncedApiCall: debouncedUpdateScore // Pass the debounced function
    });
  };

  // Delete score with debounced API call
  const handleDeleteScore = () => {
    deleteScore(matchUuid, 1, 1); // Note: deleteScore doesn't support debounced calls yet
    // You could extend deleteScore similarly if needed
  };

  // Toggle game status with debounced API call
  const handleToggleStatus = () => {
    toggleGameStatus(matchUuid); // Note: toggleGameStatus doesn't support debounced calls yet
    // You could extend toggleGameStatus similarly if needed
  };
};
```

## How it works:

1. **Debounced API Function**: `useDebounceFn` creates a function that only executes after 500ms of no calls
2. **Pass to Utility**: The debounced function is passed as `debouncedApiCall` parameter
3. **Automatic API Calls**: Every `setScore` call within the utility will trigger the debounced API call
4. **Rate Limiting**: Rapid score changes will only trigger one API call after 500ms

## Benefits:

- **Performance**: Reduces API calls during rapid score updates
- **Consistency**: All score changes trigger the same API endpoint
- **Flexibility**: Optional parameter - existing code continues to work without changes
- **Real-time**: Local state updates immediately, API updates debounced
