import { FaUtensils } from 'react-icons/fa';
import ProgressBar from '(protected)/user/widgets/ProgressBar';
import TrendIndicator from '(protected)/user/widgets/TrendIndicator';
import type { WidgetData, Trend } from '(protected)/user/widgets/types';

interface CaloriesConsumedWidgetProps {
  className?: string;
}

export default function CaloriesConsumedWidget({ className = '' }: CaloriesConsumedWidgetProps) {
  const data: WidgetData = {
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
  };

  const goal = 2500; // Daily calorie goal
  const progress = Math.min((data.value as number) / goal * 100, 100);

  return (
    <div className={`bg-white rounded-lg border-2 ${data.borderColor} overflow-hidden hover:shadow-md transition-all duration-200 ${className}`}>
      {/* Header */}
      <div className={`p-4 ${data.bgColor}`}>
        <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FaUtensils className={`w-5 h-5 ${data.color}`} />
          <h3 className={`text-sm font-semibold ${data.textColor}`}>
            {data.title}
          </h3>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            Demo Data
          </span>
        </div>
          <TrendIndicator trend={data.trend || 'neutral'} value={data.trendValue || '0%'} />
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
              <span>Daily Goal: {goal.toLocaleString()} kcal</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <ProgressBar 
              current={data.value as number}
              target={goal}
              unit=" kcal"
              color="bg-blue-500"
            />
          </div>

          {/* Status Message */}
          <div className="text-xs text-slate-600">
            {progress < 100 ? (
              <span>Need {Math.max(0, goal - (data.value as number)).toLocaleString()} more calories</span>
            ) : (
              <span className="text-green-600 font-medium">Goal achieved! 🎉</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
