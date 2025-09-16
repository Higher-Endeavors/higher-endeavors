'use client';

import { FaBrain, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import TrendIndicator from './TrendIndicator';
import type { WidgetData, Trend } from './types';
import { getStressData, calculateAverageStressLevel, calculateTimeWeightedStressLevel, getStressLevelCategory, calculateStressTrend, calculateBodyBatteryMetrics } from './hooks/useStressData';
import { useUserSettings } from '@/app/context/UserSettingsContext';

interface StressLevelWidgetProps {
  className?: string;
}

export default function StressLevelWidget({ className = '' }: StressLevelWidgetProps) {
  const [stressData, setStressData] = useState({
    latestStress: null as any,
    previousStress: null as any,
    loading: true,
    error: null as string | null
  });
  const { userSettings } = useUserSettings();

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getStressData();
        setStressData(data);
      } catch (error) {
        setStressData({
          latestStress: null,
          previousStress: null,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred'
        });
      }
    };

    loadData();
  }, []);

  const { latestStress, previousStress, loading, error } = stressData;

  // Check if Garmin is connected
  const isGarminConnected = userSettings?.general?.garminConnect?.isConnected === true;

  // Default data for when no real data is available
  const defaultData: WidgetData = {
    id: 'stress-level',
    title: 'Stress Level',
    value: 25,
    unit: '/100',
    trend: 'down' as Trend,
    trendValue: '-5%',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200'
  };

  // Process real stress data if available and Garmin is connected
  let data: WidgetData = defaultData;
  let stressLevel = 0;
  let stressInfo = getStressLevelCategory(0);
  let isDemoData = !isGarminConnected;
  
  if (latestStress && !loading && !error && isGarminConnected) {
    console.log('Processing stress data:', {
      latestStress,
      averageStressLevel: latestStress.averageStressLevel,
      maxStressLevel: latestStress.maxStressLevel,
      restStressDurationInSeconds: latestStress.restStressDurationInSeconds
    });
    
    // Use time-weighted calculation for more accuracy
    const stressAnalysis = calculateTimeWeightedStressLevel(latestStress);
    stressLevel = stressAnalysis.average;
    console.log('Calculated stress level:', stressLevel);
    
    const previousStressLevel = previousStress ? calculateAverageStressLevel(previousStress) : undefined;
    const trend = calculateStressTrend(stressLevel, previousStressLevel);
    
    stressInfo = getStressLevelCategory(stressLevel);

    data = {
      id: 'stress-level',
      title: 'Stress Level',
      value: stressLevel,
      unit: '/100',
      trend: trend.trend,
      trendValue: trend.trend !== 'neutral' ? `${trend.trend === 'up' ? '+' : '-'}${trend.changePercent}%` : '0%',
      color: stressInfo.color.replace('text-', 'text-'),
      bgColor: stressInfo.bgColor.replace('bg-', 'bg-').replace('-100', '-50'),
      textColor: stressInfo.color.replace('text-', 'text-').replace('-600', '-800'),
      borderColor: stressInfo.color.replace('text-', 'border-').replace('-600', '-200')
    };
    isDemoData = false;
  } else if (loading && isGarminConnected) {
    data = {
      ...defaultData,
      value: 'Loading...',
      color: 'text-slate-500',
      textColor: 'text-slate-600'
    };
    isDemoData = false;
  } else if (error && isGarminConnected) {
    data = {
      ...defaultData,
      value: 'Error',
      color: 'text-red-500',
      textColor: 'text-red-600'
    };
    isDemoData = false;
  }

  return (
    <div className={`bg-white rounded-lg border-2 ${data.borderColor} overflow-hidden hover:shadow-md transition-all duration-200 ${className}`}>
      {/* Header */}
      <div className={`p-4 ${data.bgColor}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaBrain className={`w-5 h-5 ${data.color}`} />
            <h3 className={`text-sm font-semibold ${data.textColor}`}>
              {data.title}
            </h3>
            {isDemoData && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Demo Data
              </span>
            )}
          </div>
          {data.trend && data.trend !== 'neutral' && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              {data.trend === 'up' ? (
                <FaArrowUp className="w-3 h-3 text-red-500" />
              ) : (
                <FaArrowDown className="w-3 h-3 text-green-500" />
              )}
              <span>{data.trendValue}</span>
            </div>
          )}
        </div>
        
        {/* Value */}
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${data.textColor}`}>
            {typeof data.value === 'number' ? data.value.toLocaleString() : data.value}
          </span>
          <span className={`text-sm ${data.textColor} opacity-75`}>
            {data.unit}
          </span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Stress Level Indicator - only show if we have real data */}
          {latestStress && !loading && !error && (
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Rest</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${stressInfo.bgColor} ${stressInfo.color}`}>
                  {stressInfo.label}
                </span>
                <span>High Stress</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`${stressInfo.color.replace('text-', 'bg-').replace('-600', '-500')} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(stressLevel, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Status Message */}
          <div className="text-xs text-slate-600">
            {latestStress && !loading && !error ? (
              <span className={`${stressInfo.color} font-medium`}>
                {stressInfo.description}
              </span>
            ) : loading ? (
              <span className="text-slate-500">Loading stress data...</span>
            ) : error ? (
              <span className="text-red-500">Error loading stress data</span>
            ) : (
              <span className="text-slate-500">No stress data available</span>
            )}
          </div>

          {/* Trend interpretation - only show if we have trend data */}
          {latestStress && previousStress && !loading && !error && (
            <div className="mt-3">
              {(() => {
                const previousStressLevel = calculateAverageStressLevel(previousStress);
                const trend = calculateStressTrend(stressLevel, previousStressLevel);
                
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

          {/* Stress breakdown - only show if we have real data */}
          {latestStress && !loading && !error && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="text-xs text-slate-600 mb-2">Stress Breakdown</div>
              {(() => {
                const stressAnalysis = calculateTimeWeightedStressLevel(latestStress);
                const breakdown = stressAnalysis.breakdown;
                
                const formatDuration = (minutes: number) => {
                  const hours = Math.floor(minutes / 60);
                  const mins = minutes % 60;
                  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                };
                
                return (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-600">Rest: {formatDuration(breakdown.rest.duration)}</span>
                      <span className="text-slate-500">({breakdown.rest.percentage}%)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-yellow-600">Low: {formatDuration(breakdown.low.duration)}</span>
                      <span className="text-slate-500">({breakdown.low.percentage}%)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-orange-600">Medium: {formatDuration(breakdown.medium.duration)}</span>
                      <span className="text-slate-500">({breakdown.medium.percentage}%)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-red-600">High: {formatDuration(breakdown.high.duration)}</span>
                      <span className="text-slate-500">({breakdown.high.percentage}%)</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
