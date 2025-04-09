import { program, periodization_type_enum, phase_focus_type } from '@/app/lib/types/pillars/fitness';
import type { ProgramSettingsFormData } from '../components/ProgramManagement/ProgramSettings';

export function useProgramSettings(
  program_data: program | undefined,
  setProgram: (value: program | ((prev: program) => program)) => void
) {
  const handleSettingsChange = (settings: Partial<ProgramSettingsFormData>) => {
    setProgram((prev_program: program) => {
      if (!prev_program) return prev_program;

      return {
        ...prev_program,
        program_name: settings.name || prev_program.program_name,
        periodization_type: (settings.periodization_type || prev_program.periodization_type) as periodization_type_enum,
        phase_focus: (settings.phase_focus || prev_program.phase_focus) as phase_focus_type,
        progression_rules: {
          type: (settings.periodization_type || prev_program.progression_rules.type) as periodization_type_enum,
          settings: {
            ...prev_program.progression_rules?.settings,
            ...settings.progression_rules?.settings
          }
        }
      };
    });
  };

  return { handleSettingsChange };
}