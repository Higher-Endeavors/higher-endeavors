# Resistance Training Documentation

## Overview
The resistance training tool allows users to create, manage, and track their resistance training programs and exercises.

## Core Components

### Program Planning
Location: `/app/(protected)/tools/(fitness)/resistance-training/plan/`

#### 1. AddExerciseModal
```typescript
// Location: /plan/components/AddExerciseModal.tsx
/**
 * Modal for adding/editing exercises in a program
 * Handles both library and user-created exercises
 */
interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: Exercise) => Promise<void>;
  exercise?: Exercise;
  exercises: Exercise[];
  onAdvancedSearch?: () => void;
  selectedExerciseName?: string;
  userSettings: UserSettings;
}
```

#### 2. ExerciseSearch
```typescript
// Location: /plan/components/ExerciseSearch.tsx
/**
 * Search component for finding exercises
 * Supports filtering and custom exercise creation
 */
```

## Type Definitions

### 1. Exercise Types
Location: `/app/lib/types/pillars/fitness/exercise.types.ts`

```typescript
// Core exercise interface
export interface BaseExercise {
  id: string;
  name: string;
  pairing: string;
  sets: number;
  reps: number;
  load: number;
  // ... other fields from actual file
}

// Exercise variations
export type Exercise = RegularExercise | VariedExercise;
```

### 2. API Types
Location: `/app/lib/types/pillars/fitness/api.types.ts`

```typescript
// Document actual API types from the file
```

## API Integration

### 1. Exercise Management
Location: `/app/api/exercise-library/route.ts`
```typescript
// Document actual API endpoints and their purposes
```

### 2. Program Management
Location: `/app/api/programs/route.ts`
```typescript
// Document actual program management endpoints
```

## Services

### Exercise Service
Location: `/app/lib/services/exercise.service.ts`

```typescript
// Document actual service methods and their purposes
```

## Data Flow

1. Exercise Creation/Selection
```
User Input → AddExerciseModal
  ↓
ExerciseSearch Component
  ↓
API Validation
  ↓
Database Update
  ↓
UI Update
```

## State Management

### 1. Exercise State
```typescript
// Document actual state management patterns
```

### 2. Program State
```typescript
// Document actual program state management
```

## Validation

### 1. Exercise Validation
Location: `/app/lib/types/pillars/fitness/zod_schemas.ts`
```typescript
// Document actual validation schemas
```

## Current Issues & TODOs

### 1. Type Safety
- [ ] Document actual type safety issues

### 2. Performance
- [ ] Document actual performance concerns

### 3. Feature Gaps
- [ ] Document missing features or improvements needed
