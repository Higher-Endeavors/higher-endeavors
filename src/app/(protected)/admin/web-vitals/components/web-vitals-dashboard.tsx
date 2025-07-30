'use client';
import React, { useState, useEffect } from 'react';
import type { RatingStats, DailyMetrics } from '../../../../lib/web-vitals/web-vitals-db';
import { clientLogger } from '@/app/lib/logging/logger.client';

interface DashboardProps {
  timeframe?: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    ratingStats: RatingStats[];
    dailyMetrics: DailyMetrics[];
    percentiles?: any;
  };
  timeframe: string;
  metric?: string;
}

// Helper function to safely format numbers
function formatNumber(value: any, decimals: number = 2): string {
  if (value === null || value === undefined) return '0';
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(num) ? '0' : num.toFixed(decimals);
}

export function WebVitalsDashboard({ timeframe = '7 days' }: DashboardProps) {
  const [stats, setStats] = useState<RatingStats[]>([]);
  const [dailyData, setDailyData] = useState<DailyMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/web-vitals-stats?timeframe=${encodeURIComponent(timeframe)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();
        
        if (!isMounted) return;

        if (!result.success) {
          throw new Error('API returned unsuccessful response');
        }

        if (!result.data?.ratingStats || !result.data?.dailyMetrics) {
          throw new Error('Invalid data structure received from API');
        }

        setStats(result.data.ratingStats);
        setDailyData(result.data.dailyMetrics);
      } catch (err) {
        clientLogger.error('Dashboard fetch error', err);
        setError('Failed to fetch dashboard data');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [timeframe]);

  if (loading) return <div className="p-4 text-center">Loading Web Vitals data...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  // Group stats by metric
  const statsByMetric = stats.reduce((acc, stat) => {
    if (!acc[stat.metric_name]) {
      acc[stat.metric_name] = [];
    }
    acc[stat.metric_name].push(stat);
    return acc;
  }, {} as Record<string, RatingStats[]>);

  return (
    <div className="web-vitals-dashboard p-6 text-black">
      <h2 className="text-2xl font-bold mb-6 text-white">Timeframe ({timeframe})</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Object.entries(statsByMetric).map(([metricName, metricStats]) => (
          <div key={metricName} className="bg-white rounded-lg shadow-md p-4 border">
            <h3 className="text-lg font-semibold mb-3 text-black">{metricName}</h3>
            <div className="space-y-2">
              {metricStats.map((stat) => (
                <div key={stat.rating_name} className={`p-2 rounded ${getRatingColor(stat.rating_name)}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize">{stat.rating_name.replace('-', ' ')}</span>
                    <span className="text-sm font-bold">{stat.count}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    <span>Avg: {formatNumber(stat.avg_value, 2)}</span>
                    <span className="ml-2">P75: {formatNumber(stat.p75_value, 2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 border">
        <h3 className="text-lg font-semibold mb-4 text-black">Daily Trends</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-black">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 text-black">Date</th>
                <th className="text-left p-2 text-black">Metric</th>
                <th className="text-left p-2 text-black">Samples</th>
                <th className="text-left p-2 text-black">Average</th>
                <th className="text-left p-2 text-black">Good %</th>
              </tr>
            </thead>
            <tbody>
              {dailyData.slice(0, 7).map((day) => (
                <tr key={`${day.date}-${day.metric_name}`} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-black">{new Date(day.date).toLocaleDateString()}</td>
                  <td className="p-2 text-black">{day.metric_name}</td>
                  <td className="p-2 text-black">{day.total_metrics}</td>
                  <td className="p-2 text-black">{formatNumber(day.avg_value, 2)}</td>
                  <td className="p-2 text-black">{formatNumber(day.good_percentage, 1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case 'good':
      return 'bg-green-100 text-green-800';
    case 'needs-improvement':
      return 'bg-yellow-100 text-yellow-800';
    case 'poor':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}