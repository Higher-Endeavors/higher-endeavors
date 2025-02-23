import type { Program } from '@/app/lib/types/pillars/fitness';

export const DEFAULT_PROGRAM: Program = {
    id: null,
    programName: '',
    userId: null,
    phaseFocus: 'GPP',
    periodizationType: 'None',
    progressionRules: {
        type: 'None',
        settings: {
            volumeIncrementPercentage: 0,
            loadIncrementPercentage: 0,
            programLength: 4,
            weeklyVolumePercentages: [100, 80, 90, 60]
        }
    },
    startDate: new Date(),
    endDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
};