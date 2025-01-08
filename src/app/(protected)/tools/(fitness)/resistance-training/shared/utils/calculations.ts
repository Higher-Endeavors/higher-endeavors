import { Exercise } from '../types';

interface VolumeMetrics {
  totalReps: number;
  totalLoad: number;
  averageRPE?: number;
  averageRIR?: number;
}

export const calculateSessionVolume = (exercises: Exercise[]): VolumeMetrics => {
  let totalReps = 0;
  let totalLoad = 0;
  let rpeSum = 0;
  let rirSum = 0;
  let rpeCount = 0;
  let rirCount = 0;

  exercises.forEach(exercise => {
    // Calculate total reps
    const exerciseReps = exercise.sets * exercise.reps;
    totalReps += exerciseReps;

    // Calculate total load (weight * reps * sets)
    totalLoad += exercise.load * exerciseReps;

    // Calculate RPE and RIR averages
    if (exercise.rpe !== undefined) {
      rpeSum += exercise.rpe;
      rpeCount++;
    }
    if (exercise.rir !== undefined) {
      rirSum += exercise.rir;
      rirCount++;
    }
  });

  return {
    totalReps,
    totalLoad,
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
    // For varied sets, show TUT of first set
    const firstSet = exercise.setDetails[0];
    const tempoTotal = firstSet.tempo.split('').reduce((sum, num) => sum + parseInt(num), 0);
    return tempoTotal * firstSet.reps;
  }
  
  // Calculate TUT for a single set
  const tempoTotal = exercise.tempo.split('').reduce((sum, num) => sum + parseInt(num), 0);
  return tempoTotal * exercise.reps;  // TUT for one set
};

export const calculateSessionDuration = (exercises: Exercise[]): number => {
  return exercises.reduce((total, exercise) => {
    // Calculate total exercise time (including rest between sets)
    const exerciseTime = exercise.isVariedSets && exercise.setDetails
      ? exercise.setDetails.reduce((time, set) => {
          const tempoTotal = set.tempo.split('').reduce((sum, num) => sum + parseInt(num), 0);
          const setTUT = tempoTotal * set.reps;
          return time + setTUT + set.rest;
        }, 0)
      : (calculateExerciseTUT(exercise) * exercise.sets + (exercise.sets - 1) * exercise.rest);

    return total + exerciseTime;
  }, 0);
}; 