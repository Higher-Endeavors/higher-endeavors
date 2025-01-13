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