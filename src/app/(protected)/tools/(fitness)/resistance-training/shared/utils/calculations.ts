import { Exercise } from '../types';

interface VolumeMetrics {
  totalReps: number;
  totalLoad: number;
  averageRPE?: number;
  averageRIR?: number;
  totalTimeUnderTension: number;
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
    // For resistance bands, we'll return 0 for volume calculations
    // This is a simplification - you might want to assign estimated weights to bands
    return 0;
  }
  return load;
};

export const calculateSessionVolume = (exercises: Exercise[]): VolumeMetrics => {
  let totalReps = 0;
  let totalLoad = 0;
  let rpeSum = 0;
  let rirSum = 0;
  let rpeCount = 0;
  let rirCount = 0;
  let totalTimeUnderTension = 0;

  exercises.forEach(exercise => {
    if (exercise.isVariedSets && exercise.setDetails) {
      exercise.setDetails.forEach(set => {
        // Handle main set
        if (!set.subSets?.length) {
          // If no sub-sets, calculate normally
          totalReps += set.reps;
          totalLoad += getNumericLoad(set.load) * set.reps;
        } else {
          // If has sub-sets, calculate volume for each sub-set
          set.subSets.forEach(subSet => {
            totalReps += subSet.reps;
            totalLoad += getNumericLoad(subSet.load) * subSet.reps;
          });
        }
      });
    } else {
      // Regular exercise calculation
      const exerciseReps = exercise.sets * exercise.reps;
      totalReps += exerciseReps;
      totalLoad += getNumericLoad(exercise.load) * exerciseReps;
    }

    // Calculate RPE and RIR averages
    if (exercise.rpe !== undefined) {
      rpeSum += exercise.rpe;
      rpeCount++;
    }
    if (exercise.rir !== undefined) {
      rirSum += exercise.rir;
      rirCount++;
    }

    // Calculate Time Under Tension
    totalTimeUnderTension += calculateExerciseTUT(exercise);
  });

  return {
    totalReps,
    totalLoad,
    totalTimeUnderTension,
    ...(rpeCount > 0 && { averageRPE: rpeSum / rpeCount }),
    ...(rirCount > 0 && { averageRIR: rirSum / rirCount })
  };
};

export const calculateVolumeProgress = (
  plannedVolume: VolumeMetrics,
  actualVolume: VolumeMetrics
): { [key: string]: number } => {
  return {
    repsCompletion: (actualVolume.totalReps / plannedVolume.totalReps) * 100,
    loadCompletion: (actualVolume.totalLoad / plannedVolume.totalLoad) * 100,
    timeUnderTensionCompletion: 
      (actualVolume.totalTimeUnderTension / plannedVolume.totalTimeUnderTension) * 100
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
        // For regular sets
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
    return tempoTotal * exercise.reps * exercise.sets;
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