'use client';

import { FaHeart, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import type { Trend } from './types';
import { getTimeInZonesData } from './hooks/useGarminActivity';
import { useUserSettings } from '@/app/context/UserSettingsContext';
import { clientLogger } from '@/app/lib/logging/logger.client';

interface ZoneData {
  zone: number;
  planned: number;
  actual: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

interface TimeInZonesWidgetProps {
  className?: string;
  onClick?: () => void;
}

export default function TimeInZonesWidget({ 
  className = '',
  onClick 
}: TimeInZonesWidgetProps) {
  const [zonesData, setZonesData] = useState({
    zones: [] as ZoneData[],
    totalPlanned: 0,
    totalActual: 0,
    loading: true,
    error: null as string | null
  });
  const { userSettings } = useUserSettings();

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getTimeInZonesData();
        setZonesData(result);
      } catch (error) {
        clientLogger.error('TimeInZonesWidget: Error loading data', error);
        setZonesData({
          zones: [],
          totalPlanned: 0,
          totalActual: 0,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred'
        });
      }
    };

    loadData();
  }, []);

  const { zones, totalPlanned, totalActual, loading, error } = zonesData;

  // Check if Garmin is connected
  const isGarminConnected = userSettings?.general?.garminConnect?.isConnected === true;
  
  // Determine display logic
  let displayZones = zones;
  let isDemoData = !isGarminConnected;
  let displayError = false;
  
  if (isGarminConnected) {
    if (loading) {
      displayZones = [];
      isDemoData = false;
    } else if (error) {
      displayZones = [];
      isDemoData = true; // Show as demo data when there's an error
    } else if (zones.length > 0) {
      displayZones = zones;
      isDemoData = false;
    } else {
      // No activities or zones this week
      displayZones = [];
      isDemoData = false;
      displayError = true;
    }
  }

  // Fallback to demo data if no real data
  if (displayZones.length === 0 && !loading) {
    displayZones = [
      {
        zone: 1,
        planned: 45,
        actual: 38,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800'
      },
      {
        zone: 2,
        planned: 120,
        actual: 135,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800'
      },
      {
        zone: 3,
        planned: 60,
        actual: 45,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800'
      },
      {
        zone: 4,
        planned: 30,
        actual: 25,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800'
      },
      {
        zone: 5,
        planned: 15,
        actual: 12,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800'
      }
    ];
    isDemoData = true;
  }

  const displayTotalPlanned = displayZones.reduce((sum, zone) => sum + zone.planned, 0);
  const displayTotalActual = displayZones.reduce((sum, zone) => sum + zone.actual, 0);
  const overallPercentage = displayTotalPlanned > 0 ? Math.round((displayTotalActual / displayTotalPlanned) * 100) : 0;

  const getStatusColor = () => {
    if (overallPercentage >= 100) return 'text-green-600';
    if (overallPercentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBgColor = () => {
    if (overallPercentage >= 100) return 'bg-green-50';
    if (overallPercentage >= 80) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getStatusBorderColor = () => {
    if (overallPercentage >= 100) return 'border-green-200';
    if (overallPercentage >= 80) return 'border-yellow-200';
    return 'border-red-200';
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 ${getStatusBgColor()} ${getStatusBorderColor()} hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaHeart className={`w-5 h-5 ${getStatusColor()}`} />
          <h4 className={`text-sm font-medium ${getStatusColor()}`}>
            Time in Zones
          </h4>
          {isDemoData && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              Demo Data
            </span>
          )}
        </div>
        <div className="text-xs text-slate-600">
          {loading ? 'Loading...' : displayError ? '0/0 min' : `${displayTotalActual}/${displayTotalPlanned} min`}
        </div>
      </div>

      {/* Zone breakdown */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center text-slate-500 text-sm py-4">
            Loading heart rate data...
          </div>
        ) : displayError ? (
          <div className="text-center text-slate-500 text-sm py-4">
            {error === 'No activities this week' ? 'No activities this week' : 
             error === 'No heart rate zones configured' ? 'No heart rate zones configured' : 
             'Unable to load heart rate data'}
          </div>
        ) : (
          displayZones.map((zone) => {
            const zonePercentage = zone.planned > 0 ? Math.round((zone.actual / zone.planned) * 100) : 0;
            const trend: Trend = zone.actual > zone.planned ? 'up' : zone.actual < zone.planned * 0.8 ? 'down' : 'neutral';
            
            return (
              <div key={zone.zone} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Zone {zone.zone}</span>
                  <span className={`${zone.textColor} font-medium`}>
                    {zone.actual}/{zone.planned} min
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div 
                    className={`${zone.color.replace('text-', 'bg-')} h-1.5 rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(zonePercentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Overall progress - only show if not loading and not in error state */}
      {!loading && !displayError && (
        <div className="mt-3 pt-2 border-t border-slate-200">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Overall Progress</span>
            <span>{overallPercentage}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`${getStatusColor().replace('text-', 'bg-')} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
