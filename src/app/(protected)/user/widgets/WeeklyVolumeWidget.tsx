import { FaFire, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import type { WidgetData, Trend } from '(protected)/user/widgets/types';

interface WeeklyVolumeWidgetProps {
  plannedVolume?: number;
  actualVolume?: number;
  unit?: string;
  className?: string;
  onClick?: () => void;
}

export default function WeeklyVolumeWidget({ 
  plannedVolume = 300,
  actualVolume = 245,
  unit = 'min',
  className = '',
  onClick 
}: WeeklyVolumeWidgetProps) {
  const percentage = Math.round((actualVolume / plannedVolume) * 100);
  const trend: Trend = actualVolume > plannedVolume ? 'up' : actualVolume < plannedVolume * 0.8 ? 'down' : 'neutral';
  const trendValue = actualVolume > plannedVolume ? `+${Math.round(((actualVolume - plannedVolume) / plannedVolume) * 100)}%` : 
                    actualVolume < plannedVolume * 0.8 ? `${Math.round(((actualVolume - plannedVolume) / plannedVolume) * 100)}%` : '0%';
  
  const getStatusColor = () => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBgColor = () => {
    if (percentage >= 100) return 'bg-green-50';
    if (percentage >= 80) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getStatusBorderColor = () => {
    if (percentage >= 100) return 'border-green-200';
    if (percentage >= 80) return 'border-yellow-200';
    return 'border-red-200';
  };

  const getTrendIcon = (trend: Trend) => {
    switch (trend) {
      case 'up':
        return <FaArrowUp className="w-3 h-3" />;
      case 'down':
        return <FaArrowDown className="w-3 h-3" />;
      default:
        return <FaMinus className="w-3 h-3" />;
    }
  };

  const getTrendColor = (trend: Trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 ${getStatusBgColor()} ${getStatusBorderColor()} hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <FaFire className={`w-5 h-5 ${getStatusColor()}`} />
          <h4 className={`text-sm font-medium ${getStatusColor()}`}>
            Weekly CME Volume
          </h4>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            Demo Data
          </span>
        </div>
        <div className={`flex items-center gap-1 text-xs ${getTrendColor(trend)}`}>
          {getTrendIcon(trend)}
          <span>{trendValue}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${getStatusColor()}`}>
            {actualVolume.toLocaleString()}
          </span>
          <span className={`text-sm ${getStatusColor()} opacity-75`}>
            {unit}
          </span>
        </div>

        <div className="text-xs text-slate-600">
          Planned: {plannedVolume.toLocaleString()} {unit}
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Progress</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`${getStatusColor().replace('text-', 'bg-')} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
