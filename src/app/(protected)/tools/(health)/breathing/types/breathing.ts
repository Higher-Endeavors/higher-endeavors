export type BreathPattern = 'box' | 'pranayama' | 'custom';

export interface BreathTiming {
  inhale: number | null;
  pause1: number | null;
  exhale: number | null;
  pause2: number | null;
}

export interface BreathPhase {
  name: 'inhale' | 'pause1' | 'exhale' | 'pause2';
  duration: number;
  instruction: string;
}

export interface SessionSettings {
  type: 'breaths' | 'duration' | 'open';
  value: number | null;
}

export interface ChakraColor {
  name: string;
  color: string;
  description: string;
}

export const CHAKRA_COLORS: ChakraColor[] = [
  { name: 'Root', color: '#FF0000', description: 'Grounding and stability' },
  { name: 'Sacral', color: '#FF7F00', description: 'Creativity and emotion' },
  { name: 'Solar Plexus', color: '#FFFF00', description: 'Personal power and confidence' },
  { name: 'Heart', color: '#00FF00', description: 'Love and compassion' },
  { name: 'Throat', color: '#0000FF', description: 'Communication and expression' },
  { name: 'Third Eye', color: '#4B0082', description: 'Intuition and wisdom' },
  { name: 'Crown', color: '#9400D3', description: 'Spiritual connection and enlightenment' }
];
