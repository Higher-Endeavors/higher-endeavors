# API Routes Documentation

## Overview
The API layer handles all data operations for the fitness application, including exercise management, program creation, and session tracking.

## Route Structure
```
/api/
├── exercise-library/     # Library exercise management
├── user-exercises/       # User-created exercises
├── resistance-sessions/  # Training session operations
└── programs/            # Program management
```

## Exercise Management Routes

### 1. Exercise Library (`/api/exercise-library/route.ts`)
```typescript
// GET /api/exercise-library
// Returns all library exercises
export async function GET(request: Request) {
  // Implementation details
}

// POST /api/exercise-library
// Adds new exercise to library (admin only)
export async function POST(request: Request) {
  // Implementation details
}
```

### 2. User Exercises (`/api/user-exercises/route.ts`)
```typescript
// GET /api/user-exercises
// Returns user's custom exercises
export async function GET(request: Request) {
  // Implementation details
}

// POST /api/user-exercises
// Creates new user exercise
export async function POST(request: Request) {
  // Implementation details
}
```

## Data Flow Patterns

### Exercise Creation Flow
1. Client sends exercise data
2. Validation layer checks data
3. Database operation
4. Response mapping
5. Client update

### Error Handling
```typescript
try {
  // Operation
} catch (error) {
  return new Response(
    JSON.stringify({ error: 'Specific error message' }),
    { status: appropriate_status_code }
  );
}
```

## Common Response Patterns

### Success Response
```typescript
return new Response(JSON.stringify(data), {
  status: 200,
  headers: { 'Content-Type': 'application/json' }
});
```

### Error Response
```typescript
return new Response(JSON.stringify({ error: message }), {
  status: errorCode,
  headers: { 'Content-Type': 'application/json' }
});
```

## Current Issues

### 1. Inconsistent Error Handling
- Different error response formats
- Inconsistent status codes
- Missing error type definitions

### 2. Response Type Safety
- Missing response type definitions
- Inconsistent response structures
- Need for standardized response format

### 3. Route Organization
- Some route handlers too large
- Mixed concerns in single files
- Duplicate validation logic

## Recommended Improvements

### 1. Standardized Response Types
```typescript
interface APIResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
  };
  status: 'success' | 'error';
}
```

### 2. Centralized Error Handling
```typescript
export const handleAPIError = (error: unknown): Response => {
  // Standard error handling
};
```

### 3. Route Handler Structure
```typescript
export async function POST(request: Request) {
  try {
    // 1. Validation
    const validated = await validateRequest(request);
    
    // 2. Business Logic
    const result = await processRequest(validated);
    
    // 3. Response
    return createSuccessResponse(result);
  } catch (error) {
    return handleAPIError(error);
  }
}
``` 