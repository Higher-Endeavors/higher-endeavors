import CaloriesBurnedWidget from '../../../widgets/CaloriesBurnedWidget';
import StepsWidget from '../../../widgets/StepsWidget';
import SleepWidget from '../../../widgets/SleepWidget';
import HeartRateWidget from '../../../widgets/HeartRateWidget';
import MetricCard from '../../../widgets/MetricCard';
import type { WidgetData, Trend } from '../../../widgets/types';

// Additional metrics for the dashboard
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

interface MetricsDashboardProps {
  className?: string;
}

export default function MetricsDashboard({ className = '' }: MetricsDashboardProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">At a Glance</h2>
          <p className="text-slate-600 dark:text-slate-400">Your daily Pillar metrics</p>
        </div>
        <button className="text-sky-600 hover:text-sky-800 font-medium text-sm">
          See All →
        </button>
      </div>

      {/* Metrics Grid - 4 columns on desktop, 2 on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core Health Metrics */}
        <HeartRateWidget />
        <SleepWidget />
        <CaloriesBurnedWidget />
        <StepsWidget />
        
        {/* Additional Metrics */}
        {additionalMetrics.map((metric) => (
          <MetricCard key={metric.id} data={metric} />
        ))}
      </div>
    </div>
  );
}
