import { Exercise, PlannedExercise, VariedExercise, PlannedExerciseSet, LoadUnit } from '@/app/lib/types/pillars/fitness';
import { calculateTempoTotal, getNumericLoad, convertWeight } from '../unit-conversions';

export interface VolumeMetrics {
  totalSets: number;
  totalReps: number;
  totalLoad: number;
}

export const calculateSessionVolume = (
  exercises: Exercise[],
  preferredUnit: LoadUnit = 'lbs'
): VolumeMetrics => {
  let totalSets = 0;
  let totalReps = 0;
  let totalLoad = 0;

  exercises.forEach(exercise => {
    if (exercise.isVariedSets) {
      const variedExercise = exercise as VariedExercise;
      totalSets += variedExercise.setDetails.length;
      variedExercise.setDetails.forEach(set => {
        totalReps += set.plannedReps;
        const load = set.plannedLoad ? getNumericLoad(set.plannedLoad) : 0;
        if (set.loadUnit && set.loadUnit !== preferredUnit) {
          totalLoad += convertWeight(load * set.plannedReps, set.loadUnit, preferredUnit);
        } else {
          totalLoad += load * set.plannedReps;
        }
      });
    } else {
      const plannedExercise = exercise as PlannedExercise;
      totalSets += plannedExercise.sets;
      if (plannedExercise.plannedSets) {
        plannedExercise.plannedSets.forEach((set: PlannedExerciseSet) => {
          totalReps += set.plannedReps;
          const load = set.plannedLoad ? getNumericLoad(set.plannedLoad) : 0;
          if (set.loadUnit && set.loadUnit !== preferredUnit) {
            totalLoad += convertWeight(load * set.plannedReps, set.loadUnit, preferredUnit);
          } else {
            totalLoad += load * set.plannedReps;
          }
        });
      }
    }
  });

  return { totalSets, totalReps, totalLoad };
};

export const calculateSessionDuration = (exercises: Exercise[]): number => {
  return exercises.reduce((total, exercise) => {
    if (exercise.isVariedSets) {
      const variedExercise = exercise as VariedExercise;
      return total + variedExercise.setDetails.reduce((setTotal, set) => {
        const repTime = calculateTempoTotal(set.plannedTempo);
        return setTotal + (set.plannedReps * repTime) + (set.plannedRest ?? 0);
      }, 0);
    } else {
      const plannedExercise = exercise as PlannedExercise;
      if (plannedExercise.plannedSets) {
        return total + plannedExercise.plannedSets.reduce((setTotal: number, set: PlannedExerciseSet) => {
          const repTime = calculateTempoTotal(set.plannedTempo);
          return setTotal + (set.plannedReps * repTime) + (set.plannedRest ?? 0);
        }, 0);
      }
      return total;
    }
  }, 0);
};

export const calculateSetTUT = (reps: number, tempo: string = '2010'): number => {
  const tempoTotal = calculateTempoTotal(tempo);
  return reps * tempoTotal;
};

export const calculateExerciseTUT = (exercise: Exercise): number => {
  if (exercise.isVariedSets) {
    const variedExercise = exercise as VariedExercise;
    return variedExercise.setDetails.reduce((total, set) => {
      return total + calculateSetTUT(set.plannedReps, set.plannedTempo || '2010');
    }, 0);
  }
  
  const plannedExercise = exercise as PlannedExercise;
  if (plannedExercise.plannedSets) {
    return plannedExercise.plannedSets.reduce((total: number, set: PlannedExerciseSet) => {
      return total + calculateSetTUT(set.plannedReps, set.plannedTempo || '2010');
    }, 0);
  }
  
  return 0;
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

export const formatLoad = (
  load: string | number | undefined, 
  loadUnit?: LoadUnit
): string => {
  if (load === undefined || load === '') {
    return '';
  }

  const numericLoad = typeof load === 'string' ? parseFloat(load) : load;
  
  if (typeof numericLoad === 'number' && !isNaN(numericLoad)) {
    const unit = loadUnit || 'lbs';
    return `${numericLoad}${unit}`;
  }

  return String(load);
};