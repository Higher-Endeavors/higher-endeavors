import { PlannedExercise } from '../../resistance-training/types/resistance-training.types';

/**
 * Calculates Time Under Tension (TUT) based on reps and tempo
 * 
 * @param reps - Number of repetitions
 * @param tempo - 4-digit tempo string (eccentric-pause1-concentric-pause2)
 *                Example: "2010" = 2sec eccentric + 0sec pause + 1sec concentric + 0sec pause = 3sec per rep
 * @returns Total time under tension in seconds
 */
export function calculateTimeUnderTension(reps: number = 0, tempo: string = '2010'): number {
  if (reps <= 0) return 0;
  // Handle explosive tempo (X in any position means 0 seconds for that phase)
  const normalizedTempo = tempo.replace(/X/gi, '0');
  // Ensure tempo is exactly 4 digits, pad with zeros if needed
  const paddedTempo = normalizedTempo.padEnd(4, '0').substring(0, 4);
  // Parse each phase of the tempo
  const eccentric = parseInt(paddedTempo[0]) || 0;   // Lowering phase
  const pause1 = parseInt(paddedTempo[1]) || 0;      // Bottom pause
  const concentric = parseInt(paddedTempo[2]) || 0;  // Lifting phase  
  const pause2 = parseInt(paddedTempo[3]) || 0;      // Top pause
  // Calculate total time per rep
  const timePerRep = eccentric + pause1 + concentric + pause2;
  // Return total TUT
  return reps * timePerRep;
}

/**
 * Calculates the estimated total session duration based on planned exercises
 * For each set: setTime = TUT (for that set) + rest (for that set)
 * Total Duration = sum of all setTimes (including rest after last set)
 *
 * @param exercises - Array of planned exercises
 * @returns Total session duration in seconds
 */
export function calculateSessionDuration(exercises: PlannedExercise[]): number {
  if (!exercises || exercises.length === 0) return 0;

  let totalDuration = 0;

  exercises.forEach(exercise => {
    if (!exercise.detail || exercise.detail.length === 0) return;

    exercise.detail.forEach((set) => {
      // Add TUT for this set
      const tut = calculateTimeUnderTension(set.reps || 0, set.tempo || '2010');
      // Add rest for this set (always included, even for last set)
      const rest = set.restSec || 0;
      totalDuration += tut + rest;
    });
  });

  return totalDuration;
}

/**
 * Formats session duration for display
 * 
 * @param durationInSeconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatSessionDuration(durationInSeconds: number): string {
  if (durationInSeconds < 60) {
    return `${durationInSeconds}s`;
  }

  // Round up to the nearest minute
  const minutes = Math.ceil(durationInSeconds / 60);
  return `${minutes}m`;
}

/**
 * Calculates session total load
 * 
 * @param exercises - Array of planned exercises
 * @returns Total session load
 */
export function calculateSessionTotalLoad(exercises: PlannedExercise[]): number {
  if (!exercises || exercises.length === 0) return 0;
  let totalLoad = 0;
  exercises.forEach(exercise => {
    if (!exercise.detail || exercise.detail.length === 0) return;
    exercise.detail.forEach(set => {
      const reps = set.reps || 0;
      const load = Number(set.load) || 0;
      totalLoad += reps * load;
    });
  });
  return totalLoad;
}

/**
 * Calculates session statistics
 * 
 * @param exercises - Array of planned exercises
 * @returns Object containing various session statistics
 */
export function calculateSessionStats(exercises: PlannedExercise[]) {
  const totalDuration = calculateSessionDuration(exercises);
  const totalExercises = exercises.length;
  const totalSets = exercises.reduce((sum, ex) => sum + (ex.detail?.length || 0), 0);
  const totalReps = exercises.reduce((sum, ex) => 
    sum + (ex.detail?.reduce((setSum, set) => setSum + (set.reps || 0), 0) || 0), 0
  );
  const totalLoad = calculateSessionTotalLoad(exercises);

  return {
    estimatedDuration: formatSessionDuration(totalDuration),
    totalExercises,
    totalSets,
    totalReps,
    totalLoad,
    durationInSeconds: totalDuration
  };
} 