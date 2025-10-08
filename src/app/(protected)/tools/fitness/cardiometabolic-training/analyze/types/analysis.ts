export type CMESessionSummary = {
  recordId: number;
  summaryId: string;
  displayName: string;
  date: string;
  activityType: string;
  durationSeconds: number;
  durationLabel: string;
  distanceMeters?: number;
  distanceLabel: string;
  family?: string;
  caloriesKcal?: number;
  avgSpeedMps?: number;
};


