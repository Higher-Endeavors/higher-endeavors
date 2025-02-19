
/**
 * Interface for a program
 */
export interface Program {
    id: string;
    programName: string;
    userId: string;
    phaseFocus: string;
    periodizationType: string;
    progressionRules: {
      type: string;
      settings: {
        volumeIncrementPercentage: number;
        loadIncrementPercentage: number;
        programLength: number;
        weeklyVolumePercentages: number[];
      };
    };
    startDate: string;
    endDate: string;
    notes?: string;
   // weeks: Week[];
    createdAt: string;
    updatedAt: string;
  }