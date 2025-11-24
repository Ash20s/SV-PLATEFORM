# Example Integration of Supervive TypeScript Types

This document shows how we could integrate Zendrex's TypeScript types library once we receive it.

## Example Structure

### 1. Backend Integration (JavaScript with JSDoc)

```javascript
// backend/src/services/superviveAPI.js

/**
 * @typedef {import('@supervive/types').Match} SuperviveMatch
 * @typedef {import('@supervive/types').MatchDetails} SuperviveMatchDetails
 * @typedef {import('@supervive/types').PlayerMatchDetails} SupervivePlayerMatchDetails
 */

class SuperviveAPIService {
  /**
   * @param {Date} since
   * @param {number} limit
   * @returns {Promise<SuperviveMatch[]>}
   */
  async getMatches(since = null, limit = 50) {
    // Implementation using typed responses
  }

  /**
   * @param {string} matchId
   * @returns {Promise<SuperviveMatchDetails | null>}
   */
  async getMatchDetails(matchId) {
    // Implementation
  }

  /**
   * Normalize Supervive API match to our internal format
   * @param {SuperviveMatchDetails} apiMatch
   * @returns {Object} Normalized match
   */
  normalizeMatch(apiMatch) {
    // Use types to ensure all fields are handled
    const matchDetails = apiMatch.MatchDetails || {};
    const playerMatchDetails = apiMatch.PlayerMatchDetails || {};
    // ... normalization logic
  }
}
```

### 2. Frontend Integration (TypeScript)

```typescript
// frontend/src/types/supervive.ts
import type { 
  Match, 
  MatchDetails, 
  PlayerMatchDetails,
  TeamMatchDetails 
} from '@supervive/types';

// Re-export for convenience
export type {
  Match as SuperviveMatch,
  MatchDetails as SuperviveMatchDetails,
  PlayerMatchDetails as SupervivePlayerMatchDetails,
  TeamMatchDetails as SuperviveTeamMatchDetails,
};

// Our normalized types that extend Supervive types
export interface NormalizedMatch extends SuperviveMatch {
  // Add our internal fields
  internalMatchId?: string;
  syncedAt?: Date;
}

// frontend/src/services/matchService.ts
import type { SuperviveMatchDetails } from '@/types/supervive';
import api from './api';

export const matchService = {
  async getMatches(): Promise<SuperviveMatchDetails[]> {
    const response = await api.get<{ matches: SuperviveMatchDetails[] }>('/matches');
    return response.data.matches;
  },
};
```

### 3. Type Guards and Validation

```typescript
// frontend/src/utils/superviveTypeGuards.ts
import type { SuperviveMatchDetails } from '@/types/supervive';

export function isValidMatch(match: unknown): match is SuperviveMatchDetails {
  return (
    typeof match === 'object' &&
    match !== null &&
    'MatchDetails' in match &&
    'PlayerMatchDetails' in match
  );
}

export function validateMatchResponse(data: unknown): SuperviveMatchDetails {
  if (!isValidMatch(data)) {
    throw new Error('Invalid match data from API');
  }
  return data;
}
```

### 4. Updated Backend Normalization with Types

```javascript
// backend/src/services/superviveAPI.js
// After receiving types, we can add better validation

normalizeMatch(apiMatch) {
  // Type checking would help ensure we handle all fields
  if (!apiMatch.MatchDetails) {
    throw new Error('Invalid match: missing MatchDetails');
  }
  
  if (!apiMatch.PlayerMatchDetails) {
    throw new Error('Invalid match: missing PlayerMatchDetails');
  }

  // Now we know the structure from types
  const matchDetails = apiMatch.MatchDetails;
  const playerMatchDetails = apiMatch.PlayerMatchDetails;
  
  // ... rest of normalization
}
```

## Benefits

1. **Type Safety**: Catch errors at compile time
2. **Autocomplete**: Better IDE support
3. **Documentation**: Types serve as documentation
4. **Refactoring**: Easier to update when API changes
5. **Validation**: Can create runtime validators from types

## Next Steps

1. Wait for Zendrex to share the types library
2. Install/import the types
3. Update backend normalization to use types
4. Update frontend to use types directly
5. Add type guards and validation
6. Update tests to use typed mocks




