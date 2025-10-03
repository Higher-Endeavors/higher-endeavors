'use client';

import { FaHeart, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import type { WidgetData, Trend } from '(protected)/user/widgets/types';
import { getHeartRateData, calculateHeartRateZone, calculateHeartRateTrend } from '(protected)/user/widgets/hooks/useHeartRateData';
import { useUserSettings } from 'context/UserSettingsContext';
import GarminAttribution from './components/GarminAttribution';

interface HeartRateWidgetProps {
  data?: WidgetData;
  className?: string;
  onClick?: () => void;
  garminAttribution?: string;
}

export default function HeartRateWidget({ 
  data,
  className = '',
  onClick,
  garminAttribution
}: HeartRateWidgetProps) {
  const [heartRateData, setHeartRateData] = useState({
    latestHeartRate: null as any,
    previousHeartRate: null as any,
    loading: true,
    error: null as string | null
  });
  const { userSettings } = useUserSettings();

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getHeartRateData();
        setHeartRateData(data);
      } catch (error) {
        setHeartRateData({
          latestHeartRate: null,
          previousHeartRate: null,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred'
        });
      }
    };

    loadData();
  }, []);

  const { latestHeartRate, previousHeartRate, loading, error } = heartRateData;

  // Check if Garmin is connected
  const isGarminConnected = userSettings?.general?.garminConnect?.isConnected === true;

  // Default data for when no real data is available
  const defaultData: WidgetData = {
    id: 'heart-rate-resting',
    title: 'Resting HR',
    value: 62,
    unit: 'bpm',
    trend: 'down' as Trend,
    trendValue: '-3%',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200'
  };

  // Process real heart rate data if available and Garmin is connected
  let metricData: WidgetData = defaultData;
  let isDemoData = !isGarminConnected;
  let heartRateDate = '';
  
  if (latestHeartRate && !loading && !error && latestHeartRate.restingHeartRateInBeatsPerMinute && isGarminConnected) {
    const restingHR = latestHeartRate.restingHeartRateInBeatsPerMinute;
    const previousHR = previousHeartRate?.restingHeartRateInBeatsPerMinute;
    const hrZone = calculateHeartRateZone(restingHR);
    
    // Calculate trend using historical data
    const trend = calculateHeartRateTrend(restingHR, previousHR);

    // Determine date indicator
    if (latestHeartRate.calendarDate) {
      const heartRateDateObj = new Date(latestHeartRate.calendarDate);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const isToday = heartRateDateObj.toDateString() === today.toDateString();
      const isYesterday = heartRateDateObj.toDateString() === yesterday.toDateString();
      
      if (isToday) {
        heartRateDate = '';
      } else if (isYesterday) {
        heartRateDate = ' (Yesterday)';
      } else {
        heartRateDate = ` (${heartRateDateObj.toLocaleDateString()})`;
      }
    }

    metricData = {
      id: 'heart-rate-resting',
      title: `Resting HR${heartRateDate}`,
      value: restingHR,
      unit: 'bpm',
      trend: trend.trend,
      trendValue: trend.trend !== 'neutral' ? `${trend.trend === 'up' ? '+' : '-'}${trend.changePercent}%` : '0%',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      borderColor: 'border-red-200'
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
      className={`p-4 rounded-lg border-2 ${finalData.bgColor} ${finalData.borderColor} hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <FaHeart className={`w-5 h-5 ${finalData.color}`} />
          <h4 className={`text-sm font-medium ${finalData.textColor}`}>
            {finalData.title}
          </h4>
          {isDemoData && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              Demo Data
            </span>
          )}
        </div>
        {!isDemoData && isGarminConnected && garminAttribution && (
          <GarminAttribution attribution={garminAttribution} className="mt-1" />
        )}
        {finalData.trend && finalData.trend !== 'neutral' && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            {finalData.trend === 'up' ? (
              <FaArrowUp className="w-3 h-3 text-red-500" />
            ) : (
              <FaArrowDown className="w-3 h-3 text-green-500" />
            )}
            <span>{finalData.trendValue}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${finalData.textColor}`}>
          {typeof finalData.value === 'number' ? finalData.value.toLocaleString() : finalData.value}
        </span>
        {finalData.unit && (
          <span className={`text-sm ${finalData.textColor} opacity-75`}>
            {finalData.unit}
          </span>
        )}
      </div>

      {/* Heart rate zone indicator - only show if we have real data */}
      {latestHeartRate && !loading && !error && latestHeartRate.restingHeartRateInBeatsPerMinute && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Zone: {calculateHeartRateZone(latestHeartRate.restingHeartRateInBeatsPerMinute).zone}</span>
            <span>Range: {calculateHeartRateZone(latestHeartRate.restingHeartRateInBeatsPerMinute).range}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`${calculateHeartRateZone(latestHeartRate.restingHeartRateInBeatsPerMinute).color} h-2 rounded-full transition-all duration-300`}
              style={{ 
                width: `${Math.min((latestHeartRate.restingHeartRateInBeatsPerMinute / 100) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Trend interpretation - only show if we have trend data */}
      {latestHeartRate && !loading && !error && latestHeartRate.restingHeartRateInBeatsPerMinute && previousHeartRate?.restingHeartRateInBeatsPerMinute && (
        <div className="mt-3">
          {(() => {
            const trend = calculateHeartRateTrend(
              latestHeartRate.restingHeartRateInBeatsPerMinute, 
              previousHeartRate.restingHeartRateInBeatsPerMinute
            );
            
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
