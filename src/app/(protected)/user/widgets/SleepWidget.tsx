'use client';

import { FaClock, FaMinus, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import type { WidgetData, Trend } from '(protected)/user/widgets/types';
import { getSleepData, formatSleepDuration, formatSleepStageDuration, calculateSleepQuality, calculateSleepStagePercentages } from '(protected)/user/widgets/hooks/useSleepData';
import { getHRVData, formatHRVValue, getHRVStatus, calculateHRVTrend } from '(protected)/user/widgets/hooks/useHRVData';
import { useUserSettings } from 'context/UserSettingsContext';
import GarminAttribution from './components/GarminAttribution';

interface SleepWidgetProps {
  data?: WidgetData;
  className?: string;
  onClick?: () => void;
  garminAttribution?: string;
}

export default function SleepWidget({ 
  data,
  className = '',
  onClick,
  garminAttribution
}: SleepWidgetProps) {
  const [sleepData, setSleepData] = useState({
    latestSleep: null as any,
    loading: true,
    error: null as string | null
  });
  const [hrvData, setHrvData] = useState({
    latestHRV: null as any,
    previousHRV: null as any,
    loading: true,
    error: null as string | null
  });
  const { userSettings } = useUserSettings();

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [sleepResult, hrvResult] = await Promise.all([
          getSleepData(),
          getHRVData()
        ]);
        setSleepData(sleepResult);
        setHrvData(hrvResult);
      } catch (error) {
        setSleepData({
          latestSleep: null,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred'
        });
        setHrvData({
          latestHRV: null,
          previousHRV: null,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred'
        });
      }
    };

    loadData();
  }, []);

  const { latestSleep, loading, error } = sleepData;
  const { latestHRV, previousHRV, loading: hrvLoading, error: hrvError } = hrvData;

  // Check if Garmin is connected
  const isGarminConnected = userSettings?.general?.garminConnect?.isConnected === true;

  // Default data for when no real data is available
  const defaultData: WidgetData = {
    id: 'sleep-duration',
    title: 'Sleep Duration',
    value: '7h 45m',
    unit: '',
    trend: 'up' as Trend,
    trendValue: '+5%',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-200'
  };

  // Process real sleep data if available and Garmin is connected
  let metricData: WidgetData = defaultData;
  let isDemoData = !isGarminConnected;
  let sleepDate = '';
  
  if (latestSleep && !loading && !error && isGarminConnected) {
    const sleepDuration = formatSleepDuration(latestSleep.durationInSeconds);
    const sleepQuality = calculateSleepQuality(latestSleep);
    const targetHours = 8;
    const currentHours = latestSleep.durationInSeconds / 3600;
    const progressPercentage = Math.min((currentHours / targetHours) * 100, 100);
    
    // Determine if this is today's or yesterday's sleep data
    const sleepDateObj = new Date(latestSleep.calendarDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = sleepDateObj.toDateString() === today.toDateString();
    const isYesterday = sleepDateObj.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      sleepDate = '';
    } else if (isYesterday) {
      sleepDate = ' (Yesterday)';
    } else {
      sleepDate = ` (${sleepDateObj.toLocaleDateString()})`;
    }
    
    // Determine trend based on sleep duration vs target
    let trend: Trend = 'neutral';
    let trendValue = '0%';
    
    if (currentHours > targetHours) {
      trend = 'up';
      trendValue = `+${Math.round(((currentHours - targetHours) / targetHours) * 100)}%`;
    } else if (currentHours < targetHours - 0.5) {
      trend = 'down';
      trendValue = `-${Math.round(((targetHours - currentHours) / targetHours) * 100)}%`;
    }

    metricData = {
      id: 'sleep-duration',
      title: `Sleep Duration${sleepDate}`,
      value: sleepDuration,
      unit: '',
      trend,
      trendValue,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-800',
      borderColor: 'border-indigo-200',
      progress: {
        current: currentHours,
        target: targetHours,
        unit: 'hours'
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
    // Instead of showing "Error", show demo data with a note
    metricData = {
      ...defaultData,
      title: 'Sleep Duration (No Data)',
      value: '7h 45m',
      color: 'text-slate-500',
      textColor: 'text-slate-600'
    };
    isDemoData = true; // Show as demo data when there's an error
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
          <FaClock className={`w-5 h-5 ${finalData.color}`} />
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
          {typeof finalData.value === 'number' ? finalData.value.toLocaleString() : finalData.value}
        </span>
        {finalData.unit && (
          <span className={`text-sm ${finalData.textColor} opacity-75`}>
            {finalData.unit}
          </span>
        )}
      </div>

      {/* Sleep quality indicator - only show if we have real data */}
      {latestSleep && !loading && !error && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Target: 8h</span>
            <span>Quality: {calculateSleepQuality(latestSleep).qualifier}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min((latestSleep.durationInSeconds / 3600 / 8) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Sleep stage breakdown - show demo data if no Garmin connection, real data if connected */}
      {(isDemoData || (latestSleep && !loading && !error)) && (
        <div className="mt-4">
          <h5 className="text-xs font-medium text-slate-600 mb-2">Sleep Stages</h5>
          <div className="space-y-2">
            {(() => {
              // Use demo data if no Garmin connection, otherwise use real data
              const stages = isDemoData ? {
                light: { duration: '4h 15m', percentage: 55 },
                rem: { duration: '1h 30m', percentage: 20 },
                deep: { duration: '1h 45m', percentage: 23 },
                awake: { duration: '15m', percentage: 2 }
              } : (latestSleep ? calculateSleepStagePercentages(latestSleep) : {
                light: { duration: '0h 0m', percentage: 0 },
                rem: { duration: '0h 0m', percentage: 0 },
                deep: { duration: '0h 0m', percentage: 0 },
                awake: { duration: '0h 0m', percentage: 0 }
              });
              return [
                { key: 'deep', label: 'Deep', color: 'bg-blue-500', data: stages.deep },
                { key: 'light', label: 'Light', color: 'bg-green-500', data: stages.light },
                { key: 'rem', label: 'REM', color: 'bg-purple-500', data: stages.rem },
                { key: 'awake', label: 'Awake', color: 'bg-red-500', data: stages.awake }
              ].map((stage) => (
                <div key={stage.key} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <span className="text-slate-600">{stage.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">
                      {typeof stage.data.duration === 'string' ? stage.data.duration : formatSleepStageDuration(stage.data.duration)}
                    </span>
                    <span className="text-slate-400">
                      ({stage.data.percentage}%)
                    </span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* HRV metrics - show demo data if no Garmin connection, real data if connected */}
      {(isDemoData || (latestHRV && !hrvLoading && !hrvError)) && (
        <div className="mt-4">
          <h5 className="text-xs font-medium text-slate-600 mb-2">Heart Rate Variability</h5>
          <div className="space-y-2">
            {/* Last Night Average HRV */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-600">Last Night Avg</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">
                  {isDemoData ? '42 ms' : (latestHRV ? formatHRVValue(latestHRV.lastNightAvg) : '0')} ms
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${isDemoData ? 'bg-yellow-100 text-yellow-600' : (latestHRV ? getHRVStatus(latestHRV.lastNightAvg).color.replace('text-', 'bg-').replace('-600', '-100') : 'bg-gray-100')} ${isDemoData ? 'text-yellow-600' : (latestHRV ? getHRVStatus(latestHRV.lastNightAvg).color : 'text-gray-600')}`}>
                  {isDemoData ? 'Good' : (latestHRV ? getHRVStatus(latestHRV.lastNightAvg).status : 'Unknown')}
                </span>
              </div>
            </div>

            {/* 5-Minute High HRV */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-slate-600">5-Min High</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">
                  {isDemoData ? '58 ms' : (latestHRV ? formatHRVValue(latestHRV.lastNight5MinHigh) : '0')} ms
                </span>
              </div>
            </div>

            {/* HRV Status Description */}
            <div className="text-xs text-slate-500 leading-tight">
              {isDemoData ? 'Good recovery - well-balanced nervous system' : (latestHRV ? getHRVStatus(latestHRV.lastNightAvg).description : 'No data available')}
            </div>

            {/* HRV Trend - only show if we have trend data */}
            {previousHRV && latestHRV && (
              <div className="mt-2">
                {(() => {
                  const trend = calculateHRVTrend(latestHRV.lastNightAvg, previousHRV.lastNightAvg);
                  
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
        </div>
      )}
    </div>
  );
}
