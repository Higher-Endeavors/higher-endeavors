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

export const calculateSessionVolume = (exercises: Exercise[], weightUnit: string = 'kg') => {
  let totalSets = 0;
  let totalReps = 0;
  let totalLoad = 0;

  exercises.forEach(exercise => {
    if (exercise.isAdvancedSets && exercise.setDetails) {
      // For Advanced Sets, count each set and its sub-sets
      totalSets += exercise.setDetails.length;
      
      exercise.setDetails.forEach(set => {
        if (set.subSets) {
          // Add up reps and load from each sub-set
          set.subSets.forEach(subSet => {
            totalReps += subSet.reps;
            if (typeof subSet.load === 'number' && !isNaN(subSet.load)) {
              totalLoad += subSet.load * subSet.reps;
            }
          });
        }
      });
    } else {
      // For regular sets
      const sets = Number(exercise.sets) || 0;
      const reps = Number(exercise.reps) || 0;
      const load = typeof exercise.load === 'number' ? exercise.load : 0;

      totalSets += sets;
      totalReps += sets * reps;

      // Only add to total load if the load is numeric
      if (typeof load === 'number' && !isNaN(load)) {
        totalLoad += sets * reps * load;
      }
    }
  });

  return {
    totalSets: isNaN(totalSets) ? 0 : totalSets,
    totalReps: isNaN(totalReps) ? 0 : totalReps,
    totalLoad: isNaN(totalLoad) ? 0 : totalLoad
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

export const calculateSessionDuration = (exercises: Exercise[]) => {
  let totalDuration = 0;

  exercises.forEach(exercise => {
    if (exercise.isAdvancedSets && exercise.setDetails) {
      exercise.setDetails.forEach(set => {
        if (set.subSets) {
          // For each sub-set, add its duration and rest time
          set.subSets.forEach(subSet => {
            // Assume each rep takes about 5 seconds to complete
            const setDuration = 5 * subSet.reps;
            totalDuration += setDuration + (subSet.rest || 0);
          });
        }
      });
    } else {
      const sets = Number(exercise.sets) || 0;
      const rest = Number(exercise.rest) || 0;
      const reps = Number(exercise.reps) || 0;
      // Assume each rep takes about 5 seconds to complete
      const setDuration = 5 * reps;
      
      totalDuration += sets * (setDuration + rest);
    }
  });

  return Math.ceil(totalDuration / 60); // Convert to minutes and round up
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
}; 