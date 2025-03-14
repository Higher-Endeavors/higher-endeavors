export interface DailySummary {
  userId: string;
  calendarDate: string;
  steps: number;
  stepsGoal: number;
  distanceInMeters: number;
  activeKilocalories: number;
  bmrKilocalories: number;
  consumedKilocalories?: number;
  moderateIntensityMinutes: number;
  vigorousIntensityMinutes: number;
  floorsClimbed?: number;
  floorsClimbedGoal?: number;
  averageStressLevel?: number;
  maxStressLevel?: number;
  restingHeartRateInBeatsPerMinute?: number;
  maxHeartRateInBeatsPerMinute?: number;
  minHeartRateInBeatsPerMinute?: number;
  averageHeartRateInBeatsPerMinute?: number;
}

export interface SleepData {
  userId: string;
  startTimeInSeconds: number;
  durationInSeconds: number;
  validation: 'AUTO_VALID' | 'AUTO_NOT_VALID' | 'MANUAL_VALID' | 'MANUAL_NOT_VALID';
  timeOffsetInSeconds: number;
  unmeasurableSleepInSeconds?: number;
  deepSleepDurationInSeconds?: number;
  lightSleepDurationInSeconds?: number;
  remSleepDurationInSeconds?: number;
  awakeDurationInSeconds?: number;
}

export interface StressData {
  userId: string;
  startTimeInSeconds: number;
  durationInSeconds: number;
  averageStressLevel: number;
  maxStressLevel: number;
  stressLevelValues: Array<{
    startTimeInSeconds: number;
    value: number;
  }>;
}

export interface HeartRateData {
  userId: string;
  startTimeInSeconds: number;
  durationInSeconds: number;
  maxHeartRate: number;
  minHeartRate: number;
  averageHeartRate: number;
  restingHeartRate?: number;
  heartRateValues: Array<{
    startTimeInSeconds: number;
    value: number;
  }>;
}

export interface BodyCompData {
  userId: string;
  timestampInSeconds: number;
  weight: number;
  bodyFatPercentage?: number;
  bodyMassIndex?: number;
  bodyWaterPercentage?: number;
  boneMass?: number;
  muscleMass?: number;
}

export interface PulseOxData {
  userId: string;
  startTimeInSeconds: number;
  durationInSeconds: number;
  readings: Array<{
    startTimeInSeconds: number;
    value: number;
    onDemand: boolean;
  }>;
}

export interface RespirationData {
  userId: string;
  startTimeInSeconds: number;
  durationInSeconds: number;
  readings: Array<{
    startTimeInSeconds: number;
    value: number;
  }>;
} 