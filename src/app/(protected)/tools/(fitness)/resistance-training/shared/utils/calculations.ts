import { Exercise, SessionExercise } from '../types';

interface VolumeMetrics {
  totalReps: number;
  totalLoad: number;
}

const calculateTempoTotal = (tempo: string): number => {
  return tempo.split('').reduce((sum, char) => {
    // Treat 'X' or 'x' as 1 second
    if (char.toLowerCase() === 'x') {
      return sum + 1;
    }
    return sum + parseInt(char) || 0;
  }, 0);
};

const getNumericLoad = (load: string | number): number => {
  if (typeof load === 'string') {
    // For resistance bands or BW, we'll return 0 for volume calculations
    return 0;
  }
  return load;
};

// Conversion functions
const KG_TO_LBS = 2.2;
const LBS_TO_KG = 0.45;

const convertWeight = (weight: number, fromUnit: 'kg' | 'lbs', toUnit: 'kg' | 'lbs'): number => {
  if (fromUnit === toUnit) return weight;
  return fromUnit === 'kg' ? weight * KG_TO_LBS : weight * LBS_TO_KG;
};

export const calculateSessionVolume = (exercises: Exercise[], preferredUnit: 'kg' | 'lbs' = 'kg'): VolumeMetrics => {
  let totalReps = 0;
  let totalLoad = 0;

  exercises.forEach((exercise) => {
    if (exercise.setDetails) {
      exercise.setDetails.forEach((set) => {
        if (Array.isArray(set)) {
          set.forEach((subSet) => {
            const load = getNumericLoad(subSet.load);
            if (load > 0) {
              totalReps += subSet.reps;
              const convertedLoad = subSet.loadUnit && subSet.loadUnit !== preferredUnit
                ? convertWeight(load, subSet.loadUnit, preferredUnit)
                : load;
              totalLoad += convertedLoad * subSet.reps;
            }
          });
        } else {
          const load = getNumericLoad(set.load);
          if (load > 0) {
            totalReps += set.reps;
            const convertedLoad = set.loadUnit && set.loadUnit !== preferredUnit
              ? convertWeight(load, set.loadUnit, preferredUnit)
              : load;
            totalLoad += convertedLoad * set.reps;
          }
        }
      });
    } else {
      // Regular exercise calculation
      const exerciseReps = exercise.sets * exercise.reps;
      totalReps += exerciseReps;
      const numericLoad = getNumericLoad(exercise.load);
      if (numericLoad > 0) {
        const convertedLoad = exercise.loadUnit && exercise.loadUnit !== preferredUnit
          ? convertWeight(numericLoad, exercise.loadUnit, preferredUnit)
          : numericLoad;
        totalLoad += convertedLoad * exerciseReps;
      }
    }
  });

  return {
    totalReps,
    totalLoad
  };
};

export const calculateSessionExerciseVolume = (exercises: SessionExercise[]): VolumeMetrics => {
  let totalReps = 0;
  let totalLoad = 0;

  exercises.forEach(exercise => {
    exercise.actualSets.forEach(set => {
      // Use actual values if available, otherwise planned values
      const reps = set.actualReps || set.plannedReps;
      const load = getNumericLoad(set.actualLoad || set.plannedLoad);
      
      totalReps += reps;
      totalLoad += load * reps;
    });
  });

  return {
    totalReps,
    totalLoad
  };
};

export const calculateVolumeProgress = (
  plannedVolume: VolumeMetrics,
  actualVolume: VolumeMetrics
): { [key: string]: number } => {
  return {
    repsCompletion: (actualVolume.totalReps / plannedVolume.totalReps) * 100,
    loadCompletion: (actualVolume.totalLoad / plannedVolume.totalLoad) * 100
  };
};

export const calculateProgressionLoad = (
  currentLoad: number,
  progressionType: 'Linear' | 'Undulating' | 'Custom',
  settings: any,
  weekNumber?: number
): number => {
  switch (progressionType) {
    case 'Linear':
      return currentLoad * (1 + settings.loadIncrementPercentage / 100);
    
    case 'Undulating':
      if (weekNumber === undefined) return currentLoad;
      const weekIndex = (weekNumber - 1) % settings.weeklyVolumePercentages.length;
      return currentLoad * (settings.weeklyVolumePercentages[weekIndex] / 100);
    
    case 'Custom':
      // Apply custom progression rules
      let newLoad = currentLoad;
      settings.rules.forEach((rule: any) => {
        if (rule.variable === 'load') {
          if (rule.changeType === 'increment') {
            newLoad += rule.value;
          } else if (rule.changeType === 'decrement') {
            newLoad -= rule.value;
          } else if (rule.changeType === 'percentage') {
            newLoad *= (1 + rule.value / 100);
          }
        }
      });
      return newLoad;
    
    default:
      return currentLoad;
  }
};

export const calculateExerciseTUT = (exercise: Exercise): number => {
  if (exercise.isVariedSets && exercise.setDetails) {
    return exercise.setDetails.reduce((totalTUT, set) => {
      const tempoTotal = calculateTempoTotal(set.tempo);
      
      if (!set.subSets?.length) {
        // For regular sets, only multiply by reps (not sets)
        return totalTUT + (tempoTotal * set.reps);
      } else {
        // For sets with sub-sets, sum up TUT for each sub-set (reps * tempo only)
        const setTUT = set.subSets.reduce((subSetTotal, subSet) => {
          return subSetTotal + (tempoTotal * subSet.reps);
        }, 0);
        return totalTUT + setTUT;
      }
    }, 0);
  } else {
    const tempoTotal = calculateTempoTotal(exercise.tempo);
    // Only multiply by reps, not by sets
    return tempoTotal * exercise.reps;
  }
};

export const calculateSessionDuration = (exercises: Exercise[]): number => {
  return exercises.reduce((total, exercise) => {
    if (exercise.isVariedSets && exercise.setDetails) {
      return total + exercise.setDetails.reduce((setTotal, set) => {
        const tempoTotal = calculateTempoTotal(set.tempo);
        
        if (!set.subSets?.length) {
          return setTotal + (tempoTotal * set.reps) + (set.rest || 0);
        } else {
          return setTotal + set.subSets.reduce((subTotal, subSet) => {
            return subTotal + (tempoTotal * subSet.reps) + subSet.rest;
          }, 0);
        }
      }, 0);
    } else {
      const exerciseTime = (calculateExerciseTUT(exercise) * exercise.sets) + 
        ((exercise.sets - 1) * exercise.rest);
      return total + exerciseTime;
    }
  }, 0);
};

export interface VolumeAdjustment {
  sets?: number;
  reps?: number;
}

export const calculateLinearProgression = (
  baseExercise: Exercise,
  weekNumber: number,
  volumeIncrementPercentage: number
): VolumeAdjustment => {
  // No adjustment for week 1 or when volume increment is 0
  if (weekNumber === 1 || volumeIncrementPercentage === 0) {
    return {
      sets: baseExercise.sets,
      reps: baseExercise.reps
    };
  }

  // Calculate target volume increase
  const baseVolume = baseExercise.sets * baseExercise.reps;
  // Calculate cumulative increase for the current week (e.g., 10%, 20%, 30%)
  const cumulativeIncrease = volumeIncrementPercentage * (weekNumber - 1);
  const targetVolume = baseVolume * (1 + (cumulativeIncrease / 100));
  
  // Calculate target reps per set to achieve the volume
  const targetRepsPerSet = Math.round(targetVolume / baseExercise.sets);

  console.log(`Week ${weekNumber} progression:`, {
    baseVolume,
    volumeIncrementPercentage,
    cumulativeIncrease,
    targetVolume,
    targetRepsPerSet
  });

  // Always try to achieve the target volume by adjusting reps first
  return {
    sets: baseExercise.sets,
    reps: targetRepsPerSet
  };
};

export const applyLinearProgression = (
  exercise: Exercise,
  weekNumber: number,
  volumeIncrementPercentage: number,
  loadIncrementPercentage: number
): Exercise => {
  // For week 1, return the exercise as is
  if (weekNumber === 1) return exercise;

  // Calculate volume adjustments
  const volumeAdjustment = calculateLinearProgression(
    exercise,
    weekNumber,
    volumeIncrementPercentage
  );

  // Handle load adjustments
  let loadAdjustment = exercise.load;
  
  // Only adjust load if:
  // 1. loadIncrementPercentage is explicitly greater than 0
  // 2. exercise.load is a number (not a band color)
  // 3. We're past week 1
  if (loadIncrementPercentage > 0 && typeof exercise.load === 'number' && weekNumber > 1) {
    const cumulativeLoadIncrease = loadIncrementPercentage * (weekNumber - 1);
    const rawAdjustedLoad = exercise.load * (1 + (cumulativeLoadIncrease / 100));
    
    // Round to nearest 5
    loadAdjustment = Math.round(rawAdjustedLoad / 5) * 5;
  }

  console.log(`Week ${weekNumber} load progression:`, {
    originalLoad: exercise.load,
    loadIncrementPercentage,
    adjustedLoad: loadAdjustment,
    weekNumber
  });

  return {
    ...exercise,
    sets: volumeAdjustment.sets || exercise.sets,
    reps: volumeAdjustment.reps || exercise.reps,
    load: loadAdjustment
  };
}; 