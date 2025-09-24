import { z } from 'zod';

// --- Template Info Schema ---
export const TemplateInfoSchema = z.object({
  tierContinuumId: z.number().int().optional(),
  tierContinuumName: z.string().optional(),
});

// --- CME Metrics Schemas ---

export const CMEMetricSchema = z.object({
  name: z.string(),
  type: z.enum(['number', 'text', 'select', 'heartRateTarget', 'distance']),
  label: z.string(),
  placeholder: z.string().optional(),
  unit: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  options: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).optional(),
  required: z.boolean().optional(),
});

export const CMEActivityFamilyConfigSchema = z.object({
  name: z.string(),
  metrics: z.array(CMEMetricSchema),
  defaultMetrics: z.array(z.string()),
});

// --- CME Activity Library Schemas ---

export const CMEActivityLibraryItemSchema = z.object({
  cme_activity_library_id: z.number().int(),
  name: z.string().min(1),
  source: z.enum(['cme_library', 'user']),
  activity_family: z.string().optional(),
  equipment: z.string().optional(),
}).strict();

// Interface for CME Activity Items (used in modals and components)
export interface CMEActivityItem {
  cme_activity_library_id: number;
  name: string;
  source: 'cme_library' | 'user';
  activity_family?: string;
  equipment?: string;
}

// Interface for activity options in dropdowns
export interface ExerciseOption {
  value: number;
  label: string;
  activity: CMEActivityItem;
  source: 'cme_library' | 'user';
}

// Interface for CME activity intervals
export interface Interval {
  stepType: string;
  duration: number;
  metrics: Record<string, string | number>;
  notes: string;
  heartRateData?: {
    type: 'zone' | 'custom';
    value: string;
    min?: string;
    max?: string;
  };
  isRepeatBlock?: boolean; // Whether this interval is part of a repeatable block
  blockId?: number; // Unique ID for grouping intervals in a repeatable block
  repeatCount?: string | number; // How many times this block should repeat (string for input, number for storage)
  isBlockHeader?: boolean; // Whether this is the header for a repeat block
}

// Interface for CME metric fields
export interface MetricField {
  name: string;
  type: 'number' | 'text' | 'select' | 'heartRateTarget' | 'distance';
  label: string;
  placeholder?: string;
  unit?: string;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
  required?: boolean;
}

// Interface for CME activities
export interface CMEExercise {
  activityId: number;
  activityName: string;
  activityFamily?: string; // Add activity family for HR zone lookup
  useIntervals: boolean;
  intervals: Interval[];
  notes: string;
  createdAt: string;
  userId: number;
  totalRepeatCount?: number; // Total number of repeats from all repeat blocks
  heartRateData?: {
    type: 'zone' | 'custom';
    value: string;
    min?: string;
    max?: string;
  };
}

// --- CME Session Schemas ---

export const CMESessionSchema = z.object({
  cme_session_id: z.number().int(),
  user_id: z.number().int(),
  session_name: z.string(),
  session_date: z.string(),
  macrocycle_phase: z.string().optional(),
  focus_block: z.string().optional(),
  notes: z.string().optional(),
  tier_continuum_id: z.number().int().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CMESessionItemSchema = z.object({
  cme_session_id: z.number().int(),
  user_id: z.number().int(),
  session_name: z.string(),
  session_date: z.string(),
  macrocycle_phase: z.string().optional(),
  focus_block: z.string().optional(),
  notes: z.string().optional(),
  tier_continuum_id: z.number().int().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export interface CMESessionItem {
  cme_session_id: number;
  user_id: number;
  session_name: string;
  session_date: string;
  macrocycle_phase?: string;
  focus_block?: string;
  notes?: string;
  tier_continuum_id?: number;
  created_at: string;
  updated_at: string;
}

// --- CME Template Schemas ---

export const CMETemplateSchema = z.object({
  cme_template_id: z.number().int(),
  user_id: z.number().int(),
  template_name: z.string(),
  tier_continuum_id: z.number().int(),
  notes: z.string().optional(),
  macrocycle_phase: z.string().optional(),
  focus_block: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export interface CMETemplateItem {
  cme_template_id: number;
  user_id: number;
  template_name: string;
  tier_continuum_id: number;
  notes?: string;
  macrocycle_phase?: string;
  focus_block?: string;
  created_at: string;
  updated_at: string;
}

// --- CME Session Exercise Schema ---

export const CMESessionExerciseSchema = z.object({
  cme_session_exercise_id: z.number().int(),
  cme_session_id: z.number().int(),
  cme_activity_library_id: z.number().int(),
  activity_name: z.string(),
  use_intervals: z.boolean(),
  intervals: z.string(), // JSON string
  notes: z.string().optional(),
  total_repeat_count: z.number().int().optional(),
  heart_rate_data: z.string().optional(), // JSON string
  created_at: z.string(),
  updated_at: z.string(),
});

export interface CMESessionActivityItem {
  cme_session_activity_id: number;
  cme_session_id: number;
  cme_activity_library_id: number;
  activity_name: string;
  use_intervals: boolean;
  intervals: string; // JSON string
  notes?: string;
  total_repeat_count?: number;
  heart_rate_data?: string; // JSON string
  created_at: string;
  updated_at: string;
}

// --- CME Template Exercise Schema ---

export const CMETemplateExerciseSchema = z.object({
  cme_template_exercise_id: z.number().int(),
  cme_template_id: z.number().int(),
  cme_activity_library_id: z.number().int(),
  activity_name: z.string(),
  use_intervals: z.boolean(),
  intervals: z.string(), // JSON string
  notes: z.string().optional(),
  total_repeat_count: z.number().int().optional(),
  heart_rate_data: z.string().optional(), // JSON string
  created_at: z.string(),
  updated_at: z.string(),
});

export interface CMETemplateActivityItem {
  cme_template_activity_id: number;
  cme_template_id: number;
  cme_activity_library_id: number;
  activity_name: string;
  use_intervals: boolean;
  intervals: string; // JSON string
  notes?: string;
  total_repeat_count?: number;
  heart_rate_data?: string; // JSON string
  created_at: string;
  updated_at: string;
}

// --- CME Session Summary Schema ---

export const CMESessionSummarySchema = z.object({
  session_id: z.number().int(),
  session_name: z.string(),
  session_date: z.string(),
  activity_count: z.number().int(),
  activity_summary: z.string(),
  total_duration: z.number(),
  total_work_duration: z.number(),
  total_intervals: z.number().int(),
  created_at: z.string(),
});

export interface CMESessionSummaryItem {
  session_id: number;
  session_name: string;
  session_date: string;
  activity_count: number;
  activity_summary: string;
  total_duration: number;
  total_work_duration: number;
  total_intervals: number;
  created_at: string;
}

// --- Types (Inferred from Zod Schemas) ---
export type CMEMetric = z.infer<typeof CMEMetricSchema>;
export type CMEActivityFamilyConfig = z.infer<typeof CMEActivityFamilyConfigSchema>;
export type CMEActivityLibraryItem = z.infer<typeof CMEActivityLibraryItemSchema>;
export type TemplateInfo = z.infer<typeof TemplateInfoSchema>;
