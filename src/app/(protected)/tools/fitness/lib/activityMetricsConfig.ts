export interface ActivityMetric {
  name: string;
  type: 'number' | 'text' | 'select';
  label: string;
  placeholder?: string;
  unit?: string;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface ActivityTypeConfig {
  name: string;
  category: 'resistance' | 'cardio' | 'metabolic';
  metrics: ActivityMetric[];
  defaultTempo?: string;
  supportsRPE?: boolean;
  supportsRIR?: boolean;
  supportsDistance?: boolean;
  supportsDuration?: boolean;
  supportsLoad?: boolean;
  supportsReps?: boolean;
  // Enhanced matching
  keywords?: string[]; // Keywords to match against activity names
  activityFamilies?: string[]; // Activity families this config applies to
  equipment?: string[]; // Equipment types this config applies to
}

export const ACTIVITY_METRICS_CONFIG: Record<string, ActivityTypeConfig> = {
  // Resistance Training Activities
  'Squat': {
    name: 'Squat',
    category: 'resistance',
    metrics: [
      { name: 'reps', type: 'number', label: 'Reps', placeholder: 'Enter reps', min: 1, required: true },
      { name: 'load', type: 'text', label: 'Load', placeholder: 'Enter weight (lbs/kg) or BW', required: true },
      { name: 'tempo', type: 'text', label: 'Tempo', placeholder: 'e.g., 2010', required: true },
      { name: 'rest', type: 'number', label: 'Rest (seconds)', placeholder: 'Enter rest period', min: 0, required: true },
      { name: 'rpe', type: 'number', label: 'RPE', placeholder: 'Rate of Perceived Exertion', min: 0, max: 10 },
      { name: 'rir', type: 'number', label: 'RIR', placeholder: 'Reps in Reserve', min: 0, max: 10 },
    ],
    defaultTempo: '2010',
    supportsRPE: true,
    supportsRIR: true,
    supportsLoad: true,
    supportsReps: true,
  },

  // Cardio Activities
  'Treadmill': {
    name: 'Treadmill',
    category: 'cardio',
    metrics: [
      { name: 'duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration', min: 1, required: true },
      { name: 'speed', type: 'number', label: 'Speed (mph)', placeholder: 'Enter speed', min: 0.1, max: 15, required: true },
      { name: 'incline', type: 'number', label: 'Incline (%)', placeholder: 'Enter incline', min: 0, max: 15 },
    ],
    supportsRPE: true,
    supportsDuration: true,
    supportsRIR: false,
    keywords: ['treadmill', 'running', 'jogging', 'walking'],
    activityFamilies: ['Cardio', 'Running', 'Treadmill'],
    equipment: ['Treadmill'],
  },

  'Stationary Bike': {
    name: 'Stationary Bike',
    category: 'cardio',
    metrics: [
      { name: 'duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration', min: 1, required: true },
      { name: 'resistance', type: 'number', label: 'Resistance Level', placeholder: 'Enter resistance level', min: 1, max: 20 },
      { name: 'rpm', type: 'number', label: 'RPM', placeholder: 'Revolutions per minute', min: 40, max: 120 },
      { name: 'watts', type: 'number', label: 'Watts', placeholder: 'Enter watts', min: 100, required: true },
    ],
    supportsRPE: true,
    supportsDuration: true,
    supportsRIR: false,
    keywords: ['bike', 'bicycle', 'cycling', 'airbike', 'air bike', 'stationary', 'spin'],
    activityFamilies: ['Cycling', 'Bike'],
    equipment: ['Stationary Bike', 'Airbike', 'Spin Bike'],
  },

  'Rowing Machine': {
    name: 'Rowing Machine',
    category: 'cardio',
    metrics: [
      { name: 'duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration', min: 1, required: true },
      { name: 'distance', type: 'number', label: 'Distance (meters)', placeholder: 'Enter distance', min: 100, required: true },
      { name: 'watts', type: 'number', label: 'Watts', placeholder: 'Enter watts', min: 100, required: true },
      { name: 'split', type: 'text', label: 'Split Time', placeholder: 'e.g., 2:00/500m' },
    ],
    supportsRPE: true,
    supportsDuration: true,
    supportsDistance: true,
    supportsRIR: false,
    keywords: ['row', 'rowing', 'erg', 'ergometer'],
    activityFamilies: ['Cardio', 'Rowing'],
    equipment: ['Rowing Machine', 'Concept2', 'Ergometer'],
  },

  'Elliptical': {
    name: 'Elliptical',
    category: 'cardio',
    metrics: [
      { name: 'duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration', min: 1, required: true },
      { name: 'resistance', type: 'number', label: 'Resistance Level', placeholder: 'Enter resistance level', min: 1, max: 20 },
    ],
    supportsRPE: true,
    supportsDuration: true,
    supportsRIR: false,
    keywords: ['elliptical', 'cross trainer'],
    activityFamilies: ['Cardio', 'Elliptical'],
  },

  'Stairclimber': {
    name: 'Stairclimber',
    category: 'cardio',
    metrics: [
      { name: 'duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration', min: 1, required: true },
      { name: 'stepsPerMinute', type: 'number', label: 'Steps per Minute', placeholder: 'Enter steps per minute', min: 20, max: 200, required: true },
      { name: 'resistance', type: 'number', label: 'Resistance Level', placeholder: 'Enter resistance level', min: 1, max: 20 },
      { name: 'floors', type: 'number', label: 'Floors Climbed', placeholder: 'Enter number of floors', min: 1 },
    ],
    supportsRPE: true,
    supportsDuration: true,
    supportsRIR: false,
    keywords: ['stairclimber', 'stairmill', 'stair master', 'stepmill', 'climber', 'stairs'],
    activityFamilies: ['Cardio', 'Stairclimber'],
    equipment: ['Stairclimber', 'Stairmill', 'Stair Master', 'Stepmill'],
  },

  // Metabolic Activities
  'Burpees': {
    name: 'Burpees',
    category: 'metabolic',
    metrics: [
      { name: 'reps', type: 'number', label: 'Reps', placeholder: 'Enter reps', min: 1, required: true },
      { name: 'duration', type: 'number', label: 'Duration (seconds)', placeholder: 'Enter duration', min: 1 },
    ],
    supportsRPE: true,
    supportsReps: true,
    supportsDuration: true,
    supportsRIR: false,
  },

  'Mountain Climbers': {
    name: 'Mountain Climbers',
    category: 'metabolic',
    metrics: [
      { name: 'duration', type: 'number', label: 'Duration (seconds)', placeholder: 'Enter duration', min: 1, required: true },
    ],
    supportsRPE: true,
    supportsDuration: true,
    supportsRIR: false,
  },

  'Jump Rope': {
    name: 'Jump Rope',
    category: 'metabolic',
    metrics: [
      { name: 'duration', type: 'number', label: 'Duration (seconds)', placeholder: 'Enter duration', min: 1, required: true },
      { name: 'reps', type: 'number', label: 'Reps', placeholder: 'Enter reps', min: 1 },
    ],
    supportsRPE: true,
    supportsReps: true,
    supportsDuration: true,
    supportsRIR: false,
  },

  // Carry Activities (already supported in existing modal)
  'Farmer Carry': {
    name: 'Farmer Carry',
    category: 'resistance',
    metrics: [
      { name: 'distance', type: 'number', label: 'Distance', placeholder: 'Enter distance', min: 1, required: true },
      { name: 'distanceUnit', type: 'select', label: 'Distance Unit', options: [
        { value: 'feet', label: 'Feet' },
        { value: 'yards', label: 'Yards' },
        { value: 'meters', label: 'Meters' },
      ], required: true },
      { name: 'load', type: 'text', label: 'Load', placeholder: 'Enter weight (lbs/kg)', required: true },
      { name: 'rpe', type: 'number', label: 'RPE', placeholder: 'Rate of Perceived Exertion', min: 0, max: 10 },
    ],
    supportsRPE: true,
    supportsDistance: true,
    supportsLoad: true,
  },

  // Swimming
  'Swimming': {
    name: 'Swimming',
    category: 'cardio',
    metrics: [
      { name: 'distance', type: 'number', label: 'Distance', placeholder: 'Enter distance', min: 1, required: true },
      { name: 'distanceUnit', type: 'select', label: 'Distance Unit', options: [
        { value: 'yards', label: 'Yards' },
        { value: 'meters', label: 'Meters' },
        { value: 'laps', label: 'Laps' },
      ], required: true },
      { name: 'stroke', type: 'select', label: 'Stroke', options: [
        { value: 'freestyle', label: 'Freestyle' },
        { value: 'backstroke', label: 'Backstroke' },
        { value: 'breaststroke', label: 'Breaststroke' },
        { value: 'butterfly', label: 'Butterfly' },
        { value: 'mixed', label: 'Mixed' },
      ] },
    ],
    supportsRPE: true,
    supportsDistance: true,
    supportsRIR: false,
  },

  // Running
  'Running': {
    name: 'Running',
    category: 'cardio',
    metrics: [
      { name: 'distance', type: 'number', label: 'Distance', placeholder: 'Enter distance', min: 0.1, required: true },
      { name: 'distanceUnit', type: 'select', label: 'Distance Unit', options: [
        { value: 'miles', label: 'Miles' },
        { value: 'kilometers', label: 'Kilometers' },
        { value: 'meters', label: 'Meters' },
      ], required: true },
      { name: 'duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration', min: 1 },
      { name: 'pace', type: 'text', label: 'Pace', placeholder: 'e.g., 8:30/mile' },
    ],
    supportsRPE: true,
    supportsDistance: true,
    supportsDuration: true,
    supportsRIR: false,
    keywords: ['run', 'running', 'jog', 'jogging', 'sprint'],
    activityFamilies: ['Cardio', 'Running'],
  },


};

// Helper function to get activity config by name with enhanced matching
export function getActivityConfig(activityName: string, equipment?: string | null): ActivityTypeConfig | null {
  // First try exact match
  if (ACTIVITY_METRICS_CONFIG[activityName]) {
    return ACTIVITY_METRICS_CONFIG[activityName];
  }

  // Try equipment matching if equipment is provided
  if (equipment) {
    const normalizedEquipment = equipment.toLowerCase();
    for (const [configName, config] of Object.entries(ACTIVITY_METRICS_CONFIG)) {
      if (config.equipment) {
        for (const configEquipment of config.equipment) {
          if (normalizedEquipment.includes(configEquipment.toLowerCase())) {
            return config;
          }
        }
      }
    }
  }

  // Try keyword matching
  const normalizedName = activityName.toLowerCase();
  for (const [configName, config] of Object.entries(ACTIVITY_METRICS_CONFIG)) {
    if (config.keywords) {
      for (const keyword of config.keywords) {
        if (normalizedName.includes(keyword.toLowerCase())) {
          return config;
        }
      }
    }
  }

  return null;
}

// Helper function to get activity config by exercise family
export function getActivityConfigByFamily(exerciseFamily: string): ActivityTypeConfig | null {
  const normalizedFamily = exerciseFamily.toLowerCase();
  
  // Find configs that match the activity family
  for (const [configName, config] of Object.entries(ACTIVITY_METRICS_CONFIG)) {
    if (config.activityFamilies) {
      for (const family of config.activityFamilies) {
        if (normalizedFamily.includes(family.toLowerCase())) {
          return config;
        }
      }
    }
  }

  // Fallback to old mapping for backward compatibility
  const familyToActivityMap: Record<string, string> = {
    'Carry': 'Farmer Carry',
    'Squat': 'Squat',
    'Cardio': 'Running', // Default cardio activity
    'Metabolic': 'Burpees', // Default metabolic activity
  };

  const activityName = familyToActivityMap[exerciseFamily];
  return activityName ? getActivityConfig(activityName) : null;
}

// Helper function to check if an activity supports a specific metric
export function supportsMetric(activityName: string, metric: 'reps' | 'load' | 'duration' | 'distance' | 'rpe' | 'rir'): boolean {
  const config = getActivityConfig(activityName);
  if (!config) return false;

  switch (metric) {
    case 'reps': return config.supportsReps || false;
    case 'load': return config.supportsLoad || false;
    case 'duration': return config.supportsDuration || false;
    case 'distance': return config.supportsDistance || false;
    case 'rpe': return config.supportsRPE || false;
    case 'rir': return config.supportsRIR || false;
    default: return false;
  }
} 