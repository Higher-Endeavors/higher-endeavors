import { z } from 'zod';

// Common fields that all planning types share
export const CommonPlanningFieldsSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  duration: z.number().int().min(1, 'Duration must be at least 1 week'),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

// Planning type enum
export const PlanningTypeSchema = z.enum([
  'resistance',
  'cardiometabolic',
  'recovery',
  'goal',
  'milestone',
  'event'
]);

// Resistance Training specific fields
export const ResistancePlanningFieldsSchema = z.object({
  phase: z.object({
    phaseFocus: z.string().optional(),
    startDate: z.string().optional(),
    duration: z.number().int().min(1).max(52).default(4),
    endDate: z.string().optional(),
    programmingRules: z.array(z.string()).default([]),
  }).optional(),
  periodization: z.object({
    type: z.enum(['Linear', 'Undulating']).optional(),
    startDate: z.string().optional(),
    duration: z.number().int().min(1).max(52).default(4),
    endDate: z.string().optional(),
    settings: z.object({
      volumeIncrement: z.number().default(0),
      loadIncrement: z.number().default(0),
      weeklyVolumes: z.array(z.number()).default([100, 80, 90, 60]),
    }).default({}),
  }).optional(),
  programs: z.object({
    selectedPrograms: z.array(z.string()).default([]),
    assignmentWeeks: z.array(z.number()).default([]),
  }).optional(),
  notes: z.string().optional(),
});

// Cardiometabolic Endurance specific fields
export const CardiometabolicPlanningFieldsSchema = z.object({
  macrocyclePhase: z.string().optional(),
  focusBlock: z.string().optional(),
  startDate: z.string().optional(),
  duration: z.number().int().min(1).max(52).default(4),
  endDate: z.string().optional(),
  activityType: z.enum(['running', 'cycling', 'swimming', 'mixed']).default('mixed'),
  weeklyVolume: z.number().int().min(60).max(600).optional(), // minutes
  intensityDistribution: z.object({
    z1: z.number().int().min(0).default(60), // percentage
    z2: z.number().int().min(0).default(25),
    z3: z.number().int().min(0).default(10),
    z4: z.number().int().min(0).default(4),
    z5: z.number().int().min(0).default(1),
  }).optional(),
  rampRate: z.number().min(4).max(12).optional(), // percentage per week
  sessions: z.object({
    selectedSessions: z.array(z.string()).default([]),
    assignmentWeeks: z.array(z.number()).default([]),
  }).optional(),
  weekOverrides: z.record(z.number().int().min(0), z.number().int().min(0).max(600)).optional(),
  notes: z.string().optional(),
});

// Recovery & Rest specific fields
export const RecoveryPlanningFieldsSchema = z.object({
  recoveryType: z.enum(['taper', 'deload', 'rest', 'recovery', 'active_recovery', 'passive_recovery']).optional(),
  startDate: z.string().optional(),
  duration: z.number().int().min(1).max(52).default(1),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

// Simple planning fields for Milestone and Event
export const MilestoneEventPlanningFieldsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  duration: z.number().int().min(1).max(52).default(1),
  notes: z.string().optional(),
});

// Goals, Milestones & Events specific fields (for Goals only)
export const GoalsPlanningFieldsSchema = z.object({
  itemType: z.enum(['goal', 'milestone', 'event']).default('goal'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  duration: z.number().int().min(1).max(52).default(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']).default('planned'),
  // Goal-specific fields
  goalType: z.enum(['performance', 'body_composition', 'health', 'skill', 'lifestyle', 'career', 'personal', 'other']).optional(),
  targetValue: z.string().optional(),
  measurementUnit: z.string().optional(),
  successCriteria: z.string().optional(),
  // Event-specific fields
  eventType: z.enum(['race', 'competition', 'assessment', 'milestone', 'wedding', 'vacation', 'trip', 'work', 'personal', 'other']).optional(),
  location: z.string().optional(),
  preparationWeeks: z.number().int().min(0).max(52).optional(),
  // Training impact
  trainingImpact: z.enum(['high', 'medium', 'low', 'none']).default('medium'),
  trainingNotes: z.string().optional(),
  // Additional details
  notes: z.string().optional(),
});

// Main planning item schema
export const PlanningItemSchema = z.object({
  id: z.string(),
  type: PlanningTypeSchema,
  resistance: ResistancePlanningFieldsSchema.optional(),
  cardiometabolic: CardiometabolicPlanningFieldsSchema.optional(),
  recovery: RecoveryPlanningFieldsSchema.optional(),
  goal: GoalsPlanningFieldsSchema.optional(),
  milestone: MilestoneEventPlanningFieldsSchema.optional(),
  event: MilestoneEventPlanningFieldsSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

// Export types
export type PlanningType = z.infer<typeof PlanningTypeSchema>;
export type CommonPlanningFields = z.infer<typeof CommonPlanningFieldsSchema>;
export type ResistancePlanningFields = z.infer<typeof ResistancePlanningFieldsSchema>;
export type CardiometabolicPlanningFields = z.infer<typeof CardiometabolicPlanningFieldsSchema>;
export type RecoveryPlanningFields = z.infer<typeof RecoveryPlanningFieldsSchema>;
export type MilestoneEventPlanningFields = z.infer<typeof MilestoneEventPlanningFieldsSchema>;
export type GoalsPlanningFields = z.infer<typeof GoalsPlanningFieldsSchema>;
export type PlanningItem = z.infer<typeof PlanningItemSchema>;

// Planning type display information
export const planningTypeInfo = {
  resistance: {
    label: 'Resistance Training',
    description: 'Strength training programs and workouts',
    icon: '🏋️',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  cardiometabolic: {
    label: 'Cardiometabolic Endurance',
    description: 'Cardio, running, cycling, and endurance training',
    icon: '🏃',
    color: 'bg-red-100 text-red-700 border-red-200',
  },
  recovery: {
    label: 'Recovery & Rest',
    description: 'Recovery sessions, rest days, and wellness activities',
    icon: '🧘',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  goal: {
    label: 'Goal',
    description: 'A specific objective to achieve',
    icon: '🎯',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  milestone: {
    label: 'Milestone',
    description: 'A significant checkpoint or achievement',
    icon: '⭐',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  event: {
    label: 'Event',
    description: 'A specific occasion or happening',
    icon: '🏆',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
} as const;
