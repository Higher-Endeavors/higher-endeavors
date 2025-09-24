# Resistance Training Analysis

This module provides comprehensive analysis tools for resistance training programs, focusing on volume progression analysis and adherence to progressive overload principles.

## Features

### Volume Analysis
- **Planned vs Actual Volume Comparison**: Visualize how actual training volume compares to planned volume across program weeks
- **Exercise-Level Analysis**: Toggle individual exercises on/off to focus on specific movements
- **Progression Metrics**: Assess whether programs follow progressive overload principles
- **Load Unit Support**: Switch between pounds (lbs) and kilograms (kg)

### Progression Analysis
- **Progression Type Detection**: Identifies linear, undulating, mixed, or no progression patterns
- **Consistency Scoring**: Measures how consistent the volume progression is (0-100%)
- **Weekly Increase Tracking**: Calculates average weekly volume increases
- **Progressive Overload Assessment**: Determines if the program follows progressive overload principles

## Components

### VolumeAnalysisChart
Interactive Chart.js-based visualization showing:
- Overall program volume progression
- Individual exercise volume trends
- Planned vs actual volume comparison
- Summary statistics and adherence metrics

### Analysis Page
Main interface featuring:
- Program selection from available resistance training programs
- User selection with admin support
- Load unit configuration
- Real-time analysis results

## Data Flow

1. **Program Selection**: Users select a resistance training program to analyze
2. **Data Fetching**: System retrieves program details and exercise data from database
3. **Volume Calculation**: Calculates planned and actual volume for each exercise and week
4. **Analysis Generation**: Computes progression metrics and adherence statistics
5. **Visualization**: Renders interactive charts and summary metrics

## Usage

```tsx
import { useProgramAnalysis } from './lib/hooks/useProgramAnalysis';
import VolumeAnalysisChart from './components/VolumeAnalysisChart';

function MyAnalysisComponent() {
  const { analysis, isLoading, error } = useProgramAnalysis(programId, userId, 'lbs');
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!analysis) return <div>No data</div>;
  
  return (
    <VolumeAnalysisChart
      analysis={analysis}
      selectedExercises={[1, 2, 3]}
      onExerciseToggle={(id) => console.log('Toggle exercise', id)}
      loadUnit="lbs"
    />
  );
}
```

## Volume Calculation

Volume is calculated as: `Volume = Reps × Load (in preferred unit)`

- Supports both planned and actual sets
- Handles unit conversion between lbs and kg
- Accounts for exercises with no actual data
- Calculates weekly, exercise-level, and program-level totals

## Progression Analysis

The system analyzes volume progression patterns:

- **Linear**: Consistent weekly increases
- **Undulating**: Alternating high/low volume weeks
- **Mixed**: Combination of progression types
- **None**: No clear progression pattern

Consistency is measured using standard deviation of weekly increases, scaled to 0-100%.

## Database Schema

The analysis relies on existing resistance training tables:
- `resist_programs`: Program metadata
- `resist_program_exercises`: Exercise data with planned and actual sets

## Future Enhancements

- Intensity analysis (load progression)
- RPE/RIR trend analysis
- Exercise-specific progression recommendations
- Export functionality for analysis reports
- Comparative analysis between programs
