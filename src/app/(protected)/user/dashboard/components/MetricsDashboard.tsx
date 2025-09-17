import BodyCompositionWidget from '../../widgets/BodyCompositionWidget';
import CaloriesBurnedWidget from '../../widgets/CaloriesBurnedWidget';
import StepsWidget from '../../widgets/StepsWidget';
import SleepWidget from '../../widgets/SleepWidget';
import HeartRateWidget from '../../widgets/HeartRateWidget';
import StressWidget from '../../widgets/StressLevelWidget';
import MetricCard from '../../widgets/MetricCard';
import type { WidgetData, Trend } from '../../widgets/types';
import Link from 'next/link';

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
          <Link href="/user/widgets">
          See All →
          </Link>
        </button>
      </div>

      {/* Metrics Grid - 4 columns on desktop, 2 on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core Health Metrics */}
        <BodyCompositionWidget />
        <HeartRateWidget />
        <SleepWidget />
        <CaloriesBurnedWidget />
        <StepsWidget />
        <StressWidget />
        
        ))
      </div>
    </div>
  );
}
