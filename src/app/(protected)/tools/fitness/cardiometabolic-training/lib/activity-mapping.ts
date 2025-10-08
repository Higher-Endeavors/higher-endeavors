// Mapping from Garmin activity types to CME activity families
export const GARMIN_TO_CME_MAPPING: Record<string, string> = {
  // Running activities
  RUNNING: 'Running',
  INDOOR_RUNNING: 'Running',
  OBSTACLE_RUN: 'Running',
  STREET_RUNNING: 'Running',
  TRACK_RUNNING: 'Running',
  TRAIL_RUNNING: 'Running',
  TREADMILL_RUNNING: 'Running',
  ULTRA_RUN: 'Running',
  VIRTUAL_RUN: 'Running',

  // Cycling activities
  CYCLING: 'Cycling',
  BMX: 'Cycling',
  CYCLOCROSS: 'Cycling',
  DOWNHILL_BIKING: 'Cycling',
  E_BIKE_FITNESS: 'Cycling',
  E_BIKE_MOUNTAIN: 'Cycling',
  GRAVEL_CYCLING: 'Cycling',
  INDOOR_CYCLING: 'Cycling',
  MOUNTAIN_BIKING: 'Cycling',
  RECUMBENT_CYCLING: 'Cycling',
  ROAD_BIKING: 'Cycling',
  TRACK_CYCLING: 'Cycling',
  VIRTUAL_RIDE: 'Cycling',
  HANDCYCLING: 'Cycling',
  INDOOR_HANDCYCLING: 'Cycling',

  // Swimming activities
  SWIMMING: 'Swimming',
  LAP_SWIMMING: 'Swimming',
  OPEN_WATER_SWIMMING: 'Swimming',

  // Rowing activities
  INDOOR_ROWING: 'Rowing',
  ROWING: 'Rowing',
  ROWING_V2: 'Rowing',

  // Walking activities
  WALKING: 'Walking',
  CASUAL_WALKING: 'Walking',
  SPEED_WALKING: 'Walking',
  HIKING: 'Walking',

  // Nordic & Snow activities
  CROSS_COUNTRY_SKIING_WS: 'Nordic & Snow',
  RESORT_SKIING: 'Nordic & Snow',
  SNOWBOARDING_WS: 'Nordic & Snow',
  RESORT_SKIING_SNOWBOARDING_WS: 'Nordic & Snow',
  SKATE_SKIING_WS: 'Nordic & Snow',
  SKATING_WS: 'Nordic & Snow',
  SNOW_SHOE_WS: 'Nordic & Snow',
  SNOWMOBILING_WS: 'Nordic & Snow',
  BACKCOUNTRY_SNOWBOARDING: 'Nordic & Snow',
  BACKCOUNTRY_SKIING: 'Nordic & Snow',

  // Watersport activities
  BOATING: 'Watersport',
  BOATING_V2: 'Watersport',
  FISHING: 'Watersport',
  FISHING_V2: 'Watersport',
  KAYAKING: 'Watersport',
  KAYAKING_V2: 'Watersport',
  KITEBOARDING: 'Watersport',
  KITEBOARDING_V2: 'Watersport',
  OFFSHORE_GRINDING: 'Watersport',
  OFFSHORE_GRINDING_V2: 'Watersport',
  ONSHORE_GRINDING: 'Watersport',
  ONSHORE_GRINDING_V2: 'Watersport',
  PADDLING: 'Watersport',
  PADDLING_V2: 'Watersport',
  SAILING: 'Watersport',
  SAILING_V2: 'Watersport',
  SNORKELING: 'Watersport',
  STAND_UP_PADDLEBOARDING: 'Watersport',
  STAND_UP_PADDLEBOARDING_V2: 'Watersport',
  SURFING: 'Watersport',
  SURFING_V2: 'Watersport',
  WAKEBOARDING: 'Watersport',
  WAKEBOARDING_V2: 'Watersport',
  WATERSKIING: 'Watersport',
  WHITEWATER_RAFTING: 'Watersport',
  WHITEWATER_RAFTING_V2: 'Watersport',
  WINDSURFING: 'Watersport',
  WINDSURFING_V2: 'Watersport',

  // General activities (not CME-focused)
  FITNESS_EQUIPMENT: 'General',
  BOULDERING: 'General',
  ELLIPTICAL: 'General',
  INDOOR_CARDIO: 'General',
  HIIT: 'General',
  INDOOR_CLIMBING: 'General',
  PILATES: 'General',
  STAIR_CLIMBING: 'General',
  STRENGTH_TRAINING: 'General',
  YOGA: 'General',
  MEDITATION: 'General',
  BOXING: 'General',
  BREATHWORK: 'General',
  DANCE: 'General',
  DISC_GOLF: 'General',
  FLOOR_CLIMBING: 'General',
  GOLF: 'General',
  INLINE_SKATING: 'General',
  JUMP_ROPE: 'General',
  MIXED_MARTIAL_ARTS: 'General',
  MOUNTAINEERING: 'General',
  ROCK_CLIMBING: 'General',
  STOP_WATCH: 'General',
  PARA_SPORTS: 'General',
  WHEELCHAIR_PUSH_RUN: 'General',
  WHEELCHAIR_PUSH_WALK: 'General',
};

export const VALID_CME_FAMILIES = [
  'Running',
  'Cycling',
  'Swimming',
  'Rowing',
  'Walking',
  'Nordic & Snow',
  'Watersport',
] as const;

export type CMEFamily = typeof VALID_CME_FAMILIES[number];

export function getCMEFamilyForActivity(garminActivityType: string): CMEFamily | null {
  const family = GARMIN_TO_CME_MAPPING[garminActivityType];
  return (VALID_CME_FAMILIES as readonly string[]).includes(family) ? (family as CMEFamily) : null;
}

export function isCMEActivity(garminActivityType: string): boolean {
  return getCMEFamilyForActivity(garminActivityType) !== null;
}

// Emoji/Icon mapping per CME family
const FAMILY_ICON: Record<CMEFamily, string> = {
  'Running': '🏃',
  'Cycling': '🚴',
  'Swimming': '🏊',
  'Rowing': '🚣',
  'Walking': '🚶',
  'Nordic & Snow': '🎿',
  'Watersport': '🌊',
};

// Get icon for a Garmin activity type (mapped by CME family)
export function getCMEIconForActivityType(garminActivityType: string): string {
  const family = getCMEFamilyForActivity(garminActivityType);
  if (family) return FAMILY_ICON[family];
  return '•';
}


