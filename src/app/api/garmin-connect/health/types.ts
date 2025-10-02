// TypeScript types for Garmin Health API data structures
// Based on Garmin Health API v1.2.0 documentation

import { z } from 'zod';

// Base interface for all health data notifications
export interface BaseHealthNotification {
  userId: string;
  summaryId: string;
}

// Blood Pressure Summary
export interface BloodPressureSummary extends BaseHealthNotification {
  measurementTimeInSeconds: number;
  measurementTimeOffsetInSeconds: number;
  systolic: number;
  diastolic: number;
  pulse: number;
  sourceType: 'MANUAL' | 'DEVICE';
}

// Body Composition Summary
export interface BodyCompositionSummary extends BaseHealthNotification {
  measurementTimeInSeconds: number;
  measurementTimeOffsetInSeconds: number;
  muscleMassInGrams?: number;
  boneMassInGrams?: number;
  bodyWaterInPercent?: number;
  bodyFatInPercent?: number;
  bodyMassIndex?: number;
  weightInGrams?: number;
}

// Heart Rate Variability (HRV) Summary
export interface HRVSummary extends BaseHealthNotification {
  calendarDate: string;
  startTimeInSeconds: number;
  durationInSeconds: number;
  startTimeOffsetInSeconds: number;
  lastNightAvg: number;
  lastNight5MinHigh: number;
  hrvValues: Record<string, number>;
}

// Pulse Ox Summary
export interface PulseOxSummary extends BaseHealthNotification {
  calendarDate: string;
  startTimeInSeconds: number;
  durationInSeconds: number;
  startTimeOffsetInSeconds: number;
  timeOffsetSpo2Values: Record<string, number>;
  onDemand: boolean;
}

// Respiration Summary
export interface RespirationSummary extends BaseHealthNotification {
  startTimeInSeconds: number;
  durationInSeconds: number;
  startTimeOffsetInSeconds: number;
  timeOffsetEpochToBreaths: Record<string, number>;
}

// Skin Temperature Summary
export interface SkinTemperatureSummary extends BaseHealthNotification {
  calendarDate: string;
  avgDeviationCelsius: number;
  durationInSeconds: number;
  startTimeInSeconds: number;
  startTimeOffsetInSeconds: number;
}

// Sleep Level Range
export interface SleepLevelRange {
  startTimeInSeconds: number;
  endTimeInSeconds: number;
}

// Sleep Levels Map
export interface SleepLevelsMap {
  deep?: SleepLevelRange[];
  light?: SleepLevelRange[];
  rem?: SleepLevelRange[];
  awake?: SleepLevelRange[];
}

// Sleep Score
export interface SleepScore {
  value?: number;
  qualifierKey?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}

// Sleep Scores Map
export interface SleepScoresMap {
  totalDuration?: SleepScore;
  stress?: SleepScore;
  awakeCount?: SleepScore;
  remPercentage?: SleepScore;
  restlessness?: SleepScore;
  lightPercentage?: SleepScore;
  deepPercentage?: SleepScore;
}

// Nap Information
export interface NapInfo {
  napDurationInSeconds: number;
  napStartTimeInSeconds: number;
  napValidation: 'MANUAL' | 'DEVICE';
  napOffsetInSeconds: number;
}

// Sleep Summary
export interface SleepSummary extends BaseHealthNotification {
  calendarDate: string;
  startTimeInSeconds: number;
  startTimeOffsetInSeconds: number;
  durationInSeconds: number;
  totalNapDurationInSeconds?: number;
  unmeasurableSleepInSeconds?: number;
  deepSleepDurationInSeconds?: number;
  lightSleepDurationInSeconds?: number;
  remSleepInSeconds?: number;
  awakeDurationInSeconds?: number;
  sleepLevelsMap?: SleepLevelsMap;
  validation: 'MANUAL' | 'DEVICE' | 'OFF_WRIST' | 'AUTO_TENTATIVE' | 'AUTO_FINAL' | 'AUTO_MANUAL' | 'ENHANCED_TENTATIVE' | 'ENHANCED_FINAL';
  timeOffsetSleepRespiration?: Record<string, number>;
  timeOffsetSleepSpo2?: Record<string, number>;
  overallSleepScore?: SleepScore;
  sleepScores?: SleepScoresMap;
  naps?: NapInfo[];
}

// Body Battery Activity Event
export interface BodyBatteryActivityEvent {
  eventType: 'SLEEP' | 'RECOVERY' | 'NAP' | 'ACTIVITY' | 'STRESS';
  eventStartTimeInSeconds: number;
  eventStartTimeOffsetInSeconds: number;
  duration: number;
  bodyBatteryImpact: number;
}

// Body Battery Dynamic Feedback Event
export interface BodyBatteryDynamicFeedbackEvent {
  eventStartTimeInSeconds: number;
  bodyBatteryLevel: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH';
}

// Stress Details Summary
export interface StressDetailsSummary extends BaseHealthNotification {
  calendarDate: string;
  startTimeInSeconds: number;
  startTimeOffsetInSeconds: number;
  durationInSeconds: number;
  bodyBatteryChargedValue?: number;
  bodyBatteryDrainedValue?: number;
  timeOffsetStressLevelValues: Record<string, number>;
  timeOffsetBodyBatteryValues?: Record<string, number>;
  bodyBatteryDynamicFeedbackEvent?: BodyBatteryDynamicFeedbackEvent;
  bodyBatteryActivityEvents?: BodyBatteryActivityEvent[];
}

// Daily Summary
export interface DailySummary extends BaseHealthNotification {
  calendarDate: string;
  startTimeInSeconds: number;
  startTimeOffsetInSeconds: number;
  activityType: string;
  durationInSeconds: number;
  steps?: number;
  pushes?: number;
  distanceInMeters?: number;
  pushDistanceInMeters?: number;
  activeTimeInSeconds?: number;
  activeKilocalories?: number;
  bmrKilocalories?: number;
  moderateIntensityDurationInSeconds?: number;
  vigorousIntensityDurationInSeconds?: number;
  floorsClimbed?: number;
  minHeartRateInBeatsPerMinute?: number;
  averageHeartRateInBeatsPerMinute?: number;
  maxHeartRateInBeatsPerMinute?: number;
  restingHeartRateInBeatsPerMinute?: number;
  timeOffsetHeartRateSamples?: Record<string, number>;
  averageStressLevel?: number;
  maxStressLevel?: number;
  stressDurationInSeconds?: number;
  restStressDurationInSeconds?: number;
  activityStressDurationInSeconds?: number;
  lowStressDurationInSeconds?: number;
  mediumStressDurationInSeconds?: number;
  highStressDurationInSeconds?: number;
  stressQualifier?: string;
  stepsGoal?: number;
  pushesGoal?: number;
  intensityDurationGoalInSeconds?: number;
  floorsClimbedGoal?: number;
}

// Epoch Summary
export interface EpochSummary extends BaseHealthNotification {
  startTimeInSeconds: number;
  startTimeOffsetInSeconds: number;
  activityType: string;
  durationInSeconds: number;
  activeTimeInSeconds?: number;
  steps?: number;
  pushes?: number;
  distanceInMeters?: number;
  pushDistanceInMeters?: number;
  activeKilocalories?: number;
  met?: number;
  intensity?: string;
  meanMotionIntensity?: number;
  maxMotionIntensity?: number;
}

// Health Snapshot Summary
export interface HealthSnapshotSummary extends BaseHealthNotification {
  calendarDate: string;
  startTimeInSeconds: number;
  durationInSeconds: number;
  startTimeOffsetInSeconds: number;
  summaries: HealthSnapshotSubSummary[];
}

// Health Snapshot Sub Summary
export interface HealthSnapshotSubSummary {
  summaryType: 'heart_rate' | 'stress' | 'spo2' | 'respiration' | 'rmssd_hrv' | 'sdrr_hrv';
  minValue?: number;
  maxValue?: number;
  avgValue?: number;
  epochSummaries?: Record<string, number>;
}

// User Metrics Summary
export interface UserMetricsSummary extends BaseHealthNotification {
  calendarDate: string;
  vo2Max?: number;
  vo2MaxCycling?: number;
  enhanced?: boolean;
  fitnessAge?: number;
}

// Union type for all health data types
export type HealthData = 
  | BloodPressureSummary
  | BodyCompositionSummary
  | HRVSummary
  | PulseOxSummary
  | RespirationSummary
  | SkinTemperatureSummary
  | SleepSummary
  | StressDetailsSummary
  | DailySummary
  | EpochSummary
  | HealthSnapshotSummary
  | UserMetricsSummary;

// Type guards for runtime type checking
export function isBloodPressureSummary(data: any): data is BloodPressureSummary {
  return data && typeof data.systolic === 'number' && typeof data.diastolic === 'number';
}

export function isBodyCompositionSummary(data: any): data is BodyCompositionSummary {
  return data && typeof data.measurementTimeInSeconds === 'number' && 
         (data.weightInGrams !== undefined || data.bodyFatInPercent !== undefined);
}

export function isHRVSummary(data: any): data is HRVSummary {
  return data && typeof data.lastNightAvg === 'number' && typeof data.hrvValues === 'object';
}

export function isPulseOxSummary(data: any): data is PulseOxSummary {
  return data && typeof data.timeOffsetSpo2Values === 'object' && typeof data.onDemand === 'boolean';
}

export function isRespirationSummary(data: any): data is RespirationSummary {
  return data && typeof data.timeOffsetEpochToBreaths === 'object';
}

export function isSkinTemperatureSummary(data: any): data is SkinTemperatureSummary {
  return data && typeof data.avgDeviationCelsius === 'number';
}

export function isSleepSummary(data: any): data is SleepSummary {
  return data && typeof data.durationInSeconds === 'number' && 
         (data.deepSleepDurationInSeconds !== undefined || data.validation !== undefined);
}

export function isStressDetailsSummary(data: any): data is StressDetailsSummary {
  return data && typeof data.timeOffsetStressLevelValues === 'object';
}

export function isDailySummary(data: any): data is DailySummary {
  return data && typeof data.calendarDate === 'string' && typeof data.activityType === 'string' && 
         typeof data.durationInSeconds === 'number';
}

export function isEpochSummary(data: any): data is EpochSummary {
  return data && typeof data.activityType === 'string' && typeof data.durationInSeconds === 'number' &&
         typeof data.startTimeInSeconds === 'number';
}

export function isHealthSnapshotSummary(data: any): data is HealthSnapshotSummary {
  return data && Array.isArray(data.summaries) && typeof data.calendarDate === 'string';
}

export function isUserMetricsSummary(data: any): data is UserMetricsSummary {
  return data && typeof data.calendarDate === 'string' && 
         (data.vo2Max !== undefined || data.fitnessAge !== undefined);
}

// Helper function to determine data type from the data structure
export function getHealthDataType(data: any): string | null {
  if (isBloodPressureSummary(data)) return 'bloodPressures';
  if (isBodyCompositionSummary(data)) return 'bodyComps';
  if (isHRVSummary(data)) return 'hrv';
  if (isPulseOxSummary(data)) return 'pulseox';
  if (isRespirationSummary(data)) return 'respiration';
  if (isSkinTemperatureSummary(data)) return 'skinTemp';
  if (isSleepSummary(data)) return 'sleeps';
  if (isStressDetailsSummary(data)) return 'stressDetails';
  if (isDailySummary(data)) return 'dailies';
  if (isEpochSummary(data)) return 'epochs';
  if (isHealthSnapshotSummary(data)) return 'healthSnapshot';
  if (isUserMetricsSummary(data)) return 'userMetrics';
  return null;
}

// Zod schemas for validation
export const BloodPressureSummarySchema = z.object({
  userId: z.string(),
  summaryId: z.string(),
  measurementTimeInSeconds: z.number(),
  measurementTimeOffsetInSeconds: z.number(),
  systolic: z.number(),
  diastolic: z.number(),
  pulse: z.number(),
  sourceType: z.enum(['MANUAL', 'DEVICE']),
});

export const BodyCompositionSummarySchema = z.object({
  userId: z.string(),
  summaryId: z.string(),
  measurementTimeInSeconds: z.number(),
  measurementTimeOffsetInSeconds: z.number(),
  muscleMassInGrams: z.number().optional(),
  boneMassInGrams: z.number().optional(),
  bodyWaterInPercent: z.number().optional(),
  bodyFatInPercent: z.number().optional(),
  bodyMassIndex: z.number().optional(),
  weightInGrams: z.number().optional(),
});

export const HRVSummarySchema = z.object({
  userId: z.string(),
  summaryId: z.string(),
  calendarDate: z.string().optional(),
  startTimeInSeconds: z.number(),
  durationInSeconds: z.number(),
  startTimeOffsetInSeconds: z.number(),
  lastNightAvg: z.number().optional(),
  lastNight5MinHigh: z.number().optional(),
  hrvValues: z.record(z.string(), z.number()).optional(),
});

export const PulseOxSummarySchema = z.object({
  userId: z.string(),
  summaryId: z.string(),
  calendarDate: z.string().optional(),
  startTimeInSeconds: z.number(),
  durationInSeconds: z.number(),
  startTimeOffsetInSeconds: z.number(),
  timeOffsetSpo2Values: z.record(z.string(), z.number()).optional(),
  onDemand: z.boolean().optional(),
});

export const RespirationSummarySchema = z.object({
  userId: z.string(),
  summaryId: z.string(),
  startTimeInSeconds: z.number(),
  durationInSeconds: z.number(),
  startTimeOffsetInSeconds: z.number(),
  timeOffsetEpochToBreaths: z.record(z.string(), z.number()).optional(),
});

export const SkinTemperatureSummarySchema = z.object({
  userId: z.string(),
  summaryId: z.string(),
  calendarDate: z.string().optional(),
  avgDeviationCelsius: z.number().optional(),
  durationInSeconds: z.number(),
  startTimeInSeconds: z.number(),
  startTimeOffsetInSeconds: z.number(),
});

export const SleepSummarySchema = z.object({
  userId: z.string(),
  summaryId: z.string(),
  calendarDate: z.string().optional(),
  startTimeInSeconds: z.number(),
  startTimeOffsetInSeconds: z.number(),
  durationInSeconds: z.number(),
  totalNapDurationInSeconds: z.number().optional(),
  unmeasurableSleepInSeconds: z.number().optional(),
  deepSleepDurationInSeconds: z.number().optional(),
  lightSleepDurationInSeconds: z.number().optional(),
  remSleepInSeconds: z.number().optional(),
  awakeDurationInSeconds: z.number().optional(),
  sleepLevelsMap: z.record(z.string(), z.array(z.object({
    startTimeInSeconds: z.number(),
    endTimeInSeconds: z.number(),
  }))).optional(),
  validation: z.enum(['MANUAL', 'DEVICE', 'OFF_WRIST', 'AUTO_TENTATIVE', 'AUTO_FINAL', 'AUTO_MANUAL', 'ENHANCED_TENTATIVE', 'ENHANCED_FINAL']).optional(),
  timeOffsetSleepRespiration: z.record(z.string(), z.number()).optional(),
  timeOffsetSleepSpo2: z.record(z.string(), z.number()).optional(),
  overallSleepScore: z.object({
    value: z.number(),
    qualifierKey: z.string(),
  }).optional(),
  sleepScores: z.record(z.string(), z.object({
    qualifierKey: z.string(),
  })).optional(),
  naps: z.array(z.object({
    napDurationInSeconds: z.number(),
    napStartTimeInSeconds: z.number(),
    napValidation: z.string(),
    napOffsetInSeconds: z.number(),
  })).optional(),
});

export const StressDetailsSummarySchema = z.object({
  userId: z.string(),
  summaryId: z.string(),
  startTimeInSeconds: z.number(),
  startTimeOffsetInSeconds: z.number(),
  durationInSeconds: z.number(),
  calendarDate: z.string().optional(),
  bodyBatteryChargedValue: z.number().optional(),
  bodyBatteryDrainedValue: z.number().optional(),
  timeOffsetStressLevelValues: z.record(z.string(), z.number()).optional(),
  timeOffsetBodyBatteryValues: z.record(z.string(), z.number()).optional(),
  bodyBatteryDynamicFeedbackEvent: z.object({
    eventStartTimeInSeconds: z.number(),
    bodyBatteryLevel: z.string(),
  }).optional(),
  bodyBatteryActivityEventList: z.array(z.object({
    eventType: z.string(),
    eventStartTimeInSeconds: z.number(),
    eventStartTimeOffsetInSeconds: z.number(),
    duration: z.number(),
    bodyBatteryImpact: z.number(),
  })).optional(),
});

export const DailySummarySchema = z.object({
  userId: z.string(),
  summaryId: z.string(),
  calendarDate: z.string(),
  startTimeInSeconds: z.number(),
  startTimeOffsetInSeconds: z.number(),
  activityType: z.string(),
  durationInSeconds: z.number(),
  steps: z.number().optional(),
  pushes: z.number().optional(),
  distanceInMeters: z.number().optional(),
  pushDistanceInMeters: z.number().optional(),
  activeTimeInSeconds: z.number().optional(),
  activeKilocalories: z.number().optional(),
  bmrKilocalories: z.number().optional(),
  moderateIntensityDurationInSeconds: z.number().optional(),
  vigorousIntensityDurationInSeconds: z.number().optional(),
  floorsClimbed: z.number().optional(),
  minHeartRateInBeatsPerMinute: z.number().optional(),
  averageHeartRateInBeatsPerMinute: z.number().optional(),
  maxHeartRateInBeatsPerMinute: z.number().optional(),
  restingHeartRateInBeatsPerMinute: z.number().optional(),
  timeOffsetHeartRateSamples: z.record(z.string(), z.number()).optional(),
  averageStressLevel: z.number().optional(),
  maxStressLevel: z.number().optional(),
  stressDurationInSeconds: z.number().optional(),
  restStressDurationInSeconds: z.number().optional(),
  activityStressDurationInSeconds: z.number().optional(),
  lowStressDurationInSeconds: z.number().optional(),
  mediumStressDurationInSeconds: z.number().optional(),
  highStressDurationInSeconds: z.number().optional(),
  stressQualifier: z.string().optional(),
  stepsGoal: z.number().optional(),
  pushesGoal: z.number().optional(),
  intensityDurationGoalInSeconds: z.number().optional(),
  floorsClimbedGoal: z.number().optional(),
});

export const EpochSummarySchema = z.object({
  userId: z.string(),
  summaryId: z.string(),
  startTimeInSeconds: z.number(),
  startTimeOffsetInSeconds: z.number(),
  activityType: z.string(),
  durationInSeconds: z.number(),
  activeTimeInSeconds: z.number().optional(),
  steps: z.number().optional(),
  pushes: z.number().optional(),
  distanceInMeters: z.number().optional(),
  pushDistanceInMeters: z.number().optional(),
  activeKilocalories: z.number().optional(),
  met: z.number().optional(),
  intensity: z.string().optional(),
  meanMotionIntensity: z.number().optional(),
  maxMotionIntensity: z.number().optional(),
});

export const HealthSnapshotSubSummarySchema = z.object({
  summaryType: z.enum(['heart_rate', 'stress', 'spo2', 'respiration', 'rmssd_hrv', 'sdrr_hrv']),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  avgValue: z.number().optional(),
  epochSummaries: z.record(z.string(), z.number()).optional(),
});

export const HealthSnapshotSummarySchema = z.object({
  userId: z.string(),
  summaryId: z.string(),
  calendarDate: z.string(),
  startTimeInSeconds: z.number(),
  durationInSeconds: z.number(),
  startTimeOffsetInSeconds: z.number(),
  summaries: z.array(HealthSnapshotSubSummarySchema),
});

export const UserMetricsSummarySchema = z.object({
  userId: z.string(),
  summaryId: z.string(),
  calendarDate: z.string(),
  vo2Max: z.number().optional(),
  vo2MaxCycling: z.number().optional(),
  enhanced: z.boolean().optional(),
  fitnessAge: z.number().optional(),
});

export const HealthWebhookPayloadSchema = z.object({
  deregistrations: z.array(z.object({
    userId: z.string(),
  })).optional(),
  userPermissions: z.array(z.object({
    userId: z.string(),
    permissions: z.array(z.string()),
  })).optional(),
  bloodPressures: z.array(BloodPressureSummarySchema).optional(),
  bodyComps: z.array(BodyCompositionSummarySchema).optional(),
  hrv: z.array(HRVSummarySchema).optional(),
  pulseox: z.array(PulseOxSummarySchema).optional(),
  respiration: z.array(RespirationSummarySchema).optional(),
  skinTemp: z.array(SkinTemperatureSummarySchema).optional(),
  sleeps: z.array(SleepSummarySchema).optional(),
  stressDetails: z.array(StressDetailsSummarySchema).optional(),
  dailies: z.array(DailySummarySchema).optional(),
  epochs: z.array(EpochSummarySchema).optional(),
  healthSnapshot: z.array(HealthSnapshotSummarySchema).optional(),
  userMetrics: z.array(UserMetricsSummarySchema).optional(),
});
