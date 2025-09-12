import { z } from 'zod';
import type { PlanningItem } from '../components/planning-modal/planning-types.zod';

export const TIZBreakdownSchema = z.object({
  z1: z.number().int().min(0), // Zone 1 minutes
  z2: z.number().int().min(0), // Zone 2 minutes
  z3: z.number().int().min(0), // Zone 3 minutes
  z4: z.number().int().min(0), // Zone 4 minutes
  z5: z.number().int().min(0), // Zone 5 minutes
});

export const SubPhaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  modality: z.enum(['running', 'cycling', 'swimming', 'strength', 'power', 'hypertrophy']),
  volume: z.number().int().min(0), // Average weekly volume
  intensity: z.number().int().min(1).max(10),
  color: z.string().min(1),
  weeklyVolumes: z.array(z.number().int().min(0)).optional(), // Individual weekly volumes
  weeklyTIZ: z.array(TIZBreakdownSchema).optional(), // Weekly TIZ breakdown
});

export const ProgramSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  weeks: z.array(z.number().int().min(0)), // Which weeks this program runs
  sessions: z.array(z.string().min(1)), // Which days of the week
});

export const PhaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['resistance', 'cme', 'recovery']),
  startWeek: z.number().int().min(0),
  duration: z.number().int().min(1),
  intensity: z.number().int().min(1).max(10),
  volume: z.number().int().min(0),
  color: z.string().min(1),
  deload: z.boolean(),
  subPhases: z.array(SubPhaseSchema).optional(),
  periodizationStyle: z.enum(['Linear', 'Undulating', 'Block', 'Reverse']).optional(),
  phaseFocus: z.enum(['GPP', 'Strength', 'Hypertrophy', 'Power', 'Endurance', 'Recovery', 'Intensification', 'Accumulation', 'Other']).optional(),
  programs: z.array(ProgramSchema).optional(),
});

export const GoalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['milestone', 'metric', 'competition', 'test', 'travel']),
  targetDate: z.date(),
  targetValue: z.number().optional(),
  currentValue: z.number().optional(),
  unit: z.string().optional(),
  status: z.enum(['pending', 'achieved', 'missed']),
  itemType: z.enum(['goal', 'milestone', 'event']).default('goal'),
  color: z.string().optional(),
});

export const EventSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  date: z.date(),
  type: z.enum(['competition', 'test', 'deload', 'travel']),
  color: z.string().min(1),
});

export const PlanSettingsSchema = z.object({
  showResistance: z.boolean(),
  showCME: z.boolean(),
  showRecovery: z.boolean(),
  showGoals: z.boolean(),
  showEvents: z.boolean(),
  timeGranularity: z.enum(['weeks', 'months', 'quarters']),
});

export const PeriodizationPlanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  startDate: z.date(),
  endDate: z.date(),
  totalWeeks: z.number().int().min(1).max(52),
  phases: z.array(PhaseSchema),
  goals: z.array(GoalSchema),
  settings: PlanSettingsSchema,
  planningItems: z.array(z.any()).optional(), // PlanningItem type will be added when needed
});

// Infer TypeScript types from Zod schemas
export type SubPhase = z.infer<typeof SubPhaseSchema>;
export type Phase = z.infer<typeof PhaseSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type Event = z.infer<typeof EventSchema>;
export type PlanSettings = z.infer<typeof PlanSettingsSchema>;
export type PeriodizationPlan = z.infer<typeof PeriodizationPlanSchema>;
