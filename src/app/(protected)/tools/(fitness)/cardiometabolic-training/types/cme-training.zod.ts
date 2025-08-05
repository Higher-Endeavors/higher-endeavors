import { z } from 'zod';

// --- CME Activity Library Schemas ---

export const CMEActivityLibraryItemSchema = z.object({
  cme_activity_library_id: z.number().int(),
  name: z.string().min(1),
  source: z.literal('cme_library'),
  activity_family: z.string().nullable().optional(),
  equipment: z.string().nullable().optional(),
}).strict();

// --- CME Program Schemas ---

export const CMEProgramSchema = z.object({
  cmeProgramId: z.number().int(),
  userId: z.number().int(),
  programName: z.string().min(1),
  macrocyclePhase: z.string().optional(),
  focusBlock: z.string().optional(),
  programType: z.string().optional(),
  progressionRules: z.any().optional(),
  programDuration: z.number().int().min(1).max(52).optional(),
  notes: z.string().optional(),
  startDate: z.string().optional(), // ISO date
  endDate: z.string().optional(), // ISO date
  rrule: z.string().optional(),
  duration: z.number().int().min(1).max(52).optional(),
  recurringEventPid: z.number().int().optional(),
  originalStart: z.string().optional(), // ISO date
  deleted: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
}).strict();

export const CMEProgramTemplateSchema = z.object({
  cmeProgramTemplateId: z.number().int(),
  templateName: z.string().min(1),
  macrocyclePhase: z.string().optional(),
  focusBlock: z.string().optional(),
  programType: z.string().optional(),
  progressionRules: z.any().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
}).strict();

// --- CME Activity Set Schema ---

export type CMEActivitySet = {
  interval?: number;
  duration?: number; // in seconds
  distance?: number;
  distanceUnit?: string;
  intensity?: string; // e.g., "moderate", "high", "RPE 7"
  restSec?: number;
  rpe?: number;
  notes?: string;
  subIntervals?: CMEActivitySet[];
};

export const CMEActivitySetSchema: z.ZodType<CMEActivitySet> = z.lazy(() =>
  z.object({
    interval: z.number().int().min(1).optional(),
    duration: z.number().int().min(0).optional(), // in seconds
    distance: z.number().int().min(0).optional(),
    distanceUnit: z.string().optional(),
    intensity: z.string().optional(),
    restSec: z.number().int().min(0).optional(),
    rpe: z.number().int().min(0).max(20).optional(),
    notes: z.string().optional(),
    subIntervals: z.array(CMEActivitySetSchema).optional(),
  }).strict()
);

// --- Program Activities Schemas ---

export const ProgramActivitiesPlannedSchema = z.object({
  programActivitiesPlannedId: z.number().int(),
  cmeProgramId: z.number().int(),
  activitySource: z.enum(['cme_library', 'user']),
  cmeActivityLibraryId: z.number().int().optional(),
  userActivityLibraryId: z.number().int().optional(),
  pairing: z.string().optional(),
  plannedIntervals: z.array(z.lazy(() => CMEActivitySetSchema)).optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
}).strict();

export const ProgramActivitiesActualSchema = z.object({
  programActivitiesActualId: z.number().int(),
  programActivitiesPlannedId: z.number().int(),
  activitiesActualDate: z.string(),
  actualIntervals: z.array(z.lazy(() => CMEActivitySetSchema)).optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
}).strict();

// --- User Activity Schema ---

export const UserActivitySchema = z.object({
  userActivityLibraryId: z.number().int(),
  userId: z.number().int(),
  activityName: z.string().min(1),
  description: z.string().optional(),
  activityFamily: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).strict();

// --- Program List Item Schema ---

export const CMEProgramListItemSchema = z.object({
  cmeProgramId: z.number().int(),
  userId: z.number().int(),
  programName: z.string().min(1),
  macrocyclePhase: z.string().optional(),
  focusBlock: z.string().optional(),
  programType: z.string().optional(),
  progressionRules: z.any().optional(),
  programDuration: z.number().int().optional(),
  notes: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  activityCount: z.number().int(),
  activitySummary: z.object({
    totalActivities: z.number().int(),
    activities: z.array(z.object({
      name: z.string()
    }))
  }).optional(),
}).strict();

// --- Action Schemas ---

export const UpdateCMEProgramSchema = z.object({
  programId: z.number().int(),
  userId: z.number().int(),
  programName: z.string().min(1),
  macrocyclePhase: z.string().optional(),
  focusBlock: z.string().optional(),
  programType: z.string().optional(),
  progressionRules: z.any().optional(),
  programDuration: z.number().int().min(1).max(52),
  notes: z.string().optional(),
  weeklyActivities: z.array(z.array(z.object({
    activitySource: z.enum(['cme_library', 'user']),
    cmeActivityLibraryId: z.number().int().nullable().optional(),
    userActivityLibraryId: z.number().int().nullable().optional(),
    pairing: z.string().optional(),
    plannedSets: z.array(z.any()).optional(),
    notes: z.string().optional(),
  })))
});

export const DuplicateCMEProgramSchema = z.object({
  programId: z.number().int(),
  newProgramName: z.string().min(1),
});

export const DeleteCMEProgramSchema = z.object({
  programId: z.number().int(),
});

// --- Types ---
export type CMEActivityLibraryItem = z.infer<typeof CMEActivityLibraryItemSchema>;
export type CMEProgram = z.infer<typeof CMEProgramSchema>;
export type CMEProgramTemplate = z.infer<typeof CMEProgramTemplateSchema>;
export type ProgramActivitiesPlanned = z.infer<typeof ProgramActivitiesPlannedSchema>;
export type ProgramActivitiesActual = z.infer<typeof ProgramActivitiesActualSchema>;
export type UserActivity = z.infer<typeof UserActivitySchema>;
export type CMEProgramListItem = z.infer<typeof CMEProgramListItemSchema>;
export type UpdateCMEProgramInput = z.infer<typeof UpdateCMEProgramSchema>;
export type DuplicateCMEProgramInput = z.infer<typeof DuplicateCMEProgramSchema>;
export type DeleteCMEProgramInput = z.infer<typeof DeleteCMEProgramSchema>;
