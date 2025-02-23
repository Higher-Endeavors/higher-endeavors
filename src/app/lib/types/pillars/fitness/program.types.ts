
/**
 * Interface for a program
 */
export interface Program {
  id: number | null;                // Changed from string to number
  programName: string;
  userId: number | null;            // Changed from string to number
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
    startDate?: Date;
    endDate?: Date;
    notes?: string;
   // weeks: Week[];
    createdAt: Date;
    updatedAt: Date;
  }