export type FeaturePillar = 'Lifestyle Management' | 'Health' | 'Nutrition' | 'Fitness';

export type FeaturePriority = 'low' | 'medium' | 'high';

export interface Feature {
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed';
  pillar: FeaturePillar;
  priority: FeaturePriority;
  expectedCompletion?: string; // ISO date string
} 