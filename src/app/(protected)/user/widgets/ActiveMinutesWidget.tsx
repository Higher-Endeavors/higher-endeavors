'use client';

import { FaRunning, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import type { WidgetData, Trend } from '(protected)/user/widgets/types';
import { getActiveMinutesData, getActiveMinutes, calculateActiveMinutesTrend, formatActiveMinutes, getActiveMinutesGoal, calculateActiveMinutesProgress } from '(protected)/user/widgets/hooks/useActiveMinutesData';
import { useUserSettings } from 'context/UserSettingsContext';

interface ActiveMinutesWidgetProps {
  className?: string;
}

export default function ActiveMinutesWidget({ className = '' }: ActiveMinutesWidgetProps) {
  const [activeMinutesData, setActiveMinutesData] = useState({
    latestActiveMinutes: null as any,
    previousActiveMinutes: null as any,
    loading: true,
    error: null as string | null
  });
  const { userSettings } = useUserSettings();

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getActiveMinutesData();
        setActiveMinutesData(data);
      } catch (error) {
        setActiveMinutesData({
          latestActiveMinutes: null,
          previousActiveMinutes: null,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred'
        });
      }
    };

    loadData();
  }, []);

  const { latestActiveMinutes, previousActiveMinutes, loading, error } = activeMinutesData;

  // Check if Garmin is connected
  const isGarminConnected = userSettings?.general?.garminConnect?.isConnected === true;

  // Default data for when no real data is available
  const defaultData: WidgetData = {
    id: 'active-minutes',
    title: 'Active Minutes',
    value: 45,
    unit: 'min',
    trend: 'up' as Trend,
    trendValue: '+8%',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-200'
  };

  // Process real active minutes data if available and Garmin is connected
  let metricData: WidgetData = defaultData;
  let activeMinutes = 0;
  let goal = getActiveMinutesGoal();
  let progress = 0;
  let isDemoData = !isGarminConnected;
  
  if (latestActiveMinutes && !loading && !error && isGarminConnected) {
    activeMinutes = getActiveMinutes(latestActiveMinutes);
    const previousMinutes = previousActiveMinutes ? getActiveMinutes(previousActiveMinutes) : undefined;
    const trend = calculateActiveMinutesTrend(activeMinutes, previousMinutes);
    const progressData = calculateActiveMinutesProgress(activeMinutes, goal);

    metricData = {
      id: 'active-minutes',
      title: 'Active Minutes',
      value: activeMinutes,
      unit: 'min',
      trend: trend.trend,
      trendValue: trend.trend !== 'neutral' ? `${trend.trend === 'up' ? '+' : '-'}${trend.changePercent}%` : '0%',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-800',
      borderColor: 'border-emerald-200'
    };
    
    progress = progressData.percentage;
    isDemoData = false;
  } else if (loading && isGarminConnected) {
    metricData = {
      ...defaultData,
      value: 'Loading...',
      color: 'text-slate-500',
      textColor: 'text-slate-600'
    };
    isDemoData = false;
  } else if (error && isGarminConnected) {
    metricData = {
      ...defaultData,
      value: 'Error',
      color: 'text-red-500',
      textColor: 'text-red-600'
    };
    isDemoData = false;
  }

  return (
    <div className={`bg-white rounded-lg border-2 ${metricData.borderColor} overflow-hidden hover:shadow-md transition-all duration-200 ${className}`}>
      {/* Header */}
      <div className={`p-4 ${metricData.bgColor}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaRunning className={`w-5 h-5 ${metricData.color}`} />
            <h3 className={`text-sm font-semibold ${metricData.textColor}`}>
              {metricData.title}
            </h3>
            {isDemoData && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Demo Data
              </span>
            )}
          </div>
          {metricData.trend && metricData.trend !== 'neutral' && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              {metricData.trend === 'up' ? (
                <FaArrowUp className="w-3 h-3 text-green-500" />
              ) : (
                <FaArrowDown className="w-3 h-3 text-red-500" />
              )}
              <span>{metricData.trendValue}</span>
            </div>
          )}
        </div>
        
        {/* Value */}
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${metricData.textColor}`}>
            {typeof metricData.value === 'number' ? formatActiveMinutes(metricData.value) : metricData.value}
          </span>
          <span className={`text-sm ${metricData.textColor} opacity-75`}>
            {metricData.unit}
          </span>
        </div>
      </div>

      {/* Progress Section - only show if we have real data */}
      {latestActiveMinutes && !loading && !error && (
        <div className="p-4">
          <div className="space-y-3">
            {/* Goal Progress */}
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Daily Goal: {goal} min</span>
                <span className={progress >= 100 ? 'text-green-600' : progress >= 80 ? 'text-blue-600' : 'text-slate-600'}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress >= 100 ? 'bg-green-500' : 
                    progress >= 80 ? 'bg-blue-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Status Message */}
            <div className="text-xs text-slate-600">
              {progress >= 100 ? (
                <span className="text-green-600 font-medium">Goal achieved! Keep it up! 🏃‍♂️</span>
              ) : progress >= 80 ? (
                <span className="text-green-600 font-medium">Almost there! 💪</span>
              ) : (
                <span>Need {Math.max(0, goal - activeMinutes)} more active minutes</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trend interpretation - only show if we have trend data */}
      {latestActiveMinutes && previousActiveMinutes && !loading && !error && (
        <div className="p-4 pt-0">
          {(() => {
            const currentMinutes = getActiveMinutes(latestActiveMinutes);
            const previousMinutes = getActiveMinutes(previousActiveMinutes);
            const trend = calculateActiveMinutesTrend(currentMinutes, previousMinutes);
            
            if (trend.trend !== 'neutral') {
              const significanceColor = trend.significance === 'high' ? 'text-red-600' : 
                                     trend.significance === 'moderate' ? 'text-yellow-600' : 'text-slate-600';
              
              return (
                <div className="text-xs">
                  <div className={`font-medium ${significanceColor} mb-1`}>
                    {trend.trend === 'up' ? '↗' : '↘'} {trend.changePercent}% vs yesterday
                  </div>
                  <div className="text-slate-500 text-xs leading-tight">
                    {trend.interpretation}
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
}
