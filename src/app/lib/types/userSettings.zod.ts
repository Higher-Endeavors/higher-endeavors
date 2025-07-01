import { z } from "zod";

// Enums and unions
export const HeightUnitSchema = z.enum(["ft_in", "in", "cm"]);
export const WeightUnitSchema = z.enum(["lbs", "kgs"]);
export const TemperatureUnitSchema = z.enum(["F", "C"]);
export const FoodMeasurementUnitSchema = z.enum(["grams", "lbs_oz", "oz"]);
export const HydrationUnitSchema = z.enum(["grams", "oz", "liters"]);
export const SpeedUnitSchema = z.enum(["mph", "kph", "min_mile", "min_km"]);
export const NotificationTypeSchema = z.enum(["email", "text", "app"]);
export const CircumferenceUnitSchema = z.enum(["in", "cm"]);
export const BodyFatMethodSchema = z.enum(["manual", "bioelectrical", "skinfold"]);
export const MacronutrientTargetModeSchema = z.enum(["grams", "percent"]);
export const FoodAllergySchema = z.enum([
  "gluten",
  "peanut",
  "dairy",
  "soy",
  "egg",
  "tree_nut",
  "fish",
  "shellfish",
  "sesame"
]);
export const CircumferenceMeasurementSchema = z.enum([
  "neck",
  "shoulders",
  "chest",
  "waist",
  "hips",
  "biceps",
  "forearm",
  "thigh",
  "calf"
]);
export const DietaryBaseSchema = z.enum(["omnivore", "vegetarian", "vegan", "pescatarian"]);
export const DietaryStyleSchema = z.enum(["paleo", "keto", "mediterranean", "other"]);

// General Settings
export const GeneralSettingsSchema = z.object({
  heightUnit: HeightUnitSchema,
  weightUnit: WeightUnitSchema,
  temperatureUnit: TemperatureUnitSchema,
  timeFormat: z.enum(["12h", "24h"]),
  dateFormat: z.string(), // Could be enum if only a few allowed
  language: z.string(),
  notifications: z.array(NotificationTypeSchema),
});

// Lifestyle Settings
export const LifestyleSettingsSchema = z.object({
  deviceIntegration: z.object({
    enabled: z.boolean(),
    devices: z.array(z.string()),
  }).optional(),
});

// Health Settings
export const HealthSettingsSchema = z.object({
  circumferenceUnit: CircumferenceUnitSchema,
  circumferenceMeasurements: z.array(CircumferenceMeasurementSchema),
  bodyFatMethods: z.array(BodyFatMethodSchema),
  trackingPreferences: z.array(z.string()).optional(),
});

// Macronutrient Targets
export const MacronutrientTargetsSchema = z.object({
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
});

// Meal Schedule Entry
export const MealScheduleEntrySchema = z.object({
  name: z.string(),
  time: z.string().optional(),
});

// Nutrient Distribution
export const NutrientDistributionSchema = z.object({
  mode: z.enum(["even", "custom-percent", "custom-macros"]),
  customPercents: z.array(z.number()).optional(),
  customMacros: z.array(
    z.object({ protein: z.number(), carbs: z.number(), fat: z.number() })
  ).optional(),
});

// Custom Meal Schedule
export const CustomMealScheduleSchema = z.object({
  id: z.string(),
  name: z.string(),
  meals: z.array(MealScheduleEntrySchema),
  nutrientDistribution: NutrientDistributionSchema,
});

// Schedule Assignments
export const ScheduleAssignmentsSchema = z.record(
  z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
  ]),
  z.string()
);

// Nutrition Settings
export const NutritionSettingsSchema = z.object({
  foodMeasurement: FoodMeasurementUnitSchema,
  hydrationUnit: HydrationUnitSchema,
  calorieTarget: z.number().optional(),
  macronutrientTargets: MacronutrientTargetsSchema.optional(),
  macronutrientTargetMode: MacronutrientTargetModeSchema.optional(),
  defaultMealSchedule: CustomMealScheduleSchema,
  customMealSchedules: z.array(CustomMealScheduleSchema),
  scheduleAssignments: ScheduleAssignmentsSchema.optional(),
  foodAllergies: z.array(z.union([FoodAllergySchema, z.string()])).optional(),
  dietaryBase: DietaryBaseSchema.optional(),
  dietaryStyles: z.array(DietaryStyleSchema).optional(),
});

// Fitness Settings
export const FitnessSettingsSchema = z.object({
  resistanceTraining: z.object({
    weightUnit: WeightUnitSchema.optional(),
    loadUnit: WeightUnitSchema.optional(),
    trackRPE: z.boolean().optional(),
    trackRIR: z.boolean().optional(),
    availableEquipment: z.array(z.string()).optional(),
    rpeScale: z.string().optional(),
  }),
  cardioMetabolic: z.object({
    speedUnit: SpeedUnitSchema,
  }),
});

// Top-level UserSettings
export const UserSettingsSchema = z.object({
  general: GeneralSettingsSchema,
  lifestyle: LifestyleSettingsSchema,
  health: HealthSettingsSchema,
  nutrition: NutritionSettingsSchema,
  fitness: FitnessSettingsSchema,
});

// Export inferred types
export type HeightUnit = z.infer<typeof HeightUnitSchema>;
export type WeightUnit = z.infer<typeof WeightUnitSchema>;
export type TemperatureUnit = z.infer<typeof TemperatureUnitSchema>;
export type FoodMeasurementUnit = z.infer<typeof FoodMeasurementUnitSchema>;
export type HydrationUnit = z.infer<typeof HydrationUnitSchema>;
export type SpeedUnit = z.infer<typeof SpeedUnitSchema>;
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type CircumferenceUnit = z.infer<typeof CircumferenceUnitSchema>;
export type BodyFatMethod = z.infer<typeof BodyFatMethodSchema>;
export type MacronutrientTargetMode = z.infer<typeof MacronutrientTargetModeSchema>;
export type FoodAllergy = z.infer<typeof FoodAllergySchema>;
export type CircumferenceMeasurement = z.infer<typeof CircumferenceMeasurementSchema>;
export type DietaryBase = z.infer<typeof DietaryBaseSchema>;
export type DietaryStyle = z.infer<typeof DietaryStyleSchema>;
export type GeneralSettings = z.infer<typeof GeneralSettingsSchema>;
export type LifestyleSettings = z.infer<typeof LifestyleSettingsSchema>;
export type HealthSettings = z.infer<typeof HealthSettingsSchema>;
export type MacronutrientTargets = z.infer<typeof MacronutrientTargetsSchema>;
export type MealScheduleEntry = z.infer<typeof MealScheduleEntrySchema>;
export type NutrientDistribution = z.infer<typeof NutrientDistributionSchema>;
export type CustomMealSchedule = z.infer<typeof CustomMealScheduleSchema>;
export type ScheduleAssignments = z.infer<typeof ScheduleAssignmentsSchema>;
export type NutritionSettings = z.infer<typeof NutritionSettingsSchema>;
export type FitnessSettings = z.infer<typeof FitnessSettingsSchema>;
export type UserSettings = z.infer<typeof UserSettingsSchema>;
