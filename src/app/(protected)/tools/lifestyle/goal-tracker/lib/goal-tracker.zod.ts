import { z } from 'zod';

// Goal Status Schema
export const GoalStatusSchema = z.enum(['active', 'completed', 'archived']);
export type GoalStatus = z.infer<typeof GoalStatusSchema>;

// Goal Focus Schema
export const GoalFocusSchema = z.enum(['weight_loss', 'muscle_gain', 'other']);
export type GoalFocus = z.infer<typeof GoalFocusSchema>;

// Goal Type Schema
export const GoalTypeSchema = z.enum(['habit', 'target', 'average']);
export type GoalType = z.infer<typeof GoalTypeSchema>;

// Goal Tracking Schema
export const GoalTrackingSchema = z.enum(['body_composition', 'custom']);
export type GoalTracking = z.infer<typeof GoalTrackingSchema>;

// Event Type Schema
export const EventTypeSchema = z.enum([
  'race',
  'competition', 
  'assessment',
  'milestone',
  'wedding',
  'vacation',
  'trip',
  'work',
  'personal',
  'other'
]);
export type EventType = z.infer<typeof EventTypeSchema>;

// Priority Schema
export const PrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export type Priority = z.infer<typeof PrioritySchema>;

// Training Impact Schema
export const TrainingImpactSchema = z.enum(['none', 'low', 'medium', 'high']);
export type TrainingImpact = z.infer<typeof TrainingImpactSchema>;

// Main Goal Item Schema
export const GoalItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Goal name is required'),
  category: z.string().optional(),
  metric: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  currentValue: z.number().default(0),
  targetValue: z.number().optional(),
  desiredRate: z.number().optional(),
  actualRate: z.number().default(0),
  notes: z.string().optional(),
  status: GoalStatusSchema.default('active'),
  parentId: z.string().optional(),
  
  // Step-based modal fields
  goalFocus: GoalFocusSchema.optional(),
  goalType: GoalTypeSchema.optional(),
  goalTracking: GoalTrackingSchema.optional(),
  customMetric: z.string().optional(),
  goalValue: z.number().optional(),
  ongoing: z.boolean().default(false),
  repeatFrequency: z.string().optional(),
  repeatInterval: z.number().optional(),
  bodyWeight: z.string().optional(),
  bodyFatPercentage: z.string().optional(),
  
  // Additional fields from GoalsTrainingFields
  priority: PrioritySchema.default('medium'),
  eventType: EventTypeSchema.default('other'),
  location: z.string().optional(),
  preparationWeeks: z.number().min(0).max(52).default(0),
  trainingImpact: TrainingImpactSchema.default('medium'),
  trainingNotes: z.string().optional(),
});

export type GoalItemType = z.infer<typeof GoalItemSchema>;

// Create Goal Schema (for form submission)
export const CreateGoalSchema = GoalItemSchema.omit({
  id: true,
  currentValue: true,
  actualRate: true,
});

export type CreateGoalType = z.infer<typeof CreateGoalSchema>;

// Update Goal Schema (for editing)
export const UpdateGoalSchema = GoalItemSchema.partial().required({
  id: true,
});

export type UpdateGoalType = z.infer<typeof UpdateGoalSchema>;

// Goal Progress Schema
export const GoalProgressSchema = z.object({
  goalId: z.string(),
  date: z.string(),
  value: z.number(),
  notes: z.string().optional(),
});

export type GoalProgressType = z.infer<typeof GoalProgressSchema>;

// Goal Statistics Schema
export const GoalStatisticsSchema = z.object({
  totalGoals: z.number(),
  activeGoals: z.number(),
  completedGoals: z.number(),
  archivedGoals: z.number(),
  completionRate: z.number(),
  averageProgress: z.number(),
});

export type GoalStatisticsType = z.infer<typeof GoalStatisticsSchema>;
