// Garmin Activity API Types
// Based on Garmin Activity API v1.2.2 specification
// Unified interface for both Activity Details and Manually Updated Activities

import { z } from 'zod';

// Base interface for all activity data
export interface ActivityData {
  userId: string;
  summaryId: string;
  activityId?: number; // Optional for manually updated activities
  startTimeInSeconds: number;
  startTimeOffsetInSeconds: number;
  activityName?: string;
  activityType: string;
  durationInSeconds: number;
  averageBikeCadenceInRoundsPerMinute?: number;
  averageHeartRateInBeatsPerMinute?: number;
  averageRunCadenceInStepsPerMinute?: number;
  averagePushCadenceInPushesPerMinute?: number;
  averageSpeedInMetersPerSecond?: number;
  averageSwimCadenceInStrokesPerMinute?: number;
  averagePaceInMinutesPerKilometer?: number;
  activeKilocalories?: number;
  deviceName?: string;
  distanceInMeters?: number;
  maxBikeCadenceInRoundsPerMinute?: number;
  maxHeartRateInBeatsPerMinute?: number;
  maxPaceInMinutesPerKilometer?: number;
  maxRunCadenceInStepsPerMinute?: number;
  maxPushCadenceInPushesPerMinute?: number;
  maxSpeedInMetersPerSecond?: number;
  numberOfActiveLengths?: number;
  startingLatitudeInDegree?: number;
  startingLongitudeInDegree?: number;
  steps?: number;
  pushes?: number;
  totalElevationGainInMeters?: number;
  totalElevationLossInMeters?: number;
  isParent?: boolean;
  parentSummaryId?: string | number;
  manual: boolean;
  samples?: ActivitySample[];
  laps?: ActivityLap[];
}

// Activity Sample interface (for detailed activity data)
export interface ActivitySample {
  startTimeInSeconds: number;
  latitudeInDegree?: number;
  longitudeInDegree?: number;
  elevationInMeters?: number;
  airTemperatureCelcius?: number;
  heartRate?: number;
  speedMetersPerSecond?: number;
  stepsPerMinute?: number;
  totalDistanceInMeters?: number;
  timerDurationInSeconds?: number;
  clockDurationInSeconds?: number;
  movingDurationInSeconds?: number;
  powerInWatts?: number;
  bikeCadenceInRPM?: number;
  directWheelchairCadence?: number;
  swimCadenceInStrokesPerMinute?: number;
}

// Activity Lap interface (for detailed activity data)
export interface ActivityLap {
  startTimeInSeconds: number;
}

// Activity Details interface (for webhook payload)
export interface ActivityDetails {
  userId: string;
  summaryId: string;
  summary: {
    activityId?: number;
    startTimeInSeconds: number;
    startTimeOffsetInSeconds: number;
    activityName?: string;
    activityType: string;
    durationInSeconds: number;
    averageBikeCadenceInRoundsPerMinute?: number;
    averageHeartRateInBeatsPerMinute?: number;
    averageRunCadenceInStepsPerMinute?: number;
    averagePushCadenceInPushesPerMinute?: number;
    averageSpeedInMetersPerSecond?: number;
    averageSwimCadenceInStrokesPerMinute?: number;
    averagePaceInMinutesPerKilometer?: number;
    activeKilocalories?: number;
    deviceName?: string;
    distanceInMeters?: number;
    maxBikeCadenceInRoundsPerMinute?: number;
    maxHeartRateInBeatsPerMinute?: number;
    maxPaceInMinutesPerKilometer?: number;
    maxRunCadenceInStepsPerMinute?: number;
    maxPushCadenceInPushesPerMinute?: number;
    maxSpeedInMetersPerSecond?: number;
    numberOfActiveLengths?: number;
    startingLatitudeInDegree?: number;
    startingLongitudeInDegree?: number;
    steps?: number;
    pushes?: number;
    totalElevationGainInMeters?: number;
    totalElevationLossInMeters?: number;
    isParent?: boolean;
    parentSummaryId?: string;
    manual?: boolean;
  };
  samples?: ActivitySample[];
  laps?: ActivityLap[];
}

// Manually Updated Activity interface (for webhook payload)
export interface ManuallyUpdatedActivity {
  userId: string;
  summaryId: string;
  startTimeInSeconds: number;
  startTimeOffsetInSeconds: number;
  activityType: string;
  durationInSeconds: number;
  averageBikeCadenceInRoundsPerMinute?: number;
  averageHeartRateInBeatsPerMinute?: number;
  averageRunCadenceInStepsPerMinute?: number;
  averageSpeedInMetersPerSecond?: number;
  averagePushCadenceInPushesPerMinute?: number;
  averageSwimCadenceInStrokesPerMinute?: number;
  averagePaceInMinutesPerKilometer?: number;
  activeKilocalories?: number;
  deviceName?: string;
  pushes?: number;
  distanceInMeters?: number;
  maxBikeCadenceInRoundsPerMinute?: number;
  maxHeartRateInBeatsPerMinute?: number;
  maxPaceInMinutesPerKilometer?: number;
  maxRunCadenceInStepsPerMinute?: number;
  maxPushCadenceInPushesPerMinute?: number;
  maxSpeedInMetersPerSecond?: number;
  numberOfActiveLengths?: number;
  startingLatitudeInDegree?: number;
  startingLongitudeInDegree?: number;
  totalElevationGainInMeters?: number;
  totalElevationLossInMeters?: number;
  isParent?: boolean;
  parentSummaryId?: number;
  manual: boolean;
}

// Webhook payload interfaces
export interface ActivityWebhookPayload {
  activityDetails?: ActivityDetails[];
  manuallyUpdatedActivities?: ManuallyUpdatedActivity[];
  deregistrations?: Array<{
    userId: string;
  }>;
  userPermissions?: Array<{
    userId: string;
    permissions: string[];
  }>;
}

// Type guards for validation
export function isActivityDetails(data: any): data is ActivityDetails {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.userId === 'string' &&
    typeof data.summaryId === 'string' &&
    typeof data.summary === 'object' &&
    data.summary !== null &&
    typeof data.summary.activityId === 'number' &&
    typeof data.summary.startTimeInSeconds === 'number' &&
    typeof data.summary.activityType === 'string' &&
    typeof data.summary.durationInSeconds === 'number'
  );
}

export function isManuallyUpdatedActivity(data: any): data is ManuallyUpdatedActivity {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.userId === 'string' &&
    typeof data.summaryId === 'string' &&
    typeof data.startTimeInSeconds === 'number' &&
    typeof data.activityType === 'string' &&
    typeof data.durationInSeconds === 'number' &&
    data.manual === true
  );
}

export function isActivitySample(data: any): data is ActivitySample {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.startTimeInSeconds === 'number'
  );
}

export function isActivityLap(data: any): data is ActivityLap {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.startTimeInSeconds === 'number'
  );
}

// Helper function to get activity data type
export function getActivityDataType(data: any): string | null {
  if (isActivityDetails(data)) {
    return 'activityDetails';
  }
  if (isManuallyUpdatedActivity(data)) {
    return 'manuallyUpdatedActivities';
  }
  return null;
}

// Helper function to convert webhook data to unified ActivityData format
export function convertToUnifiedActivityData(data: ActivityDetails | ManuallyUpdatedActivity): ActivityData {
  if (isActivityDetails(data)) {
    return {
      userId: data.userId,
      summaryId: data.summaryId,
      activityId: data.summary.activityId,
      startTimeInSeconds: data.summary.startTimeInSeconds,
      startTimeOffsetInSeconds: data.summary.startTimeOffsetInSeconds,
      activityName: data.summary.activityName,
      activityType: data.summary.activityType,
      durationInSeconds: data.summary.durationInSeconds,
      averageBikeCadenceInRoundsPerMinute: data.summary.averageBikeCadenceInRoundsPerMinute,
      averageHeartRateInBeatsPerMinute: data.summary.averageHeartRateInBeatsPerMinute,
      averageRunCadenceInStepsPerMinute: data.summary.averageRunCadenceInStepsPerMinute,
      averagePushCadenceInPushesPerMinute: data.summary.averagePushCadenceInPushesPerMinute,
      averageSpeedInMetersPerSecond: data.summary.averageSpeedInMetersPerSecond,
      averageSwimCadenceInStrokesPerMinute: data.summary.averageSwimCadenceInStrokesPerMinute,
      averagePaceInMinutesPerKilometer: data.summary.averagePaceInMinutesPerKilometer,
      activeKilocalories: data.summary.activeKilocalories,
      deviceName: data.summary.deviceName,
      distanceInMeters: data.summary.distanceInMeters,
      maxBikeCadenceInRoundsPerMinute: data.summary.maxBikeCadenceInRoundsPerMinute,
      maxHeartRateInBeatsPerMinute: data.summary.maxHeartRateInBeatsPerMinute,
      maxPaceInMinutesPerKilometer: data.summary.maxPaceInMinutesPerKilometer,
      maxRunCadenceInStepsPerMinute: data.summary.maxRunCadenceInStepsPerMinute,
      maxPushCadenceInPushesPerMinute: data.summary.maxPushCadenceInPushesPerMinute,
      maxSpeedInMetersPerSecond: data.summary.maxSpeedInMetersPerSecond,
      numberOfActiveLengths: data.summary.numberOfActiveLengths,
      startingLatitudeInDegree: data.summary.startingLatitudeInDegree,
      startingLongitudeInDegree: data.summary.startingLongitudeInDegree,
      steps: data.summary.steps,
      pushes: data.summary.pushes,
      totalElevationGainInMeters: data.summary.totalElevationGainInMeters,
      totalElevationLossInMeters: data.summary.totalElevationLossInMeters,
      isParent: data.summary.isParent,
      parentSummaryId: data.summary.parentSummaryId,
      manual: data.summary.manual || false,
      samples: data.samples,
      laps: data.laps
    };
  } else {
    return {
      userId: data.userId,
      summaryId: data.summaryId,
      activityId: undefined,
      startTimeInSeconds: data.startTimeInSeconds,
      startTimeOffsetInSeconds: data.startTimeOffsetInSeconds,
      activityName: undefined,
      activityType: data.activityType,
      durationInSeconds: data.durationInSeconds,
      averageBikeCadenceInRoundsPerMinute: data.averageBikeCadenceInRoundsPerMinute,
      averageHeartRateInBeatsPerMinute: data.averageHeartRateInBeatsPerMinute,
      averageRunCadenceInStepsPerMinute: data.averageRunCadenceInStepsPerMinute,
      averagePushCadenceInPushesPerMinute: data.averagePushCadenceInPushesPerMinute,
      averageSpeedInMetersPerSecond: data.averageSpeedInMetersPerSecond,
      averageSwimCadenceInStrokesPerMinute: data.averageSwimCadenceInStrokesPerMinute,
      averagePaceInMinutesPerKilometer: data.averagePaceInMinutesPerKilometer,
      activeKilocalories: data.activeKilocalories,
      deviceName: data.deviceName,
      distanceInMeters: data.distanceInMeters,
      maxBikeCadenceInRoundsPerMinute: data.maxBikeCadenceInRoundsPerMinute,
      maxHeartRateInBeatsPerMinute: data.maxHeartRateInBeatsPerMinute,
      maxPaceInMinutesPerKilometer: data.maxPaceInMinutesPerKilometer,
      maxRunCadenceInStepsPerMinute: data.maxRunCadenceInStepsPerMinute,
      maxPushCadenceInPushesPerMinute: data.maxPushCadenceInPushesPerMinute,
      maxSpeedInMetersPerSecond: data.maxSpeedInMetersPerSecond,
      numberOfActiveLengths: data.numberOfActiveLengths,
      startingLatitudeInDegree: data.startingLatitudeInDegree,
      startingLongitudeInDegree: data.startingLongitudeInDegree,
      steps: undefined,
      pushes: data.pushes,
      totalElevationGainInMeters: data.totalElevationGainInMeters,
      totalElevationLossInMeters: data.totalElevationLossInMeters,
      isParent: data.isParent,
      parentSummaryId: data.parentSummaryId,
      manual: data.manual,
      samples: undefined,
      laps: undefined
    };
  }
}

// Zod schemas for validation
export const ActivitySampleSchema = z.object({
  startTimeInSeconds: z.number(),
  latitudeInDegree: z.number().optional(),
  longitudeInDegree: z.number().optional(),
  elevationInMeters: z.number().optional(),
  airTemperatureCelcius: z.number().optional(),
  heartRate: z.number().optional(),
  speedMetersPerSecond: z.number().optional(),
  stepsPerMinute: z.number().optional(),
  totalDistanceInMeters: z.number().optional(),
  timerDurationInSeconds: z.number().optional(),
  clockDurationInSeconds: z.number().optional(),
  movingDurationInSeconds: z.number().optional(),
  powerInWatts: z.number().optional(),
  bikeCadenceInRPM: z.number().optional(),
  directWheelchairCadence: z.number().optional(),
  swimCadenceInStrokesPerMinute: z.number().optional(),
});

export const ActivityLapSchema = z.object({
  startTimeInSeconds: z.number(),
});

export const ActivityDetailsSchema = z.object({
  userId: z.string(),
  summaryId: z.string(),
  summary: z.object({
    activityId: z.number().optional(),
    startTimeInSeconds: z.number(),
    startTimeOffsetInSeconds: z.number(),
    activityName: z.string().optional(),
    activityType: z.string(),
    durationInSeconds: z.number(),
    averageBikeCadenceInRoundsPerMinute: z.number().optional(),
    averageHeartRateInBeatsPerMinute: z.number().optional(),
    averageRunCadenceInStepsPerMinute: z.number().optional(),
    averagePushCadenceInPushesPerMinute: z.number().optional(),
    averageSpeedInMetersPerSecond: z.number().optional(),
    averageSwimCadenceInStrokesPerMinute: z.number().optional(),
    averagePaceInMinutesPerKilometer: z.number().optional(),
    activeKilocalories: z.number().optional(),
    deviceName: z.string().optional(),
    distanceInMeters: z.number().optional(),
    maxBikeCadenceInRoundsPerMinute: z.number().optional(),
    maxHeartRateInBeatsPerMinute: z.number().optional(),
    maxPaceInMinutesPerKilometer: z.number().optional(),
    maxRunCadenceInStepsPerMinute: z.number().optional(),
    maxPushCadenceInPushesPerMinute: z.number().optional(),
    maxSpeedInMetersPerSecond: z.number().optional(),
    numberOfActiveLengths: z.number().optional(),
    startingLatitudeInDegree: z.number().optional(),
    startingLongitudeInDegree: z.number().optional(),
    steps: z.number().optional(),
    pushes: z.number().optional(),
    totalElevationGainInMeters: z.number().optional(),
    totalElevationLossInMeters: z.number().optional(),
    isParent: z.boolean().optional(),
    parentSummaryId: z.string().optional(),
    manual: z.boolean().optional(),
  }),
  samples: z.array(ActivitySampleSchema).optional(),
  laps: z.array(ActivityLapSchema).optional(),
});

export const ManuallyUpdatedActivitySchema = z.object({
  userId: z.string(),
  summaryId: z.string(),
  startTimeInSeconds: z.number(),
  startTimeOffsetInSeconds: z.number(),
  activityType: z.string(),
  durationInSeconds: z.number(),
  averageBikeCadenceInRoundsPerMinute: z.number().optional(),
  averageHeartRateInBeatsPerMinute: z.number().optional(),
  averageRunCadenceInStepsPerMinute: z.number().optional(),
  averageSpeedInMetersPerSecond: z.number().optional(),
  averagePushCadenceInPushesPerMinute: z.number().optional(),
  averageSwimCadenceInStrokesPerMinute: z.number().optional(),
  averagePaceInMinutesPerKilometer: z.number().optional(),
  activeKilocalories: z.number().optional(),
  deviceName: z.string().optional(),
  pushes: z.number().optional(),
  distanceInMeters: z.number().optional(),
  maxBikeCadenceInRoundsPerMinute: z.number().optional(),
  maxHeartRateInBeatsPerMinute: z.number().optional(),
  maxPaceInMinutesPerKilometer: z.number().optional(),
  maxRunCadenceInStepsPerMinute: z.number().optional(),
  maxPushCadenceInPushesPerMinute: z.number().optional(),
  maxSpeedInMetersPerSecond: z.number().optional(),
  numberOfActiveLengths: z.number().optional(),
  startingLatitudeInDegree: z.number().optional(),
  startingLongitudeInDegree: z.number().optional(),
  totalElevationGainInMeters: z.number().optional(),
  totalElevationLossInMeters: z.number().optional(),
  isParent: z.boolean().optional(),
  parentSummaryId: z.number().optional(),
  manual: z.literal(true),
});

export const ActivityWebhookPayloadSchema = z.object({
  activityDetails: z.array(ActivityDetailsSchema).optional(),
  manuallyUpdatedActivities: z.array(ManuallyUpdatedActivitySchema).optional(),
  deregistrations: z.array(z.object({
    userId: z.string(),
  })).optional(),
  userPermissions: z.array(z.object({
    userId: z.string(),
    permissions: z.array(z.string()),
  })).optional(),
});

// Activity types enum for validation
export const ACTIVITY_TYPES = [
  'RUNNING',
  'INDOOR_RUNNING',
  'OBSTACLE_RUN',
  'STREET_RUNNING',
  'TRACK_RUNNING',
  'TRAIL_RUNNING',
  'TREADMILL_RUNNING',
  'ULTRA_RUN',
  'VIRTUAL_RUN',
  'CYCLING',
  'BMX',
  'CYCLOCROSS',
  'DOWNHILL_BIKING',
  'E_BIKE_FITNESS',
  'E_BIKE_MOUNTAIN',
  'E_ENDURO_MTB',
  'ENDURO_MTB',
  'GRAVEL_CYCLING',
  'INDOOR_CYCLING',
  'MOUNTAIN_BIKING',
  'RECUMBENT_CYCLING',
  'ROAD_BIKING',
  'TRACK_CYCLING',
  'VIRTUAL_RIDE',
  'HANDCYCLING',
  'INDOOR_HANDCYCLING',
  'FITNESS_EQUIPMENT',
  'BOULDERING',
  'ELLIPTICAL',
  'INDOOR_CARDIO',
  'HIIT',
  'INDOOR_CLIMBING',
  'INDOOR_ROWING',
  'MOBILITY',
  'PILATES',
  'STAIR_CLIMBING',
  'STRENGTH_TRAINING',
  'YOGA',
  'MEDITATION',
  'SWIMMING',
  'LAP_SWIMMING',
  'OPEN_WATER_SWIMMING',
  'WALKING',
  'CASUAL_WALKING',
  'SPEED_WALKING',
  'HIKING',
  'RUCKING',
  'WINTER_SPORTS',
  'BACKCOUNTRY_SNOWBOARDING',
  'BACKCOUNTRY_SKIING',
  'CROSS_COUNTRY_SKIING_WS',
  'RESORT_SKIING',
  'SNOWBOARDING_WS',
  'RESORT_SKIING_SNOWBOARDING_WS',
  'SKATE_SKIING_WS',
  'SKATING_WS',
  'SNOW_SHOE_WS',
  'SNOWMOBILING_WS',
  'WATER_SPORTS',
  'BOATING_V2',
  'BOATING',
  'FISHING_V2',
  'FISHING',
  'KAYAKING_V2',
  'KAYAKING',
  'KITEBOARDING_V2',
  'KITEBOARDING',
  'OFFSHORE_GRINDING_V2',
  'OFFSHORE_GRINDING',
  'ONSHORE_GRINDING_V2',
  'ONSHORE_GRINDING',
  'PADDLING_V2',
  'PADDLING',
  'ROWING_V2',
  'ROWING',
  'SAILING_V2',
  'SAILING',
  'SNORKELING',
  'STAND_UP_PADDLEBOARDING_V2',
  'STAND_UP_PADDLEBOARDING',
  'SURFING_V2',
  'SURFING',
  'WAKEBOARDING_V2',
  'WAKEBOARDING',
  'WATERSKIING',
  'WHITEWATER_RAFTING_V2',
  'WHITEWATER_RAFTING',
  'WINDSURFING_V2',
  'WINDSURFING',
  'TRANSITION_V2',
  'BIKE_TO_RUN_TRANSITION_V2',
  'BIKE_TO_RUN_TRANSITION',
  'RUN_TO_BIKE_TRANSITION_V2',
  'RUN_TO_BIKE_TRANSITION',
  'SWIM_TO_BIKE_TRANSITION_V2',
  'SWIM_TO_BIKE_TRANSITION',
  'TEAM_SPORTS',
  'AMERICAN_FOOTBALL',
  'BASEBALL',
  'BASKETBALL',
  'CRICKET',
  'FIELD_HOCKEY',
  'ICE_HOCKEY',
  'LACROSSE',
  'RUGBY',
  'SOCCER',
  'SOFTBALL',
  'ULTIMATE_DISC',
  'VOLLEYBALL',
  'RACKET_SPORTS',
  'BADMINTON',
  'PADDELBALL',
  'PICKLEBALL',
  'PLATFORM_TENNIS',
  'RACQUETBALL',
  'SQUASH',
  'TABLE_TENNIS',
  'TENNIS',
  'TENNIS_V2',
  'OTHER',
  'BOXING',
  'BREATHWORK',
  'DANCE',
  'DISC_GOLF',
  'FLOOR_CLIMBING',
  'GOLF',
  'INLINE_SKATING',
  'JUMP_ROPE',
  'MIXED_MARTIAL_ARTS',
  'PARA_SPORTS',
  'WHEELCHAIR_PUSH_RUN',
  'WHEELCHAIR_PUSH_WALK',
  'MOUNTAINEERING',
  'ROCK_CLIMBING',
  'STOP_WATCH'
] as const;

export type ActivityType = typeof ACTIVITY_TYPES[number];
