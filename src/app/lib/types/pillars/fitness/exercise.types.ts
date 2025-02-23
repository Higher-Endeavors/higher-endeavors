import { z } from 'zod';
import { exerciseSchema, setDetailsSchema, subSetSchema, PhaseFocus, PeriodizationType, ProgressionFrequency } from './zod_schemas';

/**
 * Unit types for fitness measurements
 */

export type LoadUnit = 'lbs' | 'kg';    // Specifically for resistance training loads

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
export type ExerciseSource = 'library' | 'user';  // Remove 'custom'

/**
 * Base interface for exercise properties
 */
export interface BaseExercise {
  id: number;              // ID from respective table
  exerciseId: number;
  name: string;           
  source: 'library' | 'user';
}

export interface PlannedExercise extends BaseExercise {
  pairing: string;
  sets: number;
  isVariedSets: boolean;
  isAdvancedSets: boolean;
  plannedSets?: PlannedExerciseSet[];
  notes?: string;  // Added notes field
}

/**
 * Interface for exercises with varied sets
 */
export interface VariedExercise extends BaseExercise {
  pairing: string;
  isVariedSets: true;
  isAdvancedSets: boolean;
  setDetails: PlannedExerciseSet[];
  notes?: string;  // Added notes field
}

export function isVariedExercise(exercise: Exercise): exercise is VariedExercise {
  return 'setDetails' in exercise && exercise.setDetails !== undefined;
}

/**
 * Union type for all exercise types
 */
export type Exercise = PlannedExercise | VariedExercise;

export interface PlannedExerciseSet {
  setNumber: number;
  plannedReps: number;
  plannedLoad?: number;
  loadUnit?: string;
  plannedRest?: number;
  plannedTempo?: string;
  rpe?: number;       // Added: Rating of Perceived Exertion (1-10, with .5 increments)
  rir?: number;       // Added: Reps in Reserve (0-5 typically)
  notes?: string;
  subSets?: PlannedExerciseSubSet[];
}

/**
 * Type for individual set details in varied exercises
 */

export interface PlannedExerciseSubSet {
  subSetNumber: number;
  plannedReps: number;
  plannedLoad?: number;
  loadUnit?: string;
  plannedRest?: number;
  plannedTempo?: string;
  rpe?: number;       // Added: Rating of Perceived Exertion
  rir?: number;       // Added: Reps in Reserve
}

export interface WeekExercise extends BaseExercise {
  weekNumber: number;
  baseExerciseId: number;  // Original exercise ID
  weekSpecificId: number;  // Database ID for this specific week's version
}


/**
 * Type for exercise options in react-select
 */
export interface ExerciseOption {
  id: number;
  value: string;
  label: string;
  libraryId?: number;
  source: ExerciseSource;
  data: {
    id: number;
    name: string;
    source: ExerciseSource;
    // Optional fields for library exercises
    difficulty?: string;
    targetMuscleGroup?: string;
    primaryEquipment?: string;
    secondaryEquipment?: string;
    exerciseFamily?: string;
    bodyRegion?: string;
    movementPattern?: string;
    movementPlane?: string;
    laterality?: string;
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
 * Helper function to create a planned exercise
 */
export function createPlannedExercise(baseExercise: Omit<BaseExercise, 'isVariedSets' | 'isAdvancedSets'>): PlannedExercise {
  return {
    ...baseExercise,
    pairing: '',
    sets: 0,
    isVariedSets: false,
    isAdvancedSets: false
  };
}

/**
 * Helper function to create a varied exercise
 */
export function createVariedExercise(
  baseExercise: Omit<BaseExercise, 'isVariedSets' | 'isAdvancedSets'>,
  setDetails: PlannedExerciseSet[]
): VariedExercise {
  return {
    ...baseExercise,
    pairing: '',
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
  if ('isVariedSets' in exercise && exercise.isVariedSets) {
    const variedExercise = exercise as VariedExercise;
    const updatedSets = variedExercise.setDetails.map(set => {
      const baseReps = set.plannedReps;
      const baseLoad = typeof set.plannedLoad === 'number' ? set.plannedLoad : 0;

      // Calculate increments
      const volumeMultiplier = 1 + ((weekNumber - 1) * (volumeIncrementPercentage / 100));
      const loadMultiplier = 1 + ((weekNumber - 1) * (loadIncrementPercentage / 100));

      return {
        ...set,
        plannedReps: Math.max(1, Math.round(baseReps * volumeMultiplier)),
        plannedLoad: typeof set.plannedLoad === 'number' 
          ? Math.round(baseLoad * loadMultiplier * 100) / 100 
          : set.plannedLoad
      };
    });

    return {
      ...exercise,
      setDetails: updatedSets
    };
  }
  return exercise;
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



/**
 * Type for form handling in AddExerciseModal
 */
export interface ExerciseFormData {
  id: string;
  name: string;
  pairing: string;
  sets: number;
  reps: number;
  load: number | string;
  loadUnit?: LoadUnit;
  tempo: string;
  rest: number;
  notes?: string;
  rpe?: number;
  rir?: number;
  isVariedSets: boolean;
  isAdvancedSets: boolean;
  setDetails?: PlannedExerciseSet[];  // This already includes subSets?: PlannedExerciseSubSet[]
}

/**
 * Component Props Types
 */
export interface ExerciseItemProps {
  exercise: Exercise;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export interface MenuState {
  [key: number]: boolean;
}

export interface ExerciseListProps {
  exercises: Exercise[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export interface GroupedExercises {
  [key: string]: Exercise[];
}