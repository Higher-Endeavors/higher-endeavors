'use client';

import { FaFire, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import type { WidgetData, Trend } from '(protected)/user/widgets/types';
import { getCalorieData, calculateTotalCalories, calculateCalorieTrend, formatCalories, getCalorieGoal } from '(protected)/user/widgets/hooks/useCalorieData';
import { useUserSettings } from 'context/UserSettingsContext';
import GarminAttribution from './components/GarminAttribution';

interface CaloriesBurnedWidgetProps {
  data?: WidgetData;
  className?: string;
  showProgress?: boolean;
  onClick?: () => void;
  garminAttribution?: string;
}

export default function CaloriesBurnedWidget({ 
  data,
  className = '',
  showProgress = true,
  onClick,
  garminAttribution
}: CaloriesBurnedWidgetProps) {
  const [calorieData, setCalorieData] = useState({
    latestCalories: null as any,
    previousCalories: null as any,
    loading: true,
    error: null as string | null
  });
  const { userSettings } = useUserSettings();

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getCalorieData();
        setCalorieData(data);
      } catch (error) {
        setCalorieData({
          latestCalories: null,
          previousCalories: null,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred'
        });
      }
    };

    loadData();
  }, []);

  const { latestCalories, previousCalories, loading, error } = calorieData;

  // Check if Garmin is connected
  const isGarminConnected = userSettings?.general?.garminConnect?.isConnected === true;

  // Default data for when no real data is available
  const defaultData: WidgetData = {
    id: 'calories-burned',
    title: 'Calories Burned',
    value: 2200,
    unit: 'kcal',
    trend: 'up' as Trend,
    trendValue: '+7%',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200'
  };

  // Process real calorie data if available and Garmin is connected
  let metricData: WidgetData = defaultData;
  let isDemoData = !isGarminConnected;
  let caloriesDate = '';
  
  if (latestCalories && !loading && !error && isGarminConnected) {
    const totalCalories = calculateTotalCalories(latestCalories);
    const previousTotalCalories = previousCalories ? calculateTotalCalories(previousCalories) : undefined;
    const trend = calculateCalorieTrend(totalCalories, previousTotalCalories);
    const goal = getCalorieGoal();
    const progressPercentage = Math.min((totalCalories / goal) * 100, 100);

    // Determine date indicator
    if (latestCalories.calendarDate) {
      const caloriesDateObj = new Date(latestCalories.calendarDate);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const isToday = caloriesDateObj.toDateString() === today.toDateString();
      const isYesterday = caloriesDateObj.toDateString() === yesterday.toDateString();
      
      if (isToday) {
        caloriesDate = '';
      } else if (isYesterday) {
        caloriesDate = ' (Yesterday)';
      } else {
        caloriesDate = ` (${caloriesDateObj.toLocaleDateString()})`;
      }
    }

    metricData = {
      id: 'calories-burned',
      title: `Calories Burned${caloriesDate}`,
      value: totalCalories,
      unit: 'kcal',
      trend: trend.trend,
      trendValue: trend.trend !== 'neutral' ? `${trend.trend === 'up' ? '+' : '-'}${trend.changePercent}%` : '0%',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200',
      progress: {
        current: totalCalories,
        target: goal,
        unit: 'kcal'
      }
    };
  } else if (loading) {
    metricData = {
      ...defaultData,
      value: 'Loading...',
      color: 'text-slate-500',
      textColor: 'text-slate-600'
    };
  } else if (error) {
    metricData = {
      ...defaultData,
      value: 'Error',
      color: 'text-red-500',
      textColor: 'text-red-600'
    };
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
          <FaFire className={`w-5 h-5 ${metricData.color}`} />
          <h4 className={`text-sm font-medium ${metricData.textColor}`}>
            {metricData.title}
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
          {typeof finalData.value === 'number' ? formatCalories(finalData.value) : finalData.value}
        </span>
        {finalData.unit && (
          <span className={`text-sm ${finalData.textColor} opacity-75`}>
            {finalData.unit}
          </span>
        )}
      </div>

      {/* Progress bar integrated within the card - only show if we have real data */}
      {showProgress && latestCalories && !loading && !error && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Goal: {formatCalories(getCalorieGoal())} kcal</span>
            <span>{Math.round((calculateTotalCalories(latestCalories) / getCalorieGoal()) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((calculateTotalCalories(latestCalories) / getCalorieGoal()) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Calorie breakdown - only show if we have real data */}
      {latestCalories && !loading && !error && (
        <div className="mt-3">
          <div className="text-xs text-slate-600 mb-2">Calorie Breakdown</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Active: {formatCalories(latestCalories.activeKilocalories || 0)} kcal</span>
              <span className="text-slate-500">({Math.round(((latestCalories.activeKilocalories || 0) / calculateTotalCalories(latestCalories)) * 100)}%)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">BMR: {formatCalories(latestCalories.bmrKilocalories || 0)} kcal</span>
              <span className="text-slate-500">({Math.round(((latestCalories.bmrKilocalories || 0) / calculateTotalCalories(latestCalories)) * 100)}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Trend interpretation - only show if we have trend data */}
      {latestCalories && previousCalories && !loading && !error && (
        <div className="mt-3">
          {(() => {
            const currentTotal = calculateTotalCalories(latestCalories);
            const previousTotal = calculateTotalCalories(previousCalories);
            const trend = calculateCalorieTrend(currentTotal, previousTotal);
            
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
