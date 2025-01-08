import { Exercise } from '../types';

interface VolumeMetrics {
  totalReps: number;
  totalLoad: number;
  totalTimeUnderTension: number;
  averageRPE?: number;
  averageRIR?: number;
}

export const calculateSessionVolume = (exercises: Exercise[]): VolumeMetrics => {
  let totalReps = 0;
  let totalLoad = 0;
  let totalTimeUnderTension = 0;
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

    // Calculate time under tension
    if (exercise.tempo) {
      const tempoNumbers = exercise.tempo.split('').map(Number);
      const timePerRep = tempoNumbers.reduce((a, b) => a + b, 0);
      totalTimeUnderTension += timePerRep * exerciseReps;
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