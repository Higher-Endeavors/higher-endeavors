import { Exercise, Program, TrainingSession, LoadUnit } from './index';

export interface APIExerciseSet {
  setNumber: number;
  reps: number;
  load: number | string;
  loadUnit: LoadUnit;
  tempo: string;
  rest: number;
  notes?: string;
}

export interface APIExercise {
  id?: string;
  name?: string;
  customName?: string;
  pairing: string;
  sets: APIExerciseSet[];
  notes?: string;
  source: 'library' | 'user' | 'custom';
  libraryId?: number;
  userExerciseId?: number;
}

export interface APIDay {
  dayNumber: number;
  dayName: string;
  notes?: string;
  exercises: APIExercise[];
}

export interface APIWeek {
  weekNumber: number;
  notes?: string;
  days: APIDay[];
}

export interface APIProgramResponse {
  id: string;
  program_name: string;
  userId: string;
  phase_focus: string;
  periodization_type: string;
  progression_rules: {
    type: string;
    settings: {
      volumeIncrementPercentage: number;
      loadIncrementPercentage: number;
      programLength: number;
      weeklyVolumePercentages: number[];
    };
  };
  start_date: string;
  end_date: string;
  notes?: string;
  weeks: APIWeek[];
  created_at: string;
  updated_at: string;
}

export interface APISessionResponse {
  id: string;
  programId: string;
  scheduledDate: string;
  actualDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'skipped';
  exercises: APIExercise[];
  feedback?: {
    feeling?: 'Weak' | 'Average' | 'Strong';
    energyLevel?: 'Fatigued' | 'Normal' | 'Energetic';
    musclePump?: 'Low' | 'Medium' | 'High';
    notes?: string;
    nextDaySoreness?: 'None' | 'Mild' | 'Moderate' | 'Severe';
    nextDayFeeling?: 'Weak' | 'Average' | 'Strong';
    nextDayEnergyLevel?: 'Fatigued' | 'Normal' | 'Energetic';
  };
} 