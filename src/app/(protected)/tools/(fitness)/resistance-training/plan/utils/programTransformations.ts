import { exercise, program, week, PeriodizationType, progression_rules, progression_settings, ProgressionFrequency } from '@/app/lib/types/pillars/fitness';
  
/**
 * Validates and processes progression rules for program load and volume calculations
 * Ensures all required fields are present and properly typed for database storage
 * 
 * @param rules - The progression rules to validate, can be either from program type or direct progression_rules
 * @returns A validated progression_rules object that matches the database schema
 */
export function validateProgressionRules(rules: {
  type: string;
  settings?: {
    volume_increment_percentage?: number;
    load_increment_percentage?: number;
    program_length?: number;
    weekly_volume_percentages?: number[];
  };
  load_increment?: number;
  frequency?: string;
} | undefined): progression_rules | undefined {
  if (!rules) return undefined;

  // Convert the input to match the progression_rules type
  const validated: progression_rules = {
    type: rules.type as keyof typeof PeriodizationType,
    load_increment: rules.load_increment,
    frequency: rules.frequency as keyof typeof ProgressionFrequency,
    settings: rules.settings ? {
      volume_increment_percentage: rules.settings.volume_increment_percentage,
      load_increment_percentage: rules.settings.load_increment_percentage,
      program_length: rules.settings.program_length,
      weekly_volume_percentages: rules.settings.weekly_volume_percentages
    } : undefined
  };

  return validated;
}

export function formatProgramData(program: program, weeks: week[], selectedUserId: number, sessionUserId: number) {
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
  setProgram((prev: program) => ({ ...prev, id: result.programId }));
}