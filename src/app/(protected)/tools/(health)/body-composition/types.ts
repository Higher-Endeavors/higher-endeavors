export interface BodyCompositionEntry {
  id: string;
  date: string;
  weight: number;
  bodyFatPercentage: number | null;
  fatMass: number | null;
  fatFreeMass: number | null;
  circumferenceMeasurements?: CircumferenceMeasurements;
  skinfoldMeasurements?: SkinfoldMeasurements;
}

export interface CircumferenceMeasurements {
  neck: number;
  shoulders: number;
  chest: number;
  waist: number;
  hips: number;
  leftBicepRelaxed: number;
  leftBicepFlexed: number;
  rightBicepRelaxed: number;
  rightBicepFlexed: number;
  leftForearm: number;
  rightForearm: number;
  leftThigh: number;
  rightThigh: number;
  leftCalf: number;
  rightCalf: number;
}

export interface SkinfoldMeasurements {
  chest: number;
  abdomen: number;
  thigh: number;
  triceps: number;
  axilla: number;
  subscapula: number;
  suprailiac: number;
} 