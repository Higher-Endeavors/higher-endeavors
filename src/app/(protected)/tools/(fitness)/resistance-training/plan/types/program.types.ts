import { PeriodizationType } from "./exercise.types";

/**
 * Base program interface that maps to database structure
 */
export interface program {
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
 * Extended interface for program list view (React-specific display type)
 */
export interface program_list_item extends program {
  exercise_summary?: {
    exercises: Array<{
      id: number;
      name: string;
      source: 'library' | 'user';
    }>;
    total_exercises: number;
  };
}

/**
 * Week interface that maps to database structure
 */
export interface week {
  id: number;
  resistance_program_id: number;
  week_number: number;
  notes: string;
  created_at: Date;
  updated_at: Date;
} 