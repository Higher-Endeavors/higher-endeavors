import { z } from 'zod';

// Exercise schema
export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Exercise name is required'),
  pairing: z.string()
    .min(1, 'Pairing is required')
    .refine(
      (val) => {
        // Check for WU (Warm-Up) or CD (Cool-Down)
        if (val.startsWith('WU') || val.startsWith('CD')) {
          return true;
        }
        // Check for uppercase letter followed by a number 1-99 (e.g., A1, B12, C99)
        return /^[A-Z](?:[1-9]|[1-9][0-9])$/.test(val);
      },
      {
        message: 'Pairing must be either WU/CD or an uppercase letter followed by a number 1-99 (e.g., A1, B12)'
      }
    ),
  sets: z.number().min(1, 'Must have at least 1 set'),
  reps: z.number().min(1, 'Must have at least 1 rep'),
  load: z.number().min(0, 'Load cannot be negative'),
  tempo: z.string().regex(/^[0-9X]{4}$/, 'Tempo must be 4 digits or X'),
  rest: z.number().min(0, 'Rest cannot be negative'),
  notes: z.string().optional(),
  rpe: z.number().min(0).max(10).optional(),
  rir: z.number().min(0).max(10).optional(),
  isVariedSets: z.boolean().optional(),
  isAdvancedSets: z.boolean().optional(),
  setDetails: z.array(z.object({
    setNumber: z.number(),
    reps: z.number().min(1, 'Must have at least 1 rep'),
    load: z.number().min(0, 'Load cannot be negative'),
    tempo: z.string().regex(/^[0-9X]{4}$/, 'Tempo must be 4 digits or X'),
    rest: z.number().min(0, 'Rest cannot be negative'),
    rpe: z.number().min(0).max(10).optional(),
    rir: z.number().min(0).max(10).optional(),
    subSets: z.array(z.object({
      reps: z.number().min(1, 'Must have at least 1 rep'),
      load: z.number().min(0, 'Load cannot be negative'),
      rest: z.number().min(0, 'Rest cannot be negative'),
      tempo: z.string().regex(/^[0-9X]{4}$/, 'Tempo must be 4 digits or X')
    })).optional()
  })).optional()
});

// Program settings schema
export const programSettingsSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  phaseFocus: z.enum(['GPP', 'Strength', 'Hypertrophy', 'Intensification', 'Accumulation']),
  periodizationType: z.enum(['None', 'Linear', 'Undulating', 'Custom']),
  progressionRules: z.object({
    type: z.enum(['None', 'Linear', 'Undulating', 'Custom']),
    settings: z.object({
      volumeIncrementPercentage: z.number().min(0).max(100).optional(),
      loadIncrementPercentage: z.number().min(0).max(100).optional(),
      weeklyVolumePercentages: z.array(z.number().min(0).max(100)).optional(),
      programLength: z.number().min(1).max(52).optional()
    })
  })
});

// Complete program schema
export const programSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  name: z.string().min(1, 'Program name is required'),
  phaseFocus: z.enum(['GPP', 'Strength', 'Hypertrophy', 'Intensification', 'Accumulation']),
  periodizationType: z.enum(['None', 'Linear', 'Undulating', 'Custom']),
  exercises: z.array(exerciseSchema),
  progressionRules: z.object({
    type: z.enum(['None', 'Linear', 'Undulating', 'Custom']),
    settings: z.object({
      volumeIncrementPercentage: z.number().min(0).max(100).optional(),
      loadIncrementPercentage: z.number().min(0).max(100).optional(),
      weeklyVolumePercentages: z.array(z.number().min(0).max(100)).optional(),
      programLength: z.number().min(1).max(52).optional()
    })
  }),
  volumeTargets: z.array(z.object({
    muscleGroup: z.string(),
    targetSets: z.number().min(0),
    currentSets: z.number().min(0)
  })),
  createdAt: z.date(),
  updatedAt: z.date()
}); 