'use client';

import { FaFire, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import type { WidgetData, Trend } from '(protected)/user/widgets/types';
import { getWeeklyCMEVolumeData, formatVolumeMinutes, calculateVolumeTrend } from '(protected)/user/widgets/hooks/useGarminActivity';
import { useUserSettings } from 'context/UserSettingsContext';
import { clientLogger } from 'lib/logging/logger.client';
import GarminAttribution from '(protected)/user/widgets/components/GarminAttribution';

interface WeeklyVolumeWidgetProps {
  plannedVolume?: number;
  actualVolume?: number;
  unit?: string;
  className?: string;
  onClick?: () => void;
}

export default function WeeklyVolumeWidget({ 
  plannedVolume = 300,
  actualVolume,
  unit = 'min',
  className = '',
  onClick 
}: WeeklyVolumeWidgetProps) {
  const [volumeData, setVolumeData] = useState({
    totalVolume: 0,
    activities: [] as any[],
    loading: true,
    error: null as string | null
  });
  const { userSettings } = useUserSettings();

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getWeeklyCMEVolumeData();
        setVolumeData(result);
      } catch (error) {
        clientLogger.error('WeeklyCMEVolumeWidget: Error loading data', error);
        setVolumeData({
          totalVolume: 0,
          activities: [],
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred'
        });
      }
    };

    loadData();
  }, []);

  const { totalVolume, activities, loading, error } = volumeData;

  // Check if Garmin is connected
  const isGarminConnected = userSettings?.general?.garminConnect?.isConnected === true;
  
  // Determine actual volume and display logic
  let displayVolume = actualVolume || 0;
  let isDemoData = !isGarminConnected;
  let displayError = false;
  
  if (isGarminConnected) {
    if (loading) {
      displayVolume = 0;
      isDemoData = false;
    } else if (error) {
      displayVolume = 0;
      isDemoData = true; // Show as demo data when there's an error
    } else if (totalVolume > 0) {
      displayVolume = totalVolume;
      isDemoData = false;
    } else {
      // No activities this week
      displayVolume = 0;
      isDemoData = false;
      displayError = true;
    }
  }

  const percentage = Math.round((displayVolume / plannedVolume) * 100);
  const trend: Trend = displayVolume > plannedVolume ? 'up' : displayVolume < plannedVolume * 0.8 ? 'down' : 'neutral';
  const trendValue = displayVolume > plannedVolume ? `+${Math.round(((displayVolume - plannedVolume) / plannedVolume) * 100)}%` : 
                    displayVolume < plannedVolume * 0.8 ? `${Math.round(((displayVolume - plannedVolume) / plannedVolume) * 100)}%` : '0%';
  
  const getStatusColor = () => {
    if (displayError) return 'text-slate-500';
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBgColor = () => {
    if (displayError) return 'bg-slate-50';
    if (percentage >= 100) return 'bg-green-50';
    if (percentage >= 80) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getStatusBorderColor = () => {
    if (displayError) return 'border-slate-200';
    if (percentage >= 100) return 'border-green-200';
    if (percentage >= 80) return 'border-yellow-200';
    return 'border-red-200';
  };

  const getTrendIcon = (trend: Trend) => {
    switch (trend) {
      case 'up':
        return <FaArrowUp className="w-3 h-3" />;
      case 'down':
        return <FaArrowDown className="w-3 h-3" />;
      default:
        return <FaMinus className="w-3 h-3" />;
    }
  };

  const getTrendColor = (trend: Trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 ${getStatusBgColor()} ${getStatusBorderColor()} hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <FaFire className={`w-5 h-5 ${getStatusColor()}`} />
          <h4 className={`text-sm font-medium ${getStatusColor()}`}>
            Weekly CME Volume
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
        <div className={`flex items-center gap-1 text-xs ${getTrendColor(trend)}`}>
          {getTrendIcon(trend)}
          <span>{trendValue}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${getStatusColor()}`}>
            {loading ? 'Loading...' : displayError ? '0' : displayVolume.toLocaleString()}
          </span>
          <span className={`text-sm ${getStatusColor()} opacity-75`}>
            {unit}
          </span>
        </div>

        {displayError && isGarminConnected && (
          <div className="text-xs text-slate-500">
            No activities this week
          </div>
        )}

        <div className="text-xs text-slate-600">
          Planned: {plannedVolume.toLocaleString()} {unit}
        </div>

        {/* Progress bar - only show if not loading and not in error state */}
        {!loading && !displayError && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Progress</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className={`${getStatusColor().replace('text-', 'bg-')} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
