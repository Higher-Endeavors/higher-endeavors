import type { CMEMetric, CMEActivityFamilyConfig } from '../types/cme.zod';

export const CME_ACTIVITY_FAMILY_CONFIG: Record<string, CMEActivityFamilyConfig> = {
  'Running': {
    name: 'Running',
    metrics: [
      { name: 'Pace', type: 'text', label: 'Pace', placeholder: 'e.g., 8:30/mile' },
      { name: 'Distance', type: 'number', label: 'Distance', placeholder: 'Enter distance', min: 0.1 },
      { name: 'Duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration', min: 1 },
      { name: 'Heart Rate', type: 'number', label: 'Heart Rate (BPM)', placeholder: 'Enter heart rate', min: 40, max: 220 },
      { name: 'Calories', type: 'number', label: 'Calories', placeholder: 'Enter calories burned', min: 0 },
      { name: 'Cadence', type: 'number', label: 'Cadence (spm)', placeholder: 'Steps per minute', min: 120, max: 200 },
    ],
    defaultMetrics: ['Distance', 'Duration', 'Pace', 'Heart Rate']
  },

  'Cycling': {
    name: 'Cycling',
    metrics: [
      { name: 'Speed', type: 'number', label: 'Speed', placeholder: 'Enter speed', min: 0.1, max: 50 },
      { name: 'Distance', type: 'number', label: 'Distance', placeholder: 'Enter distance', min: 0.1 },
      { name: 'Duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration', min: 1 },
      { name: 'Heart Rate', type: 'number', label: 'Heart Rate (BPM)', placeholder: 'Enter heart rate', min: 40, max: 220 },
      { name: 'Calories', type: 'number', label: 'Calories', placeholder: 'Enter calories burned', min: 0 },
      { name: 'Cadence', type: 'number', label: 'Cadence (rpm)', placeholder: 'Revolutions per minute', min: 40, max: 120 },
      { name: 'Power', type: 'number', label: 'Power (watts)', placeholder: 'Enter power output', min: 0, max: 1000 },
    ],
    defaultMetrics: ['Distance', 'Duration', 'Speed', 'Cadence', 'Heart Rate']
  },

  'Swimming': {
    name: 'Swimming',
    metrics: [
      { name: 'Pace', type: 'text', label: 'Pace', placeholder: 'e.g., 1:45/100m' },
      { name: 'Distance', type: 'number', label: 'Distance', placeholder: 'Enter distance', min: 25 },
      { name: 'Duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration', min: 1 },
      { name: 'Heart Rate', type: 'number', label: 'Heart Rate (BPM)', placeholder: 'Enter heart rate', min: 40, max: 220 },
      { name: 'Calories', type: 'number', label: 'Calories', placeholder: 'Enter calories burned', min: 0 },
      { name: 'Strokes', type: 'number', label: 'Strokes', placeholder: 'Enter stroke count', min: 1 },
    ],
    defaultMetrics: ['Distance', 'Duration', 'Pace', 'Strokes', 'Heart Rate']
  },

  'Rowing': {
    name: 'Rowing',
    metrics: [
      { name: 'Pace', type: 'text', label: 'Pace', placeholder: 'e.g., 2:00/500m' },
      { name: 'Distance', type: 'number', label: 'Distance', placeholder: 'Enter distance', min: 100 },
      { name: 'Duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration', min: 1 },
      { name: 'Heart Rate', type: 'number', label: 'Heart Rate (BPM)', placeholder: 'Enter heart rate', min: 40, max: 220 },
      { name: 'Calories', type: 'number', label: 'Calories', placeholder: 'Enter calories burned', min: 0 },
      { name: 'Strokes', type: 'number', label: 'Strokes', placeholder: 'Enter stroke count', min: 1 },
      { name: 'Power', type: 'number', label: 'Power (watts)', placeholder: 'Enter power output', min: 0, max: 1000 },
    ],
    defaultMetrics: ['Distance', 'Duration', 'Pace', 'Strokes', 'Heart Rate']
  },

  'Walking': {
    name: 'Walking',
    metrics: [
      { name: 'Speed', type: 'number', label: 'Speed', placeholder: 'Enter speed', min: 0.1, max: 8 },
      { name: 'Distance', type: 'number', label: 'Distance', placeholder: 'Enter distance', min: 0.1 },
      { name: 'Duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration', min: 1 },
      { name: 'Heart Rate', type: 'number', label: 'Heart Rate (BPM)', placeholder: 'Enter heart rate', min: 40, max: 220 },
      { name: 'Calories', type: 'number', label: 'Calories', placeholder: 'Enter calories burned', min: 0 },
      { name: 'Cadence', type: 'number', label: 'Cadence (spm)', placeholder: 'Steps per minute', min: 80, max: 140 },
    ],
    defaultMetrics: ['Distance', 'Duration', 'Pace', 'Heart Rate']
  },

  'General': {
    name: 'General',
    metrics: [
      { name: 'Duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration', min: 1 },
      { name: 'Heart Rate', type: 'number', label: 'Heart Rate (BPM)', placeholder: 'Enter heart rate', min: 40, max: 220 },
      { name: 'Calories', type: 'number', label: 'Calories', placeholder: 'Enter calories burned', min: 0 },
    ],
    defaultMetrics: ['Duration', 'Heart Rate']
  },

  'Nordic & Snow': {
    name: 'Nordic & Snow',
    metrics: [
      { name: 'Pace', type: 'text', label: 'Pace', placeholder: 'e.g., 6:00/km' },
      { name: 'Speed', type: 'number', label: 'Speed', placeholder: 'Enter speed', min: 0.1, max: 25 },
      { name: 'Distance', type: 'number', label: 'Distance', placeholder: 'Enter distance', min: 0.1 },
      { name: 'Duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration', min: 1 },
      { name: 'Heart Rate', type: 'number', label: 'Heart Rate (BPM)', placeholder: 'Enter heart rate', min: 40, max: 220 },
      { name: 'Calories', type: 'number', label: 'Calories', placeholder: 'Enter calories burned', min: 0 },
      { name: 'Cadence', type: 'number', label: 'Cadence (spm)', placeholder: 'Strides per minute', min: 60, max: 180 },
    ],
    defaultMetrics: ['Distance', 'Duration', 'Pace', 'Heart Rate']
  },

  'Watersport': {
    name: 'Watersport',
    metrics: [
      { name: 'Speed', type: 'number', label: 'Speed', placeholder: 'Enter speed', min: 0.1, max: 15 },
      { name: 'Distance', type: 'number', label: 'Distance', placeholder: 'Enter distance', min: 25 },
      { name: 'Duration', type: 'number', label: 'Duration (minutes)', placeholder: 'Enter duration', min: 1 },
      { name: 'Heart Rate', type: 'number', label: 'Heart Rate (BPM)', placeholder: 'Enter heart rate', min: 40, max: 220 },
      { name: 'Calories', type: 'number', label: 'Calories', placeholder: 'Enter calories burned', min: 0 },
      { name: 'Strokes', type: 'number', label: 'Strokes', placeholder: 'Enter stroke count', min: 1 },
    ],
    defaultMetrics: ['Distance', 'Duration', 'Pace', 'Heart Rate']
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
