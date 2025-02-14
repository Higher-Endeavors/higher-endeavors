export interface SkinfoldMeasurements {
  chest?: number;
  abdominal?: number;
  thigh?: number;
  triceps?: number;
  suprailiac?: number;
  subscapula?: number;
  axilla?: number;
  abdomen?: number;
}

export interface CircumferenceMeasurements {
  neck?: number;
  shoulders?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  leftBicepRelaxed?: number;
  leftBicepFlexed?: number;
  rightBicepRelaxed?: number;
  rightBicepFlexed?: number;
  leftForearm?: number;
  rightForearm?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
}

export interface BodyCompositionMetrics {
  bodyFatPercentage: number;
  fatMass: number;
  fatFreeMass: number;
}

// Jackson-Pollock formula
export const calculateBodyFatFromSkinfolds = (
  measurements: SkinfoldMeasurements,
  isMale: boolean,
  age: number
): number => {
  if (isMale) {
    const sum = (measurements.chest || 0) + (measurements.abdominal || 0) + (measurements.thigh || 0);
    const bodyDensity = 1.10938 - (0.0008267 * sum) + (0.0000016 * sum * sum) - (0.0002574 * age);
    return (495 / bodyDensity) - 450;
  } else {
    const sum = (measurements.triceps || 0) + (measurements.suprailiac || 0) + (measurements.thigh || 0);
    const bodyDensity = 1.099421 - (0.0009929 * sum) + (0.0000023 * sum * sum) - (0.0001392 * age);
    return (495 / bodyDensity) - 450;
  }
};

// Alternative 7-site formula
export const calculateBodyDensityFromSevenSite = (
  measurements: SkinfoldMeasurements,
  age: number,
  isMale: boolean
): number => {
  const sum = Object.values(measurements).reduce((acc, val) => acc + (val || 0), 0);
  const sumSquared = sum * sum;

  if (isMale) {
    return 1.112 - (0.00043499 * sum) + (0.00000055 * sumSquared) - (0.00028826 * age);
  } else {
    return 1.097 - (0.00046971 * sum) + (0.00000056 * sumSquared) - (0.00012828 * age);
  }
};

export const calculateBodyFatFromCircumference = (
  measurements: CircumferenceMeasurements,
  weight: number,
  height: number,
  isMale: boolean,
  age: number
): number => {
  // Navy Method
  if (isMale && measurements.neck && measurements.waist) {
    const logValue = Math.log10(measurements.waist - measurements.neck);
    return 86.010 * logValue - 70.041 * Math.log10(height) + 36.76;
  } else if (!isMale && measurements.neck && measurements.waist && measurements.hips) {
    const logValue = Math.log10(measurements.waist + measurements.hips - measurements.neck);
    return 163.205 * logValue - 97.684 * Math.log10(height) - 78.387;
  }
  return 0;
};

export const calculateBMI = (weight: number, height: number): number => {
  // Weight in kg, height in meters
  return weight / (height * height);
};

export const calculateLeanMass = (weight: number, bodyFat: number): number => {
  return weight * (1 - bodyFat / 100);
};

export const calculateFatMass = (weight: number, bodyFat: number): number => {
  return weight * (bodyFat / 100);
};

export const calculateAllMetrics = (
  weight: number,
  measurements: SkinfoldMeasurements,
  age: number,
  isMale: boolean,
  method: 'jackson-pollock' | 'seven-site' = 'jackson-pollock'
): BodyCompositionMetrics => {
  let bodyFatPercentage: number;
  
  if (method === 'seven-site') {
    const bodyDensity = calculateBodyDensityFromSevenSite(measurements, age, isMale);
    bodyFatPercentage = (495 / bodyDensity) - 450;
  } else {
    bodyFatPercentage = calculateBodyFatFromSkinfolds(measurements, isMale, age);
  }

  const fatMass = calculateFatMass(weight, bodyFatPercentage);
  const fatFreeMass = weight - fatMass;

  return {
    bodyFatPercentage,
    fatMass,
    fatFreeMass
  };
}; 