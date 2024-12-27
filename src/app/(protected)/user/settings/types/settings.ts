export type HeightUnit = 'ft_in' | 'in' | 'cm';
export type WeightUnit = 'lbs' | 'kgs';
export type TemperatureUnit = 'F' | 'C';
export type FoodMeasurementUnit = 'grams' | 'lbs_oz' | 'oz';
export type HydrationUnit = 'grams' | 'oz' | 'liters';
export type SpeedUnit = 'mph' | 'kph' | 'min_mile' | 'min_km';
export type NotificationType = 'email' | 'text' | 'app';

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
  // Placeholder for health-specific settings
  trackingPreferences?: string[];
}

export interface NutritionSettings {
  foodMeasurement: FoodMeasurementUnit;
  hydrationUnit: HydrationUnit;
}

export interface FitnessSettings {
  resistanceTraining: {
    weightUnit: WeightUnit;
  };
  cardioMetabolic: {
    speedUnit: SpeedUnit;
  };
}

export interface UserSettings {
  general: GeneralSettings;
  lifestyle: LifestyleSettings;
  health: HealthSettings;
  nutrition: NutritionSettings;
  fitness: FitnessSettings;
} 