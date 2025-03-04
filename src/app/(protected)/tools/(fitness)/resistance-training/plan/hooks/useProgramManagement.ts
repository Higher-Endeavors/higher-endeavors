import { useState } from 'react';
import {
  Program,
  Exercise,
  PhaseFocus,
  PeriodizationType,
  ProgressionFrequency,
  createVariedExercise,
  createPlannedExercise,
  BaseExercise,
  PlannedExercise,
  VariedExercise,
  ExerciseSource,
  ProgramListItem,
  ProgressionRules,
  LoadUnit
} from '@/app/lib/types/pillars/fitness';

interface UseProgramManagementProps {
  setProgram: (program: Program) => void;
  setWeekExercises: (exercises: { [key: number]: Exercise[] }) => void;
  currentUserId: number;
  onError?: (error: string) => void;
}

export function useProgramManagement({ 
  setProgram, 
  setWeekExercises, 
  currentUserId,
  onError 
}: UseProgramManagementProps) {
  
  const fetchProgramDetails = async (programId: number): Promise<Program> => {
    const response = await fetch(`/api/resistance-training/program/${programId}`);
    if (!response.ok) throw new Error('Failed to fetch program details');
    return response.json();
  };
  
  const handleProgramSelect = async (programListItem: ProgramListItem) => {
    const fullProgram = await fetchProgramDetails(programListItem.id);
  
    setProgram({
      id: fullProgram.id,
      user_id: fullProgram.user_id,
      program_name: fullProgram.program_name,
      phase_focus: fullProgram.phase_focus,
      periodization_type: fullProgram.periodization_type,
      progression_rules: {
        type: fullProgram.progression_rules?.type || PeriodizationType.None,
        settings: {
          volume_increment_percentage: fullProgram.progression_rules?.settings?.volume_increment_percentage ?? 0,
          load_increment_percentage: fullProgram.progression_rules?.settings?.load_increment_percentage ?? 0,
          program_length: fullProgram.progression_rules?.settings?.program_length ?? 4,
          weekly_volume_percentages: fullProgram.progression_rules?.settings?.weekly_volume_percentages ?? [100, 100, 100, 100]
        }
      },
      created_at: new Date(fullProgram.created_at),
      updated_at: new Date(fullProgram.updated_at),
      notes: fullProgram.notes || ''
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
          weekNumber: number;
          notes?: string;
          days: Array<{
            dayNumber: number;
            dayName?: string;
            notes?: string;
            exercises: Array<{
              id?: string;
              name?: string;
              customName?: string;
              source: 'library' | 'user';
              libraryId?: string;
              userExerciseId?: string;
              pairing: string;
              notes?: string;
              orderIndex: number;
              isVariedSets: boolean;
              isAdvancedSets: boolean;
              sets: Array<{
                setNumber: number;
                reps: number;
                load: number;
                loadUnit: string;
                tempo: string;
                rest: number;
                notes?: string;
              }>;
            }>;
          }>;
        }>;
      };
      
      if (!data.weeks || !Array.isArray(data.weeks)) {
        throw new Error('Invalid program data: missing weeks array');
      }
      
      const newWeekExercises: { [key: number]: Exercise[] } = {};
      
      data.weeks.forEach((week) => {  // Remove `: APIWeek`
        if (!week.days || !Array.isArray(week.days)) {
          console.warn(`Week ${week.weekNumber} has no days array`);
          return;
        }
      
        const weekExercises: Exercise[] = [];
        week.days.forEach((day) => {  // Remove `: APIDay`
          if (!day.exercises || !Array.isArray(day.exercises)) {
            console.warn(`Day ${day.dayNumber} in week ${week.weekNumber} has no exercises array`);
            return;
          }
      
          day.exercises.forEach((exercise) => {
            const baseExercise: Omit<PlannedExercise, 'isVariedSets' | 'isAdvancedSets'> = {
                id: exercise.id ? parseInt(exercise.id) : Date.now(),
                exerciseId: exercise.libraryId ? parseInt(exercise.libraryId) : 0, // Required by BaseExercise
                name: exercise.name || exercise.customName || 'Unknown Exercise',
                source: exercise.source === 'library' ? 'exercise_library' : 'user_exercises',
                pairing: exercise.pairing || 'A1',
                sets: exercise.sets.length,
                notes: exercise.notes || ''
              };

            const hasVariedSets = exercise.sets.length > 1 && exercise.sets.some((set, idx, arr) => {
              if (idx === 0) return false;
              const prevSet = arr[idx - 1];
              return set.reps !== prevSet.reps || set.load !== prevSet.load || set.tempo !== prevSet.tempo;
            });

            const exerciseData = hasVariedSets
              ? createVariedExercise(baseExercise, exercise.sets.map(set => ({
                  setNumber: set.setNumber,
                  plannedReps: set.reps,
                  plannedLoad: set.load,
                  loadUnit: set.loadUnit as LoadUnit,
                  plannedTempo: set.tempo,
                  plannedRest: set.rest,
                  notes: set.notes || ''
                })))
              : createPlannedExercise(baseExercise);

            weekExercises.push(exerciseData);
          });
        });

        if (weekExercises.length > 0) {
          newWeekExercises[week.weekNumber] = weekExercises;
        }
      });

      setWeekExercises(newWeekExercises);
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

  const handleProgramUpdate = (program: Program) => {
    if (!program.user_id) return;

    setProgram({
      id: program.id,
      user_id: program.user_id,
      program_name: program.program_name,
      phase_focus: program.phase_focus,
      periodization_type: program.periodization_type,
      progression_rules: {
        type: program.progression_rules?.type || PeriodizationType.None,
        settings: {
          volume_increment_percentage: program.progression_rules?.settings?.volume_increment_percentage ?? 0,
          load_increment_percentage: program.progression_rules?.settings?.load_increment_percentage ?? 0,
          program_length: program.progression_rules?.settings?.program_length ?? 4,
          weekly_volume_percentages: program.progression_rules?.settings?.weekly_volume_percentages ?? [100, 100, 100, 100]
        }
      },
      created_at: typeof program.created_at === 'string' 
        ? new Date(program.created_at) 
        : program.created_at,
      updated_at: typeof program.updated_at === 'string' 
        ? new Date(program.updated_at) 
        : program.updated_at,
      notes: program.notes || ''
    });
  };

  return {
    handleProgramSelect,
    loadProgramExercises,
    handleProgramDelete,
    handleProgramUpdate
  };
}