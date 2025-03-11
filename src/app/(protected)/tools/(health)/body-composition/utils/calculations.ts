interface SkinfoldMeasurements {
  chest: number;
  abdomen: number;
  thigh: number;
  triceps: number;
  axilla: number;
  subscapula: number;
  suprailiac: number;
}

export const calculateBodyDensity = (
  measurements: SkinfoldMeasurements,
  age: number,
  isMale: boolean
): number => {
  const sum = Object.values(measurements).reduce((acc, val) => acc + val, 0);
  const sumSquared = sum * sum;

  if (isMale) {
    return (
      1.112 -
      0.00043499 * sum +
      0.00000055 * sumSquared -
      0.00028826 * age
    );
  } else {
    return (
      1.097 -
      0.00046971 * sum +
      0.00000056 * sumSquared -
      0.00012828 * age
    );
  }
};

export const calculateBodyFatPercentage = (bodyDensity: number): number => {
  return (495 / bodyDensity) - 450;
};

export const calculateFatMass = (weight: number, bodyFatPercentage: number): number => {
  return (weight * bodyFatPercentage) / 100;
};

export const calculateFatFreeMass = (weight: number, fatMass: number): number => {
  return weight - fatMass;
};

export interface BodyCompositionMetrics {
  bodyFatPercentage: number;
  fatMass: number;
  fatFreeMass: number;
}

export const calculateAllMetrics = (
  weight: number,
  measurements: SkinfoldMeasurements,
  age: number,
  isMale: boolean
): BodyCompositionMetrics => {
  const bodyDensity = calculateBodyDensity(measurements, age, isMale);
  const bodyFatPercentage = calculateBodyFatPercentage(bodyDensity);
  const fatMass = calculateFatMass(weight, bodyFatPercentage);
  const fatFreeMass = calculateFatFreeMass(weight, fatMass);

  return {
    bodyFatPercentage,
    fatMass,
    fatFreeMass,
  };
}; 