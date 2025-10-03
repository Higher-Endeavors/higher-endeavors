"use client";

import WeeklyVolumeWidget from '(protected)/user/widgets/WeeklyCMEVolumeWidget';
import TimeInZonesWidget from '(protected)/user/widgets/TimeInZonesWidget';
import TrainingLoadWidget from '(protected)/user/widgets/TrainingLoadWidget';
import RecoveryStatusWidget from '(protected)/user/widgets/RecoveryStatusWidget';
import WorkoutIntensityWidget from '(protected)/user/widgets/WorkoutIntensityWidget';
import WeeklyGoalsWidget from '(protected)/user/widgets/WeeklyGoalsWidget';

interface FitnessDashboardProps {
  className?: string;
  garminAttribution: string;
}

export default function FitnessDashboard({ className = '', garminAttribution }: FitnessDashboardProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Weekly Metrics</h2>
          <p className="text-slate-600 dark:text-slate-400">Your Pillar data for this week</p>
        </div>
        <button className="text-sky-600 hover:text-sky-800 font-medium text-sm">
          View Details →
        </button>
      </div>

      {/* Fitness Metrics Grid - 4 columns on desktop, 2 on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core Training Metrics */}
        <WeeklyVolumeWidget garminAttribution={garminAttribution} />
        <TimeInZonesWidget garminAttribution={garminAttribution} />
        <TrainingLoadWidget />
        <RecoveryStatusWidget />
        
        {/* Additional Metrics */}
        <WorkoutIntensityWidget />
        <WeeklyGoalsWidget />
      </div>
    </div>
  );
}
