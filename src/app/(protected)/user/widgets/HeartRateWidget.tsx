import { FaHeart, FaArrowDown } from 'react-icons/fa';
import type { WidgetData, Trend } from './types';

interface HeartRateWidgetProps {
  data?: WidgetData;
  className?: string;
  onClick?: () => void;
}

export default function HeartRateWidget({ 
  data,
  className = '',
  onClick 
}: HeartRateWidgetProps) {
  const defaultData: WidgetData = {
    id: 'heart-rate-resting',
    title: 'Resting HR',
    value: 52,
    unit: 'bpm',
    trend: 'down' as Trend,
    trendValue: '-3%',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200'
  };

  const metricData = data || defaultData;

  return (
    <div
      className={`p-4 rounded-lg border-2 ${metricData.bgColor} ${metricData.borderColor} hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <FaHeart className={`w-5 h-5 ${metricData.color}`} />
          <h4 className={`text-sm font-medium ${metricData.textColor}`}>
            {metricData.title}
          </h4>
        </div>
        {metricData.trend && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <FaArrowDown className="w-3 h-3" />
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

      {/* Heart rate zone indicator */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-slate-600 mb-1">
          <span>Zone: Excellent</span>
          <span>Range: 40-60</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-red-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((60 - 52) / (60 - 40)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
