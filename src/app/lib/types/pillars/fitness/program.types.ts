import { PeriodizationType } from "./exercise.types";

/**
 * Interface for a program
 */
export interface Program {
  id: number;
  program_name: string;
  user_id: number;
  phase_focus: string;
  periodization_type: string;
  progression_rules: {
    type: string;
    settings: {
      volume_increment_percentage?: number;
      load_increment_percentage?: number;
      program_length?: number;
      weekly_volume_percentages?: number[];
    };
  };
  start_date?: Date;
  end_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
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
  resistanceProgramId: number;
  weekNumber: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
} 