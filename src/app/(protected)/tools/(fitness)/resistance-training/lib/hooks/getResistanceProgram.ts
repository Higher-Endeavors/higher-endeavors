import { ResistanceProgram, ProgramExercisesPlanned } from '../../types/resistance-training.zod';
import { getApiBaseUrl } from '@/app/lib/utils/apiUtils';

export async function getResistanceProgram(programId: number, userId: number): Promise<{
  program: ResistanceProgram;
  exercises: ProgramExercisesPlanned[];
}> {
  const res = await fetch(`${getApiBaseUrl()}/api/resistance-training/programs?id=${programId}&userId=${userId}`, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch resistance training program: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  
  if (!data.program_id) {
    throw new Error('Invalid response format: expected program data');
  }
  
  // Transform the API response to match our types
  const program: ResistanceProgram = {
    resistanceProgramId: data.program_id,
    userId: data.user_id,
    programName: data.program_name,
    phaseFocus: data.phase_focus,
    periodizationType: data.periodization_type,
    progressionRules: data.progression_rules,
    programDuration: data.program_duration,
    notes: data.notes,
    startDate: data.start_date,
    endDate: data.end_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    templateInfo: data.template_info,
  };
  
  // Transform exercises from the API response
  const exercises: (ProgramExercisesPlanned & { programInstance?: number, actualSets?: any })[] = (data.exercises || []).map((ex: any) => ({
    programExercisesPlannedId: ex.programExercisesPlannedId,
    resistanceProgramId: ex.resistanceProgramId,
    exerciseSource: ex.exerciseSource,
    exerciseLibraryId: ex.exerciseLibraryId,
    userExerciseLibraryId: ex.userExerciseLibraryId,
    pairing: ex.pairing,
    plannedSets: ex.plannedSets || [],
    actualSets: ex.actualSets || [], // <-- add this line
    notes: ex.notes,
    createdAt: ex.createdAt,
    updatedAt: ex.updatedAt,
    programInstance: ex.programInstance,
  }));
  
  return { program, exercises };
} 