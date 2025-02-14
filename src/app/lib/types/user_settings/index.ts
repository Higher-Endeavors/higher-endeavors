// Unit Types
export type HeightUnit = 'ft_in' | 'in' | 'cm';
export type WeightUnit = 'lbs' | 'kg';  // For body weight measurements
export type LoadUnit = 'lbs' | 'kg';    // For resistance training loads
export type TemperatureUnit = 'F' | 'C';
export type FoodMeasurementUnit = 'grams' | 'lbs_oz' | 'oz';
export type HydrationUnit = 'grams' | 'oz' | 'liters';
export type SpeedUnit = 'mph' | 'kph' | 'min_mile' | 'min_km';
export type NotificationType = 'email' | 'text' | 'app';
export type CircumferenceUnit = 'in' | 'cm';
export type BodyFatMethod = 'manual' | 'bioelectrical' | 'skinfold';

export type CircumferenceMeasurement = 
  | 'neck'
  | 'shoulders'
  | 'chest'
  | 'waist'
  | 'hips'
  | 'biceps'
  | 'forearm'
  | 'thigh'
  | 'calf';

// Settings Interfaces
export interface GeneralSettings {
  heightUnit: HeightUnit;
  weightUnit: WeightUnit;
  temperatureUnit: TemperatureUnit;
  timeFormat: '12h' | '24h';
  dateFormat: string;
  language: string;
  notifications: NotificationType[];
}

export interface LifestyleSettings {
  deviceIntegration: {
    enabled: boolean;
    devices: string[]; // Placeholder for device IDs
  };
}

export interface HealthSettings {
  circumferenceUnit: CircumferenceUnit;
  circumferenceMeasurements: CircumferenceMeasurement[];
  bodyFatMethods: BodyFatMethod[];
  trackingPreferences?: string[];
}

export interface NutritionSettings {
  foodMeasurement: FoodMeasurementUnit;
  hydrationUnit: HydrationUnit;
}

export interface FitnessSettings {
  resistanceTraining: {
    loadUnit: LoadUnit;
    trackRPE?: boolean;
    trackRIR?: boolean;
    availableEquipment?: number[];
  };
  cardioMetabolic: {
    speedUnit: SpeedUnit;
  };
}

export interface PillarSettings {
  general?: GeneralSettings;
  lifestyle?: LifestyleSettings;
  health?: HealthSettings;
  nutrition?: NutritionSettings;
  fitness?: FitnessSettings;
}

export interface UserSettings {
  user_id: number;
  height_unit: 'imperial' | 'metric';
  weight_unit: WeightUnit;
  temperature_unit: TemperatureUnit;
  time_format: '12h' | '24h';
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  language: string;
  notifications_email: boolean;
  notifications_text: boolean;
  notifications_app: boolean;
  pillar_settings: PillarSettings;
  created_at?: string;
  updated_at?: string;
}

export type UpdateUserSettingsInput = Partial<Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at'>>;

export interface UseUserSettingsReturn {
  settings: UserSettings | null;
  isLoading: boolean;
  error: Error | null;
  updateSettings: (newSettings: UpdateUserSettingsInput) => Promise<void>;
  mutationError: Error | null;
  isMutating: boolean;
} 