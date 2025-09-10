# Resistance Training Program Browser

This document describes the implementation of the Program Browser functionality for the Resistance Training tool.

## Overview

The Program Browser allows users to view, search, filter, and manage their saved resistance training programs. It provides a comprehensive interface for program management with features like pagination, filtering, and program actions.

## Components

### ProgramBrowser Component

**Location**: `src/app/(protected)/tools/(fitness)/resistance-training/components/ProgramBrowser.tsx`

**Features**:
- Displays a list of saved resistance training programs
- Search functionality by program name
- Filtering by date range, phase focus, and periodization type
- Sorting by newest, oldest, or name
- Pagination (5 programs per page)
- Program actions: View/Edit, Duplicate, Delete
- Delete confirmation modal
- Loading states and error handling

**Props**:
- `onProgramSelect`: Callback when a program is selected
- `currentUserId`: ID of the current user
- `isAdmin`: Whether the user is an admin (optional)
- `onProgramDelete`: Callback when a program is deleted (optional)

### API Route

**Location**: `src/app/api/resistance-training/programs/route.ts`

**Endpoints**:
- `GET /api/resistance-training/programs` - Fetch program list
- `GET /api/resistance-training/programs?id={programId}` - Fetch specific program with exercises
- `DELETE /api/resistance-training/programs?id={programId}` - Delete a program (soft delete)

**Features**:
- Authentication required
- User-specific data access
- Exercise summary aggregation
- Soft delete functionality

### Data Fetching Hook

**Location**: `src/app/(protected)/tools/(fitness)/resistance-training/lib/hooks/getResistancePrograms.ts`

**Purpose**: Provides a clean interface for fetching resistance training programs from the API.

## Database Schema

The implementation uses the following database tables:

### resist_programs
- `program_id` (Primary Key)
- `user_id` (Foreign Key to users)
- `program_name`
- `phase_focus`
- `periodization_type`
- `progression_rules` (JSONB)
- `program_duration`
- `notes`
- `start_date`, `end_date`
- `deleted` (Soft delete flag)
- `created_at`, `updated_at`

### resist_program_exercises
- `program_exercises_id` (Primary Key)
- `program_id` (Foreign Key to resist_programs)
- `exercise_source` ('library' or 'user')
- `exercise_library_id` (Foreign Key to exercise_library)
- `user_exercise_library_id` (Foreign Key to resist_user_exercise_library)
- `pairing`
- `planned_sets` (JSON)
- `notes`
- `created_at`, `updated_at`

## Types

**Location**: `src/app/(protected)/tools/(fitness)/resistance-training/types/resistance-training.zod.ts`

### ProgramListItem
Type for program list items displayed in the browser:
```typescript
interface ProgramListItem {
  resistanceProgramId: number;
  userId: number;
  programName: string;
  phaseFocus?: string;
  periodizationType?: string;
  progressionRules?: any;
  programDuration?: number;
  notes?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
  exerciseCount: number;
  exerciseSummary?: {
    totalExercises: number;
    exercises: Array<{ name: string }>;
  };
}
```

## Usage

### Basic Usage
```tsx
<ProgramBrowser 
  currentUserId={selectedUserId}
  onProgramSelect={(program) => {
    // Handle program selection
    console.log('Selected program:', program);
  }}
  onProgramDelete={(programId) => {
    // Handle program deletion
    console.log('Program deleted:', programId);
  }}
/>
```

### Integration with ResistanceTrainingClient
The ProgramBrowser is integrated into the main resistance training interface in `ResistanceTraining.client.tsx`:

```tsx
<ProgramBrowser 
  currentUserId={selectedUserId}
  onProgramSelect={(program) => {
    // TODO: Implement program loading functionality
    console.log('Selected program:', program);
  }}
  onProgramDelete={(programId) => {
    // TODO: Handle program deletion
    console.log('Program deleted:', programId);
  }}
/>
```

## Features

### Search and Filtering
- **Search**: Filter programs by name (case-insensitive)
- **Date Range**: Filter by creation date (All Time, Past Week, Past Month, Past Year)
- **Phase Focus**: Filter by training phase (GPP, Strength, Hypertrophy, Power, Endurance)
- **Periodization Type**: Filter by periodization method (Linear, Undulating, Block, None)
- **Sorting**: Sort by newest, oldest, or alphabetical by name

### Program Actions
- **View/Edit**: Select a program for editing (callback to parent component)
- **Duplicate**: Create a copy of a program (placeholder implementation)
- **Delete**: Remove a program with confirmation modal

### Pagination
- Shows 5 programs per page
- Navigation controls for previous/next pages
- Page number buttons for direct navigation

### Error Handling
- Loading states with spinner
- Error messages for failed API calls
- Graceful handling of empty states

## Future Enhancements

1. **Program Loading**: Implement the `onProgramSelect` callback to load selected programs into the editor
2. **Program Duplication**: Complete the duplicate functionality
3. **Bulk Actions**: Add support for selecting multiple programs
4. **Advanced Filtering**: Add more filter options (exercise types, duration, etc.)
5. **Export/Import**: Add functionality to export/import programs
6. **Program Templates**: Integration with program templates
7. **Sharing**: Allow sharing programs between users

## Testing Considerations

1. **Loading States**: Verify loading spinner displays during fetch
2. **Error Handling**: Test API failure scenarios
3. **Filtering**: Test all filter combinations
4. **Pagination**: Verify pagination works correctly
5. **Program Actions**: Test delete confirmation and other actions
6. **Empty States**: Verify proper display when no programs exist
7. **Responsive Design**: Test on different screen sizes

## Security

- All API endpoints require authentication
- Users can only access their own programs
- Soft delete prevents data loss
- Input validation on all user inputs 