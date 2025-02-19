# Exercise Type System Documentation

## Overview
The exercise type system is the foundation for handling exercise data throughout the application. It provides type safety and validation for exercise-related operations.

## Core Type Files

### 1. exercise.types.ts
Location: `/lib/types/pillars/fitness/exercise.types.ts`

#### Key Types:
```typescript
export interface BaseExercise {
  id: number;
  name: string;
  pairing: string;
  displayId?: string;
  source: ExerciseSource;
  // ... other fields
}

export type Exercise = RegularExercise | VariedExercise;
```

Purpose:
- Defines core exercise properties
- Handles both regular and varied set exercises
- Provides type safety for exercise operations

### 2. api.types.ts
Location: `/lib/types/pillars/fitness/api.types.ts`

#### Key Interfaces:
```typescript
export interface APIExercise {
  id: number;
  displayId?: string;
  source: ExerciseSource;
  libraryId?: number;
  userExerciseId?: never;
  // ... other fields
}
```

Purpose:
- Defines API request/response shapes
- Handles different exercise sources
- Manages ID relationships

### 3. zod_schemas.ts
Location: `/lib/types/pillars/fitness/zod_schemas.ts`

#### Key Schemas:
```typescript
export const exerciseSchema = z.discriminatedUnion('isVariedSets', [...]);
```

Purpose:
- Runtime validation
- Type inference
- Data integrity checks

## Type Relationships

### Exercise Source Handling
```typescript
export type ExerciseSource = 'library' | 'user';

// Library Exercise
{
  source: 'library',
  libraryId: number
}

// User Exercise
{
  source: 'user',
  userExerciseId: number
}
```

### Set Configuration
1. Regular Sets
2. Varied Sets
3. Advanced Sets (with subsets)

## Current Issues

### 1. Type Export Organization
- APIExercise not exported from index.ts
- Inconsistent export patterns
- Need to consolidate exports

### 2. Type Safety Gaps
- Implicit 'any' in set mapping
- Missing validation for ID relationships
- Incomplete type coverage

## Recommended Improvements

1. Export Organization
```typescript
// index.ts
export * from './exercise.types';
export * from './api.types';
export * from './zod_schemas';
```

2. Type Safety
```typescript
// Add explicit types for mappings
setDetails: apiExercise.sets.map((set: APIExerciseSet) => ({
  // ... mapping
}))
```

3. Validation
```typescript
// Add source-specific validation
.refine((data) => {
  if (data.source === 'library') return !!data.libraryId;
  if (data.source === 'user') return !!data.userExerciseId;
  return true;
})
```

## ID Handling
- Database stores all IDs as integers
- Primary ID field (`id`) matches database integer type
- Optional `displayId` available for string representation
- All database relationships use the primary integer ID

## Source Field
- Valid values: 'library' | 'user'
- Required field matching database constraints
- Used to determine ID relationship type

## Type Relationships
### Database → API → Frontend Flow
1. Database stores IDs as integers
2. API maintains integer IDs for relationships
3. Frontend can use displayId for presentation

### Exercise References
- Library exercises: referenced by `id` when source is 'library'
- User exercises: referenced by `id` when source is 'user'
- No 'custom' exercises - all user-created exercises use 'user' source

## Implementation Notes
- All ID relationships should use integer type
- Source field is required in all exercise interfaces
- Type safety enforced through strict source values 