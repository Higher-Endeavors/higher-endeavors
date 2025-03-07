import { 
  exercise,
  exercise_set,
  load_unit 
} from '@/app/lib/types/pillars/fitness';
import { calculate_tempo_total, get_numeric_load, convert_weight } from '../unit-conversions';

export interface volume_metrics {
  total_sets: number;
  total_reps: number;
  total_load: number;
}

export const calculate_session_volume = (
  exercises: exercise[],
  preferred_unit: load_unit = 'lbs'
): volume_metrics => {
  let total_sets = 0;
  let total_reps = 0;
  let total_load = 0;

  exercises.forEach(exercise => {
    total_sets += exercise.sets;

    exercise.planned_sets.forEach((set: exercise_set) => {
      // Handle sub-sets if they exist
      if (set.sub_sets && set.sub_sets.length > 0) {
        set.sub_sets.forEach(sub_set => {
          total_reps += sub_set.planned_reps;
          const load = sub_set.planned_load ? get_numeric_load(sub_set.planned_load) : 0;
          if (sub_set.load_unit && sub_set.load_unit !== preferred_unit) {
            total_load += convert_weight(load * sub_set.planned_reps, sub_set.load_unit, preferred_unit);
          } else {
            total_load += load * sub_set.planned_reps;
          }
        });
      } else {
        // Handle regular sets
        total_reps += set.planned_reps;
        const load = set.planned_load ? get_numeric_load(set.planned_load) : 0;
        if (set.load_unit && set.load_unit !== preferred_unit) {
          total_load += convert_weight(load * set.planned_reps, set.load_unit, preferred_unit);
        } else {
          total_load += load * set.planned_reps;
        }
      }
    });
  });

  return { total_sets, total_reps, total_load };
};

export const calculate_session_duration = (exercises: exercise[]): number => {
  return exercises.reduce((total, exercise) => {
    return total + exercise.planned_sets.reduce((set_total: number, set: exercise_set) => {
      if (set.sub_sets && set.sub_sets.length > 0) {
        // Calculate duration for each sub-set
        return set_total + set.sub_sets.reduce((sub_total, sub_set) => {
          const rep_time = calculate_tempo_total(sub_set.planned_tempo);
          return sub_total + (sub_set.planned_reps * rep_time) + (sub_set.planned_rest ?? 0);
        }, 0);
      } else {
        // Calculate duration for regular set
        const rep_time = calculate_tempo_total(set.planned_tempo);
        return set_total + (set.planned_reps * rep_time) + (set.planned_rest ?? 0);
      }
    }, 0);
  }, 0);
};

export const calculate_set_tut = (reps: number, tempo: string = '2010'): number => {
  const tempo_total = calculate_tempo_total(tempo);
  return reps * tempo_total;
};

export const calculate_exercise_tut = (exercise: exercise): number => {
  return exercise.planned_sets.reduce((total: number, set: exercise_set) => {
    if (set.sub_sets && set.sub_sets.length > 0) {
      // Calculate TUT for each sub-set
      return total + set.sub_sets.reduce((sub_total, sub_set) => {
        return sub_total + calculate_set_tut(sub_set.planned_reps, sub_set.planned_tempo || '2010');
      }, 0);
    } else {
      // Calculate TUT for regular set
      return total + calculate_set_tut(set.planned_reps, set.planned_tempo || '2010');
    }
  }, 0);
};

export const calculate_linear_progression = (
  base_value: number,
  week_number: number,
  increment_percentage: number
): number => {
  const multiplier = 1 + ((week_number - 1) * (increment_percentage / 100));
  return Math.round(base_value * multiplier * 100) / 100;
};

// Alias export for backward compatibility
export const calculateSessionExerciseVolume = calculate_session_volume; 

export const format_load = (
  load: string | number | undefined, 
  load_unit?: load_unit
): string => {
  if (load === undefined || load === '') {
    return '';
  }

  const numeric_load = typeof load === 'string' ? parseFloat(load) : load;
  
  if (typeof numeric_load === 'number' && !isNaN(numeric_load)) {
    const unit = load_unit || 'lbs';
    return `${numeric_load}${unit}`;
  }

  return String(load);
};