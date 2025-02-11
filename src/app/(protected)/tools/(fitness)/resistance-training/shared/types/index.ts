import { Exercise, ExerciseSource } from './exercise.types';

// Base types
export type LoadUnit = 'kg' | 'lbs';

// Re-export exercise types
export type { Exercise, ExerciseSource };

// Program phase focus options
export type PhaseFocus = 'GPP' | 'Strength' | 'Hypertrophy' | 'Intensification' | 'Accumulation';

// Periodization type options
export type PeriodizationType = 'None' | 'Linear' | 'Undulating' | 'Custom';

// Volume target for specific muscle groups
export interface VolumeTarget {
  muscleGroup: string;
  minSets: number;
  maxSets: number;
}

// Progression rule settings
export interface ProgressionRuleSettings {
  volumeIncrementPercentage?: number;
  loadIncrementPercentage?: number;
  weeklyVolumePercentages?: number[];
  programLength?: number;
  rules?: Array<{
    variable: string;
    changeType: string;
    value: number;
  }>;
}

// Progression rules for the program
export interface ProgressionRules {
  type: PeriodizationType;
  settings: ProgressionRuleSettings;
}

// Base program interface
export interface BaseProgram {
  id: string;
  userId: string;
  name: string;
  phaseFocus: PhaseFocus;
  periodizationType: PeriodizationType;
  progressionRules: ProgressionRules;
  volumeTargets?: VolumeTarget[];
}

// Complete program structure
export interface Program extends BaseProgram {
  exercises: Exercise[];
  createdAt: Date;
  updatedAt: Date;
}

// Saved program structure (for API responses)
export interface SavedProgram extends Omit<BaseProgram, 'name'> {
  program_name: string;
  exercises?: Exercise[];
  created_at: string;
  updated_at: string;
}

// Training session related types
export interface SessionSet {
  id?: string;
  setNumber: number;
  plannedReps: number;
  actualReps?: number;
  plannedLoad: number | string;
  actualLoad?: number | string;
  tempo: string;
  restTime: number;
  rpe?: number;
  rir?: number;
  notes?: string;
}

export interface SessionExercise {
  id?: string;
  exerciseLibraryId: number;
  name: string;
  pairing: string;
  plannedSets: number;
  actualSets: SessionSet[];
  notes?: string;
}

export interface SessionFeedback {
  feeling?: 'Weak' | 'Average' | 'Strong';
  energyLevel?: 'Fatigued' | 'Normal' | 'Energetic';
  musclePump?: 'Low' | 'Medium' | 'High';
  notes?: string;
  nextDaySoreness?: 'None' | 'Mild' | 'Moderate' | 'Severe';
  nextDayFeeling?: 'Weak' | 'Average' | 'Strong';
  nextDayEnergyLevel?: 'Fatigued' | 'Normal' | 'Energetic';
}

export interface TrainingSession {
  id?: string;
  programId: string;
  scheduledDate: string;
  actualDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'skipped';
  exercises: SessionExercise[];
  feedback?: SessionFeedback;
} 