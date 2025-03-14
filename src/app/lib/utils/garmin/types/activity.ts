export interface Activity {
  activityId: number;
  activityName?: string;
  description?: string;
  type: ActivityType;
  startTimeInSeconds: number;
  durationInSeconds: number;
  distanceInMeters: number;
  averageSpeedInMetersPerSecond: number;
  maxSpeedInMetersPerSecond: number;
  averageHeartRateInBeatsPerMinute?: number;
  maxHeartRateInBeatsPerMinute?: number;
  calories: number;
  averagePowerInWatts?: number;
  maxPowerInWatts?: number;
  elevationGainInMeters?: number;
  elevationLossInMeters?: number;
  maxElevationInMeters?: number;
  minElevationInMeters?: number;
}

export type GarminActivityType =
  // Running
  | 'RUNNING'
  | 'INDOOR_RUNNING'
  | 'OBSTACLE_RUN'
  | 'STREET_RUNNING'
  | 'TRACK_RUNNING'
  | 'TRAIL_RUNNING'
  | 'TREADMILL_RUNNING'
  | 'ULTRA_RUN'
  | 'VIRTUAL_RUN'
  // Cycling
  | 'CYCLING'
  | 'BMX'
  | 'CYCLOCROSS'
  | 'DOWNHILL_BIKING'
  | 'E_BIKE_FITNESS'
  | 'E_BIKE_MOUNTAIN'
  | 'GRAVEL_CYCLING'
  | 'INDOOR_CYCLING'
  | 'MOUNTAIN_BIKING'
  | 'RECUMBENT_CYCLING'
  | 'ROAD_BIKING'
  | 'TRACK_CYCLING'
  | 'VIRTUAL_RIDE'
  | 'HANDCYCLING'
  | 'INDOOR_HANDCYCLING'
  // Gym & Fitness
  | 'FITNESS_EQUIPMENT'
  | 'BOULDERING'
  | 'ELLIPTICAL'
  | 'INDOOR_CARDIO'
  | 'HIIT'
  | 'INDOOR_CLIMBING'
  | 'INDOOR_ROWING'
  | 'PILATES'
  | 'STAIR_CLIMBING'
  | 'STRENGTH_TRAINING'
  | 'YOGA'
  | 'MEDITATION'
  // Swimming
  | 'SWIMMING'
  | 'LAP_SWIMMING'
  | 'OPEN_WATER_SWIMMING'
  // Walking
  | 'WALKING'
  | 'CASUAL_WALKING'
  | 'SPEED_WALKING'
  | 'HIKING'
  // Winter Sports
  | 'WINTER_SPORTS'
  | 'BACKCOUNTRY_SNOWBOARDING'
  | 'BACKCOUNTRY_SKIING'
  | 'CROSS_COUNTRY_SKIING_WS'
  | 'RESORT_SKIING'
  | 'SNOWBOARDING_WS'
  | 'RESORT_SKIING_SNOWBOARDING_WS'
  | 'SKATE_SKIING_WS'
  | 'SKATING_WS'
  | 'SNOW_SHOE_WS'
  | 'SNOWMOBILING_WS'
  // Water Sports
  | 'BOATING' | 'BOATING_V2'
  | 'FISHING' | 'FISHING_V2'
  | 'KAYAKING' | 'KAYAKING_V2'
  | 'KITEBOARDING' | 'KITEBOARDING_V2'
  | 'OFFSHORE_GRINDING' | 'OFFSHORE_GRINDING_V2'
  | 'ONSHORE_GRINDING' | 'ONSHORE_GRINDING_V2'
  | 'PADDLING' | 'PADDLING_V2'
  | 'ROWING' | 'ROWING_V2'
  | 'SAILING' | 'SAILING_V2'
  | 'SNORKELING'
  | 'STAND_UP_PADDLEBOARDING' | 'STAND_UP_PADDLEBOARDING_V2'
  | 'SURFING' | 'SURFING_V2'
  | 'WAKEBOARDING' | 'WAKEBOARDING_V2'
  | 'WATERSKIING'
  | 'WHITEWATER_RAFTING' | 'WHITEWATER_RAFTING_V2'
  | 'WINDSURFING' | 'WINDSURFING_V2'
  // Transitions
  | 'TRANSITION_V2'
  | 'BIKE_TO_RUN_TRANSITION' | 'BIKE_TO_RUN_TRANSITION_V2'
  | 'RUN_TO_BIKE_TRANSITION' | 'RUN_TO_BIKE_TRANSITION_V2'
  | 'SWIM_TO_BIKE_TRANSITION' | 'SWIM_TO_BIKE_TRANSITION_V2'
  // Team Sports
  | 'TEAM_SPORTS'
  | 'AMERICAN_FOOTBALL'
  | 'BASEBALL'
  | 'BASKETBALL'
  | 'CRICKET'
  | 'FIELD_HOCKEY'
  | 'ICE_HOCKEY'
  | 'LACROSSE'
  | 'RUGBY'
  | 'SOCCER'
  | 'SOFTBALL'
  | 'ULTIMATE_DISC'
  | 'VOLLEYBALL'
  // Racket Sports
  | 'RACKET_SPORTS'
  | 'BADMINTON'
  | 'PADEL'
  | 'PICKLEBALL'
  | 'PLATFORM_TENNIS'
  | 'RACQUETBALL'
  | 'SQUASH'
  | 'TABLE_TENNIS'
  | 'TENNIS' | 'TENNIS_V2'
  // Other
  | 'OTHER'
  | 'BOXING'
  | 'BREATHWORK'
  | 'DANCE'
  | 'DISC_GOLF'
  | 'FLOOR_CLIMBING'
  | 'GOLF'
  | 'INLINE_SKATING'
  | 'JUMP_ROPE'
  | 'MIXED_MARTIAL_ARTS'
  | 'MOUNTAINEERING'
  | 'ROCK_CLIMBING'
  | 'STOP_WATCH'
  // Para Sports
  | 'PARA_SPORTS'
  | 'WHEELCHAIR_PUSH_RUN'
  | 'WHEELCHAIR_PUSH_WALK';

export interface ActivityType {
  typeId: number;
  typeKey: GarminActivityType;
  parentTypeId?: number;
  sortOrder?: number;
}

export interface ActivityDetails extends Activity {
  userId: string;
  summaryId: string;
  activityType: ActivityType;
  eventType?: string;
  timeZone?: string;
  locationName?: string;
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;
  steps?: number;
  strokes?: number;
  averageCadenceInStepsPerMinute?: number;
  maxCadenceInStepsPerMinute?: number;
  averageRunCadenceInStepsPerMinute?: number;
  maxRunCadenceInStepsPerMinute?: number;
  averageSwimCadenceInStrokesPerMinute?: number;
  maxSwimCadenceInStrokesPerMinute?: number;
  averageBikeCadenceInRoundsPerMinute?: number;
  maxBikeCadenceInRoundsPerMinute?: number;
  trainingEffect?: number;
  anaerobicTrainingEffect?: number;
  normalizedPower?: number;
  lapCount?: number;
  poolLength?: number;
  poolLengthUnit?: string;
  deviceName?: string;
  metadataURL?: string;
} 