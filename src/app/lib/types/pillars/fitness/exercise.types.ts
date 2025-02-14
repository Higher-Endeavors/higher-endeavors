import { z } from 'zod';
import { exerciseSchema, setDetailsSchema, subSetSchema, PhaseFocus, PeriodizationType, ProgressionFrequency } from './zod_schemas';

/**
 * Unit types for fitness measurements
 */
export type WeightUnit = 'lbs' | 'kg';  // For body weight measurements
export type LoadUnit = 'lbs' | 'kg';    // Specifically for resistance training loads
export type HeightUnit = 'in' | 'cm';
export type TemperatureUnit = 'F' | 'C';

/**
 * Program types
 */
export type PhaseFocusType = (typeof PhaseFocus)[keyof typeof PhaseFocus];
export type PeriodizationTypeEnum = (typeof PeriodizationType)[keyof typeof PeriodizationType];
export type ProgressionFrequencyType = (typeof ProgressionFrequency)[keyof typeof ProgressionFrequency];

export { PhaseFocus, PeriodizationType, ProgressionFrequency };

/**
 * Type guards
 */
export function isPhaseFocus(value: unknown): value is PhaseFocusType {
  return typeof value === 'string' && Object.values(PhaseFocus).includes(value as PhaseFocusType);
}

export function isPeriodizationType(value: unknown): value is PeriodizationTypeEnum {
  return typeof value === 'string' && Object.values(PeriodizationType).includes(value as PeriodizationTypeEnum);
}

export function isProgressionFrequency(value: unknown): value is ProgressionFrequencyType {
  return typeof value === 'string' && Object.values(ProgressionFrequency).includes(value as ProgressionFrequencyType);
}

/**
 * Defines the possible sources of an exercise
 */
export type ExerciseSource = 'library' | 'user' | 'custom';

/**
 * Type for sub-sets within a set
 */
export type SubSet = z.infer<typeof subSetSchema> & {
  reps: number;
  load: number | string;
  loadUnit?: LoadUnit;  // Changed from WeightUnit to LoadUnit
  notes?: string;
  rest?: number;
};

/**
 * Type for individual set details in varied exercises
 */
export type SetDetail = z.infer<typeof setDetailsSchema>;

/**
 * Base interface for exercise properties
 */
export interface BaseExercise {
  id: string;
  name: string;
  pairing: string;
  sets: number;
  reps: number;
  load: number | string;
  tempo: string;
  rest: number;
  notes?: string;
  rpe?: number;
  rir?: number;
  loadUnit?: LoadUnit;  // Changed from WeightUnit to LoadUnit
  source?: ExerciseSource;
  libraryId?: number;
  userExerciseId?: number;
}

/**
 * Interface for exercises with uniform sets
 */
export interface RegularExercise extends BaseExercise {
  isVariedSets: false;
  isAdvancedSets: false;
  setDetails?: undefined;
}

/**
 * Interface for exercises with varied sets
 */
export interface VariedExercise extends BaseExercise {
  isVariedSets: true;
  isAdvancedSets: boolean;
  setDetails: SetDetail[];
}

/**
 * Union type for all exercise types
 */
export type Exercise = RegularExercise | VariedExercise;

/**
 * Type for exercise options in react-select
 */
export interface ExerciseOption {
  id: string;
  value: string;
  label: string;
  libraryId?: number;
  source?: ExerciseSource;
  data: {
    id: string;
    name: string;
    source: ExerciseSource;
    difficulty?: string;
    targetMuscleGroup: string;
    primaryEquipment: string;
    secondaryEquipment?: string;
    exerciseFamily: string;
    bodyRegion: string;
    movementPattern: string;
    movementPlane: string;
    laterality: string;
    libraryId?: number;
  };
}

/**
 * Type for exercise select handler
 */
export type ExerciseSelectHandler = (
  newValue: ExerciseOption | null,
  actionMeta: { 
    action: string;
    option?: ExerciseOption;
    name?: string;
  }
) => void;

/**
 * Helper function to create a regular exercise
 */
export function createRegularExercise(baseExercise: Omit<BaseExercise, 'isVariedSets' | 'isAdvancedSets'>): RegularExercise {
  return {
    ...baseExercise,
    isVariedSets: false,
    isAdvancedSets: false
  };
}

/**
 * Helper function to create a varied exercise
 */
export function createVariedExercise(
  baseExercise: Omit<BaseExercise, 'isVariedSets' | 'isAdvancedSets'>,
  setDetails: SetDetail[]
): VariedExercise {
  return {
    ...baseExercise,
    isVariedSets: true,
    isAdvancedSets: setDetails.length > 0,
    setDetails
  };
}

/**
 * Helper function to get the next pairing letter
 */
export function getNextPairing(exercises: Exercise[]): string {
  if (exercises.length === 0) return 'A1';
  
  const pairings = exercises.map(e => e.pairing).sort();
  const lastPairing = pairings[pairings.length - 1];
  
  if (!lastPairing) return 'A1';
  
  const letter = lastPairing.charAt(0);
  const number = parseInt(lastPairing.charAt(1));
  
  if (number === 2) {
    return String.fromCharCode(letter.charCodeAt(0) + 1) + '1';
  }
  
  return letter + '2';
}

/**
 * Helper function to apply linear progression to an exercise
 */
export function applyLinearProgression(
  exercise: Exercise,
  weekNumber: number,
  volumeIncrementPercentage: number,
  loadIncrementPercentage: number
): Exercise {
  const baseReps = Number(exercise.reps) || 0;
  const baseLoad = typeof exercise.load === 'number' ? exercise.load : 0;
  
  // Calculate increments
  const volumeMultiplier = 1 + ((weekNumber - 1) * (volumeIncrementPercentage / 100));
  const loadMultiplier = 1 + ((weekNumber - 1) * (loadIncrementPercentage / 100));

  // Apply progression
  const newReps = Math.max(1, Math.round(baseReps * volumeMultiplier));
  const newLoad = typeof exercise.load === 'number' 
    ? Math.round(baseLoad * loadMultiplier * 100) / 100 
    : exercise.load;

  return {
    ...exercise,
    reps: isNaN(newReps) ? baseReps : newReps,
    load: typeof newLoad === 'number' && isNaN(newLoad) ? baseLoad : newLoad
  };
}

/**
 * Training session related types
 */
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

export function isValidPairing(pairing: string): boolean {
  return /^([A-Z][1-2]|WU|CD)$/.test(pairing);
} 