import { FaHeart, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import type { Trend } from '(protected)/user/widgets/types';

interface RecoveryStatusWidgetProps {
  recoveryScore?: number;
  trend?: Trend;
  trendValue?: string;
  className?: string;
  onClick?: () => void;
}

export default function RecoveryStatusWidget({ 
  recoveryScore = 78,
  trend = 'up',
  trendValue = '+5%',
  className = '',
  onClick 
}: RecoveryStatusWidgetProps) {
  const getStatusColor = () => {
    if (recoveryScore >= 80) return 'text-green-600';
    if (recoveryScore >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBgColor = () => {
    if (recoveryScore >= 80) return 'bg-green-50';
    if (recoveryScore >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getStatusBorderColor = () => {
    if (recoveryScore >= 80) return 'border-green-200';
    if (recoveryScore >= 60) return 'border-yellow-200';
    return 'border-red-200';
  };

  const getStatusText = () => {
    if (recoveryScore >= 80) return 'Excellent';
    if (recoveryScore >= 60) return 'Good';
    return 'Poor';
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
          <FaHeart className={`w-5 h-5 ${getStatusColor()}`} />
          <h4 className={`text-sm font-medium ${getStatusColor()}`}>
            Recovery Status
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
      
      <div className="space-y-3">
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${getStatusColor()}`}>
            {recoveryScore}
          </span>
          <span className={`text-sm ${getStatusColor()} opacity-75`}>
            /100
          </span>
        </div>

        <div className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </div>

        {/* Recovery factors */}
        <div className="space-y-2">
          <div className="text-xs text-slate-600">Recovery Factors</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Sleep</span>
              <span className="font-semibold text-green-600">Good</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">HRV</span>
              <span className="font-semibold text-yellow-600">Fair</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Stress</span>
              <span className="font-semibold text-green-600">Low</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Load</span>
              <span className="font-semibold text-yellow-600">Moderate</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Recovery Score</span>
            <span>{recoveryScore}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`${getStatusColor().replace('text-', 'bg-')} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${recoveryScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
