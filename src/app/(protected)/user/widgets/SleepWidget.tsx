import { FaClock, FaMinus } from 'react-icons/fa';
import type { WidgetData, Trend } from './types';

interface SleepWidgetProps {
  data?: WidgetData;
  className?: string;
  onClick?: () => void;
}

export default function SleepWidget({ 
  data,
  className = '',
  onClick 
}: SleepWidgetProps) {
  const defaultData: WidgetData = {
    id: 'sleep-duration',
    title: 'Sleep Duration',
    value: '7h 32m',
    unit: '',
    trend: 'neutral' as Trend,
    trendValue: '0%',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-200'
  };

  const metricData = data || defaultData;

  return (
    <div
      className={`p-4 rounded-lg border-2 ${metricData.bgColor} ${metricData.borderColor} hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <FaClock className={`w-5 h-5 ${metricData.color}`} />
          <h4 className={`text-sm font-medium ${metricData.textColor}`}>
            {metricData.title}
          </h4>
        </div>
        {metricData.trend && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <FaMinus className="w-3 h-3" />
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

      {/* Sleep quality indicator */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-slate-600 mb-1">
          <span>Target: 8h</span>
          <span>Quality: Good</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(7.5 / 8) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
