import { Exercise, Program, Week } from '@/app/lib/types/pillars/fitness';
  
  export function formatProgramData(program: Program, weeks: Week[], selectedUserId: number, sessionUserId: number) {
    return {
      id: program.id,
      name: program.program_name.trim(),
      periodizationType: program.periodization_type,
      phaseFocus: program.phase_focus,
      progressionRules: program.progression_rules,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + (weeks.length * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      notes: program.notes || '',
      weeks,
      userId: selectedUserId || sessionUserId
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