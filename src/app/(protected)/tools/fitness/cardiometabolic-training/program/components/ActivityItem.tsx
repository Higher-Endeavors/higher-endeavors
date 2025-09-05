'use client';

import React, { useState } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import type { CMEExercise } from '../../lib/types/cme.zod';

interface ActivityItemProps {
  activity: CMEExercise;
  onEdit: (activityId: number) => void;
  onDelete: (activityId: number) => void;
  userHeartRateZones?: any[]; // Add this prop for heart rate zone data
}

export default function ActivityItem({ activity, onEdit, onDelete, userHeartRateZones }: ActivityItemProps) {
  const [menuOpen, setMenuOpen] = useState<{ [key: number]: boolean }>({});

  const toggleMenu = (id: number) => {
    setMenuOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const closeMenu = () => {
    setMenuOpen({});
  };

  const getActivityId = () => {
    // Use activityId as the primary identifier
    return activity.activityId;
  };

  // Calculate summary
  const totalDuration = activity.intervals.reduce((sum, interval) => sum + interval.duration, 0);
  const totalWorkDuration = activity.intervals
    .filter(interval => interval.stepType === 'Work')
    .reduce((sum, interval) => sum + interval.duration, 0);
  
  // Helper function to format duration from decimal minutes to MM:SS
  const formatDuration = (duration: number) => {
    if (!duration || duration <= 0) return '0:00';
    const minutes = Math.floor(duration);
    const seconds = Math.round((duration - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get unique metrics from all intervals to determine column headers
  const getUniqueMetrics = () => {
    const metrics = new Set<string>();
    activity.intervals.forEach(interval => {
      if (interval.metrics) {
        Object.keys(interval.metrics).forEach(metricName => {
          // Filter out internal metadata fields that shouldn't be displayed as columns
          if (metricName && 
              metricName !== '' && 
              !metricName.endsWith('_type') && 
              !metricName.endsWith('_min') && 
              !metricName.endsWith('_max') &&
              metricName !== 'Duration' && // Skip Duration since we have Duration (min)
              metricName !== 'Heart Rate Target_type' &&
              metricName !== 'Heart Rate Target_min' &&
              metricName !== 'Heart Rate Target_max') {
            metrics.add(metricName);
          }
        });
      }
      
      // Add heart rate target if this interval has heart rate data
      if (interval.heartRateData) {
        metrics.add('Heart Rate Target');
      }
    });
    
    return Array.from(metrics);
  };

  const uniqueMetrics = getUniqueMetrics();
  const hasMetrics = uniqueMetrics.length > 0;

  // Determine column layout based on available data
  const getColumnCount = () => {
    let count = 3; // Set, Step Type, Notes (always present)
    if (activity.intervals.some(interval => interval.duration > 0)) count++; // Duration
    if (hasMetrics) count += uniqueMetrics.length; // Dynamic metrics
    return count;
  };

  const columnCount = getColumnCount();

  return (
    <div className="bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-medium dark:text-slate-900">{activity.activityName}</span>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleMenu(getActivityId());
            }}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors"
            aria-label="Activity options"
            aria-expanded={!!menuOpen[getActivityId()]}
            aria-haspopup="true"
          >
            <HiOutlineDotsVertical className="h-5 w-5 text-gray-600 dark:text-gray-700" />
          </button>

          {menuOpen[getActivityId()] && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
              <div className="py-1">
                <button
                  onClick={() => {
                    onEdit(getActivityId());
                    closeMenu();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(getActivityId());
                    closeMenu();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Details Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-300">
              <th className="text-left py-2 font-medium text-gray-900 dark:text-slate-900">Set</th>
              <th className="text-left py-2 font-medium text-gray-900 dark:text-slate-900">Step Type</th>
              {activity.intervals.some(interval => interval.duration > 0) && (
                <th className="text-left py-2 font-medium text-gray-900 dark:text-slate-900">Duration</th>
              )}
              {uniqueMetrics.map((metric, idx) => (
                <th key={idx} className="text-left py-2 font-medium text-gray-900 dark:text-slate-900">{metric}</th>
              ))}
              <th className="text-left py-2 font-medium text-gray-900 dark:text-slate-900">Notes</th>
            </tr>
          </thead>
          <tbody>
            {activity.intervals.map((interval, idx) => {
              // Check if this interval should show a set number
              const shouldShowSetNumber = idx === 0 || 
                activity.intervals[idx - 1]?.stepType !== 'Recovery' ||
                interval.stepType === 'Work';

              return (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-200">
                  <td className="py-2 text-gray-600 dark:text-slate-600">
                    {shouldShowSetNumber ? idx + 1 : ''}
                  </td>
                  <td className="py-2 text-gray-600 dark:text-slate-600">{interval.stepType}</td>
                  {activity.intervals.some(interval => interval.duration > 0) && (
                    <td className="py-2 text-gray-600 dark:text-slate-600">
                      {formatDuration(interval.duration)}
                    </td>
                  )}
                  {uniqueMetrics.map((metric, metricIdx) => {
                    // Find zone label and BPM range from userHeartRateZones using the activity's activity family
                    if (metric === 'Heart Rate Target' && interval.heartRateData) {
                      const activityZones = userHeartRateZones?.find((z: any) => z.activityType.toLowerCase() === activity.activityFamily?.toLowerCase());
                      
                      if (interval.heartRateData?.type === 'zone' && activityZones) {
                        const zone = activityZones.zones.find((z: any) => z.zone === interval.heartRateData?.value);
                        if (zone) {
                          return (
                            <td key={metricIdx} className="py-2 text-gray-600 dark:text-slate-600">
                              {zone.label} ({zone.min}-{zone.max} BPM)
                            </td>
                          );
                        }
                      }
                      
                      // Fallback to just showing the value
                      return (
                        <td key={metricIdx} className="py-2 text-gray-600 dark:text-slate-600">
                          {interval.heartRateData?.value || ''}
                        </td>
                      );
                    }
                    
                    // For other metrics, display the value
                    const value = interval.metrics?.[metric];
                    return (
                      <td key={metricIdx} className="py-2 text-gray-600 dark:text-slate-600">
                        {value || ''}
                      </td>
                    );
                  })}
                  <td className="py-2 text-gray-600 dark:text-slate-600">{interval.notes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Information */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-300">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-slate-500">Total Duration:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-slate-900">{formatDuration(totalDuration)}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-slate-500">Work Duration:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-slate-900">{formatDuration(totalWorkDuration)}</span>
          </div>
          {activity.useIntervals && (
            <div>
              <span className="text-gray-500 dark:text-slate-500">Total Repeats:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-slate-900">
                {activity.totalRepeatCount || 0}
              </span>
            </div>
          )}
          <div>
            <span className="text-gray-500 dark:text-slate-500">Type:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-slate-900">
              {activity.useIntervals ? 'Interval Training' : 'Steady State'}
            </span>
          </div>
        </div>

        {activity.notes && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-300">
            <span className="text-gray-500 dark:text-slate-500">Notes:</span>
            <span className="ml-2 dark:text-slate-900">{activity.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}