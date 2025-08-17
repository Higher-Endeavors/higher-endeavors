// CME Types

// --- Enums ---

export type CmeStepType = 'Warm-Up' | 'Work' | 'Recovery' | 'Cool-Down';

// --- Program Structures ---

/**
 * Represents a CardioMetabolic Endurance training program for a user.
 */
export interface CmeProgram {
  cmeProgramId: number;
  userId: number;
  programName: string;
  macrocyclePhase?: string;
  focusBlock?: string;
  progressionRules?: any; // JSONB, can be further typed if needed
  programDuration?: number; // in weeks
  notes?: string;
  templateId?: number;
  startDate?: string; // ISO date
  createdAt: string;
  updatedAt?: string;
}

/**
 * Represents a template for CME programs.
 */
export interface CmeProgramTemplate {
  cmeProgramTemplateId: number;
  templateName: string;
  macrocyclePhase?: string;
  focusBlock?: string;
  progressionRules?: any;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Represents a planned session for a program day.
 */
export interface CmeProgramDaySession {
  cmeProgramDaySessionId: number;
  cmeProgramId: number;
  weekNumber: number;
  dayNumber: number;
  sessionType: string; // e.g., run, bike, swim
  sessionName?: string;
  plannedDistance?: number;
  plannedDuration?: number; // seconds
  plannedIntensity?: Record<string, any>; // JSONB, e.g., { pace, hrZone, power }
  detail?: CmePlannedStep[]; // Array of planned steps/intervals
  notes?: string;
  orderIndex?: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Represents a planned step/interval in a session.
 */
export interface CmePlannedStep {
  stepType: CmeStepType;
  duration?: number; // seconds
  intensity?: string | number;
  intensityMetric?: string;
  notes?: string;
  subSteps?: CmePlannedStep[]; // For advanced/cluster intervals (one level)
}

/**
 * Represents a completed user session (actual log).
 */
export interface CmeUserActualSession {
  cmeUserActualSessionId: number;
  userId: number;
  cmeProgramDaySessionId?: number;
  sessionDate: string; // ISO date
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Represents actual performance for each interval/step.
 */
export interface CmeSessionIntervalPerf {
  cmeSessionIntervalPerfId: number;
  cmeUserActualSessionId: number;
  stepNumber: number;
  stepType: CmeStepType;
  actualDuration?: number; // seconds
  actualDistance?: number;
  actualIntensity?: number;
  actualAvgSpeed?: number;
  actualActiveCalories?: number;
  actualAvgHeartRate?: number;
  cmeMetricId?: number;
  actualTempo?: string;
  actualRest?: number;
  detail?: CmeActualStep[]; // Array of actual sub-steps/intervals
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Represents an actual performed step (mirrors CmePlannedStep, but for actuals).
 */
export interface CmeActualStep {
  stepType: CmeStepType;
  duration?: number;
  intensity?: string | number;
  intensityMetric?: string;
  notes?: string;
  subSteps?: CmeActualStep[];
}

/**
 * Reference metric (e.g., Heart Rate, Power, etc.)
 */
export interface CmeMetric {
  cmeMetricId: number;
  metricName: string;
}

/**
 * Represents a metric value for an interval (e.g., HR, Power, etc.)
 */
export interface CmeIntervalMetric {
  metricId: number;
  cmeSessionIntervalPerfId: number;
  cmeMetricId: number;
  metricValue: number;
  metricUnit?: string;
  recordedOffsetSeconds?: number;
  source?: string;
  createdAt: string;
}
