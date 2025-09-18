import { ProgramListItem } from '(protected)/tools/fitness/resistance-training/types/resistance-training.zod';
import { getFetchBaseUrl } from 'lib/utils/clientUtils';

export async function getResistancePrograms(userId: number): Promise<ProgramListItem[]> {
  const baseURL = await getFetchBaseUrl();
  const fetchURL = `${baseURL}/api/resistance-training/programs?userId=${userId}`;
  const res = await fetch(fetchURL, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch resistance training programs: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  
  if (!data.programs || !Array.isArray(data.programs)) {
    throw new Error('Invalid response format: expected programs array');
  }
  
  return data.programs.map((program: any) => ({
    resistanceProgramId: program.resistanceProgramId,
    userId: program.userId,
    programName: program.programName,
    phaseFocus: program.phaseFocus,
    periodizationType: program.periodizationType,
    progressionRules: program.progressionRules,
    programDuration: program.programDuration,
    notes: program.notes,
    startDate: program.startDate,
    endDate: program.endDate,
    createdAt: program.createdAt,
    updatedAt: program.updatedAt,
    exerciseCount: program.exercise_count,
    exerciseSummary: program.exercise_summary,
  }));
} 