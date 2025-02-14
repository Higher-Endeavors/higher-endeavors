// Constants
export const KG_TO_LBS = 2.2;
export const LBS_TO_KG = 0.45;

export const calculateTempoTotal = (tempo?: string): number => {
  if (!tempo) return 0;  // Return 0 if tempo is undefined
  return tempo.split('').reduce((sum, char) => {
    // Treat 'X' or 'x' as 1 second
    if (char.toLowerCase() === 'x') {
      return sum + 1;
    }
    return sum + parseInt(char) || 0;
  }, 0);
};

export const getNumericLoad = (load: string | number): number => {
  if (typeof load === 'string') {
    // Try to parse numeric strings first
    const parsedLoad = parseFloat(load);
    if (!isNaN(parsedLoad)) {
      return parsedLoad;
    }
    // For resistance bands or BW, we'll return 0 for volume calculations
    return 0;
  }
  return load;
};

export const convertWeight = (weight: number, fromUnit: 'kg' | 'lbs', toUnit: 'kg' | 'lbs'): number => {
  if (fromUnit === toUnit) return weight;
  return fromUnit === 'kg' ? weight * KG_TO_LBS : weight * LBS_TO_KG;
}; 