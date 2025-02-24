import { Program, PeriodizationTypeEnum, PhaseFocusType } from '@/app/lib/types/pillars/fitness';
import type { ProgramSettingsFormData } from '../components/ProgramContainer/ProgramSettings';

export function useProgramSettings(
  program: Program | undefined,
  setProgram: (value: Program | ((prev: Program) => Program)) => void
) {
  const handleSettingsChange = (settings: Partial<ProgramSettingsFormData>) => {
    setProgram(prevProgram => {
      if (!prevProgram) return prevProgram;

      return {
        ...prevProgram,
        programName: settings.name || prevProgram.programName,
        periodizationType: (settings.periodizationType || prevProgram.periodizationType) as PeriodizationTypeEnum,
        phaseFocus: (settings.phaseFocus || prevProgram.phaseFocus) as PhaseFocusType,
        progressionRules: {
          type: (settings.periodizationType || prevProgram.progressionRules.type) as PeriodizationTypeEnum,
          settings: {
            ...prevProgram.progressionRules?.settings,
            ...settings.progressionRules?.settings
          }
        }
      };
    });
  };

  return { handleSettingsChange };
}