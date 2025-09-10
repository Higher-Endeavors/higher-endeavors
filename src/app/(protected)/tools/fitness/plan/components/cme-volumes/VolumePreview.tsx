import React from 'react';
import { HiChevronDown } from 'react-icons/hi';
import type { CMEVolumeSettings, CMEVolumePlan } from './cme-volumes.zod';

interface VolumePreviewProps {
  settings: CMEVolumeSettings;
  totalWeeks: number;
  onPlanChange?: (plan: CMEVolumePlan[]) => void;
}

export default function VolumePreview({ settings, totalWeeks, onPlanChange }: VolumePreviewProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  // Calculate volume progression based on settings
  const calculateVolumeProgression = () => {
    const progression = [];
    let currentVolume = settings.baselineVolume;
    
    for (let week = 1; week <= totalWeeks; week++) {
      // Check if this is a deload week
      const isDeloadWeek = (week - 1) % settings.deloadEvery === 0 && week > 1;
      
      if (isDeloadWeek) {
        // Apply deload reduction
        currentVolume = Math.round(currentVolume * (1 - settings.deloadReduction / 100));
      } else if (week > 1) {
        // Apply ramp rate
        currentVolume = Math.round(currentVolume * (1 + settings.rampRate / 100));
      }
      
      // Cap at peak volume
      currentVolume = Math.min(currentVolume, settings.peakVolume);
      
      // Calculate activity volumes
      const activityVolumes: { [activityId: string]: { volume: number; tiz: any } } = {};
      settings.activities.forEach(activity => {
        const activityVolume = Math.round(currentVolume * (activity.volumePercentage / 100));
        activityVolumes[activity.id] = {
          volume: activityVolume,
          tiz: {
            z1: Math.round(activityVolume * (settings.tizTargets.z1 / settings.tizTargets.total)),
            z2: Math.round(activityVolume * (settings.tizTargets.z2 / settings.tizTargets.total)),
            z3: Math.round(activityVolume * (settings.tizTargets.z3 / settings.tizTargets.total)),
            z4: Math.round(activityVolume * (settings.tizTargets.z4 / settings.tizTargets.total)),
            z5: Math.round(activityVolume * (settings.tizTargets.z5 / settings.tizTargets.total)),
          }
        };
      });
      
      progression.push({
        week,
        totalVolume: currentVolume,
        activities: activityVolumes,
      });
    }
    
    return progression;
  };

  const volumeProgression = calculateVolumeProgression();
  const maxVolume = Math.max(...volumeProgression.map(w => w.totalVolume));
  const minVolume = Math.min(...volumeProgression.map(w => w.totalVolume));

  // Generate chart data for visualization
  const chartData = volumeProgression.map(week => ({
    week: week.week,
    volume: week.totalVolume,
    percentage: ((week.totalVolume - minVolume) / (maxVolume - minVolume)) * 100,
  }));

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
      >
        <span>Volume Progression Preview</span>
        <HiChevronDown className={`h-4 w-4 transform transition-transform ${isExpanded ? '' : '-rotate-180'}`} />
      </button>

      {isExpanded && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-slate-800">{settings.baselineVolume}</div>
              <div className="text-xs text-slate-500">Baseline (min/week)</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-slate-800">{settings.peakVolume}</div>
              <div className="text-xs text-slate-500">Peak (min/week)</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-slate-800">{settings.rampRate}%</div>
              <div className="text-xs text-slate-500">Ramp Rate</div>
            </div>
          </div>

          {/* Volume Progression Chart */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-slate-700">Weekly Volume Progression</h4>
              <div className="text-xs text-slate-500">
                {minVolume} - {maxVolume} min/week
              </div>
            </div>
            
            <div className="space-y-2">
              {chartData.slice(0, 12).map((week) => (
                <div key={week.week} className="flex items-center gap-3">
                  <div className="w-8 text-xs text-slate-600">W{week.week}</div>
                  <div className="flex-1 bg-slate-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-300"
                      style={{ width: `${week.percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-xs text-slate-600 text-right">{week.volume}m</div>
                </div>
              ))}
              
              {chartData.length > 12 && (
                <div className="text-xs text-slate-500 text-center py-2">
                  ... and {chartData.length - 12} more weeks
                </div>
              )}
            </div>
          </div>

          {/* Activity Breakdown Preview */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Activity Distribution (Week 1)</h4>
            <div className="space-y-2">
              {settings.activities.map((activity) => {
                const week1Volume = volumeProgression[0]?.activities[activity.id]?.volume || 0;
                const percentage = settings.tizTargets.total > 0 ? (week1Volume / settings.tizTargets.total) * 100 : 0;
                
                return (
                  <div key={activity.id} className="flex items-center gap-3">
                    <span className="text-lg">{activity.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{activity.name}</span>
                        <span className="text-slate-600">{week1Volume}m ({activity.volumePercentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full transition-all duration-300 ${activity.color.split(' ')[0].replace('bg-', 'bg-')}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deload Schedule */}
          <div className="bg-amber-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-amber-800 mb-2">Deload Schedule</h4>
            <div className="text-xs text-amber-700">
              Deload weeks occur every {settings.deloadEvery} weeks with {settings.deloadReduction}% volume reduction
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {volumeProgression
                .filter(week => (week.week - 1) % settings.deloadEvery === 0 && week.week > 1)
                .slice(0, 8)
                .map(week => (
                  <span
                    key={week.week}
                    className="px-2 py-1 bg-amber-200 text-amber-800 rounded text-xs"
                  >
                    W{week.week}
                  </span>
                ))}
              {volumeProgression.filter(week => (week.week - 1) % settings.deloadEvery === 0 && week.week > 1).length > 8 && (
                <span className="px-2 py-1 bg-amber-200 text-amber-800 rounded text-xs">
                  +{volumeProgression.filter(week => (week.week - 1) % settings.deloadEvery === 0 && week.week > 1).length - 8} more
                </span>
              )}
            </div>
          </div>

          {/* Export/Apply Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onPlanChange?.(volumeProgression)}
              className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              Apply to Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
