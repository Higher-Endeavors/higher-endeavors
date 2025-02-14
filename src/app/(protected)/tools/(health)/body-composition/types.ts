import type { CircumferenceMeasurements, SkinfoldMeasurements, BodyCompositionMetrics } from '@/app/lib/utils/health/body-composition/calculations';

export interface BodyCompositionEntry extends BodyCompositionMetrics {
  id: string;
  date: string;
  weight: number;
  circumferenceMeasurements?: CircumferenceMeasurements;
  skinfoldMeasurements?: SkinfoldMeasurements;
}

export type { CircumferenceMeasurements, SkinfoldMeasurements, BodyCompositionMetrics }; 