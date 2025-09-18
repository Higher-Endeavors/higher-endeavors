import { FaWeight } from 'react-icons/fa';
import ProgressBar from '(protected)/user/widgets/ProgressBar';
import TrendIndicator from '(protected)/user/widgets/TrendIndicator';
import type { WidgetData, Trend } from '(protected)/user/widgets/types';

interface CalorieDeficitWidgetProps {
  className?: string;
}

export default function CalorieDeficitWidget({ className = '' }: CalorieDeficitWidgetProps) {
  const data: WidgetData = {
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
  };

  const target = 500; // Target daily deficit
  const progress = Math.min((data.value as number) / target * 100, 100);

  return (
    <div className={`bg-white rounded-lg border-2 ${data.borderColor} overflow-hidden hover:shadow-md transition-all duration-200 ${className}`}>
      {/* Header */}
      <div className={`p-4 ${data.bgColor}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaWeight className={`w-5 h-5 ${data.color}`} />
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
          {/* Target Progress */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Target: {target} kcal deficit</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <ProgressBar 
              current={data.value as number}
              target={target}
              unit=" kcal"
              color="bg-green-500"
            />
          </div>

          {/* Status Message */}
          <div className="text-xs text-slate-600">
            {progress >= 100 ? (
              <span className="text-green-600 font-medium">Target exceeded! Great work! 🎯</span>
            ) : progress >= 80 ? (
              <span className="text-green-600 font-medium">Almost at target! 💪</span>
            ) : (
              <span>Need {Math.max(0, target - (data.value as number))} more deficit</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
