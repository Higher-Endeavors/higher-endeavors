import { Exercise, SetDetail, WeightUnit } from '@/app/lib/types/pillars/fitness';
import { calculateTempoTotal, getNumericLoad, convertWeight } from '../unit-conversions';

export interface VolumeMetrics {
  totalSets: number;
  totalReps: number;
  totalLoad: number;
}

export const calculateSessionVolume = (
  exercises: Exercise[],
  preferredUnit: WeightUnit = 'lbs'
): VolumeMetrics => {
  let totalSets = 0;
  let totalReps = 0;
  let totalLoad = 0;

  exercises.forEach(exercise => {
    if (exercise.isVariedSets && exercise.setDetails) {
      totalSets += exercise.setDetails.length;
      exercise.setDetails.forEach(set => {
        totalReps += set.reps;
        const load = getNumericLoad(set.load);
        if (set.loadUnit && set.loadUnit !== preferredUnit) {
          totalLoad += convertWeight(load * set.reps, set.loadUnit, preferredUnit);
        } else {
          totalLoad += load * set.reps;
        }
      });
    } else {
      const sets = Number(exercise.sets) || 0;
      const reps = Number(exercise.reps) || 0;
      const load = getNumericLoad(exercise.load);
      
      totalSets += sets;
      totalReps += sets * reps;
      
      if (exercise.loadUnit && exercise.loadUnit !== preferredUnit) {
        totalLoad += sets * reps * convertWeight(load, exercise.loadUnit, preferredUnit);
      } else {
        totalLoad += sets * reps * load;
      }
    }
  });

  return { totalSets, totalReps, totalLoad };
};

export const calculateSessionDuration = (exercises: Exercise[]): number => {
  const REST_TIME_BETWEEN_SETS = 90; // seconds
  const TIME_PER_REP = 4; // seconds
  
  return exercises.reduce((total, exercise) => {
    if (exercise.isVariedSets && exercise.setDetails) {
      const sets = exercise.setDetails.length;
      const avgReps = exercise.setDetails.reduce((sum, set) => sum + Number(set.reps), 0) / sets;
      const timePerSet = (avgReps * TIME_PER_REP) + REST_TIME_BETWEEN_SETS;
      return total + (sets * timePerSet);
    }
    const timePerSet = (Number(exercise.reps) * TIME_PER_REP) + REST_TIME_BETWEEN_SETS;
    return total + (Number(exercise.sets) * timePerSet);
  }, 0);
};

export const calculateSetTUT = (reps: number, tempo: string = '2010'): number => {
  const tempoTotal = calculateTempoTotal(tempo);
  return reps * tempoTotal;
};

export const calculateExerciseTUT = (exercise: Exercise): number => {
  if (exercise.isVariedSets && exercise.setDetails) {
    // For varied sets, return an array of TUT values for each set
    return exercise.setDetails.reduce((total, set) => {
      return total + calculateSetTUT(set.reps || 0, set.tempo || '2010');
    }, 0);
  }
  
  // For regular sets, calculate TUT for a single set
  return calculateSetTUT(Number(exercise.reps) || 0, exercise.tempo || '2010');
};

export const calculateLinearProgression = (
  baseValue: number,
  weekNumber: number,
  incrementPercentage: number
): number => {
  const multiplier = 1 + ((weekNumber - 1) * (incrementPercentage / 100));
  return Math.round(baseValue * multiplier * 100) / 100;
};

// Alias export for backward compatibility
export const calculateSessionExerciseVolume = calculateSessionVolume; 