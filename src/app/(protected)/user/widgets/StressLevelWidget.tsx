import { FaBrain } from 'react-icons/fa';
import ProgressBar from './ProgressBar';
import TrendIndicator from './TrendIndicator';
import type { WidgetData, Trend } from './types';

interface StressLevelWidgetProps {
  className?: string;
}

export default function StressLevelWidget({ className = '' }: StressLevelWidgetProps) {
  const data: WidgetData = {
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
  };

  const stressLevel = data.value as number;
  const getStressLevel = (level: number) => {
    if (level <= 25) return { label: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (level <= 50) return { label: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (level <= 75) return { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { label: 'Very High', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const stressInfo = getStressLevel(stressLevel);

  return (
    <div className={`bg-white rounded-lg border-2 ${data.borderColor} overflow-hidden hover:shadow-md transition-all duration-200 ${className}`}>
      {/* Header */}
      <div className={`p-4 ${data.bgColor}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaBrain className={`w-5 h-5 ${data.color}`} />
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
          {/* Stress Level Indicator */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Low</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${stressInfo.bgColor} ${stressInfo.color}`}>
                {stressInfo.label}
              </span>
              <span>High</span>
            </div>
            <ProgressBar 
              current={stressLevel}
              target={100}
              unit="/100"
              color="bg-yellow-500"
            />
          </div>

          {/* Status Message */}
          <div className="text-xs text-slate-600">
            {stressLevel <= 25 ? (
              <span className="text-green-600 font-medium">Great stress management! 😌</span>
            ) : stressLevel <= 50 ? (
              <span className="text-yellow-600 font-medium">Moderate stress level</span>
            ) : (
              <span className="text-orange-600 font-medium">Consider stress management techniques</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
