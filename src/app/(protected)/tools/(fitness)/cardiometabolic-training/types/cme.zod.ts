import { z } from 'zod';

// --- CME Metrics Schemas ---

export const CMEMetricSchema = z.object({
  name: z.string(),
  type: z.enum(['number', 'text', 'select']),
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

// --- Program Schemas ---

export const CmeProgramSchema = z.object({
  cmeProgramId: z.number().int(),
  userId: z.number().int(),
  programName: z.string().min(1),
  macrocyclePhase: z.string().optional(),
  focusBlock: z.string().optional(),
  programType: z.string().optional(),
  progressionRules: z.any().optional(),
  programDuration: z.number().int().min(1).max(52).optional(),
  notes: z.string().optional(),
  templateId: z.number().int().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  rrule: z.string().optional(),
  duration: z.number().int().min(1).max(52).optional(),
  recurringEventPid: z.number().int().optional(),
  originalStart: z.string().optional(),
  deleted: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
}).strict();

export const CmeProgramTemplateSchema = z.object({
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

// --- Type definitions for recursive schemas ---

export type CmePlannedStep = {
  stepType: 'Warm-Up' | 'Work' | 'Recovery' | 'Cool-Down';
  duration?: number;
  intensity?: string | number;
  intensityMetric?: string;
  notes?: string;
  subSteps?: CmePlannedStep[];
};

export type CMEActivitySet = {
  interval?: number;
  duration?: number;
  distance?: number;
  distanceUnit?: string;
  intensity?: string;
  restSec?: number;
  rpe?: number;
  notes?: string;
  subIntervals?: CMEActivitySet[];
};

export type CmeActualStep = {
  stepType: 'Warm-Up' | 'Work' | 'Recovery' | 'Cool-Down';
  duration?: number;
  intensity?: string | number;
  intensityMetric?: string;
  notes?: string;
  subSteps?: CmeActualStep[];
};

// --- Recursive Schemas ---

export const CmePlannedStepSchema: z.ZodType<CmePlannedStep> = z.lazy(() =>
  z.object({
    stepType: z.enum(['Warm-Up', 'Work', 'Recovery', 'Cool-Down']),
    duration: z.number().int().min(1).optional(),
    intensity: z.union([z.string(), z.number()]).optional(),
    intensityMetric: z.string().optional(),
    notes: z.string().optional(),
    subSteps: z.array(CmePlannedStepSchema).optional(),
  })
);

export const CMEActivitySetSchema: z.ZodType<CMEActivitySet> = z.lazy(() =>
  z.object({
    interval: z.number().int().min(1).optional(),
    duration: z.number().int().min(0).optional(),
    distance: z.number().int().min(0).optional(),
    distanceUnit: z.string().optional(),
    intensity: z.string().optional(),
    restSec: z.number().int().min(0).optional(),
    rpe: z.number().int().min(0).max(20).optional(),
    notes: z.string().optional(),
    subIntervals: z.array(CMEActivitySetSchema).optional(),
  }).strict()
);

export const CmeActualStepSchema: z.ZodType<CmeActualStep> = z.lazy(() =>
  z.object({
    stepType: z.enum(['Warm-Up', 'Work', 'Recovery', 'Cool-Down']),
    duration: z.number().int().min(1).optional(),
    intensity: z.union([z.string(), z.number()]).optional(),
    intensityMetric: z.string().optional(),
    notes: z.string().optional(),
    subSteps: z.array(CmeActualStepSchema).optional(),
  })
);

export const CmeProgramDaySessionSchema = z.object({
  cmeProgramDaySessionId: z.number().int(),
  cmeProgramId: z.number().int(),
  weekNumber: z.number().int().min(1),
  dayNumber: z.number().int().min(1),
  sessionType: z.string().min(1),
  sessionName: z.string().optional(),
  plannedDistance: z.number().optional(),
  plannedDuration: z.number().int().optional(),
  plannedIntensity: z.record(z.any()).optional(),
  detail: z.array(CmePlannedStepSchema).optional(),
  notes: z.string().optional(),
  orderIndex: z.number().int().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
}).strict();

// --- Program Activities Schemas ---

export const ProgramActivitiesPlannedSchema = z.object({
  programActivitiesPlannedId: z.number().int(),
  cmeProgramId: z.number().int(),
  activitySource: z.enum(['cme_library', 'user']),
  cmeActivityLibraryId: z.number().int().optional(),
  userActivityLibraryId: z.number().int().optional(),
  pairing: z.string().optional(),
  plannedIntervals: z.array(CMEActivitySetSchema).optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
}).strict();

export const ProgramActivitiesActualSchema = z.object({
  programActivitiesActualId: z.number().int(),
  programActivitiesPlannedId: z.number().int(),
  activitiesActualDate: z.string(),
  actualIntervals: z.array(CMEActivitySetSchema).optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
}).strict();

export const UserActivitySchema = z.object({
  userActivityLibraryId: z.number().int(),
  userId: z.number().int(),
  activityName: z.string().min(1),
  description: z.string().optional(),
  activityFamily: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).strict();

// --- Completed Session Schemas ---

export const CmeUserActualSessionSchema = z.object({
  cmeUserActualSessionId: z.number().int(),
  userId: z.number().int(),
  cmeProgramDaySessionId: z.number().int().optional(),
  sessionDate: z.string(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
}).strict();

export const CmeSessionIntervalPerfSchema = z.object({
  cmeSessionIntervalPerfId: z.number().int(),
  cmeUserActualSessionId: z.number().int(),
  stepNumber: z.number().int().min(1),
  stepType: z.enum(['Warm-Up', 'Work', 'Recovery', 'Cool-Down']),
  actualDuration: z.number().int().optional(),
  actualDistance: z.number().optional(),
  actualIntensity: z.number().optional(),
  actualAvgSpeed: z.number().optional(),
  actualActiveCalories: z.number().optional(),
  actualAvgHeartRate: z.number().optional(),
  cmeMetricId: z.number().int().optional(),
  actualTempo: z.string().optional(),
  actualRest: z.number().int().optional(),
  detail: z.array(CmeActualStepSchema).optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
}).strict();

// --- Metrics Schemas ---

export const CmeMetricSchema = z.object({
  cmeMetricId: z.number().int(),
  metricName: z.string().min(1),
});

export const CmeIntervalMetricSchema = z.object({
  metricId: z.number().int(),
  cmeSessionIntervalPerfId: z.number().int(),
  cmeMetricId: z.number().int(),
  metricValue: z.number(),
  metricUnit: z.string().optional(),
  recordedOffsetSeconds: z.number().int().optional(),
  source: z.string().optional(),
  createdAt: z.string(),
});

// --- Program List Schemas ---

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

// --- Types (Inferred from Zod Schemas) ---
export type CMEMetric = z.infer<typeof CMEMetricSchema>;
export type CMEActivityFamilyConfig = z.infer<typeof CMEActivityFamilyConfigSchema>;
export type CMEActivityLibraryItem = z.infer<typeof CMEActivityLibraryItemSchema>;
export type CmeProgram = z.infer<typeof CmeProgramSchema>;
export type CmeProgramTemplate = z.infer<typeof CmeProgramTemplateSchema>;
export type CmeProgramDaySession = z.infer<typeof CmeProgramDaySessionSchema>;
export type ProgramActivitiesPlanned = z.infer<typeof ProgramActivitiesPlannedSchema>;
export type ProgramActivitiesActual = z.infer<typeof ProgramActivitiesActualSchema>;
export type UserActivity = z.infer<typeof UserActivitySchema>;
export type CmeUserActualSession = z.infer<typeof CmeUserActualSessionSchema>;
export type CmeSessionIntervalPerf = z.infer<typeof CmeSessionIntervalPerfSchema>;
export type CmeMetric = z.infer<typeof CmeMetricSchema>;
export type CmeIntervalMetric = z.infer<typeof CmeIntervalMetricSchema>;
export type CMEProgramListItem = z.infer<typeof CMEProgramListItemSchema>;
export type UpdateCMEProgramInput = z.infer<typeof UpdateCMEProgramSchema>;
export type DuplicateCMEProgramInput = z.infer<typeof DuplicateCMEProgramSchema>;
export type DeleteCMEProgramInput = z.infer<typeof DeleteCMEProgramSchema>;
