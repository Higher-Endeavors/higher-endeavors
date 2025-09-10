import { FaFire, FaHeart, FaRunning, FaClock, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import type { WidgetData, Trend } from './types';

interface MetricCardProps {
  data: WidgetData;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
}

export default function MetricCard({ 
  data, 
  size = 'medium', 
  className = '', 
  onClick 
}: MetricCardProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case 'calories-burned':
      case 'calories-consumed':
      case 'calorie-deficit':
        return FaFire;
      case 'steps':
      case 'active-minutes':
        return FaRunning;
      case 'sleep-duration':
        return FaClock;
      case 'heart-rate-resting':
        return FaHeart;
      default:
        return FaRunning;
    }
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

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'p-3',
          title: 'text-xs',
          value: 'text-lg',
          unit: 'text-xs'
        };
      case 'large':
        return {
          container: 'p-6',
          title: 'text-base',
          value: 'text-3xl',
          unit: 'text-base'
        };
      default: // medium
        return {
          container: 'p-4',
          title: 'text-sm',
          value: 'text-2xl',
          unit: 'text-sm'
        };
    }
  };

  const IconComponent = getIcon(data.id);
  const sizeClasses = getSizeClasses();

  return (
    <div
      className={`${sizeClasses.container} rounded-lg border-2 ${data.bgColor} ${data.borderColor} hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <IconComponent className={`w-5 h-5 ${data.color}`} />
          <h4 className={`${sizeClasses.title} font-medium ${data.textColor}`}>
            {data.title}
          </h4>
        </div>
        {data.trend && (
          <div className={`flex items-center gap-1 text-xs ${getTrendColor(data.trend)}`}>
            {getTrendIcon(data.trend)}
            <span>{data.trendValue}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className={`${sizeClasses.value} font-bold ${data.textColor}`}>
          {typeof data.value === 'number' ? data.value.toLocaleString() : data.value}
        </span>
        {data.unit && (
          <span className={`${sizeClasses.unit} ${data.textColor} opacity-75`}>
            {data.unit}
          </span>
        )}
      </div>

      {/* Context-specific progress bars and additional info */}
      {data.id === 'calorie-deficit' && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Target: 500 kcal</span>
            <span>{Math.round((691 / 500) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((691 / 500) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {data.id === 'stress-level' && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Low</span>
            <span>High</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${23}%` }}
            />
          </div>
        </div>
      )}

      {data.id === 'active-minutes' && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Goal: 60 min</span>
            <span>{Math.round((67 / 60) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((67 / 60) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {data.id === 'calories-consumed' && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Target: 2,200 kcal</span>
            <span>{Math.round((2156 / 2200) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((2156 / 2200) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
