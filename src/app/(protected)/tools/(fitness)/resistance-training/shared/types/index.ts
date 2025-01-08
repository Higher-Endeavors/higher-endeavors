// Base Exercise type used across components
export interface Exercise {
  id: string;
  name: string;
  pairing: string;
  sets: number;
  reps: number;
  load: number;
  tempo: string;
  rest: number;
  notes?: string;
  rpe?: number;
  rir?: number;
  targetMuscleGroup?: string;
  exerciseLibraryId?: number;
}

// Program types
export type PhaseFocus = 'GPP' | 'Strength' | 'Hypertrophy' | 'Intensification' | 'Accumulation';
export type PeriodizationType = 'Linear' | 'Undulating' | 'Custom';

export interface Program {
  id: string;
  userId: string;
  name: string;
  phaseFocus: PhaseFocus;
  periodizationType: PeriodizationType;
  startDate?: Date;
  endDate?: Date;
  exercises: Exercise[];
  progressionRules: ProgressionRules;
  volumeTargets: VolumeTarget[];
  createdAt: Date;
  updatedAt: Date;
}

// Progression types
export interface ProgressionRules {
  type: PeriodizationType;
  settings: LinearProgressionRules | UndulatingProgressionRules | CustomProgressionRules;
}

export interface LinearProgressionRules {
  volumeIncrementPercentage: number;
  loadIncrementPercentage: number;
}

export interface UndulatingProgressionRules {
  weeklyVolumePercentages: number[]; // e.g., [100, 50, 75, 25]
}

export interface CustomProgressionRule {
  variable: 'sets' | 'reps' | 'load';
  changeType: 'increment' | 'decrement' | 'percentage';
  value: number;
  condition?: {
    type: 'completion' | 'rpe' | 'rir';
    threshold: number;
  };
}

export interface CustomProgressionRules {
  rules: CustomProgressionRule[];
}

// Volume tracking types
export interface VolumeTarget {
  id: string;
  type: 'session' | 'weekly' | 'exercise';
  muscleGroupId?: number;
  exerciseId?: number;
  repVolumeTarget?: number;
  loadVolumeTarget?: number;
  timeUnderTensionTarget?: number;
}

export interface VolumeMetrics {
  repVolume: number;
  loadVolume: number;
  timeUnderTension: number;
}

// Training session types
export interface TrainingSession {
  id: string;
  programId: string;
  userId: string;
  scheduledDate: Date;
  actualDate?: Date;
  status: 'planned' | 'completed' | 'skipped';
  exercises: SessionExercise[];
  feedback?: SessionFeedback;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionExercise extends Exercise {
  plannedSets: number;
  actualSets: SessionSet[];
}

export interface SessionSet {
  setNumber: number;
  plannedReps: number;
  actualReps?: number;
  plannedLoad: number;
  actualLoad?: number;
  tempo?: string;
  restTime?: number;
  rpe?: number;
  rir?: number;
  notes?: string;
}

export interface SessionFeedback {
  feeling: 'Weak' | 'Average' | 'Strong';
  energyLevel: 'Fatigued' | 'Normal' | 'Energetic';
  musclePump?: number; // 1-10 rating
  notes?: string;
  nextDaySoreness?: 'None' | 'Mild' | 'Moderate' | 'Severe';
  nextDayFeeling?: 'Weak' | 'Average' | 'Strong';
  nextDayEnergyLevel?: 'Fatigued' | 'Normal' | 'Energetic';
}

// Exercise library types
export interface ExerciseLibraryEntry {
  id: number;
  name: string;
  difficulty: string;
  targetMuscleGroup: string;
  primaryMoverMuscle: string;
  secondaryMuscle?: string;
  tertiaryMuscle?: string;
  primaryEquipment: string;
  secondaryEquipment?: string;
  posture?: string;
  singleDoubleArm?: string;
  continuousAlternatingArms?: string;
  grip?: string;
  endingLoadPosition?: string;
  footElevation?: string;
  combinationExercise?: string;
  movePattern1?: string;
  movePattern2?: string;
  movePattern3?: string;
  movePlane1?: string;
  movePlane2?: string;
  movePlane3?: string;
  bodyRegion: string;
  forceType: string;
  mechanics: string;
  laterality: string;
  exerciseModality: string;
} 