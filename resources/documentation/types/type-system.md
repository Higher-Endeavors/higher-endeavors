# Type System Documentation

## Current Structure
The application's type system is primarily located in `/src/app/lib/types/`, with the main focus on fitness-related types.

### Current Type Organization
```
/src/app/lib/types/
└── pillars/
    └── fitness/
        ├── index.ts             # Main type exports
        ├── exercise.types.ts    # Exercise type definitions
        ├── api.types.ts         # API interfaces
        └── zod_schemas.ts       # Validation schemas
```

## Core Type Files

### 1. Exercise Types (`exercise.types.ts`)
Currently handles:
- Base exercise definitions
- Exercise variations (Regular/Varied)
- Set configurations
- Exercise metadata

### 2. API Types (`api.types.ts`)
Manages:
- API request/response interfaces
- Data transformation types
- API-specific exercise formats

### 3. Validation Schemas (`zod_schemas.ts`)
Contains:
- Exercise validation schemas
- Program validation rules
- Type inference definitions

## Current Type Exports (`index.ts`)
```typescript
import { ProgressionRules } from './zod_schemas';

export * from './exercise.types';
export * from './zod_schemas';
export type { ProgressionRules }; 
```

## Known Issues

### 1. Type Organization
- Types are currently concentrated in the fitness pillar
- Limited separation between domains
- Some types may need to be moved to shared locations

### 2. Missing Type Definitions
- User settings types need centralization
- Authentication types need proper organization
- Shared utility types could be better organized

### 3. Type Safety Gaps
- Some 'any' types in API responses
- Inconsistent null handling
- Missing type guards in key areas

## Recommended Improvements

### 1. Proposed Type Structure
```
/src/app/lib/types/
├── pillars/
│   ├── fitness/        # Current fitness types
│   ├── nutrition/      # Future expansion
│   └── recovery/       # Future expansion
├── user/              # User-related types
├── shared/            # Common types
└── api/               # API-specific types
```

### 2. Type Safety Enhancements
```typescript
// Add proper type guards
function isExercise(obj: unknown): obj is Exercise {
  return obj !== null && typeof obj === 'object' && 'name' in obj;
}

// Standardize API responses
interface APIResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}
```

### 3. Validation Improvements
```typescript
// Add comprehensive validation
const exerciseSchema = z.object({
  // Add complete validation rules
});

// Add type inference helpers
type ValidatedExercise = z.infer<typeof exerciseSchema>;
```

## Next Steps

### 1. Immediate Improvements
- [ ] Export APIExercise type from index.ts
- [ ] Add missing type guards
- [ ] Standardize API response types

### 2. Short-term Goals
- [ ] Create dedicated user types directory
- [ ] Establish shared types folder
- [ ] Improve type documentation

### 3. Long-term Goals
- [ ] Implement proper domain separation
- [ ] Add comprehensive validation
- [ ] Create type migration guides

## Type Usage Guidelines

### 1. Current Patterns
```typescript
// Exercise type usage
import { Exercise } from '@/app/lib/types/pillars/fitness';

// Validation usage
import { exerciseSchema } from '@/app/lib/types/pillars/fitness';
```

### 2. Best Practices
- Import types from index files
- Use type guards for runtime checks
- Implement proper validation
- Document complex types

### 3. Type Safety Rules
- Avoid using 'any'
- Handle null/undefined explicitly
- Use proper type guards
- Implement comprehensive validation