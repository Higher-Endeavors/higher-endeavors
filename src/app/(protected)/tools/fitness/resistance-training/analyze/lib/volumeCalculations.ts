import type { ProgramExercisesPlanned } from '(protected)/tools/fitness/resistance-training/types/resistance-training.zod';
import type { 
  VolumeDataPoint, 
  ExerciseVolumeData, 
  ProgramVolumeAnalysis,
  VolumeProgression 
} from '../types/analysis.zod';

/**
 * Calculates volume for a single exercise set
 * Volume = reps × load (in preferred unit)
 */
function calculateSetVolume(set: any, preferredUnit: string = 'lbs'): number {
  const reps = set.reps || 0;
  const load = Number(set.load) || 0;
  
  if (reps === 0 || load === 0) return 0;
  
  // Convert load to preferred unit if needed
  const setUnit = (set.loadUnit === 'kg' || set.loadUnit === 'lbs') ? set.loadUnit : 'lbs';
  let convertedLoad = load;
  
  if (setUnit !== preferredUnit) {
    if (setUnit === 'kg' && preferredUnit === 'lbs') {
      convertedLoad = load * 2.20462;
    } else if (setUnit === 'lbs' && preferredUnit === 'kg') {
      convertedLoad = load / 2.20462;
    }
  }
  
  return reps * convertedLoad;
}

/**
 * Calculates total volume for an exercise across all sets
 */
function calculateExerciseVolume(exercise: ProgramExercisesPlanned, preferredUnit: string = 'lbs'): { planned: number; actual: number | null } {
  let plannedVolume = 0;
  let actualVolume = 0;
  let hasActualData = false;

  // Calculate planned volume
  if (exercise.plannedSets && Array.isArray(exercise.plannedSets)) {
    exercise.plannedSets.forEach(set => {
      plannedVolume += calculateSetVolume(set, preferredUnit);
    });
  }

  // Calculate actual volume
  if (exercise.actualSets && Array.isArray(exercise.actualSets)) {
    exercise.actualSets.forEach(set => {
      const volume = calculateSetVolume(set, preferredUnit);
      actualVolume += volume;
      if (volume > 0) hasActualData = true;
    });
  }

  return {
    planned: plannedVolume,
    actual: hasActualData ? actualVolume : null
  };
}

/**
 * Calculates volume data for a single exercise across all weeks
 */
export function calculateExerciseVolumeData(
  exercise: ProgramExercisesPlanned & { exerciseName?: string },
  weeklyExercises: (ProgramExercisesPlanned & { exerciseName?: string })[][],
  preferredUnit: string = 'lbs'
): ExerciseVolumeData {
  const exerciseName = exercise.exerciseName || 
    (exercise.exerciseLibraryId 
      ? `Exercise ${exercise.exerciseLibraryId}` 
      : `User Exercise ${exercise.userExerciseLibraryId}`);
  
  const weeklyData: VolumeDataPoint[] = [];
  let totalPlannedVolume = 0;
  let totalActualVolume = 0;
  let weeksWithActualData = 0;

  // Calculate volume for each week
  weeklyExercises.forEach((weekExercises, weekIndex) => {
    const weekNumber = weekIndex + 1;
    
    // Find this exercise in the current week
    const weekExercise = weekExercises.find(ex => 
      ex.exerciseLibraryId === exercise.exerciseLibraryId && 
      ex.userExerciseLibraryId === exercise.userExerciseLibraryId
    );

    if (weekExercise) {
      const { planned, actual } = calculateExerciseVolume(weekExercise, preferredUnit);
      
      const volumeDifference = actual !== null ? actual - planned : null;
      const volumePercentage = actual !== null ? (actual / planned) * 100 : null;
      
      weeklyData.push({
        week: weekNumber,
        plannedVolume: planned,
        actualVolume: actual,
        volumeDifference,
        volumePercentage
      });

      totalPlannedVolume += planned;
      if (actual !== null) {
        totalActualVolume += actual;
        weeksWithActualData++;
      }
    } else {
      // Exercise not present in this week
      weeklyData.push({
        week: weekNumber,
        plannedVolume: 0,
        actualVolume: null,
        volumeDifference: null,
        volumePercentage: null
      });
    }
  });

  const averageVolumePercentage = weeksWithActualData > 0 
    ? totalActualVolume / totalPlannedVolume * 100 
    : null;

  return {
    exerciseName,
    exerciseId: exercise.exerciseLibraryId || exercise.userExerciseLibraryId || 0,
    weeklyData,
    totalPlannedVolume,
    totalActualVolume: weeksWithActualData > 0 ? totalActualVolume : null,
    averageVolumePercentage
  };
}

/**
 * Calculates overall program volume analysis
 */
export function calculateProgramVolumeAnalysis(
  program: any,
  weeklyExercises: (ProgramExercisesPlanned & { exerciseName?: string })[][],
  preferredUnit: string = 'lbs'
): ProgramVolumeAnalysis {
  // Get all unique exercises across all weeks
  const allExercises = new Map<string, ProgramExercisesPlanned & { exerciseName?: string }>();
  
  weeklyExercises.forEach(weekExercises => {
    weekExercises.forEach(exercise => {
      const key = `${exercise.exerciseLibraryId || 0}-${exercise.userExerciseLibraryId || 0}`;
      if (!allExercises.has(key)) {
        allExercises.set(key, exercise);
      }
    });
  });

  // Calculate volume data for each exercise
  const exerciseData: ExerciseVolumeData[] = Array.from(allExercises.values()).map(exercise => 
    calculateExerciseVolumeData(exercise, weeklyExercises, preferredUnit)
  );

  // Calculate overall volume data
  const overallVolumeData: VolumeDataPoint[] = [];
  let totalPlannedVolume = 0;
  let totalActualVolume = 0;
  let weeksWithActualData = 0;

  weeklyExercises.forEach((weekExercises, weekIndex) => {
    const weekNumber = weekIndex + 1;
    let weekPlannedVolume = 0;
    let weekActualVolume = 0;
    let weekHasActualData = false;

    weekExercises.forEach(exercise => {
      const { planned, actual } = calculateExerciseVolume(exercise, preferredUnit);
      weekPlannedVolume += planned;
      if (actual !== null) {
        weekActualVolume += actual;
        weekHasActualData = true;
      }
    });

    const volumeDifference = weekHasActualData ? weekActualVolume - weekPlannedVolume : null;
    const volumePercentage = weekHasActualData ? (weekActualVolume / weekPlannedVolume) * 100 : null;

    overallVolumeData.push({
      week: weekNumber,
      plannedVolume: weekPlannedVolume,
      actualVolume: weekHasActualData ? weekActualVolume : null,
      volumeDifference,
      volumePercentage
    });

    totalPlannedVolume += weekPlannedVolume;
    if (weekHasActualData) {
      totalActualVolume += weekActualVolume;
      weeksWithActualData++;
    }
  });

  const averageVolumePercentage = weeksWithActualData > 0 
    ? totalActualVolume / totalPlannedVolume * 100 
    : null;

  return {
    programId: program.resistanceProgramId,
    programName: program.programName,
    totalWeeks: weeklyExercises.length,
    exerciseData,
    overallVolumeData,
    totalPlannedVolume,
    totalActualVolume: weeksWithActualData > 0 ? totalActualVolume : null,
    averageVolumePercentage
  };
}

/**
 * Calculates volume progression metrics
 */
export function calculateVolumeProgression(volumeData: VolumeDataPoint[]): VolumeProgression {
  const plannedVolumes = volumeData.map(d => d.plannedVolume).filter(v => v > 0);
  
  if (plannedVolumes.length < 2) {
    return {
      isProgressive: false,
      progressionType: 'none',
      averageWeeklyIncrease: 0,
      consistency: 0
    };
  }

  // Calculate weekly increases
  const increases: number[] = [];
  for (let i = 1; i < plannedVolumes.length; i++) {
    const increase = ((plannedVolumes[i] - plannedVolumes[i-1]) / plannedVolumes[i-1]) * 100;
    increases.push(increase);
  }

  const averageWeeklyIncrease = increases.reduce((sum, inc) => sum + inc, 0) / increases.length;
  
  // Determine progression type
  const isLinear = increases.every(inc => inc > 0);
  const isUndulating = increases.some(inc => inc < 0) && increases.some(inc => inc > 0);
  
  let progressionType: 'linear' | 'undulating' | 'mixed' | 'none' = 'none';
  if (isLinear) progressionType = 'linear';
  else if (isUndulating) progressionType = 'undulating';
  else if (increases.some(inc => Math.abs(inc) > 1)) progressionType = 'mixed';

  // Calculate consistency (lower standard deviation = higher consistency)
  const mean = averageWeeklyIncrease;
  const variance = increases.reduce((sum, inc) => sum + Math.pow(inc - mean, 2), 0) / increases.length;
  const standardDeviation = Math.sqrt(variance);
  const consistency = Math.max(0, 100 - (standardDeviation * 10)); // Scale to 0-100

  return {
    isProgressive: averageWeeklyIncrease > 0,
    progressionType,
    averageWeeklyIncrease,
    consistency
  };
}
