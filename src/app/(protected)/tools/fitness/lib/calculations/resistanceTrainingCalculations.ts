import { ProgramExercisesPlanned } from '(protected)/tools/fitness/resistance-training/types/resistance-training.zod';

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
 * For each set: setTime = TUT (for resistance) or duration (for CME) + rest (for that set)
 * Total Duration = sum of all setTimes (including rest after last set)
 *
 * @param exercises - Array of planned exercises
 * @returns Total session duration in seconds
 */
export function calculateSessionDuration(exercises: ProgramExercisesPlanned[]): number {
  if (!exercises || exercises.length === 0) return 0;

  let totalDuration = 0;

  exercises.forEach(exercise => {
    if (!exercise.plannedSets || exercise.plannedSets.length === 0) return;

    exercise.plannedSets.forEach((set) => {
      let setDuration = 0;
      
      // Check if this is a CME exercise (has duration field)
      if (set.duration !== undefined && set.duration !== null) {
        // CME exercise - use duration field
        const duration = set.duration || 0;
        const unit = set.durationUnit || 'minutes';
        
        if (unit === 'seconds') {
          setDuration = duration;
        } else {
          // Convert minutes to seconds
          setDuration = duration * 60;
        }
      } else {
        // Resistance exercise - use TUT
        setDuration = calculateTimeUnderTension(set.reps || 0, set.tempo || '2010');
      }
      
      // Add rest for this set (always included, even for last set)
      const rest = set.restSec || 0;
      totalDuration += setDuration + rest;
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
  return `${minutes} minutes`;
}

/**
 * Converts a load value between lbs and kg
 * @param value - the numeric value
 * @param fromUnit - 'lbs' or 'kg'
 * @param toUnit - 'lbs' or 'kg'
 * @returns converted value
 */
function convertLoad(value: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return value;
  if (fromUnit === 'kg' && toUnit === 'lbs') return value * 2.2;
  if (fromUnit === 'lbs' && toUnit === 'kg') return value / 2.2;
  return value;
}

/**
 * Calculates session total load in the preferred unit
 * @param exercises - Array of planned exercises
 * @param preferredUnit - 'lbs' or 'kg'
 * @returns Total session load in preferred unit
 */
export function calculateSessionTotalLoad(exercises: ProgramExercisesPlanned[], preferredUnit: string): number {
  if (!exercises || exercises.length === 0) return 0;
  let totalLoad = 0;
  exercises.forEach(exercise => {
    if (!exercise.plannedSets || exercise.plannedSets.length === 0) return;
    exercise.plannedSets.forEach(set => {
      const reps = set.reps || 0;
      const load = Number(set.load) || 0;
      // Only convert if load is a number and unit is present
      let setUnit = (set.loadUnit === 'kg' || set.loadUnit === 'lbs') ? set.loadUnit : 'lbs';
      totalLoad += convertLoad(reps * load, setUnit, preferredUnit);
    });
  });
  return Math.round(totalLoad * 100) / 100;
}

/**
 * Calculates session statistics (unit-aware)
 * @param exercises - Array of planned exercises
 * @param preferredUnit - 'lbs' or 'kg'
 * @returns Object containing various session statistics
 */
export function calculateSessionStats(exercises: ProgramExercisesPlanned[], preferredUnit: string) {
  const totalDuration = calculateSessionDuration(exercises);
  const totalExercises = exercises.length;
  const totalSets = exercises.reduce((sum, ex) => sum + (ex.plannedSets?.length || 0), 0);
  const totalReps = exercises.reduce((sum, ex) => 
    sum + (ex.plannedSets?.reduce((setSum, set) => setSum + (set.reps || 0), 0) || 0), 0
  );
  const totalLoad = calculateSessionTotalLoad(exercises, preferredUnit);

  return {
    estimatedDuration: formatSessionDuration(totalDuration),
    totalExercises,
    totalSets,
    totalReps,
    totalLoad,
    durationInSeconds: totalDuration
  };
} 

/**
 * Generates progressed exercises for each week based on progression rules and base week exercises.
 * Supports Linear and Undulating periodization.
 *
 * @param baseWeekExercises - Array of ProgramExercisesPlanned for week 1 (template)
 * @param programLength - Number of weeks in the program
 * @param progressionRules - Object containing periodization type and settings
 * @returns Mapping of week number to progressed ProgramExercisesPlanned[]
 */
export function generateProgressedWeeks(
  baseWeekExercises: ProgramExercisesPlanned[],
  programLength: number,
  progressionRules: {
    type: string;
    settings?: {
      volume_increment_percentage?: number;
      load_increment_percentage?: number;
      weekly_volume_percentages?: number[];
    };
  }
): { [weekNumber: number]: ProgramExercisesPlanned[] } {
  const {
    type: periodizationType,
    settings = {}
  } = progressionRules || {};
  const {
    volume_increment_percentage = 0,
    load_increment_percentage = 0,
    weekly_volume_percentages = []
  } = settings;

  // Helper to deep clone an object
  function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  // Helper to check if a value is numeric
  function isNumeric(val: unknown): boolean {
    if (val === undefined || val === null) {
      return false;
    }
    if (typeof val === 'number') {
      return !Number.isNaN(val);
    }
    if (typeof val === 'string' && val.trim() !== '') {
      return !Number.isNaN(Number(val));
    }
    return false;
  }

  function toNumeric(val: unknown): number | null {
    return isNumeric(val) ? Number(val) : null;
  }

  // Progress a single set (and its subSets if present)
  function progressSet(
    set: any,
    week: number,
    baseSets: any[]
  ): any {
    let newSet = { ...set };
    if (periodizationType === 'Linear') {
      // Progress load if numeric
      if (isNumeric(set.load)) {
        const baseLoad = Number(set.load);
        newSet.load = (Math.round(baseLoad * (1 + (load_increment_percentage * (week - 1) / 100)) * 100) / 100).toString();
      }
      // Volume progression: distribute total reps across sets
      const currentReps = toNumeric(set.reps);
      if (currentReps !== null && Array.isArray(baseSets) && baseSets.length > 0) {
        const numericBaseSets = baseSets.map(baseSet => toNumeric(baseSet.reps) ?? 0);
        const numSets = numericBaseSets.length;
        if (numSets > 0) {
          const baseTotalReps = numericBaseSets.reduce((sum, reps) => sum + reps, 0);
          const progressedTotalReps = Math.round(baseTotalReps * Math.pow(1 + volume_increment_percentage / 100, week - 1));
          const baseRepsPerSet = Math.floor(progressedTotalReps / numSets);
          const remainder = progressedTotalReps % numSets;
          const setIdx = baseSets.findIndex(s => s === set);
          if (setIdx >= 0) {
            newSet.reps = baseRepsPerSet + (setIdx < remainder ? 1 : 0);
          }
        }
      }
    } else if (periodizationType === 'Undulating') {
      // Progress reps only, based on weekly percentage
      const weekPct = weekly_volume_percentages[week - 1] ?? 100;
      const volumePct = weekPct / 100;
      const currentReps = toNumeric(set.reps);
      if (currentReps !== null) {
        newSet.reps = Math.max(1, Math.round(currentReps * volumePct));
      }
    }
    // Progress subSets recursively
    if (set.subSets && Array.isArray(set.subSets)) {
      newSet.subSets = set.subSets.map((sub: any) => progressSet(sub, week, set.subSets));
    }
    return newSet;
  }

  const result: { [weekNumber: number]: ProgramExercisesPlanned[] } = {};
  for (let week = 1; week <= programLength; week++) {
    result[week] = deepClone(baseWeekExercises).map(ex => {
      const baseSets = ex.plannedSets || [];
      const progressedSets = baseSets.map(set => progressSet(set, week, baseSets));
      return {
        ...ex,
        plannedSets: progressedSets
      };
    });
  }
  return result;
} 