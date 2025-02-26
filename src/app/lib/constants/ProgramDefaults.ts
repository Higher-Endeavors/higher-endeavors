import type { Program } from '@/app/lib/types/pillars/fitness';

export const DefaultProgram: Program = {
    id: 0,
    programName: '',
    userId: 0,
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