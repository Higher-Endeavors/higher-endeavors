'use client';

import { FaRunning, FaArrowUp, FaArrowDown, FaRoute } from 'react-icons/fa';
import type { WidgetData, Trend } from './types';
import { getStepsData, getStepCount, calculateStepsTrend, formatSteps, getStepsGoal, calculateStepsProgress, getDistanceInMeters, formatDistance, calculateDistanceTrend, getFloorsClimbed, formatFloors, calculateFloorsTrend, StepsData } from './hooks/useStepsData';
import { useUserSettings } from '@/app/context/UserSettingsContext';
import { useState, useEffect } from 'react';
import GarminAttribution from './components/GarminAttribution';

interface StepsWidgetProps {
  data?: WidgetData;
  className?: string;
  showProgress?: boolean;
  onClick?: () => void;
}

export default function StepsWidget({ 
  data,
  className = '',
  showProgress = true,
  onClick 
}: StepsWidgetProps) {
  const { userSettings } = useUserSettings();
  const [stepsData, setStepsData] = useState<StepsData>({
    latestSteps: null,
    previousSteps: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await getStepsData();
      setStepsData(data);
    };
    fetchData();
  }, []);

  const { latestSteps, previousSteps, loading, error } = stepsData;

  // Check if Garmin is connected
  const isGarminConnected = userSettings?.general?.garminConnect?.isConnected === true;

  // Default data for when no real data is available
  const defaultData: WidgetData = {
    id: 'steps',
    title: 'Daily Steps',
    value: 8500,
    unit: 'steps',
    trend: 'up' as Trend,
    trendValue: '+12%',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200'
  };

  // Process real steps data if available and Garmin is connected
  let metricData: WidgetData = defaultData;
  let isDemoData = !isGarminConnected;
  let stepsDate = '';
  
  if (latestSteps && !loading && !error && isGarminConnected) {
    const stepCount = getStepCount(latestSteps);
    const previousStepCount = previousSteps ? getStepCount(previousSteps) : undefined;
    const trend = calculateStepsTrend(stepCount, previousStepCount);
    const goal = getStepsGoal();
    const progress = calculateStepsProgress(stepCount, goal);

    // Determine date indicator
    if (latestSteps.calendarDate) {
      const stepsDateObj = new Date(latestSteps.calendarDate);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const isToday = stepsDateObj.toDateString() === today.toDateString();
      const isYesterday = stepsDateObj.toDateString() === yesterday.toDateString();
      
      if (isToday) {
        stepsDate = '';
      } else if (isYesterday) {
        stepsDate = ' (Yesterday)';
      } else {
        stepsDate = ` (${stepsDateObj.toLocaleDateString()})`;
      }
    }

    metricData = {
      id: 'steps',
      title: `Daily Steps${stepsDate}`,
      value: stepCount,
      unit: 'steps',
      trend: trend.trend,
      trendValue: trend.trend !== 'neutral' ? `${trend.trend === 'up' ? '+' : '-'}${trend.changePercent}%` : '0%',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-200',
      progress: {
        current: stepCount,
        target: goal,
        unit: 'steps'
      }
    };
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

  // Use provided data if available, otherwise use processed data
  const finalData = data || metricData;

  return (
    <div
      className={`p-4 rounded-lg border-2 ${metricData.bgColor} ${metricData.borderColor} hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <FaRunning className={`w-5 h-5 ${metricData.color}`} />
          <h4 className={`text-sm font-medium ${metricData.textColor}`}>
            {metricData.title}
          </h4>
          {isDemoData && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              Demo Data
            </span>
          )}
        </div>
        {!isDemoData && isGarminConnected && (
          <GarminAttribution className="mt-1" />
        )}
        {finalData.trend && finalData.trend !== 'neutral' && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            {finalData.trend === 'up' ? (
              <FaArrowUp className="w-3 h-3 text-green-500" />
            ) : (
              <FaArrowDown className="w-3 h-3 text-red-500" />
            )}
            <span>{finalData.trendValue}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${finalData.textColor}`}>
          {typeof finalData.value === 'number' ? formatSteps(finalData.value) : finalData.value}
        </span>
        {finalData.unit && (
          <span className={`text-sm ${finalData.textColor} opacity-75`}>
            {finalData.unit}
          </span>
        )}
      </div>

      {/* Distance information - only show if we have real data */}
      {latestSteps && !loading && !error && userSettings?.general?.distanceUnit && (
        <div className="mt-3">
          {(() => {
            const distanceInMeters = getDistanceInMeters(latestSteps);
            const previousDistance = previousSteps ? getDistanceInMeters(previousSteps) : undefined;
            const distanceUnit = userSettings.general.distanceUnit;
            const distanceTrend = calculateDistanceTrend(distanceInMeters, previousDistance);
            
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FaRoute className="w-3 h-3 text-slate-500" />
                    <span className="text-slate-600">Distance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">
                      {formatDistance(distanceInMeters, distanceUnit)}
                    </span>
                    {distanceTrend.trend !== 'neutral' && (
                      <div className="flex items-center gap-1">
                        {distanceTrend.trend === 'up' ? (
                          <FaArrowUp className="w-2 h-2 text-green-500" />
                        ) : (
                          <FaArrowDown className="w-2 h-2 text-red-500" />
                        )}
                        <span className="text-xs text-slate-500">
                          {distanceTrend.trend === 'up' ? '+' : '-'}{distanceTrend.changePercent}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Distance trend interpretation - removed redundant analysis */}
              </div>
            );
          })()}
        </div>
      )}

      {/* Floors climbed information - only show if we have real data */}
      {latestSteps && !loading && !error && (
        <div className="mt-3">
          {(() => {
            const floorsClimbed = getFloorsClimbed(latestSteps);
            const previousFloors = previousSteps ? getFloorsClimbed(previousSteps) : undefined;
            const floorsTrend = calculateFloorsTrend(floorsClimbed, previousFloors);
            
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">🏢</span>
                    <span className="text-slate-600">Floors Climbed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">
                      {formatFloors(floorsClimbed)} floors
                    </span>
                    {floorsTrend.trend !== 'neutral' && (
                      <div className="flex items-center gap-1">
                        {floorsTrend.trend === 'up' ? (
                          <FaArrowUp className="w-2 h-2 text-green-500" />
                        ) : (
                          <FaArrowDown className="w-2 h-2 text-red-500" />
                        )}
                        <span className="text-xs text-slate-500">
                          {floorsTrend.trend === 'up' ? '+' : '-'}{floorsTrend.changePercent}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Floors trend interpretation */}
                {floorsTrend.trend !== 'neutral' && (
                  <div className="text-xs text-slate-500 leading-tight">
                    {floorsTrend.interpretation}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Progress bar integrated within the card - only show if we have real data */}
      {showProgress && latestSteps && !loading && !error && (
        <div className="mt-3">
          {(() => {
            const stepCount = getStepCount(latestSteps);
            const goal = getStepsGoal();
            const progress = calculateStepsProgress(stepCount, goal);
            
            return (
              <>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Goal: {formatSteps(goal)} steps</span>
                  <span className={progress.status === 'exceeded' ? 'text-green-600' : progress.status === 'achieved' ? 'text-blue-600' : 'text-slate-600'}>
                    {Math.round(progress.percentage)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progress.status === 'exceeded' ? 'bg-green-500' : 
                      progress.status === 'achieved' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                {progress.status === 'exceeded' && (
                  <div className="text-xs text-green-600 mt-1 font-medium">
                    🎉 Goal exceeded by {formatSteps(stepCount - goal)} steps!
                  </div>
                )}
                {progress.status === 'achieved' && (
                  <div className="text-xs text-blue-600 mt-1 font-medium">
                    ✅ Goal achieved!
                  </div>
                )}
                {progress.status === 'in_progress' && (
                  <div className="text-xs text-slate-500 mt-1">
                    {formatSteps(progress.remaining)} steps remaining
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Trend interpretation - only show if we have trend data */}
      {latestSteps && previousSteps && !loading && !error && (
        <div className="mt-3">
          {(() => {
            const currentSteps = getStepCount(latestSteps);
            const previousStepCount = getStepCount(previousSteps);
            const trend = calculateStepsTrend(currentSteps, previousStepCount);
            
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
