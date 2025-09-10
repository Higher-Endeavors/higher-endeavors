import { FaRunning } from 'react-icons/fa';
import ProgressBar from './ProgressBar';
import TrendIndicator from './TrendIndicator';
import type { WidgetData, Trend } from './types';

interface ActiveMinutesWidgetProps {
  className?: string;
}

export default function ActiveMinutesWidget({ className = '' }: ActiveMinutesWidgetProps) {
  const data: WidgetData = {
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
  };

  const goal = 60; // Daily active minutes goal
  const progress = Math.min((data.value as number) / goal * 100, 100);

  return (
    <div className={`bg-white rounded-lg border-2 ${data.borderColor} overflow-hidden hover:shadow-md transition-all duration-200 ${className}`}>
      {/* Header */}
      <div className={`p-4 ${data.bgColor}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaRunning className={`w-5 h-5 ${data.color}`} />
            <h3 className={`text-sm font-semibold ${data.textColor}`}>
              {data.title}
            </h3>
          </div>
          <TrendIndicator trend={data.trend} value={data.trendValue} />
        </div>
        
        {/* Value */}
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${data.textColor}`}>
            {typeof data.value === 'number' ? data.value.toLocaleString() : data.value}
          </span>
          <span className={`text-sm ${data.textColor} opacity-75`}>
            {data.unit}
          </span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Goal Progress */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Daily Goal: {goal} min</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <ProgressBar 
              current={data.value as number}
              target={goal}
              unit=" min"
              color="bg-emerald-500"
            />
          </div>

          {/* Status Message */}
          <div className="text-xs text-slate-600">
            {progress >= 100 ? (
              <span className="text-green-600 font-medium">Goal achieved! Keep it up! 🏃‍♂️</span>
            ) : progress >= 80 ? (
              <span className="text-green-600 font-medium">Almost there! 💪</span>
            ) : (
              <span>Need {Math.max(0, goal - (data.value as number))} more active minutes</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
