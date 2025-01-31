import { z } from 'zod';
import { exerciseSchema, type Exercise } from '../schemas/exercise';

// Re-export the Exercise type from our Zod schema
export type { Exercise };

// Program phase focus options
export type PhaseFocus = 'GPP' | 'Strength' | 'Hypertrophy' | 'Power' | 'Endurance' | 'Recovery' | 'Intensification' | 'Accumulation';

// Periodization type options
export type PeriodizationType = 'Linear' | 'Undulating' | 'Block' | 'Custom';

// Volume target for specific muscle groups
export interface VolumeTarget {
  muscleGroup: string;
  minSets: number;
  maxSets: number;
}

// Progression rules for the program
export interface ProgressionRules {
  type: PeriodizationType;
  settings: {
    volumeIncrementPercentage?: number;
    loadIncrementPercentage?: number;
    weeklyVolumePercentages?: number[];
    programLength?: number;
    rules?: Array<{
      variable: string;
      changeType: string;
      value: number;
    }>;
  };
}

// Complete program structure
export interface Program {
  id: string;
  userId: string;
  name: string;
  phaseFocus: PhaseFocus;
  periodizationType: PeriodizationType;
  exercises: Exercise[];
  progressionRules: ProgressionRules;
  volumeTargets: VolumeTarget[];
  createdAt: Date;
  updatedAt: Date;
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