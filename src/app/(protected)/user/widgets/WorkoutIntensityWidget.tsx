import { FaBolt, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import type { Trend } from '(protected)/user/widgets/types';

interface WorkoutIntensityWidgetProps {
  averageIntensity?: number;
  trend?: Trend;
  trendValue?: string;
  className?: string;
  onClick?: () => void;
}

export default function WorkoutIntensityWidget({ 
  averageIntensity = 72,
  trend = 'up',
  trendValue = '+8%',
  className = '',
  onClick 
}: WorkoutIntensityWidgetProps) {
  const getStatusColor = () => {
    if (averageIntensity >= 80) return 'text-green-600';
    if (averageIntensity >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBgColor = () => {
    if (averageIntensity >= 80) return 'bg-green-50';
    if (averageIntensity >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getStatusBorderColor = () => {
    if (averageIntensity >= 80) return 'border-green-200';
    if (averageIntensity >= 60) return 'border-yellow-200';
    return 'border-red-200';
  };

  const getIntensityLevel = () => {
    if (averageIntensity >= 80) return 'High';
    if (averageIntensity >= 60) return 'Moderate';
    return 'Low';
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
          <FaBolt className={`w-5 h-5 ${getStatusColor()}`} />
          <h4 className={`text-sm font-medium ${getStatusColor()}`}>
            Workout Intensity
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
            {averageIntensity}%
          </span>
        </div>

        <div className={`text-sm font-medium ${getStatusColor()}`}>
          {getIntensityLevel()} Intensity
        </div>

        {/* Intensity breakdown */}
        <div className="space-y-2">
          <div className="text-xs text-slate-600">Weekly Breakdown</div>
          <div className="space-y-1">
            {[
              { day: 'Mon', intensity: 85, color: 'bg-green-500' },
              { day: 'Tue', intensity: 65, color: 'bg-yellow-500' },
              { day: 'Wed', intensity: 0, color: 'bg-slate-200' },
              { day: 'Thu', intensity: 78, color: 'bg-green-500' },
              { day: 'Fri', intensity: 45, color: 'bg-red-500' },
              { day: 'Sat', intensity: 90, color: 'bg-green-500' },
              { day: 'Sun', intensity: 0, color: 'bg-slate-200' }
            ].map((workout) => (
              <div key={workout.day} className="flex items-center justify-between text-xs">
                <span className="text-slate-500 w-8">{workout.day}</span>
                <div className="flex-1 mx-2">
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div 
                      className={`${workout.color} h-1.5 rounded-full transition-all duration-300`}
                      style={{ width: `${workout.intensity}%` }}
                    />
                  </div>
                </div>
                <span className="text-slate-600 w-8 text-right">
                  {workout.intensity > 0 ? `${workout.intensity}%` : 'Rest'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
