# API Request/Response Handlers Documentation

## Overview
API handlers manage the request/response cycle for all fitness application endpoints, ensuring proper data validation, processing, and error handling.

## Handler Types

### 1. Exercise Handlers

#### Library Exercise Handler
```typescript
// /api/exercise-library/route.ts
export async function GET(request: Request) {
  try {
    const exercises = await prisma.exerciseLibrary.findMany({
      orderBy: { exercise_name: 'asc' }
    });

    return new Response(JSON.stringify(exercises), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch exercises' }),
      { status: 500 }
    );
  }
}
```

#### User Exercise Handler
```typescript
// /api/user-exercises/route.ts
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const data = await request.json();
    // Handler implementation
  } catch (error) {
    // Error handling
  }
}
```

## Common Handler Patterns

### 1. Authentication Check
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401 }
  );
}
```

### 2. Request Validation
```typescript
const data = await request.json();
const validated = exerciseSchema.safeParse(data);
if (!validated.success) {
  return new Response(
    JSON.stringify({ error: 'Invalid data', details: validated.error }),
    { status: 400 }
  );
}
```

### 3. Database Operations
```typescript
try {
  const result = await prisma.userExercise.create({
    data: {
      userId: session.user.id,
      // ... other fields
    }
  });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific database errors
  }
  throw error;
}
```

## Current Issues

### 1. Validation Inconsistency
- Some handlers lack proper validation
- Inconsistent validation error formats
- Missing type checking in some handlers

### 2. Error Handling Gaps
- Generic error messages
- Inconsistent error status codes
- Missing error logging

### 3. Authentication Gaps
- Inconsistent auth checks
- Missing role-based access control
- Token validation issues

## Best Practices

### 1. Request Validation
```typescript
async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  const data = await request.json();
  const result = schema.safeParse(data);
  
  if (!result.success) {
    throw new ValidationError(result.error);
  }
  
  return result.data;
}
```

### 2. Response Creation
```typescript
function createResponse<T>(
  data: T,
  status: number = 200
): Response {
  return new Response(
    JSON.stringify({ data, status: 'success' }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
```

### 3. Error Handling
```typescript
function handleError(error: unknown): Response {
  if (error instanceof ValidationError) {
    return new Response(
      JSON.stringify({
        error: 'Validation Error',
        details: error.issues
      }),
      { status: 400 }
    );
  }
  
  // Handle other error types
  return new Response(
    JSON.stringify({ error: 'Internal Server Error' }),
    { status: 500 }
  );
}
``` 