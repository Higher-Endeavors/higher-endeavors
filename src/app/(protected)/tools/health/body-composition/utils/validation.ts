import { z } from 'zod';
import type { CircumferenceMeasurements, SkinfoldMeasurements } from '../types';

const positiveNumber = z.number().positive('Must be greater than 0');
const nonNegativeNumber = z.number().min(0, 'Must be 0 or greater');
const percentageNumber = z.number().min(0, 'Must be 0 or greater').max(100, 'Must be 100 or less');

export const bodyCompositionSchema = z.object({
  weight: positiveNumber.max(500, 'Weight must be less than 500kg'),
  age: positiveNumber.max(150, 'Age must be less than 150').optional(),
  manualBodyFatPercentage: percentageNumber.optional(),
});

export const skinfoldSchema = z.object({
  chest: nonNegativeNumber.max(100, 'Measurement must be less than 100mm'),
  abdomen: nonNegativeNumber.max(100, 'Measurement must be less than 100mm'),
  thigh: nonNegativeNumber.max(100, 'Measurement must be less than 100mm'),
  triceps: nonNegativeNumber.max(100, 'Measurement must be less than 100mm'),
  axilla: nonNegativeNumber.max(100, 'Measurement must be less than 100mm'),
  subscapula: nonNegativeNumber.max(100, 'Measurement must be less than 100mm'),
  suprailiac: nonNegativeNumber.max(100, 'Measurement must be less than 100mm'),
});

export const circumferenceSchema = z.object({
  neck: nonNegativeNumber.max(100, 'Measurement must be less than 100cm'),
  shoulders: nonNegativeNumber.max(200, 'Measurement must be less than 200cm'),
  chest: nonNegativeNumber.max(200, 'Measurement must be less than 200cm'),
  waist: nonNegativeNumber.max(200, 'Measurement must be less than 200cm'),
  hips: nonNegativeNumber.max(200, 'Measurement must be less than 200cm'),
  leftBicepRelaxed: nonNegativeNumber.max(100, 'Measurement must be less than 100cm'),
  leftBicepFlexed: nonNegativeNumber.max(100, 'Measurement must be less than 100cm'),
  rightBicepRelaxed: nonNegativeNumber.max(100, 'Measurement must be less than 100cm'),
  rightBicepFlexed: nonNegativeNumber.max(100, 'Measurement must be less than 100cm'),
  leftForearm: nonNegativeNumber.max(100, 'Measurement must be less than 100cm'),
  rightForearm: nonNegativeNumber.max(100, 'Measurement must be less than 100cm'),
  leftThigh: nonNegativeNumber.max(150, 'Measurement must be less than 150cm'),
  rightThigh: nonNegativeNumber.max(150, 'Measurement must be less than 150cm'),
  leftCalf: nonNegativeNumber.max(100, 'Measurement must be less than 100cm'),
  rightCalf: nonNegativeNumber.max(100, 'Measurement must be less than 100cm'),
});

export type ValidationError = {
  path: string[];
  message: string;
};

export const validateMeasurements = (
  weight: number,
  age: number | undefined,
  manualBodyFat: number | undefined,
  skinfold: SkinfoldMeasurements,
  circumference: CircumferenceMeasurements,
  bodyFatMethod: 'manual' | 'skinfold' = 'manual'
): ValidationError[] => {
  const errors: ValidationError[] = [];

  try {
    bodyCompositionSchema.parse({
      weight,
      age: bodyFatMethod === 'skinfold' ? age : undefined,
      manualBodyFatPercentage: manualBodyFat,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(err => ({
        path: err.path.map(String),
        message: err.message,
      })));
    }
  }

  // Only validate skinfold measurements if using skinfold method
  if (bodyFatMethod === 'skinfold') {
    try {
      skinfoldSchema.parse(skinfold);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(err => ({
          path: ['skinfold', ...err.path.map(String)],
          message: err.message,
        })));
      }
    }
  }

  try {
    circumferenceSchema.parse(circumference);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(err => ({
        path: ['circumference', ...err.path.map(String)],
        message: err.message,
      })));
    }
  }

  return errors;
}; 