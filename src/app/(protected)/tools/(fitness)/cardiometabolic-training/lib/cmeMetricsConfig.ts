import type { CMEMetric, CMEActivityFamilyConfig } from '../types/cme.zod';

export const CME_ACTIVITY_FAMILY_CONFIG: Record<string, CMEActivityFamilyConfig> = {
  'Running': {
    name: 'Running',
    metrics: [
      { name: 'Duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration' },
      { name: 'Distance', type: 'distance', label: 'Distance', placeholder: 'Enter distance', min: 0.1 },
      { name: 'Pace', type: 'text', label: 'Pace', placeholder: 'e.g., 8:30/mile' },
      { name: 'Speed', type: 'number', label: 'Speed', placeholder: 'Enter speed', min: 0.1, max: 15 },
      { name: 'Heart Rate Target', type: 'heartRateTarget', label: 'Heart Rate Target', placeholder: 'Select target type' },
      { name: 'Calories', type: 'number', label: 'Calories', placeholder: 'Enter calories burned', min: 0 },
      { name: 'Cadence', type: 'number', label: 'Cadence (spm)', placeholder: 'Steps per minute', min: 120, max: 200 },
      { name: 'Weight', type: 'number', label: 'Weight (lbs)', placeholder: 'Enter weight carried', min: 0, max: 100 },
    ],
    defaultMetrics: ['Duration', 'Distance', 'Pace', 'Heart Rate Target']
  },

  'Cycling': {
    name: 'Cycling',
    metrics: [
      { name: 'Duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration' },
      { name: 'Distance', type: 'distance', label: 'Distance', placeholder: 'Enter distance', min: 0.1 },
      { name: 'Speed', type: 'number', label: 'Speed', placeholder: 'Enter speed', min: 0.1, max: 50 },
      { name: 'Pace', type: 'text', label: 'Pace', placeholder: 'e.g., 3:45/km' },
      { name: 'Heart Rate Target', type: 'heartRateTarget', label: 'Heart Rate Target', placeholder: 'Select target type' },
      { name: 'Cadence', type: 'number', label: 'Cadence (rpm)', placeholder: 'Revolutions per minute', min: 40, max: 120 },
      { name: 'Power', type: 'number', label: 'Power (watts)', placeholder: 'Enter power output', min: 0, max: 1000 },
      { name: 'Calories', type: 'number', label: 'Calories', placeholder: 'Enter calories burned', min: 0 },
    ],
    defaultMetrics: ['Duration', 'Distance', 'Speed', 'Cadence', 'Heart Rate Target']
  },

  'Swimming': {
    name: 'Swimming',
    metrics: [
      { name: 'Distance', type: 'distance', label: 'Distance', placeholder: 'Enter distance', min: 0.1 },
      { name: 'Duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration' },
      { name: 'Heart Rate Target', type: 'heartRateTarget', label: 'Heart Rate Target', placeholder: 'Select target type' },
      { name: 'Calories', type: 'number', label: 'Calories', placeholder: 'Enter calories burned', min: 0 },
      { name: 'Strokes', type: 'number', label: 'Strokes per length', placeholder: 'Enter stroke count', min: 1, max: 50 },
    ],
    defaultMetrics: ['Distance', 'Duration', 'Heart Rate Target']
  },

  'Rowing': {
    name: 'Rowing',
    metrics: [
      { name: 'Distance', type: 'distance', label: 'Distance', placeholder: 'Enter distance', min: 0.1 },
      { name: 'Duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration' },
      { name: 'Heart Rate Target', type: 'heartRateTarget', label: 'Heart Rate Target', placeholder: 'Select target type' },
      { name: 'Calories', type: 'number', label: 'Calories', placeholder: 'Enter calories burned', min: 0 },
      { name: 'Strokes', type: 'number', label: 'Strokes per minute', placeholder: 'Enter stroke rate', min: 15, max: 40 },
      { name: 'Power', type: 'number', label: 'Power (watts)', placeholder: 'Enter power output', min: 0, max: 1000 },
    ],
    defaultMetrics: ['Distance', 'Duration', 'Heart Rate Target']
  },

  'Walking': {
    name: 'Walking',
    metrics: [
      { name: 'Distance', type: 'distance', label: 'Distance', placeholder: 'Enter distance', min: 0.1 },
      { name: 'Duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration' },
      { name: 'Heart Rate Target', type: 'heartRateTarget', label: 'Heart Rate Target', placeholder: 'Select target type' },
      { name: 'Calories', type: 'number', label: 'Calories', placeholder: 'Enter calories burned', min: 0 },
      { name: 'Weight', type: 'number', label: 'Weight (lbs)', placeholder: 'Enter weight carried', min: 0, max: 100 },
    ],
    defaultMetrics: ['Distance', 'Duration', 'Heart Rate Target']
  },

  'General': {
    name: 'General',
    metrics: [
      { name: 'Duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration' },
      { name: 'Heart Rate Target', type: 'heartRateTarget', label: 'Heart Rate Target', placeholder: 'Select target type' },
      { name: 'Calories', type: 'number', label: 'Calories', placeholder: 'Enter calories burned', min: 0 },
    ],
    defaultMetrics: ['Duration', 'Heart Rate Target']
  },

  'Nordic & Snow': {
    name: 'Nordic & Snow',
    metrics: [
      { name: 'Distance', type: 'distance', label: 'Distance', placeholder: 'Enter distance', min: 0.1 },
      { name: 'Duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration' },
      { name: 'Heart Rate Target', type: 'heartRateTarget', label: 'Heart Rate Target', placeholder: 'Select target type' },
      { name: 'Calories', type: 'number', label: 'Calories', placeholder: 'Enter calories burned', min: 0 },
      { name: 'Power', type: 'number', label: 'Power (watts)', placeholder: 'Enter power output', min: 0, max: 1000 },
    ],
    defaultMetrics: ['Distance', 'Duration', 'Heart Rate Target']
  },

  'Watersport': {
    name: 'Watersport',
    metrics: [
      { name: 'Distance', type: 'distance', label: 'Distance', placeholder: 'Enter distance', min: 0.1 },
      { name: 'Duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration' },
      { name: 'Heart Rate Target', type: 'heartRateTarget', label: 'Heart Rate Target', placeholder: 'Select target type' },
      { name: 'Calories', type: 'number', label: 'Calories', placeholder: 'Enter calories burned', min: 0 },
      { name: 'Strokes', type: 'number', label: 'Strokes per minute', placeholder: 'Enter stroke rate', min: 15, max: 60 },
    ],
    defaultMetrics: ['Distance', 'Duration', 'Heart Rate Target']
  }
};

// Helper function to get CME activity family config by name
export function getCMEActivityFamilyConfig(activityFamilyName: string): CMEActivityFamilyConfig | null {
  return CME_ACTIVITY_FAMILY_CONFIG[activityFamilyName] || null;
}

// Helper function to get all available CME activity families
export function getAvailableCMEActivityFamilies(): string[] {
  return Object.keys(CME_ACTIVITY_FAMILY_CONFIG);
}

// Helper function to get default metrics for an activity family
export function getDefaultMetricsForActivityFamily(activityFamilyName: string): string[] {
  const config = getCMEActivityFamilyConfig(activityFamilyName);
  return config?.defaultMetrics || [];
}

// Helper function to check if an activity family supports a specific metric
export function supportsMetric(activityFamilyName: string, metricName: string): boolean {
  const config = getCMEActivityFamilyConfig(activityFamilyName);
  if (!config) return false;
  
  return config.metrics.some(metric => metric.name === metricName);
}
