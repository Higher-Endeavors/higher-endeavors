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

// Interface for exercise options in dropdowns
export interface ExerciseOption {
  value: number;
  label: string;
  activity: CMEActivityItem;
  source: 'cme_library' | 'user';
}

// Interface for CME exercise intervals
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

// Interface for CME exercises
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

// Interface for CME session items (matches database structure)
export interface CMESessionItem {
  cme_session_id: number;
  user_id: number;
  session_name: string;
  macrocycle_phase?: string;
  focus_block?: string;
  notes?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
  exercise_count: number;
  exercise_summary: string;
  // Template information (only for templates)
  templateInfo?: {
    tierContinuumId?: number;
    tierContinuumName?: string;
  };
  // Legacy fields for backward compatibility
  sessionId?: number;
  sessionName?: string;
  createdAt?: string;
  duration?: number;
  intensity?: string;
  activityType?: string;
  targetHeartRate?: number;
  userId?: number;
}

// --- Types (Inferred from Zod Schemas) ---
export type CMEMetric = z.infer<typeof CMEMetricSchema>;
export type CMEActivityFamilyConfig = z.infer<typeof CMEActivityFamilyConfigSchema>;
export type CMEActivityLibraryItem = z.infer<typeof CMEActivityLibraryItemSchema>;
export type TemplateInfo = z.infer<typeof TemplateInfoSchema>;
