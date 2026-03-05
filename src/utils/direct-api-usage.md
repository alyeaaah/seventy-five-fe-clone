# Direct API Score Updates - Usage Guide

## Files Created:
- `src/utils/direct-api.ts` - Direct API calls using existing axios configuration
- Updated `src/utils/score.util.ts` - Uses direct API calls automatically

## How It Works:

### 1. Automatic API Calls
```typescript
// All score updates now automatically trigger API calls
const { updateGameScore } = useScore();

// This will:
// 1. Update local state immediately
// 2. Call API automatically
updateGameScore({
  matchUuid,
  team: "home",
  direction: "UP"
});
```

### 2. Skip API Calls (for testing/bulk operations)
```typescript
// Skip API call when needed
updateGameScore({
  matchUuid,
  team: "home", 
  direction: "UP",
  skipApiCall: true // Skip API call
});
```

### 3. Debounced API Calls (if needed)
```typescript
import { useDebounceFn } from "ahooks";
import { updateMatchScoreDirectly } from "@/utils/direct-api";

// Create debounced version in component
const { run: debouncedUpdateScore } = useDebounceFn(
  (scoreData) => updateMatchScoreDirectly(scoreData),
  { wait: 500 }
);

// Use with skipApiCall to prevent double API calls
updateGameScore({
  matchUuid,
  team: "home",
  direction: "UP", 
  skipApiCall: true // Skip automatic API call
});

// Then call debounced API manually
debouncedUpdateScore(scoreData);
```

## Benefits:
✅ **Self-contained**: No parameters needed for basic usage  
✅ **Automatic**: API calls happen automatically  
✅ **Authenticated**: Uses existing axios config with auth  
✅ **Flexible**: Can skip API calls when needed  
✅ **Debouncable**: Still supports debouncing if required  

## Migration from Previous Version:
- **Before**: `updateGameScore({ ..., debouncedApiCall })`
- **After**: `updateGameScore({ ... })` (automatic) or `updateGameScore({ ..., skipApiCall: true })` (manual)
