'use client';

import React, { useState } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import type { CMEExercise } from '../types/cme.zod';

interface ExerciseItemProps {
  exercise: CMEExercise;
  onEdit: (exerciseId: number) => void;
  onDelete: (exerciseId: number) => void;
  userHeartRateZones?: any[]; // Add this prop for heart rate zone data
}

export default function ExerciseItem({ exercise, onEdit, onDelete, userHeartRateZones }: ExerciseItemProps) {
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

  const getExerciseId = () => {
    // Use activityId as the primary identifier
    return exercise.activityId;
  };

  // Calculate summary
  const totalDuration = exercise.intervals.reduce((sum, interval) => sum + interval.duration, 0);
  const totalWorkDuration = exercise.intervals
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
    exercise.intervals.forEach(interval => {
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
    if (exercise.intervals.some(interval => interval.duration > 0)) count++; // Duration
    if (hasMetrics) count += uniqueMetrics.length; // Dynamic metrics
    return count;
  };

  const columnCount = getColumnCount();

  return (
    <div className="bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-medium dark:text-slate-900">{exercise.activityName}</span>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleMenu(getExerciseId());
            }}
            aria-label="Exercise options"
            aria-expanded={!!menuOpen[getExerciseId()]}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <HiOutlineDotsVertical className="h-5 w-5 text-gray-600 dark:text-slate-900" aria-hidden="true" />
          </button>
          {menuOpen[getExerciseId()] && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={closeMenu}
              />
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-20">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit(getExerciseId());
                      closeMenu();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(getExerciseId());
                      closeMenu();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Exercise Details Table */}
      <div className="mt-3">
        {/* Desktop table header */}
        <div className={`hidden md:grid gap-2 text-sm font-semibold text-gray-500 dark:text-slate-600`} style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
          <div>Step</div>
          <div className="font-bold">Step Type</div>
          {exercise.intervals.some(interval => interval.duration > 0) && (
            <div className="font-bold">Duration (min)</div>
          )}
          {uniqueMetrics.map(metric => (
            <div key={metric} className="font-bold">{metric}</div>
          ))}
          <div className="font-bold">Notes</div>
        </div>
        
        {/* Desktop table rows */}
        <div className={`hidden md:grid gap-2 text-sm dark:text-slate-600`} style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
          {exercise.intervals.map((interval, idx) => {
            // Check if this is part of a repeat pattern (Work/Recovery cycles)
            const isWork = interval.stepType === 'Work';
            const isRecovery = interval.stepType === 'Recovery';
            const isInRepeatPattern = isWork || isRecovery;
            
            // Check if this is the start of a new repeat pattern
            const isStartOfPattern = isWork && (
              idx === 0 || 
              exercise.intervals[idx - 1]?.stepType !== 'Recovery'
            );
            
            return (
              <React.Fragment key={idx}>
                <div className="flex items-center">
                  <span className={isInRepeatPattern ? 'ml-4' : ''}>
                    {idx + 1}
                  </span>
                </div>
                <div className="flex items-center">{interval.stepType}</div>
                {exercise.intervals.some(interval => interval.duration > 0) && (
                  <div className="flex items-center">{formatDuration(interval.duration)}</div>
                )}
                {uniqueMetrics.map(metric => (
                  <div key={metric} className="flex items-center">
                    {metric === 'Heart Rate Target' && interval.heartRateData ? (
                      // Special handling for heart rate target using interval's own heartRateData
                      interval.heartRateData.type === 'zone' ? (
                        // Find zone label and BPM range from userHeartRateZones using the exercise's activity family
                        (() => {
                          const activityZones = userHeartRateZones?.find((z: any) => z.activityType.toLowerCase() === exercise.activityFamily?.toLowerCase());
                          const zone = activityZones?.zones?.find((zone: any) => `zone${zone.id}` === interval.heartRateData?.value);
                          if (zone && zone.minBpm && zone.maxBpm) {
                            return `Zone ${zone.id} (${zone.minBpm}-${zone.maxBpm} BPM)`;
                          }
                          return interval.heartRateData.value;
                        })()
                      ) : (
                        // Custom range
                        `${interval.heartRateData.min}-${interval.heartRateData.max} BPM`
                      )
                    ) : (
                      // Regular metrics
                      interval.metrics && interval.metrics[metric] !== undefined ? interval.metrics[metric] || '-' : '-'
                    )}
                  </div>
                ))}
                <div className="flex items-center">{interval.notes || '-'}</div>
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Mobile-friendly card layout */}
        <div className="md:hidden space-y-3">
          {exercise.intervals.map((interval, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-3 border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">Step {idx + 1}</span>
                <span className="text-sm font-bold text-gray-500">{interval.stepType}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {exercise.intervals.some(interval => interval.duration > 0) && (
                  <div>
                    <div className="font-bold text-gray-600 mb-1">Duration</div>
                    <span className="text-gray-800">{formatDuration(interval.duration)}</span>
                  </div>
                )}
                {uniqueMetrics.map(metric => (
                  <div key={metric}>
                    <div className="font-bold text-gray-600 mb-1">{metric}</div>
                    <span className="text-gray-800">
                      {metric === 'Heart Rate Target' && interval.heartRateData ? (
                        // Special handling for heart rate target using interval's own heartRateData
                        interval.heartRateData.type === 'zone' ? (
                          // Find zone label and BPM range from userHeartRateZones using the exercise's activity family
                          (() => {
                            const activityZones = userHeartRateZones?.find((z: any) => z.activityType.toLowerCase() === exercise.activityFamily?.toLowerCase());
                            const zone = activityZones?.zones?.find((zone: any) => `zone${zone.id}` === interval.heartRateData?.value);
                            if (zone && zone.minBpm && zone.maxBpm) {
                              return `Zone ${zone.id} (${zone.minBpm}-${zone.maxBpm} BPM)`;
                            }
                            return interval.heartRateData.value;
                          })()
                        ) : (
                          // Custom range
                          `${interval.heartRateData.min}-${interval.heartRateData.max} BPM`
                        )
                      ) : (
                        // Regular metrics - filter out internal metadata fields
                        interval.metrics && 
                        interval.metrics[metric] !== undefined && 
                        !metric.endsWith('_type') && 
                        !metric.endsWith('_min') && 
                        !metric.endsWith('_max') &&
                        metric !== 'Duration' &&
                        metric !== 'Heart Rate Target_type' &&
                        metric !== 'Heart Rate Target_min' &&
                        metric !== 'Heart Rate Target_max' ? 
                          interval.metrics[metric] || '-' : '-'
                      )}
                    </span>
                  </div>
                ))}
              </div>
              {interval.notes && (
                <div className="mt-2 text-sm">
                  <div className="font-bold text-gray-600 mb-1">Notes</div>
                  <span className="text-gray-800">{interval.notes}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary and Notes */}
      <div className="mt-3 border-t pt-3">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm font-medium text-purple-700">
            <div>
              <span className="mr-1">Total Duration:</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                {formatDuration(totalDuration)}
              </span>
            </div>
            {exercise.useIntervals && (
              <div>
                <span className="mr-1">Intervals:</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {exercise.totalRepeatCount || 0}
                </span>
              </div>
            )}
            {totalWorkDuration > 0 && (
              <div>
                <span className="mr-1">Work Time:</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {formatDuration(totalWorkDuration)}
                </span>
              </div>
            )}
            <div>
              <span className="mr-1">Type:</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                {exercise.useIntervals ? 'Interval Training' : 'Steady State'}
              </span>
            </div>
          </div>
          {exercise.notes && (
            <div className="text-sm text-gray-600">
              <span>
                <span className="font-medium dark:text-slate-900">Notes: </span>
                <span className="dark:text-slate-900">{exercise.notes}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}