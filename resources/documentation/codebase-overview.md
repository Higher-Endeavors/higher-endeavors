# Fitness Application Codebase Documentation

## Directory Structure

typescript
/app
├── (protected) // Protected routes requiring authentication
│ └── tools
│ └── (fitness) // Fitness-related features
│ └── resistance-training
├── api // API routes and handlers
│ ├── exercise-library
│ └── resistance-sessions
└── lib // Shared libraries and utilities
├── types
│ └── pillars
│ └── fitness // Fitness-related type definitions
├── utils
│ └── fitness // Fitness-specific utilities
└── services // Service layer for API interactions
```

## Core Components

### Type System
The application uses a comprehensive type system for exercise and program management:

1. **Base Types** (`/lib/types/pillars/fitness/`)
   - `exercise.types.ts`: Core exercise type definitions
   - `api.types.ts`: API interface definitions
   - `zod_schemas.ts`: Validation schemas
   - `index.ts`: Type exports

2. **API Layer** (`/api/`)
   - Exercise Library Management
   - Training Session Handling
   - User Exercise Management

3. **UI Components** (`/app/(protected)/tools/(fitness)/resistance-training/`)
   - Exercise Management
   - Program Creation
   - Training Session Tracking

## Key Patterns

### Data Flow
1. User Interface
2. Type Validation (Zod)
3. API Calls
4. Database Operations

### Type Safety
- Strong typing throughout the application
- Runtime validation with Zod
- API type definitions

## Areas for Improvement
1. **Type Export Organization**
   - Need to consolidate type exports
   - Ensure consistent export patterns

2. **API Interaction Patterns**
   - Document existing patterns
   - Standardize approach

3. **Utility Function Location**
   - Map current utility locations
   - Identify potential consolidation

## Detailed Documentation Sections
- [Type System](./type-system.md)
- [API Layer](./api-layer.md)
- [Component Architecture](./component-architecture.md)
- [Data Flow](./data-flow.md)