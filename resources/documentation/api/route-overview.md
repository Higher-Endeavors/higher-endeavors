# API Routes Overview

## Directory Structure
All API routes are located in `/app/api/` with the following organization:

## Authentication & User Management
```
/api/
├── auth/
│   └── route.ts           # Authentication endpoints (NextAuth)
├── user/
│   └── route.ts           # User profile management
└── user-settings/
    └── route.ts           # User preferences and settings
```

## Exercise Management
```
/api/
├── exercise-library/
│   └── route.ts           # Pre-defined exercise management
├── user-exercises/
│   └── route.ts           # User-created exercises
└── exercises/
    └── route.ts           # Combined exercise endpoints
```

## Program Management
```
/api/
├── programs/
│   ├── [id]/
│   │   └── route.ts       # Individual program operations
│   └── route.ts           # Program CRUD operations
├── program-templates/
│   └── route.ts           # Program template management
└── program-settings/
    └── route.ts           # Program configuration
```

## Training Sessions
```
/api/
├── resistance-sessions/
│   ├── [id]/
│   │   └── route.ts       # Individual session operations
│   └── route.ts           # Session CRUD operations
├── session-feedback/
│   └── route.ts           # Training session feedback
└── session-tracking/
    └── route.ts           # Real-time session tracking
```

## Progress Tracking
```
/api/
├── measurements/
│   └── route.ts           # Body measurements
├── progress-photos/
│   └── route.ts           # Progress photo management
└── tracking/
    ├── strength/
    │   └── route.ts       # Strength progress
    └── volume/
        └── route.ts       # Volume tracking
```

## Utility Routes
```
/api/
├── upload/
│   └── route.ts           # File upload handling
└── search/
    └── route.ts           # Global search functionality
```

## Route Details

### Exercise Management Routes

#### `/api/exercise-library/route.ts`
- `GET`: Fetch all library exercises
- `POST`: Add new exercise to library (admin)
- `PUT`: Update library exercise
- `DELETE`: Remove from library

#### `/api/user-exercises/route.ts`
- `GET`: Get user's custom exercises
- `POST`: Create new user exercise
- `PUT`: Update user exercise
- `DELETE`: Delete user exercise

### Program Management Routes

#### `/api/programs/route.ts`
- `GET`: List user's programs
- `POST`: Create new program
- `PUT`: Update program
- `DELETE`: Delete program

#### `/api/programs/[id]/route.ts`
- `GET`: Get specific program
- `PUT`: Update specific program
- `DELETE`: Delete specific program

### Training Session Routes

#### `/api/resistance-sessions/route.ts`
- `GET`: List training sessions
- `POST`: Create new session
- `PUT`: Update session
- `DELETE`: Delete session

## Common Response Patterns

### Success Response
```typescript
{
  status: 'success',
  data: {
    // Response data
  }
}
```

### Error Response
```typescript
{
  status: 'error',
  error: {
    code: string,
    message: string
  }
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Authentication
Most routes require authentication via NextAuth session. Protected routes include:
- All `/api/user-exercises/` endpoints
- All `/api/programs/` endpoints
- All `/api/resistance-sessions/` endpoints

## Rate Limiting
- Standard routes: 100 requests per minute
- Upload routes: 10 requests per minute
- Search routes: 30 requests per minute 