export type HeightUnit = 'ft_in' | 'in' | 'cm';
export type WeightUnit = 'lbs' | 'kgs';
export type TemperatureUnit = 'F' | 'C';
export type FoodMeasurementUnit = 'grams' | 'lbs_oz' | 'oz';
export type HydrationUnit = 'grams' | 'oz' | 'liters';
export type SpeedUnit = 'mph' | 'kph' | 'min_mile' | 'min_km';
export type NotificationType = 'email' | 'text' | 'app';
export type CircumferenceUnit = 'in' | 'cm';
export type BodyFatMethod = 'manual' | 'bioelectrical' | 'skinfold';
export type MacronutrientTargetMode = 'grams' | 'percent';
export type FoodAllergy =
  | 'gluten'
  | 'peanut'
  | 'dairy'
  | 'soy'
  | 'egg'
  | 'tree_nut'
  | 'fish'
  | 'shellfish'
  | 'sesame';

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

export type DietaryBase =
  | 'omnivore'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian';

export type DietaryStyle =
  | 'paleo'
  | 'keto'
  | 'mediterranean'
  | 'other';

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

export interface MacronutrientTargets {
  protein: number; // grams or percent
  carbs: number;   // grams or percent
  fat: number;     // grams or percent
}

export interface MealScheduleEntry {
  name: string; // e.g. 'Breakfast', 'Lunch', 'Post-workout Snack'
  time?: string; // e.g. '08:00', optional
}

export interface NutrientDistribution {
  mode: 'even' | 'custom-percent' | 'custom-macros';
  customPercents?: number[]; // for custom-percent mode
  customMacros?: { protein: number; carbs: number; fat: number }[]; // for custom-macros mode
}

export interface CustomMealSchedule {
  id: string; // uuid or unique string
  name: string;
  meals: MealScheduleEntry[];
  nutrientDistribution: NutrientDistribution;
}

export type ScheduleAssignments = {
  [weekday in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']?: string; // schedule id
};

export interface NutritionSettings {
  foodMeasurement: FoodMeasurementUnit;
  hydrationUnit: HydrationUnit;
  /**
   * Daily calorie target for the user
   */
  calorieTarget?: number;
  /**
   * User's macronutrient targets (protein, carbs, fat)
   */
  macronutrientTargets?: MacronutrientTargets;
  /**
   * Whether the user is setting macros by grams or percent
   */
  macronutrientTargetMode?: MacronutrientTargetMode;
  defaultMealSchedule: CustomMealSchedule;
  customMealSchedules: CustomMealSchedule[];
  scheduleAssignments: ScheduleAssignments;
  /**
   * User's food allergies/intolerances
   */
  foodAllergies?: FoodAllergy[];
  /**
   * User's dietary base (e.g. vegan, vegetarian, etc.)
   */
  dietaryBase?: DietaryBase;
  /**
   * User's dietary styles (e.g. keto, paleo, etc.)
   */
  dietaryStyles?: DietaryStyle[];
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