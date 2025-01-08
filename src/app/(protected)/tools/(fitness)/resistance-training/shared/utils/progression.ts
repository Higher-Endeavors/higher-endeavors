interface Exercise {
  sets: number;
  reps: number;
  load: number;
}

interface LinearProgressionRules {
  volumeIncrementPercentage: number;
  loadIncrementPercentage: number;
}

interface UndulatingProgressionRules {
  weeklyVolumePercentages: number[]; // e.g., [100, 50, 75, 25]
}

interface CustomProgressionRules {
  rules: Array<{
    variable: 'sets' | 'reps' | 'load';
    changeType: 'increment' | 'decrement' | 'percentage';
    value: number;
    condition?: {
      type: 'completion' | 'rpe' | 'rir';
      threshold: number;
    };
  }>;
}

export function applyLinearProgression(
  exercise: Exercise,
  rules: LinearProgressionRules
): Exercise {
  const volumeMultiplier = 1 + (rules.volumeIncrementPercentage / 100);
  const loadMultiplier = 1 + (rules.loadIncrementPercentage / 100);

  // First try to increase reps while keeping sets constant
  let newReps = Math.round(exercise.reps * volumeMultiplier);
  
  // If new reps would be too high (> 15), increase sets instead
  if (newReps > 15) {
    newReps = exercise.reps;
    const newSets = Math.round(exercise.sets * volumeMultiplier);
    return {
      ...exercise,
      sets: newSets,
      load: Math.round(exercise.load * loadMultiplier * 2) / 2 // Round to nearest 0.5
    };
  }

  return {
    ...exercise,
    reps: newReps,
    load: Math.round(exercise.load * loadMultiplier * 2) / 2 // Round to nearest 0.5
  };
}

export function applyUndulatingProgression(
  exercise: Exercise,
  rules: UndulatingProgressionRules,
  weekIndex: number
): Exercise {
  const weeklyPercentage = rules.weeklyVolumePercentages[weekIndex % rules.weeklyVolumePercentages.length];
  const volumeMultiplier = weeklyPercentage / 100;

  // In undulating periodization, we typically adjust volume while maintaining intensity
  const totalReps = exercise.sets * exercise.reps;
  const newTotalReps = Math.round(totalReps * volumeMultiplier);

  // Try to maintain the same sets if possible
  let newReps = Math.round(newTotalReps / exercise.sets);
  let newSets = exercise.sets;

  // If reps would be too low or too high, adjust sets instead
  if (newReps < 3 || newReps > 15) {
    newReps = exercise.reps;
    newSets = Math.round(newTotalReps / newReps);
  }

  return {
    ...exercise,
    sets: newSets,
    reps: newReps,
    load: exercise.load // Maintain load in undulating progression
  };
}

export function applyCustomProgression(
  exercise: Exercise,
  rules: CustomProgressionRules,
  performanceMetrics?: {
    completedReps: number;
    rpe?: number;
    rir?: number;
  }
): Exercise {
  let updatedExercise = { ...exercise };

  for (const rule of rules.rules) {
    // Check if the rule condition is met
    if (rule.condition) {
      if (!performanceMetrics) continue;

      switch (rule.condition.type) {
        case 'completion':
          if (performanceMetrics.completedReps < rule.condition.threshold) continue;
          break;
        case 'rpe':
          if (!performanceMetrics.rpe || performanceMetrics.rpe > rule.condition.threshold) continue;
          break;
        case 'rir':
          if (!performanceMetrics.rir || performanceMetrics.rir < rule.condition.threshold) continue;
          break;
      }
    }

    // Apply the rule
    switch (rule.changeType) {
      case 'increment':
        updatedExercise[rule.variable] += rule.value;
        break;
      case 'decrement':
        updatedExercise[rule.variable] -= rule.value;
        break;
      case 'percentage':
        updatedExercise[rule.variable] = Math.round(
          updatedExercise[rule.variable] * (1 + rule.value / 100) * 2
        ) / 2;
        break;
    }
  }

  return updatedExercise;
}

export function validateProgression(
  exercise: Exercise,
  previousExercise: Exercise
): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check for excessive volume increases
  const previousVolume = previousExercise.sets * previousExercise.reps;
  const newVolume = exercise.sets * exercise.reps;
  const volumeIncrease = ((newVolume - previousVolume) / previousVolume) * 100;

  if (volumeIncrease > 20) {
    warnings.push(`Volume increase of ${Math.round(volumeIncrease)}% may be too aggressive`);
  }

  // Check for excessive load increases
  const loadIncrease = ((exercise.load - previousExercise.load) / previousExercise.load) * 100;
  if (loadIncrease > 10) {
    warnings.push(`Load increase of ${Math.round(loadIncrease)}% may be too aggressive`);
  }

  // Check for reasonable rep ranges
  if (exercise.reps < 3) {
    warnings.push('Rep range is very low, consider increasing');
  }
  if (exercise.reps > 15) {
    warnings.push('Rep range is very high, consider increasing load instead');
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
} 