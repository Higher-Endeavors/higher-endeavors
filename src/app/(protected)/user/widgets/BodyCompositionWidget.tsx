'use client';

import { FaWeight, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { getBodyComposition } from './hooks/useBodyComposition';
import TrendIndicator from './TrendIndicator';
import type { Trend } from './types';

interface BodyCompositionWidgetProps {
  className?: string;
}

export default function BodyCompositionWidget({ className = '' }: BodyCompositionWidgetProps) {
  const [bodyCompositionData, setBodyCompositionData] = useState({
    data: null as any,
    loading: true,
    error: null as string | null
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getBodyComposition();
        setBodyCompositionData(result);
      } catch (error) {
        setBodyCompositionData({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred'
        });
      }
    };

    loadData();
  }, []);

  const { data, loading, error } = bodyCompositionData;

  const getTrend = (change: number | null): Trend => {
    if (change === null) return 'neutral';
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'neutral';
  };

  const formatValue = (value: number | null, unit: string, decimals: number = 1): string => {
    if (value === null) return 'N/A';
    return `${value.toFixed(decimals)} ${unit}`;
  };

  const formatChange = (change: number | null, unit: string, decimals: number = 1): string => {
    if (change === null) return 'N/A';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(decimals)} ${unit}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border-2 border-slate-200 overflow-hidden ${className}`}>
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border-2 border-red-200 overflow-hidden ${className}`}>
        <div className="p-4">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <FaExclamationTriangle className="w-4 h-4" />
            <h3 className="text-sm font-semibold">Body Composition</h3>
          </div>
          <p className="text-xs text-red-600">Failed to load data</p>
        </div>
      </div>
    );
  }

  if (!data?.latestEntry) {
    return (
      <div className={`bg-white rounded-lg border-2 border-slate-200 overflow-hidden ${className}`}>
        <div className="p-4">
          <div className="flex items-center gap-2 text-slate-600 mb-2">
            <FaWeight className="w-4 h-4" />
            <h3 className="text-sm font-semibold">Body Composition</h3>
          </div>
          <div className="text-center py-4">
            <p className="text-xs text-slate-500 mb-2">No measurements yet</p>
            <a 
              href="/tools/health/body-composition" 
              className="text-xs text-sky-600 hover:text-sky-800 font-medium"
            >
              Take your first measurement →
            </a>
          </div>
        </div>
      </div>
    );
  }

  const { latestEntry, fourWeekTrend } = data;

  return (
    <div className={`bg-white rounded-lg border-2 border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200 ${className}`}>
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaWeight className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-800">Body Composition</h3>
          </div>
          <div className="text-xs text-slate-500">
            {formatDate(latestEntry.date)}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Weight */}
          {latestEntry.weight !== null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Weight</span>
                {fourWeekTrend.weight.change !== null && (
                  <TrendIndicator 
                    trend={getTrend(fourWeekTrend.weight.change)} 
                    value={formatChange(fourWeekTrend.weight.change, 'lbs', 1)}
                  />
                )}
              </div>
              <div className="text-lg font-bold text-slate-800">
                {formatValue(latestEntry.weight, 'lbs', 1)}
              </div>
            </div>
          )}

          {/* Body Fat % */}
          {latestEntry.bodyFatPercentage !== null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Body Fat %</span>
                {fourWeekTrend.bodyFatPercentage.change !== null && (
                  <TrendIndicator 
                    trend={getTrend(fourWeekTrend.bodyFatPercentage.change)} 
                    value={formatChange(fourWeekTrend.bodyFatPercentage.change, '%', 1)}
                  />
                )}
              </div>
              <div className="text-lg font-bold text-slate-800">
                {formatValue(latestEntry.bodyFatPercentage, '%', 1)}
              </div>
            </div>
          )}

          {/* Fat Mass */}
          {latestEntry.fatMass !== null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Fat Mass</span>
                {fourWeekTrend.fatMass.change !== null && (
                  <TrendIndicator 
                    trend={getTrend(fourWeekTrend.fatMass.change)} 
                    value={formatChange(fourWeekTrend.fatMass.change, 'lbs', 1)}
                  />
                )}
              </div>
              <div className="text-lg font-bold text-slate-800">
                {formatValue(latestEntry.fatMass, 'lbs', 1)}
              </div>
            </div>
          )}

          {/* Fat Free Mass */}
          {latestEntry.fatFreeMass !== null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Fat Free Mass</span>
                {fourWeekTrend.fatFreeMass.change !== null && (
                  <TrendIndicator 
                    trend={getTrend(fourWeekTrend.fatFreeMass.change)} 
                    value={formatChange(fourWeekTrend.fatFreeMass.change, 'lbs', 1)}
                  />
                )}
              </div>
              <div className="text-lg font-bold text-slate-800">
                {formatValue(latestEntry.fatFreeMass, 'lbs', 1)}
              </div>
            </div>
          )}
        </div>

        {/* 4-Week Trend Summary */}
        {(latestEntry.weight !== null || latestEntry.bodyFatPercentage !== null) && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <FaChartLine className="w-3 h-3 text-slate-500" />
              <span className="text-xs text-slate-500">4-Week Trend</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {latestEntry.weight !== null && (
                <div className="text-slate-600">
                  Weight: {fourWeekTrend.weight.previous ? formatValue(fourWeekTrend.weight.previous, 'lbs') : 'N/A'} → {formatValue(fourWeekTrend.weight.current, 'lbs')}
                </div>
              )}
              {latestEntry.bodyFatPercentage !== null && (
                <div className="text-slate-600">
                  Body Fat: {fourWeekTrend.bodyFatPercentage.previous ? formatValue(fourWeekTrend.bodyFatPercentage.previous, '%') : 'N/A'} → {formatValue(fourWeekTrend.bodyFatPercentage.current, '%')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Link */}
        <div className="mt-3 text-center">
          <a 
            href="/tools/health/body-composition" 
            className="text-xs text-sky-600 hover:text-sky-800 font-medium"
          >
            Update Measurement →
          </a>
        </div>
      </div>
    </div>
  );
}
