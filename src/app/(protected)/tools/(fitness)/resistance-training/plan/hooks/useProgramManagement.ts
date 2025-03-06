import { useState } from 'react';
import {
  program,
  exercise,
  PhaseFocus,
  PeriodizationType,
  ProgressionFrequency,
  create_varied_exercise,
  create_planned_exercise,
  base_exercise,
  planned_exercise,
  varied_exercise,
  exercise_source,
  program_list_item,
  load_unit
} from '@/app/lib/types/pillars/fitness';

interface UseProgramManagementProps {
  setProgram: (program: program) => void;
  setWeekExercises: (exercises: { [key: number]: exercise[] }) => void;
  currentUserId: number;
  onError?: (error: string) => void;
}

export function useProgramManagement({ 
  setProgram, 
  setWeekExercises, 
  currentUserId,
  onError 
}: UseProgramManagementProps) {
  
  const fetchProgramDetails = async (programId: number): Promise<program> => {
    const response = await fetch(`/api/resistance-training/program/${programId}`);
    if (!response.ok) throw new Error('Failed to fetch program details');
    return response.json();
  };
  
  const handleProgramSelect = async (program_list_item: program_list_item) => {
    const full_program = await fetchProgramDetails(program_list_item.id);
  
    setProgram({
      id: full_program.id,
      user_id: full_program.user_id,
      program_name: full_program.program_name,
      phase_focus: full_program.phase_focus,
      periodization_type: full_program.periodization_type,
      progression_rules: {
        type: full_program.progression_rules?.type || PeriodizationType.None,
        settings: {
          volume_increment_percentage: full_program.progression_rules?.settings?.volume_increment_percentage ?? 0,
          load_increment_percentage: full_program.progression_rules?.settings?.load_increment_percentage ?? 0,
          program_length: full_program.progression_rules?.settings?.program_length ?? 4,
          weekly_volume_percentages: full_program.progression_rules?.settings?.weekly_volume_percentages ?? [100, 100, 100, 100]
        }
      },
      created_at: new Date(full_program.created_at),
      updated_at: new Date(full_program.updated_at),
      notes: full_program.notes || ''
    });
  };
  // volumeTargets: selectedProgram.volumeTargets || [],
      /* createdAt: typeof selectedProgram.created_at === 'string' 
        ? new Date(selectedProgram.created_at) 
        : selectedProgram.created_at,
      updatedAt: typeof selectedProgram.updated_at === 'string' 
        ? new Date(selectedProgram.updated_at) 
        : selectedProgram.updated_at
    });
  }; */
  const loadProgramExercises = async (programId: string) => {
    try {
      const response = await fetch(`/api/resistance-training/program/${programId}`);
      if (!response.ok) throw new Error('Failed to load program exercises');
      
      const data = await response.json() as {
        weeks: Array<{
          week_number: number;
          notes?: string;
          days: Array<{
            day_number: number;
            day_name?: string;
            notes?: string;
            exercises: Array<{
              id?: string;
              name?: string;
              custom_name?: string;
              source: 'library' | 'user';
              exercise_library_id?: string;
              user_exercise_id?: string;
              pairing: string;
              notes?: string;
              order_index: number;
              is_varied_sets: boolean;
              is_advanced_sets: boolean;
              sets: Array<{
                set_number: number;
                planned_reps: number;
                planned_load: number;
                load_unit: string;
                planned_tempo: string;
                planned_rest: number;
                notes?: string;
              }>;
            }>;
          }>;
        }>;
      };
      
      if (!data.weeks || !Array.isArray(data.weeks)) {
        throw new Error('Invalid program data: missing weeks array');
      }
      
      const new_week_exercises: { [key: number]: exercise[] } = {};
      
      data.weeks.forEach((week) => {
        if (!week.days || !Array.isArray(week.days)) {
          console.warn(`Week ${week.week_number} has no days array`);
          return;
        }
      
        const week_exercises: exercise[] = [];
        week.days.forEach((day) => {
          if (!day.exercises || !Array.isArray(day.exercises)) {
            console.warn(`Day ${day.day_number} in week ${week.week_number} has no exercises array`);
            return;
          }
      
          day.exercises.forEach((exercise) => {
            const base_exercise: Omit<planned_exercise, 'is_varied_sets' | 'is_advanced_sets'> = {
                id: exercise.id ? parseInt(exercise.id) : Date.now(),
                exercise_id: exercise.exercise_library_id ? parseInt(exercise.exercise_library_id) : 0,
                name: exercise.name || exercise.custom_name || 'Unknown Exercise',
                source: exercise.source === 'library' ? 'exercise_library' : 'user_exercises',
                pairing: exercise.pairing || 'A1',
                sets: exercise.sets.length,
                notes: exercise.notes || ''
              };

            const has_varied_sets = exercise.sets.length > 1 && exercise.sets.some((set, idx, arr) => {
              if (idx === 0) return false;
              const prev_set = arr[idx - 1];
              return set.planned_reps !== prev_set.planned_reps || 
                     set.planned_load !== prev_set.planned_load || 
                     set.planned_tempo !== prev_set.planned_tempo;
            });

            const exercise_data = has_varied_sets
              ? create_varied_exercise(base_exercise, exercise.sets.map(set => ({
                  set_number: set.set_number,
                  planned_reps: set.planned_reps,
                  planned_load: set.planned_load,
                  load_unit: set.load_unit as load_unit,
                  planned_tempo: set.planned_tempo,
                  planned_rest: set.planned_rest,
                  notes: set.notes || ''
                })))
              : create_planned_exercise(base_exercise);

            week_exercises.push(exercise_data);
          });
        });

        if (week_exercises.length > 0) {
          new_week_exercises[week.week_number] = week_exercises;
        }
      });

      setWeekExercises(new_week_exercises);
    } catch (error) {
      console.error('Error loading program exercises:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Failed to load program exercises');
      }
    }
  };

  const handleProgramDelete = (programId: number) => {
    setProgram({
      id: programId,
      user_id: currentUserId,
      program_name: '',
      phase_focus: PhaseFocus.GPP,
      periodization_type: PeriodizationType.Linear,
      notes: '',
      progression_rules: {
        type: PeriodizationType.None,
        settings: {
          volume_increment_percentage: 0,
          load_increment_percentage: 0,
          program_length: 4,
          weekly_volume_percentages: [100, 100, 100, 100]
        }
      },
      created_at: new Date(),
      updated_at: new Date()
    });
    setWeekExercises({});
  };

  const handleProgramUpdate = (program_data: program) => {
    if (!program_data.user_id) return;

    setProgram({
      id: program_data.id,
      user_id: program_data.user_id,
      program_name: program_data.program_name,
      phase_focus: program_data.phase_focus,
      periodization_type: program_data.periodization_type,
      progression_rules: {
        type: program_data.progression_rules?.type || PeriodizationType.None,
        settings: {
          volume_increment_percentage: program_data.progression_rules?.settings?.volume_increment_percentage ?? 0,
          load_increment_percentage: program_data.progression_rules?.settings?.load_increment_percentage ?? 0,
          program_length: program_data.progression_rules?.settings?.program_length ?? 4,
          weekly_volume_percentages: program_data.progression_rules?.settings?.weekly_volume_percentages ?? [100, 100, 100, 100]
        }
      },
      created_at: typeof program_data.created_at === 'string' 
        ? new Date(program_data.created_at) 
        : program_data.created_at,
      updated_at: typeof program_data.updated_at === 'string' 
        ? new Date(program_data.updated_at) 
        : program_data.updated_at,
      notes: program_data.notes || ''
    });
  };

  return {
    handleProgramSelect,
    loadProgramExercises,
    handleProgramDelete,
    handleProgramUpdate
  };
}