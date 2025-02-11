import { Exercise, SessionExercise } from '../types';

interface VolumeMetrics {
  totalReps: number;
  totalLoad: number;
}

const calculateTempoTotal = (tempo?: string): number => {
  if (!tempo) return 0;  // Return 0 if tempo is undefined
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
    // Try to parse numeric strings first
    const parsedLoad = parseFloat(load);
    if (!isNaN(parsedLoad)) {
      return parsedLoad;
    }
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
  console.log('Starting calculateSessionVolume with exercises:', exercises);
  let totalSets = 0;
  let totalReps = 0;
  let totalLoad = 0;

  exercises.forEach(exercise => {
    console.log('\nProcessing exercise:', {
      name: exercise.name,
      pairing: exercise.pairing,
      sets: exercise.sets,
      reps: exercise.reps,
      load: exercise.load,
      isVariedSets: exercise.isVariedSets,
      setDetails: exercise.setDetails
    });

    if (exercise.isVariedSets && exercise.setDetails) {
      // For varied sets, count each set and its details
      totalSets += exercise.setDetails.length;
      
      exercise.setDetails.forEach(set => {
        console.log('Processing varied set:', set);
        if (set.subSets && set.subSets.length > 0) {
          // Add up reps and load from each sub-set
          set.subSets.forEach(subSet => {
            console.log('Processing sub-set:', subSet);
            totalReps += subSet.reps;
            if (typeof subSet.load === 'number' && !isNaN(subSet.load)) {
              totalLoad += subSet.load * subSet.reps;
            }
          });
        } else {
          // Regular set within varied sets
          totalReps += set.reps;
          if (typeof set.load === 'number' && !isNaN(set.load)) {
            totalLoad += set.load * set.reps;
          }
        }
      });
    } else {
      // For regular sets
      const sets = Array.isArray(exercise.sets) ? exercise.sets.length : Number(exercise.sets) || 0;
      const reps = Number(exercise.reps) || 0;
      const load = typeof exercise.load === 'number' ? exercise.load : 0;

      console.log('Processing regular set:', { sets, reps, load });

      totalSets += sets;
      totalReps += sets * reps;

      // Only add to total load if the load is numeric
      if (typeof load === 'number' && !isNaN(load)) {
        totalLoad += sets * reps * load;
      }
    }

    console.log('Running totals:', { totalSets, totalReps, totalLoad });
  });

  const result = {
    totalSets: isNaN(totalSets) ? 0 : totalSets,
    totalReps: isNaN(totalReps) ? 0 : totalReps,
    totalLoad: isNaN(totalLoad) ? 0 : totalLoad
  };
  
  console.log('\nFinal volume calculation result:', result);
  return result;
};

export const calculateSessionExerciseVolume = (exercises: SessionExercise[]): VolumeMetrics => {
  console.log('Starting session volume calculation with exercises:', exercises);
  let totalReps = 0;
  let totalLoad = 0;

  exercises.forEach(exercise => {
    console.log('\nProcessing exercise:', {
      name: exercise.name,
      pairing: exercise.pairing,
      actualSets: exercise.actualSets
    });

    exercise.actualSets.forEach(set => {
      // Use actual values if available, otherwise planned values
      const reps = set.actualReps || set.plannedReps;
      const rawLoad = set.actualLoad || set.plannedLoad;
      const load = getNumericLoad(rawLoad);
      
      console.log('Processing set:', {
        setNumber: set.setNumber,
        plannedReps: set.plannedReps,
        actualReps: set.actualReps,
        usedReps: reps,
        plannedLoad: set.plannedLoad,
        actualLoad: set.actualLoad,
        rawLoad,
        processedLoad: load
      });
      
      totalReps += reps;
      totalLoad += load * reps;

      console.log('Running totals:', { totalReps, totalLoad });
    });
  });

  const result = {
    totalReps,
    totalLoad
  };
  
  console.log('\nFinal volume calculation result:', result);
  return result;
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
    if (exercise.isVariedSets && exercise.setDetails) {
      exercise.setDetails.forEach(set => {
        const setTempo = calculateTempoTotal(set.tempo);
        if (set.subSets && set.subSets.length > 0) {
          // For each sub-set, add its TUT and rest time
          set.subSets.forEach(subSet => {
            const setDuration = setTempo * subSet.reps;
            totalDuration += setDuration + (subSet.rest || 0);
          });
        } else {
          // Regular set within varied sets
          const setDuration = setTempo * set.reps;
          totalDuration += setDuration + (set.rest || 0);
        }
      });
    } else {
      // For regular sets
      const sets = Array.isArray(exercise.sets) ? exercise.sets.length : Number(exercise.sets) || 0;
      const reps = Number(exercise.reps) || 0;
      const rest = Number(exercise.rest) || 0;
      const tempo = calculateTempoTotal(exercise.tempo);
      
      // Calculate duration for each set: (tempo * reps) + rest
      const setDuration = (tempo * reps) + rest;
      totalDuration += sets * setDuration;
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