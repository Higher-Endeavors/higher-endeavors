import { PeriodizationType } from "./exercise.types";

/**
 * Interface for a program
 */
export interface Program {
  id: number;                // Changed from string to number
  programName: string;
  userId: number;            // Changed from string to number
  phaseFocus: string;
  periodizationType: string;
  progressionRules: {
    type: string;
    settings: {
      volumeIncrementPercentage?: number;
      loadIncrementPercentage?: number;
      programLength?: number;
      weeklyVolumePercentages?: number[];
    };
  };
    startDate?: Date;
    endDate?: Date;
    notes?: string;
   // weeks: Week[];
    createdAt: Date;
    updatedAt: Date;
  }

  /**
 * Extended interface for program list view
 * Includes computed/derived properties for display purposes
 */
export interface ProgramListItem extends Program {
  exerciseSummary?: {
    exercises: Array<{
      id: number;
      name: string;
      source: 'library' | 'user';
    }>;
    totalExercises: number;
  };
}

export interface Week {
  id: number;
  resistance_program_id: number;
  week_number: number;
  notes: string;
  created_at: Date;
  updated_at: Date;
}