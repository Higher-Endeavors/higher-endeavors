import { Exercise, Program, Week } from '@/app/lib/types/pillars/fitness';


export function transformWeekExercises(weekExercises: { [key: number]: Exercise[] }, programLength = 4) {
    return Array.from({ length: programLength }, (_, weekIndex) => ({
      weekNumber: weekIndex + 1,
      notes: '',
      days: [{
        dayNumber: 1,
        notes: '',
        exercises: transformExercisesForWeek(weekExercises[weekIndex + 1], weekIndex + 1)
      }]
    }));
  }
  
  export function formatProgramData(program: Program, weeks: Week[], selectedUserId: number | null, sessionUserId: string | null) {
    return {
      id: program.id,
      name: program.programName.trim(),
      periodizationType: program.periodizationType,
      phaseFocus: program.phaseFocus,
      progressionRules: program.progressionRules,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + (weeks.length * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      notes: program.notes || '',
      weeks,
      userId: selectedUserId?.toString() || sessionUserId || '0'
    };
  }
  
  export async function saveProgramToAPI(programData: any, programId: number | null, setProgram: Function) {
    const isUpdate = Boolean(programId);
    const url = isUpdate ? `/api/resistance-training/program/${programId}` : '/api/resistance-training/program';
    
    const response = await fetch(url, {
      method: isUpdate ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(programData),
    });
  
    if (!response.ok) {
      throw new Error(await response.text());
    }
  
    const result = await response.json();
    setProgram((prev: Program) => ({ ...prev, id: result.programId }));
  }

  function transformExercisesForWeek(exercises: Exercise[] = [], weekNumber: number) {
    return exercises.map(exercise => ({
      id: exercise.id,
      name: exercise.name,
      pairing: exercise.pairing,
      notes: exercise.notes || '',
      source: exercise.source,
      exerciseId: exercise.exerciseId,
      weekNumber: weekNumber,
      baseExerciseId: exercise.id,
      weekSpecificId: Math.floor(Math.random() * 1000000)
    }));
  }