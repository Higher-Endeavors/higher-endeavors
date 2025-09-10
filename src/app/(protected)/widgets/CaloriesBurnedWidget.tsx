import { FaFire, FaArrowUp } from 'react-icons/fa';
import type { WidgetData, Trend } from './types';

interface CaloriesBurnedWidgetProps {
  data?: WidgetData;
  className?: string;
  showProgress?: boolean;
  onClick?: () => void;
}

export default function CaloriesBurnedWidget({ 
  data,
  className = '',
  showProgress = true,
  onClick 
}: CaloriesBurnedWidgetProps) {
  const defaultData: WidgetData = {
    id: 'calories-burned',
    title: 'Calories Burned',
    value: 2847,
    unit: 'kcal',
    trend: 'up' as Trend,
    trendValue: '+12%',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200'
  };

  const metricData = data || defaultData;

  return (
    <div
      className={`p-4 rounded-lg border-2 ${metricData.bgColor} ${metricData.borderColor} hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <FaFire className={`w-5 h-5 ${metricData.color}`} />
          <h4 className={`text-sm font-medium ${metricData.textColor}`}>
            {metricData.title}
          </h4>
        </div>
        {metricData.trend && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <FaArrowUp className="w-3 h-3" />
            <span>{metricData.trendValue}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${metricData.textColor}`}>
          {typeof metricData.value === 'number' ? metricData.value.toLocaleString() : metricData.value}
        </span>
        {metricData.unit && (
          <span className={`text-sm ${metricData.textColor} opacity-75`}>
            {metricData.unit}
          </span>
        )}
      </div>

      {/* Progress bar integrated within the card */}
      {showProgress && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Goal: 3,000 kcal</span>
            <span>{Math.round((2847 / 3000) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((2847 / 3000) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
