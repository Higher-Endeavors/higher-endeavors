'use client';
import React, { useState, useEffect } from 'react';
import { getRatingStatistics, getDailyMetrics, type RatingStats, type DailyMetrics } from '../../../../lib/web-vitals/web-vitals-db';

interface DashboardProps {
  timeframe?: string;
}

export function WebVitalsDashboard({ timeframe = '7 days' }: DashboardProps) {
  const [stats, setStats] = useState<RatingStats[]>([]);
  const [dailyData, setDailyData] = useState<DailyMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/web-vitals-stats?timeframe=${encodeURIComponent(timeframe)}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch data');
        }

        const { data } = await response.json();
        setStats(data.ratingStats);
        setDailyData(data.dailyMetrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [timeframe]);

  if (loading) return <div>Loading Web Vitals data...</div>;
  if (error) return <div>Error: {error}</div>;

  // Group stats by metric
  const statsByMetric = stats.reduce((acc, stat) => {
    if (!acc[stat.metric_name]) {
      acc[stat.metric_name] = [];
    }
    acc[stat.metric_name].push(stat);
    return acc;
  }, {} as Record<string, RatingStats[]>);

  return (
    <div className="web-vitals-dashboard">
      <h2>Web Vitals Dashboard ({timeframe})</h2>
      
      <div className="metrics-grid">
        {Object.entries(statsByMetric).map(([metricName, metricStats]) => (
          <div key={metricName} className="metric-card">
            <h3>{metricName}</h3>
            <div className="rating-breakdown">
              {metricStats.map((stat) => (
                <div key={stat.rating_name} className={`rating-item ${stat.rating_name}`}>
                  <span className="rating-label">{stat.rating_name}</span>
                  <span className="rating-count">{stat.count}</span>
                  <span className="rating-avg">Avg: {stat.avg_value}</span>
                  <span className="rating-p75">P75: {stat.p75_value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="daily-trends">
        <h3>Daily Trends</h3>
        <div className="trends-table">
          {dailyData.slice(0, 7).map((day) => (
            <div key={`${day.date}-${day.metric_name}`} className="trend-row">
              <span>{new Date(day.date).toLocaleDateString()}</span>
              <span>{day.metric_name}</span>
              <span>{day.total_metrics} samples</span>
              <span>Avg: {day.avg_value}</span>
              <span>{day.good_percentage}% good</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}