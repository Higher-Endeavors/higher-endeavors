import { Exercise } from '../types';

/**
 * Generates the next available pairing based on existing exercises
 * Follows the pattern: A1, A2, B1, B2, C1, C2, etc.
 * Skips warm-up (WU) and cool-down (CD) exercises
 */
export const generateNextPairing = (exercises: Exercise[]): string => {
  const existingPairings = exercises
    .map(ex => ex.pairing)
    .filter(p => !p.includes('WU') && !p.includes('CD'));

  if (existingPairings.length === 0) {
    return 'A1';
  }

  const lastPairing = existingPairings[existingPairings.length - 1];
  const letter = lastPairing.charAt(0);
  const number = parseInt(lastPairing.charAt(1));

  if (number === 2) {
    // Move to next letter, start with 1
    return String.fromCharCode(letter.charCodeAt(0) + 1) + '1';
  } else {
    // Keep same letter, move to 2
    return letter + '2';
  }
};

/**
 * Updates exercise pairings after reordering or deletion
 * Maintains A1, A2, B1, B2 pattern while preserving WU/CD
 */
export const updatePairingsAfterReorder = (exercises: Exercise[]): Exercise[] => {
  // Separate special pairings (WU/CD) from regular exercises
  const specialExercises = exercises.filter(ex => 
    ex.pairing.includes('WU') || ex.pairing.includes('CD')
  );
  const regularExercises = exercises.filter(ex => 
    !ex.pairing.includes('WU') && !ex.pairing.includes('CD')
  );

  // Update regular exercise pairings
  const updatedRegularExercises = regularExercises.map((exercise, index) => {
    const letter = String.fromCharCode(65 + Math.floor(index / 2)); // A, A, B, B, C, C, ...
    const number = (index % 2) + 1; // 1, 2, 1, 2, ...
    return {
      ...exercise,
      pairing: `${letter}${number}`
    };
  });

  // Combine special and regular exercises
  // Special exercises should maintain their original positions
  const finalExercises = [...exercises];
  exercises.forEach((ex, index) => {
    if (ex.pairing.includes('WU') || ex.pairing.includes('CD')) {
      finalExercises[index] = ex;
    } else {
      const regularIndex = regularExercises.findIndex(r => r.id === ex.id);
      if (regularIndex !== -1) {
        finalExercises[index] = updatedRegularExercises[regularIndex];
      }
    }
  });

  return finalExercises;
}; 