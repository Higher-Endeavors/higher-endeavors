import { useState } from 'react';
import { 
  SavedProgram, 
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
  ProgressionRules
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
  
  const fetchProgramDetails = async (programId: number): Promise<SavedProgram> => {
    const response = await fetch(`/api/resistance-training/program/${programId}`);
    if (!response.ok) throw new Error('Failed to fetch program details');
    return response.json();
  };
  
  const handleProgramSelect = async (programListItem: ProgramListItem) => {
    const fullProgram = await fetchProgramDetails(programListItem.id);
  
    setProgram({
      id: parseInt(fullProgram.id),
      userId: parseInt(fullProgram.userId),
      programName: fullProgram.program_name,
      phaseFocus: fullProgram.phase_focus,
      periodizationType: fullProgram.periodization_type,
      progressionRules: {
        type: fullProgram.progression_rules?.type || PeriodizationType.None,
        settings: {
          volumeIncrementPercentage: fullProgram.progression_rules?.settings?.volumeIncrementPercentage ?? 0,
          loadIncrementPercentage: fullProgram.progression_rules?.settings?.loadIncrementPercentage ?? 0,
          programLength: fullProgram.progression_rules?.settings?.programLength ?? 4,
          weeklyVolumePercentages: fullProgram.progression_rules?.settings?.weeklyVolumePercentages ?? [100, 100, 100, 100]
        }
      },
      createdAt: new Date(fullProgram.created_at),
      updatedAt: new Date(fullProgram.updated_at)
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
                  loadUnit: set.loadUnit,
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
      userId: currentUserId,
      programName: '',
      phaseFocus: PhaseFocus.GPP,
      periodizationType: PeriodizationType.Linear,
      notes: '',
      progressionRules: {
        type: PeriodizationType.None,
        settings: {
          volumeIncrementPercentage: 0,
          loadIncrementPercentage: 0,
          programLength: 4,
          weeklyVolumePercentages: [100, 100, 100, 100]
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setWeekExercises({});
  };

  const handleProgramUpdate = (program: SavedProgram) => {
    if (!program.userId) return;

    setProgram({
      id: parseInt(program.id),
      userId: parseInt(program.userId),
      programName: program.program_name,
      phaseFocus: program.phase_focus,
      periodizationType: program.periodization_type,
      progressionRules: {
        type: program.progression_rules?.type || PeriodizationType.None,
        settings: {
          volumeIncrementPercentage: program.progression_rules?.settings?.volumeIncrementPercentage ?? 0,
          loadIncrementPercentage: program.progression_rules?.settings?.loadIncrementPercentage ?? 0,
          programLength: program.progression_rules?.settings?.programLength ?? 4,
          weeklyVolumePercentages: program.progression_rules?.settings?.weeklyVolumePercentages ?? [100, 100, 100, 100]
        }
      },
      createdAt: typeof program.created_at === 'string' 
        ? new Date(program.created_at) 
        : program.created_at,
      updatedAt: typeof program.updated_at === 'string' 
        ? new Date(program.updated_at) 
        : program.updated_at
    });
  };

  return {
    handleProgramSelect,
    loadProgramExercises,
    handleProgramDelete,
    handleProgramUpdate
  };
}