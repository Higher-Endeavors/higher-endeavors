import CaloriesBurnedWidget from './CaloriesBurnedWidget';
import StepsWidget from './StepsWidget';
import SleepWidget from './SleepWidget';
import HeartRateWidget from './HeartRateWidget';
import MetricCard from './MetricCard';
import SummaryCard from './SummaryCard';
import type { WidgetData, Trend } from './types';

// Additional metrics for the full dashboard
const additionalMetrics: WidgetData[] = [
  {
    id: 'calories-consumed',
    title: 'Calories Consumed',
    value: 2156,
    unit: 'kcal',
    trend: 'down' as Trend,
    trendValue: '-5%',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200'
  },
  {
    id: 'calorie-deficit',
    title: 'Calorie Deficit',
    value: 691,
    unit: 'kcal',
    trend: 'up' as Trend,
    trendValue: '+18%',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-200'
  },
  {
    id: 'stress-level',
    title: 'Stress Level',
    value: 23,
    unit: '/100',
    trend: 'down' as Trend,
    trendValue: '-12%',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200'
  },
  {
    id: 'active-minutes',
    title: 'Active Minutes',
    value: 67,
    unit: 'min',
    trend: 'up' as Trend,
    trendValue: '+15%',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-200'
  }
];

interface DailyMetricsProps {
  className?: string;
}

export default function DailyMetrics({ className = '' }: DailyMetricsProps) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="text-lg font-semibold text-slate-800">Daily Metrics</h3>
        <p className="text-sm text-slate-600">Today's health & fitness data</p>
      </div>

      {/* Metrics Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Core Metrics - Individual Widgets */}
          <CaloriesBurnedWidget />
          <StepsWidget />
          <SleepWidget />
          <HeartRateWidget />
          
          {/* Additional Metrics - Generic Cards */}
          {additionalMetrics.map((metric) => (
            <MetricCard key={metric.id} data={metric} />
          ))}
        </div>

        {/* Summary Card */}
        <SummaryCard />
      </div>
    </div>
  );
}
