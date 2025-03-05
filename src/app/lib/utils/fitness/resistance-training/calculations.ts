import { 
  exercise,
  planned_exercise,
  varied_exercise,
  planned_exercise_set,
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
    if (exercise.is_varied_sets) {
      const varied_exercise_instance = exercise as varied_exercise;
      total_sets += varied_exercise_instance.set_details.length;
      varied_exercise_instance.set_details.forEach((set: planned_exercise_set) => {
        total_reps += set.planned_reps;
        const load = set.planned_load ? get_numeric_load(set.planned_load) : 0;
        if (set.load_unit && set.load_unit !== preferred_unit) {
          total_load += convert_weight(load * set.planned_reps, set.load_unit, preferred_unit);
        } else {
          total_load += load * set.planned_reps;
        }
      });
    } else {
      const planned_exercise_instance = exercise as planned_exercise;
      total_sets += planned_exercise_instance.sets;
      if (planned_exercise_instance.planned_sets) {
        planned_exercise_instance.planned_sets.forEach((set: planned_exercise_set) => {
          total_reps += set.planned_reps;
          const load = set.planned_load ? get_numeric_load(set.planned_load) : 0;
          if (set.load_unit && set.load_unit !== preferred_unit) {
            total_load += convert_weight(load * set.planned_reps, set.load_unit, preferred_unit);
          } else {
            total_load += load * set.planned_reps;
          }
        });
      }
    }
  });

  return { total_sets, total_reps, total_load };
};

export const calculate_session_duration = (exercises: exercise[]): number => {
  return exercises.reduce((total, exercise) => {
    if (exercise.is_varied_sets) {
      const varied_exercise_instance = exercise as varied_exercise;
      return total + varied_exercise_instance.set_details.reduce((set_total: number, set: planned_exercise_set) => {
        const rep_time = calculate_tempo_total(set.planned_tempo);
        return set_total + (set.planned_reps * rep_time) + (set.planned_rest ?? 0);
      }, 0);
    } else {
      const planned_exercise_instance = exercise as planned_exercise;
      if (planned_exercise_instance.planned_sets) {
        return total + planned_exercise_instance.planned_sets.reduce((set_total: number, set: planned_exercise_set) => {
          const rep_time = calculate_tempo_total(set.planned_tempo);
          return set_total + (set.planned_reps * rep_time) + (set.planned_rest ?? 0);
        }, 0);
      }
      return total;
    }
  }, 0);
};

export const calculate_set_tut = (reps: number, tempo: string = '2010'): number => {
  const tempo_total = calculate_tempo_total(tempo);
  return reps * tempo_total;
};

export const calculate_exercise_tut = (exercise: exercise): number => {
  if (exercise.is_varied_sets) {
    const varied_exercise_instance = exercise as varied_exercise;
    return varied_exercise_instance.set_details.reduce((total: number, set: planned_exercise_set) => {
      return total + calculate_set_tut(set.planned_reps, set.planned_tempo || '2010');
    }, 0);
  }
  
  const planned_exercise_instance = exercise as planned_exercise;
  if (planned_exercise_instance.planned_sets) {
    return planned_exercise_instance.planned_sets.reduce((total: number, set: planned_exercise_set) => {
      return total + calculate_set_tut(set.planned_reps, set.planned_tempo || '2010');
    }, 0);
  }
  
  return 0;
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