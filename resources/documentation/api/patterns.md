# API Interaction Patterns Documentation

## Overview
This document outlines the standard patterns for API interactions in the fitness application, focusing on consistency, type safety, and error handling.

## Core Patterns

### 1. Data Flow Pattern
```typescript
Client Request
  ↓
Authentication (where needed)
  ↓
Request Validation
  ↓
Business Logic
  ↓
Database Operation
  ↓
Response Mapping
  ↓
Client Response
```

### 2. Type-Safe Request/Response Pattern
```typescript
// Request type definition
interface CreateExerciseRequest {
  exercise_name: string;
  source: ExerciseSource;
  // ... other fields
}

// Response type definition
interface CreateExerciseResponse {
  id: string;
  exercise_name: string;
  created_at: string;
  // ... other fields
}

// Implementation
async function createExercise(
  request: CreateExerciseRequest
): Promise<CreateExerciseResponse> {
  // Implementation
}
```

## API Interaction Examples

### 1. Exercise Creation
```typescript
// Client-side
const createUserExercise = async (exerciseName: string) => {
  try {
    const response = await fetch('/api/user-exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercise_name: exerciseName })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  } catch (error) {
    // Error handling
  }
};
```

### 2. Data Fetching
```typescript
// Client-side
const fetchExercises = async () => {
  try {
    const response = await fetch('/api/exercises');
    if (!response.ok) {
      throw new Error('Failed to fetch exercises');
    }
    
    const data = await response.json();
    return mapAPIToExercise(data);
  } catch (error) {
    // Error handling
  }
};
```

## Current Implementation Patterns

### 1. API Route Implementation
```typescript
// Server-side route handler
export async function POST(request: Request) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return unauthorized();
    }

    // 2. Request parsing & validation
    const data = await request.json();
    const validated = exerciseSchema.safeParse(data);
    if (!validated.success) {
      return badRequest(validated.error);
    }

    // 3. Business logic & database operation
    const result = await processRequest(validated.data);

    // 4. Response
    return success(result);
  } catch (error) {
    return handleError(error);
  }
}
```

### 2. Data Transformation Pattern
```typescript
// API to Frontend transformation
const mapAPIToFrontend = <T extends APIResponse, U extends FrontendType>(
  apiData: T,
  mapper: (data: T) => U
): U => {
  // Transformation logic
  return mapper(apiData);
};
```

## Common Issues and Solutions

### 1. Type Safety Gaps
```typescript
// Problem:
const data = await response.json();
setExercises(data); // No type checking

// Solution:
const data = await response.json();
const validated = exerciseArraySchema.parse(data);
setExercises(validated);
```

### 2. Error Handling
```typescript
// Problem:
catch (error) {
  console.error(error);
}

// Solution:
catch (error) {
  if (error instanceof APIError) {
    handleAPIError(error);
  } else if (error instanceof ValidationError) {
    handleValidationError(error);
  } else {
    handleUnexpectedError(error);
  }
}
```

## Recommended Pattern Improvements

### 1. Typed API Client
```typescript
class APIClient {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new APIError(response);
    }
    return response.json();
  }

  async post<T, U>(endpoint: string, data: T): Promise<U> {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new APIError(response);
    }
    return response.json();
  }
}
```

### 2. Response Wrapper
```typescript
interface APIResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  status: 'success' | 'error';
}

function createAPIResponse<T>(
  data: T,
  status: 'success' | 'error' = 'success'
): APIResponse<T> {
  return {
    data,
    status
  };
}
```

### 3. Error Boundary Pattern
```typescript
interface APIError extends Error {
  code: string;
  status: number;
  details?: unknown;
}

class APIErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    if (error instanceof APIError) {
      // Handle API errors
    }
  }
}
``` 