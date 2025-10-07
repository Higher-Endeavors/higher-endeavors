# Performance Records

This module automatically calculates and displays personal records (PRs) for resistance training exercises by analyzing a user's workout history.

## Features

- **Automatic PR Detection**: Analyzes all exercise instances to find the maximum load lifted for each rep count (1-15 reps)
- **Card-Based Display**: Each exercise is displayed in its own card showing all rep records
- **Exercise Grouping**: Records are organized by exercise name for easy reference
- **Detailed Information**: Shows the date, program name, and load unit for each record
- **Responsive Grid**: Cards are arranged in a responsive grid layout (1-3 columns based on screen size)

## How It Works

1. **Data Source**: Pulls exercise instances from the `resist_program_exercises` table
2. **Set Analysis**: Extracts individual sets from the `actual_sets` JSON data
3. **PR Calculation**: For each exercise and rep count, finds the maximum load ever lifted
4. **Display**: Organizes records by exercise and sorts by rep count

## API Endpoints

- `GET /api/resistance-training/performance-records?user_id={id}&timeframe={timeframe}`
  - Returns calculated performance records for a user
  - Supports timeframe filtering (all, year, 6month, 3month, month, week)

## Components

- `PerformanceRecordsPage`: Main page component
- `PRList`: Displays performance records in a responsive grid
- `ExercisePRCard`: Individual exercise card showing all rep records

## Data Structure

```typescript
interface PerformanceRecord {
  repCount: number;
  maxLoad: number;
  loadUnit: string;
  date: string;
  programName: string;
}

interface ExercisePerformanceRecords {
  [exerciseName: string]: PerformanceRecord[];
}
```

## Usage

The performance records are automatically calculated and updated as users log their workouts. No manual entry is required - the system analyzes the existing workout data to determine personal records.
