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

export interface BodyCompositionEntry {
  id?: string;
  date: Date;
  weight: number;
  manualBodyFatPercentage?: number;
  skinfoldMeasurements?: SkinfoldMeasurements;
  circumferenceMeasurements: CircumferenceMeasurements;
  calculatedBodyFatPercentage?: number;
  fatMass?: number;
  fatFreeMass?: number;
  userId: string;
}

export interface AnalysisTimeframe {
  startDate: Date;
  endDate: Date;
} 