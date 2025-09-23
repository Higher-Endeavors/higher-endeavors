'use client';

import { useState, useEffect, useCallback } from 'react';
import { useExerciseInstances, type ExerciseInstancesData } from './useExerciseInstances';

// Transform the exercise instances data into the format expected by the chart component
function transformToAnalysisData(data: ExerciseInstancesData) {
  // Group instances by time periods (similar to the old logic)
  const now = new Date();
  const groups: { [key: string]: any[] } = {};
  
  data.instances.forEach(instance => {
    const instanceDate = new Date(instance.executionDate);
    let periodKey: string;
    
    // Use the same grouping logic as the original function
    switch (data.timeframe) {
      case 'week':
        const weekStart = new Date(instanceDate);
        weekStart.setDate(instanceDate.getDate() - instanceDate.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        periodKey = `${instanceDate.getFullYear()}-${String(instanceDate.getMonth() + 1).padStart(2, '0')}`;
        break;
      case '3month':
        const quarter = Math.floor(instanceDate.getMonth() / 3) + 1;
        periodKey = `${instanceDate.getFullYear()}-Q${quarter}`;
        break;
      case '6month':
        const halfYear = instanceDate.getMonth() < 6 ? 'H1' : 'H2';
        periodKey = `${instanceDate.getFullYear()}-${halfYear}`;
        break;
      case 'year':
        periodKey = instanceDate.getFullYear().toString();
        break;
      default:
        periodKey = instanceDate.toISOString().split('T')[0];
    }
    
    if (!groups[periodKey]) {
      groups[periodKey] = [];
    }
    groups[periodKey].push(instance);
  });
  
  // Convert to array and calculate averages
  const timeframeData = Object.entries(groups)
    .map(([period, periodInstances]) => {
      const totalLoadVolume = periodInstances.reduce((sum, inst) => sum + inst.loadVolume, 0);
      const averageLoadVolume = totalLoadVolume / periodInstances.length;
      
      return {
        period,
        instances: periodInstances,
        averageLoadVolume,
        totalLoadVolume,
        instanceCount: periodInstances.length
      };
    })
    .sort((a, b) => a.period.localeCompare(b.period));

  return {
    exerciseName: data.exerciseName,
    instances: data.instances,
    timeframeData
  };
}

interface UseExerciseAnalysisResult {
  analysis: any | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useExerciseAnalysis(
  userId: number,
  exerciseId: string | null,
  timeframe: string
): UseExerciseAnalysisResult {
  const { data, isLoading, error, refetch } = useExerciseInstances(userId, exerciseId, timeframe);
  
  const analysis = data ? transformToAnalysisData(data) : null;


  return {
    analysis,
    isLoading,
    error,
    refetch
  };
}
