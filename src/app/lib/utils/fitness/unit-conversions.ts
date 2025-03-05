// Constants
export const KG_TO_LBS = 2.2;
export const LBS_TO_KG = 0.45;

export const calculate_tempo_total = (tempo?: string): number => {
  if (!tempo) return 0;  // Return 0 if tempo is undefined
  return tempo.split('').reduce((sum, char) => {
    // Treat 'X' or 'x' as 1 second
    if (char.toLowerCase() === 'x') {
      return sum + 1;
    }
    return sum + parseInt(char) || 0;
  }, 0);
};

export const get_numeric_load = (load: string | number): number => {
  if (typeof load === 'string') {
    // Try to parse numeric strings first
    const parsed_load = parseFloat(load);
    if (!isNaN(parsed_load)) {
      return parsed_load;
    }
    // For resistance bands or BW, we'll return 0 for volume calculations
    return 0;
  }
  return load;
};

export const convert_weight = (weight: number, from_unit: 'kg' | 'lbs', to_unit: 'kg' | 'lbs'): number => {
  if (from_unit === to_unit) return weight;
  return from_unit === 'kg' ? weight * KG_TO_LBS : weight * LBS_TO_KG;
}; 